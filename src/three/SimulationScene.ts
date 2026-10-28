/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import {
  initMaterialLibrary,
  MaterialLibrary,
} from './materials';
import {
  createLevelFloor,
  createCentralTowerStructure,
  createCollaboratorPin,
  Level3DObject,
  ConduitLine,
} from './proceduralModels';
import {
  OrgLevelInfo,
  SimulationParameters,
  Collaborator,
  SpatialAnnotation,
  DepartmentNode,
  CameraPreset,
} from '../types/simulation';
import { soundEngine } from '../utils/audio';

// Pre-allocated math helpers outside render loop
const _tmpVec = new THREE.Vector3();
const _camTarget = new THREE.Vector3();
const _camPos = new THREE.Vector3();
const _rayOrigin = new THREE.Vector2();

export interface SimulationSceneCallbacks {
  onSelectDepartment: (dept: DepartmentNode | null) => void;
  onSelectLevel: (levelId: number | null) => void;
  onAddAnnotationAtPoint?: (point: [number, number, number], levelId: number) => void;
}

export class SimulationScene {
  private container: HTMLElement;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private controls: OrbitControls;
  private materials: MaterialLibrary;

  private isSoftwareGl: boolean = false;
  private isDestroyed: boolean = false;
  private frameId: number = 0;

  private levels: OrgLevelInfo[];
  private levelObjects: Level3DObject[] = [];
  private conduitLines: ConduitLine[] = [];
  private liftCar: THREE.Mesh | null = null;
  private collaboratorPinsGroup: THREE.Group = new THREE.Group();

  private raycaster: THREE.Raycaster = new THREE.Raycaster();
  private callbacks: SimulationSceneCallbacks;

  // Camera transition state
  private targetCameraPos: THREE.Vector3 = new THREE.Vector3(18, 14, 22);
  private targetLookAt: THREE.Vector3 = new THREE.Vector3(0, 6, 0);
  private isTransitioningCamera: boolean = false;

  // Simulation runtime state
  private isPlaying: boolean = true;
  private playbackSpeed: number = 1;
  private currentProgress: number = 0; // 0 to 1
  private parameters: SimulationParameters;

  // Selected object highlights
  private selectedDeptId: string | null = null;
  private selectedLevelId: number | null = null;
  private highlightRing: THREE.Mesh | null = null;

  constructor(
    container: HTMLElement,
    levels: OrgLevelInfo[],
    initialParams: SimulationParameters,
    callbacks: SimulationSceneCallbacks
  ) {
    this.container = container;
    this.levels = levels;
    this.parameters = initialParams;
    this.callbacks = callbacks;

    // 1. Detect software WebGL
    this.isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    // 2. Initialize WebGL Renderer
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 600;

    this.renderer = new THREE.WebGLRenderer({
      antialias: !this.isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: false,
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(this.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.shadowMap.enabled = !this.isSoftwareGl;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(this.renderer.domElement);

    // 3. Scene & Camera
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x060913);
    this.scene.fog = new THREE.FogExp2(0x060913, 0.018);

    this.camera = new THREE.PerspectiveCamera(42, width / height, 0.5, 120);
    this.camera.position.set(18, 14, 22);

    // 4. OrbitControls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = !this.isSoftwareGl;
    this.controls.dampingFactor = 0.05;
    this.controls.target.set(0, 6, 0);
    this.controls.maxPolarAngle = Math.PI / 2 - 0.02; // Don't go below floor
    this.controls.minDistance = 4;
    this.controls.maxDistance = 45;

    this.controls.addEventListener('start', () => {
      // User manual camera override cancels scripted camera moves
      this.isTransitioningCamera = false;
    });

    // 5. Studio Environment Map (RoomEnvironment)
    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // 6. Lighting Rig (Balanced 3-point studio lighting)
    const keyLight = new THREE.DirectionalLight(0xfff5e6, 2.2);
    keyLight.position.set(15, 25, 15);
    keyLight.castShadow = !this.isSoftwareGl;
    if (!this.isSoftwareGl) {
      keyLight.shadow.mapSize.width = 1024;
      keyLight.shadow.mapSize.height = 1024;
      keyLight.shadow.camera.near = 5;
      keyLight.shadow.camera.far = 60;
      keyLight.shadow.camera.left = -15;
      keyLight.shadow.camera.right = 15;
      keyLight.shadow.camera.top = 15;
      keyLight.shadow.camera.bottom = -15;
      keyLight.shadow.bias = -0.0005;
      keyLight.shadow.normalBias = 0.02;
    }
    this.scene.add(keyLight);

    const fillLight = new THREE.HemisphereLight(0x38bdf8, 0x0f172a, 1.2);
    this.scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xa78bfa, 1.0);
    rimLight.position.set(-15, 10, -15);
    this.scene.add(rimLight);

    // 7. Materials & 3D Objects
    this.materials = initMaterialLibrary(this.isSoftwareGl);

    // Build Central Tower Core and inter-floor flow conduits
    const tower = createCentralTowerStructure(this.levels, this.materials);
    this.scene.add(tower.group);
    this.conduitLines = tower.conduitLines;
    this.liftCar = tower.liftCar;

    // Build Organizational Level Decks
    this.levels.forEach(lvl => {
      const lvlObj = createLevelFloor(lvl, this.materials);
      this.levelObjects.push(lvlObj);
      this.scene.add(lvlObj.group);
    });

    // Add Collaborator Pins Group
    this.scene.add(this.collaboratorPinsGroup);

    // In-world selection indicator ring
    const selRingGeo = new THREE.RingGeometry(1.2, 1.35, 32);
    const selRingMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.9,
    });
    this.highlightRing = new THREE.Mesh(selRingGeo, selRingMat);
    this.highlightRing.rotation.x = Math.PI / 2;
    this.highlightRing.visible = false;
    this.scene.add(this.highlightRing);

