/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { MaterialLibrary } from './materials';
import { OrgLevelInfo, DepartmentNode } from '../types/simulation';

export interface Level3DObject {
  levelId: number;
  group: THREE.Group;
  dataBars: {
    mesh: THREE.Mesh;
    baseHeight: number;
    deptId: string;
  }[];
  departmentPods: Map<string, THREE.Group>;
  interactiveMeshes: THREE.Mesh[];
  pulseRings: THREE.Mesh[];
}

export interface ConduitLine {
  curve: THREE.CatmullRomCurve3;
  tubeMesh: THREE.Mesh;
  particles: THREE.Points;
  particlePositions: Float32Array;
  particleProgress: number[];
  speed: number;
}

// Build a multi-part composite department workstation pod (3–6 parts)
export function createDepartmentPod(
  dept: DepartmentNode,
  level: OrgLevelInfo,
  materials: MaterialLibrary
): { group: THREE.Group; interactiveMesh: THREE.Mesh } {
  const podGroup = new THREE.Group();
  podGroup.name = `pod-${dept.id}`;
  podGroup.position.set(dept.position[0], dept.position[1], dept.position[2]);

  // 1. Primary Base Platform (Hexagonal or chamfered cylinder)
  const baseGeo = new THREE.CylinderGeometry(0.9, 1.1, 0.25, 6);
  const baseMat = new THREE.MeshStandardMaterial({
    color: 0x182234,
    roughness: 0.35,
    metalness: 0.8,
  });
  const baseMesh = new THREE.Mesh(baseGeo, baseMat);
  baseMesh.position.y = 0.125;
  baseMesh.castShadow = true;
  baseMesh.receiveShadow = true;
  podGroup.add(baseMesh);

  // 2. Beveled Metallic Accent Ring
  const ringGeo = new THREE.TorusGeometry(0.95, 0.06, 8, 24);
  const accentColor = new THREE.Color(dept.color);
  const ringMat = new THREE.MeshStandardMaterial({
    color: accentColor,
    emissive: accentColor,
    emissiveIntensity: 0.5,
    roughness: 0.2,
    metalness: 0.9,
  });
  const ringMesh = new THREE.Mesh(ringGeo, ringMat);
  ringMesh.rotation.x = Math.PI / 2;
  ringMesh.position.y = 0.26;
  podGroup.add(ringMesh);

  // 3. Central Console / Holographic Hub Housing
  const consoleGeo = new THREE.CylinderGeometry(0.35, 0.45, 0.5, 8);
  const consoleMat = new THREE.MeshStandardMaterial({
    color: 0x22324e,
    roughness: 0.4,
    metalness: 0.7,
  });
  const consoleMesh = new THREE.Mesh(consoleGeo, consoleMat);
  consoleMesh.position.y = 0.5;
  podGroup.add(consoleMesh);

  // 4. Floating Holographic Status Crystal (Interactive Raycast target)
  const crystalGeo = new THREE.OctahedronGeometry(0.32, 0);
  const crystalMat = new THREE.MeshStandardMaterial({
    color: accentColor,
    emissive: accentColor,
    emissiveIntensity: 0.8,
    roughness: 0.1,
    metalness: 0.3,
    transparent: true,
    opacity: 0.9,
  });
  const crystalMesh = new THREE.Mesh(crystalGeo, crystalMat);
  crystalMesh.position.y = 1.05;
  crystalMesh.name = `interactive-${dept.id}`;
  // Attach metadata for raycasting
  crystalMesh.userData = {
    type: 'department',
    deptId: dept.id,
    levelId: dept.levelId,
    department: dept,
  };
  podGroup.add(crystalMesh);

  // 5. Orbital Status Rings
  const orbitGeo = new THREE.RingGeometry(0.5, 0.54, 24);
  const orbitMat = new THREE.MeshBasicMaterial({
    color: accentColor,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.6,
  });
  const orbitMesh = new THREE.Mesh(orbitGeo, orbitMat);
  orbitMesh.rotation.x = Math.PI / 2;
  orbitMesh.position.y = 1.05;
  podGroup.add(orbitMesh);

  // 6. Glowing Floor Projection Cone
  const coneGeo = new THREE.ConeGeometry(0.5, 0.6, 12, 1, true);
  const coneMat = new THREE.MeshBasicMaterial({
    color: accentColor,
    transparent: true,
    opacity: 0.18,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
  });
  const coneMesh = new THREE.Mesh(coneGeo, coneMat);
  coneMesh.rotation.x = Math.PI;
  coneMesh.position.y = 0.8;
  podGroup.add(coneMesh);

  return { group: podGroup, interactiveMesh: crystalMesh };
}

// Build full composite architectural floor for an organizational tier
export function createLevelFloor(
  level: OrgLevelInfo,
  materials: MaterialLibrary
): Level3DObject {
  const levelGroup = new THREE.Group();
  levelGroup.name = `level-${level.id}`;
  levelGroup.position.y = level.yPosition;

  const interactiveMeshes: THREE.Mesh[] = [];
  const departmentPods = new Map<string, THREE.Group>();
  const dataBars: { mesh: THREE.Mesh; baseHeight: number; deptId: string }[] = [];
  const pulseRings: THREE.Mesh[] = [];

  // Floor radius varies slightly by level to form an organic tiered ziggurat / tower
  const floorRadii: Record<number, { outer: number; inner: number; thickness: number; sides: number }> = {
    4: { outer: 6.8, inner: 1.2, thickness: 0.45, sides: 32 }, // Executive dome deck
    3: { outer: 7.8, inner: 1.4, thickness: 0.45, sides: 6 }, // Hexagonal engineering deck
    2: { outer: 8.8, inner: 1.6, thickness: 0.5, sides: 8 }, // Octagonal data cloud deck
    1: { outer: 10.5, inner: 1.8, thickness: 0.6, sides: 48 }, // Foundation market plaza
  };
  const cfg = floorRadii[level.id] || { outer: 8, inner: 1.5, thickness: 0.5, sides: 24 };

  // 1. Primary Floor Deck (Upper surface)
  const floorMat = materials.floorMaterials.get(level.id) || materials.pillarMaterial;
  const floorGeo = new THREE.CylinderGeometry(cfg.outer, cfg.outer * 1.02, cfg.thickness, cfg.sides);
  const floorMesh = new THREE.Mesh(floorGeo, floorMat);
  floorMesh.position.y = 0;
  floorMesh.receiveShadow = true;
  floorMesh.name = `floor-${level.id}`;
  floorMesh.userData = {
    type: 'level',
    levelId: level.id,
    levelInfo: level,
  };
  levelGroup.add(floorMesh);
  interactiveMeshes.push(floorMesh);

  // 2. Perimeter Structural Bevel Ring
  const trimGeo = new THREE.TorusGeometry(cfg.outer * 1.01, 0.12, 8, cfg.sides);
  const accentColor = new THREE.Color(level.accentColor);
  const trimMat = new THREE.MeshStandardMaterial({
    color: accentColor,
    emissive: accentColor,
    emissiveIntensity: 0.4,
    roughness: 0.25,
    metalness: 0.85,
  });
  const trimMesh = new THREE.Mesh(trimGeo, trimMat);
  trimMesh.rotation.x = Math.PI / 2;
  trimMesh.position.y = cfg.thickness / 2;
  levelGroup.add(trimMesh);

  // 3. Central Core Opening Collar
  const collarGeo = new THREE.CylinderGeometry(cfg.inner + 0.3, cfg.inner + 0.4, 0.6, 24);
  const collarMesh = new THREE.Mesh(collarGeo, materials.pillarMaterial);
  collarMesh.position.y = 0.2;
  levelGroup.add(collarMesh);

  // 4. Central Holographic Pulse Ring
  const pulseRingGeo = new THREE.RingGeometry(cfg.inner + 0.5, cfg.inner + 0.68, 32);
  const pulseRingMat = new THREE.MeshBasicMaterial({
    color: accentColor,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.6,
  });
  const pulseRingMesh = new THREE.Mesh(pulseRingGeo, pulseRingMat);
  pulseRingMesh.rotation.x = Math.PI / 2;
  pulseRingMesh.position.y = 0.26;
  levelGroup.add(pulseRingMesh);
  pulseRings.push(pulseRingMesh);

  // 5. Level 4 Special: Executive Translucent Crystal Geodesic Canopy Dome
  if (level.id === 4) {
    const domeGeo = new THREE.SphereGeometry(4.8, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2.3);
    const domeMesh = new THREE.Mesh(domeGeo, materials.glassMaterial);
    domeMesh.position.y = 0.2;
    levelGroup.add(domeMesh);

    // Dome framing ribs
    const ribGeo = new THREE.TorusGeometry(4.78, 0.05, 8, 32);
    const ribMesh = new THREE.Mesh(ribGeo, trimMat);
    ribMesh.rotation.x = Math.PI / 2;
    ribMesh.position.y = 2.4;
    levelGroup.add(ribMesh);
  }

  // 6. Interactive 3D Data Visualizations WITHIN the Model (Dynamic 3D Bar Visualizers)
  // Each department has a 3-bar histogram cluster on the floor visualizing Throughput, Health, Load!
  level.departments.forEach((dept, dIdx) => {
    // Add department pod
    const { group: pod, interactiveMesh } = createDepartmentPod(dept, level, materials);
    departmentPods.set(dept.id, pod);
    levelGroup.add(pod);
    interactiveMeshes.push(interactiveMesh);

    // In-Model 3D Data Bar Cluster adjacent to the pod
    const barSpacing = 0.35;
    const barMetrics = [
      { type: 'throughput', scale: dept.throughput / 1500, color: 0x38bdf8 },
      { type: 'load', scale: dept.load / 100, color: dept.load > 85 ? 0xef4444 : 0x10b981 },
      { type: 'health', scale: dept.health / 100, color: 0xf59e0b },
    ];

    barMetrics.forEach((m, mIdx) => {
      const height = Math.max(0.3, m.scale * 1.8);
      const barGeo = new THREE.BoxGeometry(0.2, 1, 0.2);
      barGeo.translate(0, 0.5, 0); // pivot at bottom!

      const barMat = new THREE.MeshStandardMaterial({
        color: m.color,
        emissive: m.color,
        emissiveIntensity: 0.6,
        roughness: 0.3,
        metalness: 0.5,
      });

      const barMesh = new THREE.Mesh(barGeo, barMat);
      // Place near pod
      const angle = (dIdx * (Math.PI * 2) / level.departments.length) + (mIdx - 1) * 0.12;
      const dist = cfg.outer * 0.72;
      barMesh.position.set(
        Math.cos(angle) * dist,
        0.2,
        Math.sin(angle) * dist
      );
      barMesh.scale.y = height;
      barMesh.name = `databar-${dept.id}-${m.type}`;
      barMesh.castShadow = true;
      levelGroup.add(barMesh);

      dataBars.push({
        mesh: barMesh,
        baseHeight: height,
        deptId: dept.id,
      });
    });
  });

  return {
    levelId: level.id,
    group: levelGroup,
    dataBars,
    departmentPods,
    interactiveMeshes,
    pulseRings,
  };
}