    // Event Listeners
    this.setupEventListeners();

    // Compile scene
    if (!this.isSoftwareGl) {
      this.renderer.compile(this.scene, this.camera);
    }

    // Start render loop
    this.startLoop();
  }

  private setupEventListeners() {
    window.addEventListener('resize', this.onResize);
    this.renderer.domElement.addEventListener('pointerdown', this.onPointerDown);
  }

  private onResize = () => {
    if (this.isDestroyed || !this.container) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    if (width === 0 || height === 0) return;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  private onPointerDown = (event: MouseEvent) => {
    const rect = this.renderer.domElement.getBoundingClientRect();
    _rayOrigin.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    _rayOrigin.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(_rayOrigin, this.camera);

    // Collect all raycast targets
    const targets: THREE.Object3D[] = [];
    this.levelObjects.forEach(lvl => {
      targets.push(...lvl.interactiveMeshes);
    });

    const intersects = this.raycaster.intersectObjects(targets, false);

    if (intersects.length > 0) {
      const hit = intersects[0];
      const data = hit.object.userData;

      if (data && data.type === 'department') {
        const dept = data.department as DepartmentNode;
        this.selectDepartment(dept);
        soundEngine.playSelect();
      } else if (data && data.type === 'level') {
        const levelId = data.levelId as number;
        this.selectLevel(levelId);
        soundEngine.playSelect();
      }
    } else {
      // Clicked background - deselect
      this.clearSelection();
    }
  };

  public selectDepartment(dept: DepartmentNode | null) {
    if (!dept) {
      this.clearSelection();
      return;
    }
    this.selectedDeptId = dept.id;
    this.selectedLevelId = dept.levelId;

    if (this.highlightRing) {
      this.highlightRing.visible = true;
      this.highlightRing.position.set(dept.position[0], dept.position[1] + 0.05, dept.position[2]);
      (this.highlightRing.material as THREE.MeshBasicMaterial).color.set(dept.color);
    }

    // Smoothly focus camera towards department
    this.targetLookAt.set(dept.position[0], dept.position[1], dept.position[2]);
    this.targetCameraPos.set(
      dept.position[0] + 5,
      dept.position[1] + 3.5,
      dept.position[2] + 6
    );
    this.isTransitioningCamera = true;

    this.callbacks.onSelectDepartment(dept);
    this.callbacks.onSelectLevel(dept.levelId);
  }

  public selectLevel(levelId: number | null) {
    if (!levelId) {
      this.clearSelection();
      return;
    }
    this.selectedLevelId = levelId;
    this.selectedDeptId = null;
    if (this.highlightRing) {
      this.highlightRing.visible = false;
    }

    const lvl = this.levels.find(l => l.id === levelId);
    if (lvl) {
      this.targetLookAt.set(0, lvl.yPosition, 0);
      this.targetCameraPos.set(12, lvl.yPosition + 4.5, 14);
      this.isTransitioningCamera = true;
    }

    this.callbacks.onSelectDepartment(null);
    this.callbacks.onSelectLevel(levelId);
  }

  public clearSelection() {
    this.selectedDeptId = null;
    this.selectedLevelId = null;
    if (this.highlightRing) {
      this.highlightRing.visible = false;
    }
    this.callbacks.onSelectDepartment(null);
    this.callbacks.onSelectLevel(null);
  }

  public setCameraPreset(preset: CameraPreset) {
    this.isTransitioningCamera = true;

    switch (preset) {
      case 'overview':
        this.targetLookAt.set(0, 6, 0);
        this.targetCameraPos.set(18, 14, 22);
        break;
      case 'executive':
        this.targetLookAt.set(0, 11.5, 0);
        this.targetCameraPos.set(10, 15, 12);
        break;
      case 'engineering':
        this.targetLookAt.set(0, 7.2, 0);
        this.targetCameraPos.set(-11, 10, 11);
        break;
      case 'cloud':
        this.targetLookAt.set(0, 3.6, 0);
        this.targetCameraPos.set(12, 6.5, -9);
        break;
      case 'market':
        this.targetLookAt.set(0, 0.5, 0);
        this.targetCameraPos.set(-13, 4, -10);
        break;
      case 'cinematic':
        this.targetLookAt.set(0, 6, 0);
        this.targetCameraPos.set(22, 10, 18);
        break;
    }
  }

  public updateParameters(params: SimulationParameters) {
    this.parameters = params;
  }

  public setPlayback(isPlaying: boolean, speed: number = 1) {
    this.isPlaying = isPlaying;
    this.playbackSpeed = speed;
  }

  public setSimulationProgress(progress: number) {
    this.currentProgress = THREE.MathUtils.clamp(progress, 0, 1);
  }

  public toScreenPosition(x: number, y: number, z: number): { x: number; y: number; visible: boolean } {
    _tmpVec.set(x, y, z);
    _tmpVec.project(this.camera);

    // If behind camera
    if (_tmpVec.z > 1) {
      return { x: 0, y: 0, visible: false };
    }

    const rect = this.renderer.domElement.getBoundingClientRect();
    const halfWidth = rect.width / 2;
    const halfHeight = rect.height / 2;

    const screenX = _tmpVec.x * halfWidth + halfWidth;
    const screenY = -_tmpVec.y * halfHeight + halfHeight;

    // Check bounds
    const inBounds = screenX >= -20 && screenX <= rect.width + 20 && screenY >= -20 && screenY <= rect.height + 20;

    return {
      x: screenX,
      y: screenY,
      visible: inBounds,
    };
  }

  public updateCollaborators(collaborators: Collaborator[], annotations: SpatialAnnotation[]) {
    // Re-render collaborator pins
    while (this.collaboratorPinsGroup.children.length > 0) {
      const child = this.collaboratorPinsGroup.children[0];
      this.collaboratorPinsGroup.remove(child);
    }

    collaborators.forEach(collab => {
      if (collab.cursorPos && collab.id !== 'user-self') {
        const pin = createCollaboratorPin(collab.avatarColor, collab.name);
        pin.position.set(collab.cursorPos[0], collab.cursorPos[1], collab.cursorPos[2]);
        this.collaboratorPinsGroup.add(pin);
      }
    });

    annotations.forEach(annot => {
      const pin = createCollaboratorPin('#f43f5e', annot.authorName);
      pin.position.set(annot.position[0], annot.position[1], annot.position[2]);
      this.collaboratorPinsGroup.add(pin);
    });
  }

  private afterDraw(cb: () => void) {
    const gl = this.renderer.getContext() as WebGL2RenderingContext;
    const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
    gl.flush();
    const poll = () => {
      if (this.isDestroyed) return;
      const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
      if (state === gl.UNSIGNALED) {
        this.frameId = window.setTimeout(poll, 5);
      } else {
        if (sync) gl.deleteSync(sync);
        this.frameId = window.setTimeout(cb, 80);
      }
    };
    this.frameId = window.setTimeout(poll, 5);
  }

  private startLoop() {
    let lastTime = performance.now();

    const tick = () => {
      if (this.isDestroyed) return;
      const now = performance.now();
      const delta = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      this.updateSimulation(delta);
      this.renderFrame(delta);

      if (this.isSoftwareGl) {
        this.afterDraw(tick);
      } else {
        this.frameId = requestAnimationFrame(tick);
      }
    };

    if (this.isSoftwareGl) {
      this.afterDraw(tick);
    } else {
      this.frameId = requestAnimationFrame(tick);
    }
  }

  private updateSimulation(delta: number) {
    if (!this.isPlaying) return;

    // Advance simulation loop progress
    const loopDuration = 60; // 60 seconds full cycle
    const effectiveSpeed = this.playbackSpeed * (this.parameters.workloadDemand / 100);
    this.currentProgress = (this.currentProgress + (delta * effectiveSpeed) / loopDuration) % 1;

    // 1. Update In-Model 3D Data Bars (Dynamic response to parameters and simulation pulse)
    const demandMultiplier = this.parameters.workloadDemand / 100;
    const autoMultiplier = 1 + (this.parameters.automationRate - 50) * 0.005;

    this.levelObjects.forEach(lvl => {
      lvl.dataBars.forEach((bar, bIdx) => {
        const timeOffset = this.currentProgress * Math.PI * 4 + bIdx * 0.5;
        const wave = 0.8 + Math.sin(timeOffset) * 0.35 * demandMultiplier;
        const targetScaleY = Math.max(0.2, bar.baseHeight * wave * autoMultiplier);

        // Smoothly interpolate bar height
        bar.mesh.scale.y = THREE.MathUtils.damp(bar.mesh.scale.y, targetScaleY, 6, delta);
      });

      // Subtle pulse on floor indicator rings
      lvl.pulseRings.forEach(ring => {
        const pulse = 1 + Math.sin(this.currentProgress * Math.PI * 8) * 0.04;
        ring.scale.set(pulse, pulse, 1);
      });

      // Slow rotation on department status crystals
      lvl.departmentPods.forEach(pod => {
        const crystal = pod.getObjectByName(`interactive-${pod.name.replace('pod-', '')}`);
        if (crystal) {
          crystal.rotation.y += delta * 1.2;
          crystal.rotation.x += delta * 0.4;
        }
      });
    });

    // 2. Animate Central Vertical Lift Car
    if (this.liftCar) {
      // Moves up and down between level 1 (y=0.5) and level 4 (y=11.5)
      const liftY = 0.8 + ((Math.sin(this.currentProgress * Math.PI * 4) + 1) / 2) * 10.5;
      this.liftCar.position.y = THREE.MathUtils.damp(this.liftCar.position.y, liftY, 4, delta);
    }

    // 3. Animate Flow Conduit Particles
    const flowDirection = 1;
    this.conduitLines.forEach(conduit => {
      const posAttr = conduit.particles.geometry.attributes.position as THREE.BufferAttribute;
      const count = conduit.particleProgress.length;

      for (let p = 0; p < count; p++) {
        conduit.particleProgress[p] =
          (conduit.particleProgress[p] + delta * conduit.speed * effectiveSpeed * flowDirection) % 1;
        if (conduit.particleProgress[p] < 0) conduit.particleProgress[p] += 1;

        const pt = conduit.curve.getPointAt(conduit.particleProgress[p]);
        posAttr.setXYZ(p, pt.x, pt.y, pt.z);
      }
      posAttr.needsUpdate = true;
    });

    // 4. Subtle rotation on selection highlight ring
    if (this.highlightRing && this.highlightRing.visible) {
      this.highlightRing.rotation.z += delta * 1.5;
    }
  }

  private renderFrame(delta: number) {
    // Smooth camera transition if active
    if (this.isTransitioningCamera) {
      this.camera.position.x = THREE.MathUtils.damp(this.camera.position.x, this.targetCameraPos.x, 3.5, delta);
      this.camera.position.y = THREE.MathUtils.damp(this.camera.position.y, this.targetCameraPos.y, 3.5, delta);
      this.camera.position.z = THREE.MathUtils.damp(this.camera.position.z, this.targetCameraPos.z, 3.5, delta);

      this.controls.target.x = THREE.MathUtils.damp(this.controls.target.x, this.targetLookAt.x, 3.5, delta);
      this.controls.target.y = THREE.MathUtils.damp(this.controls.target.y, this.targetLookAt.y, 3.5, delta);
      this.controls.target.z = THREE.MathUtils.damp(this.controls.target.z, this.targetLookAt.z, 3.5, delta);

      if (
        this.camera.position.distanceTo(this.targetCameraPos) < 0.1 &&
        this.controls.target.distanceTo(this.targetLookAt) < 0.1
      ) {
        this.isTransitioningCamera = false;
      }
    }

    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  public dispose() {
    this.isDestroyed = true;
    if (this.isSoftwareGl) {
      clearTimeout(this.frameId);
    } else {
      cancelAnimationFrame(this.frameId);
    }

    window.removeEventListener('resize', this.onResize);
    this.renderer.domElement.removeEventListener('pointerdown', this.onPointerDown);

    this.controls.dispose();
    this.renderer.dispose();

    if (this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }
  }
}