// Build Central Energy Lift Shaft and Inter-Tier Structural Pillars
export function createCentralTowerStructure(
  levels: OrgLevelInfo[],
  materials: MaterialLibrary
): { group: THREE.Group; conduitLines: ConduitLine[]; liftCar: THREE.Mesh } {
  const towerGroup = new THREE.Group();
  towerGroup.name = 'central-tower-structure';

  const conduitLines: ConduitLine[] = [];

  // 1. Central Core Vertical Glass Cylinder (Elevator/Energy Conduit)
  const totalHeight = 13.5;
  const shaftGeo = new THREE.CylinderGeometry(1.2, 1.4, totalHeight, 24, 1, true);
  const shaftMesh = new THREE.Mesh(shaftGeo, materials.glassMaterial);
  shaftMesh.position.y = totalHeight / 2;
  towerGroup.add(shaftMesh);

  // 2. Internal Glowing Spiral Energy Helix
  const helixPoints: THREE.Vector3[] = [];
  const turns = 8;
  const pointsCount = 200;
  for (let i = 0; i <= pointsCount; i++) {
    const t = i / pointsCount;
    const angle = t * Math.PI * 2 * turns;
    const y = t * totalHeight;
    const r = 0.85;
    helixPoints.push(new THREE.Vector3(Math.cos(angle) * r, y, Math.sin(angle) * r));
  }
  const helixCurve = new THREE.CatmullRomCurve3(helixPoints);
  const helixGeo = new THREE.TubeGeometry(helixCurve, 140, 0.05, 8, false);
  const helixMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x0284c7,
    emissiveIntensity: 0.9,
    roughness: 0.2,
    metalness: 0.5,
  });
  const helixMesh = new THREE.Mesh(helixGeo, helixMat);
  towerGroup.add(helixMesh);

  // 3. Central Vertical Data Lift Car (Moves up and down during simulation!)
  const liftCarGeo = new THREE.CylinderGeometry(0.95, 0.95, 0.6, 16);
  const liftCarMat = new THREE.MeshStandardMaterial({
    color: 0x67e8f9,
    emissive: 0x06b6d4,
    emissiveIntensity: 0.85,
    roughness: 0.15,
    metalness: 0.9,
  });
  const liftCar = new THREE.Mesh(liftCarGeo, liftCarMat);
  liftCar.position.y = 5.0;
  towerGroup.add(liftCar);

  // 4. Heavy Outer Structural Support Pylons (4 Columns spanning the floors)
  const pylonAngles = [Math.PI / 4, (3 * Math.PI) / 4, (5 * Math.PI) / 4, (7 * Math.PI) / 4];
  const pylonDist = 6.2;
  pylonAngles.forEach(ang => {
    const pylonGeo = new THREE.CylinderGeometry(0.2, 0.35, totalHeight, 8);
    const pylonMesh = new THREE.Mesh(pylonGeo, materials.pillarMaterial);
    pylonMesh.position.set(Math.cos(ang) * pylonDist, totalHeight / 2, Math.sin(ang) * pylonDist);
    pylonMesh.castShadow = true;
    towerGroup.add(pylonMesh);
  });

  // 5. Inter-Floor Flow Conduits with Animated Data Pulse Particles
  // Generate 4 curved conduits carrying data flows between consecutive levels
  for (let i = 0; i < levels.length - 1; i++) {
    const topL = levels[i]; // e.g. Level 4
    const botL = levels[i + 1]; // e.g. Level 3

    const angle = (i * Math.PI) / 2 + Math.PI / 6;
    const rTop = 4.2;
    const rBot = 5.2;

    const p0 = new THREE.Vector3(Math.cos(angle) * rTop, topL.yPosition + 0.2, Math.sin(angle) * rTop);
    const p1 = new THREE.Vector3(
      Math.cos(angle + 0.3) * (rTop + 1.2),
      (topL.yPosition + botL.yPosition) / 2,
      Math.sin(angle + 0.3) * (rTop + 1.2)
    );
    const p2 = new THREE.Vector3(Math.cos(angle) * rBot, botL.yPosition + 0.2, Math.sin(angle) * rBot);

    const curve = new THREE.CatmullRomCurve3([p0, p1, p2]);
    const tubeGeo = new THREE.TubeGeometry(curve, 32, 0.08, 8, false);
    const tubeMesh = new THREE.Mesh(tubeGeo, materials.conduitMaterial);
    towerGroup.add(tubeMesh);

    // Particle flow system along this conduit
    const particleCount = 20;
    const particlePositions = new Float32Array(particleCount * 3);
    const particleProgress: number[] = [];

    for (let p = 0; p < particleCount; p++) {
      const prog = p / particleCount;
      particleProgress.push(prog);
      const pt = curve.getPointAt(prog);
      particlePositions[p * 3] = pt.x;
      particlePositions[p * 3 + 1] = pt.y;
      particlePositions[p * 3 + 2] = pt.z;
    }

    const partGeo = new THREE.BufferGeometry();
    partGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particles = new THREE.Points(partGeo, materials.particleMaterial);
    towerGroup.add(particles);

    conduitLines.push({
      curve,
      tubeMesh,
      particles,
      particlePositions,
      particleProgress,
      speed: 0.25,
    });
  }

  // 6. Ground Base Contact Shadow & Plaza Ring
  const shadowGeo = new THREE.PlaneGeometry(28, 28);
  const shadowMesh = new THREE.Mesh(shadowGeo, materials.contactShadowMaterial);
  shadowMesh.rotation.x = -Math.PI / 2;
  shadowMesh.position.y = -0.05;
  towerGroup.add(shadowMesh);

  return { group: towerGroup, conduitLines, liftCar };
}

// Build 3D spatial collaborator pin / marker
export function createCollaboratorPin(
  color: string,
  name: string
): THREE.Group {
  const pinGroup = new THREE.Group();
  pinGroup.name = `pin-${name}`;

  // Glowing beacon cone pointing down
  const coneGeo = new THREE.ConeGeometry(0.25, 0.8, 12);
  const pinColor = new THREE.Color(color);
  const coneMat = new THREE.MeshStandardMaterial({
    color: pinColor,
    emissive: pinColor,
    emissiveIntensity: 0.9,
    roughness: 0.2,
    metalness: 0.6,
  });
  const coneMesh = new THREE.Mesh(coneGeo, coneMat);
  coneMesh.rotation.x = Math.PI; // Point down
  coneMesh.position.y = 0.5;
  pinGroup.add(coneMesh);

  // Floating sphere above cone
  const sphereGeo = new THREE.SphereGeometry(0.18, 16, 16);
  const sphereMesh = new THREE.Mesh(sphereGeo, coneMat);
  sphereMesh.position.y = 1.0;
  pinGroup.add(sphereMesh);

  // Horizontal target pulse ring on the ground
  const targetRingGeo = new THREE.RingGeometry(0.3, 0.45, 24);
  const targetRingMat = new THREE.MeshBasicMaterial({
    color: pinColor,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.7,
  });
  const targetRing = new THREE.Mesh(targetRingGeo, targetRingMat);
  targetRing.rotation.x = Math.PI / 2;
  targetRing.position.y = 0.05;
  pinGroup.add(targetRing);

  return pinGroup;
}
