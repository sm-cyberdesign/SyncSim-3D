/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';

// Create procedural high-resolution canvas texture for high-tech organizational floors
export function createTechFloorTexture(
  primaryColor: string,
  gridColor: string,
  ringColor: string
): THREE.CanvasTexture {
  const size = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  // Base dark fill
  ctx.fillStyle = '#0a0f1d';
  ctx.fillRect(0, 0, size, size);

  // Radial ambient gradient
  const grad = ctx.createRadialGradient(size / 2, size / 2, 80, size / 2, size / 2, size / 2);
  grad.addColorStop(0, primaryColor + '22');
  grad.addColorStop(0.6, primaryColor + '08');
  grad.addColorStop(1, '#050814');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  // Orthogonal grid lines
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = gridColor + '20';
  const step = 64;
  for (let x = 0; x <= size; x += step) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, size);
    ctx.stroke();
  }
  for (let y = 0; y <= size; y += step) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(size, y);
    ctx.stroke();
  }

  // Concentric technical rings
  const center = size / 2;
  const rings = [140, 260, 380, 480];
  rings.forEach((r, idx) => {
    ctx.beginPath();
    ctx.arc(center, center, r, 0, Math.PI * 2);
    ctx.strokeStyle = ringColor + (idx % 2 === 0 ? '55' : '30');
    ctx.lineWidth = idx === 1 ? 2.5 : 1.5;
    if (idx % 2 === 1) {
      ctx.setLineDash([12, 16]);
    } else {
      ctx.setLineDash([]);
    }
    ctx.stroke();
  });
  ctx.setLineDash([]);

  // Compass ticks
  for (let a = 0; a < Math.PI * 2; a += Math.PI / 16) {
    const r1 = 460;
    const r2 = 480;
    ctx.beginPath();
    ctx.moveTo(center + Math.cos(a) * r1, center + Math.sin(a) * r1);
    ctx.lineTo(center + Math.cos(a) * r2, center + Math.sin(a) * r2);
    ctx.strokeStyle = primaryColor + '66';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

// Create soft radial contact shadow texture
export function createContactShadowTexture(): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  const rad = ctx.createRadialGradient(size / 2, size / 2, 20, size / 2, size / 2, size / 2);
  rad.addColorStop(0, 'rgba(0, 0, 0, 0.85)');
  rad.addColorStop(0.3, 'rgba(0, 0, 0, 0.55)');
  rad.addColorStop(0.7, 'rgba(0, 0, 0, 0.15)');
  rad.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx.fillStyle = rad;
  ctx.fillRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// Procedural glowing particle dot texture
export function createParticleGlowTexture(): THREE.CanvasTexture {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  const grad = ctx.createRadialGradient(size / 2, size / 2, 4, size / 2, size / 2, size / 2);
  grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
  grad.addColorStop(0.25, 'rgba(100, 220, 255, 0.9)');
  grad.addColorStop(0.65, 'rgba(30, 140, 255, 0.35)');
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// Procedural high-fidelity 42U Server Rack Faceplate Canvas Texture
export function createServerFaceplateTexture(
  accentColorHex: string,
  deptName: string
): THREE.CanvasTexture {
  const width = 512;
  const height = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  // 1. Chassis Background (Dark Matte Carbon Steel)
  ctx.fillStyle = '#0a0d14';
  ctx.fillRect(0, 0, width, height);

  // 2. Vertical 42U Mounting Rails on Left & Right
  const railWidth = 36;
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(0, 0, railWidth, height);
  ctx.fillRect(width - railWidth, 0, railWidth, height);

  // Rail bevels
  ctx.fillStyle = '#334155';
  ctx.fillRect(railWidth - 2, 0, 2, height);
  ctx.fillRect(width - railWidth, 0, 2, height);

  // Rack Unit square cage nuts and stamps
  const unitCount = 42;
  const unitHeight = height / unitCount;

  for (let u = 0; u < unitCount; u++) {
    const y = u * unitHeight;
    ctx.fillStyle = '#05070a';
    ctx.fillRect(10, y + 6, 12, 10);
    ctx.fillRect(width - 22, y + 6, 12, 10);

    if (u % 4 === 0) {
      ctx.fillStyle = '#94a3b8';
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`${42 - u}U`, 24, y + 14);
      ctx.fillText(`${42 - u}U`, width - 24, y + 14);
    }
  }

  // 3. Rack Interior Server Blades & Shelves
  const innerLeft = railWidth + 4;
  const innerRight = width - railWidth - 4;
  const innerWidth = innerRight - innerLeft;

  // Top Diagnostic Header / LCD Status Marquee (U41 - U42)
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(innerLeft, 4, innerWidth, unitHeight * 2 - 8);
  ctx.strokeStyle = accentColorHex;
  ctx.lineWidth = 1.5;
  ctx.strokeRect(innerLeft, 4, innerWidth, unitHeight * 2 - 8);

  ctx.fillStyle = accentColorHex;
  ctx.font = 'bold 13px monospace';
  ctx.textAlign = 'left';
  ctx.fillText(`SYSTEM NODE: ${deptName.substring(0, 22).toUpperCase()}`, innerLeft + 12, 22);

  ctx.fillStyle = '#38bdf8';
  ctx.font = '10px monospace';
  ctx.fillText('STATUS: ONLINE  |  42U RACK SUITE  |  ACTIVE PDU', innerLeft + 12, 38);

  // Power status LED
  ctx.beginPath();
  ctx.arc(innerRight - 20, 24, 5, 0, Math.PI * 2);
  ctx.fillStyle = '#10b981';
  ctx.fill();

  // Stack of Server Blades
  let currentY = unitHeight * 2 + 4;

  const bladeSlots = [
    { heightU: 2, type: 'blade' },
    { heightU: 1, type: 'network' },
    { heightU: 1, type: 'network' },
    { heightU: 4, type: 'gpu' },
    { heightU: 2, type: 'blade' },
    { heightU: 2, type: 'blade' },
    { heightU: 4, type: 'storage' },
    { heightU: 4, type: 'storage' },
    { heightU: 4, type: 'gpu' },
    { heightU: 2, type: 'blade' },
    { heightU: 2, type: 'blade' },
    { heightU: 2, type: 'blade' },
    { heightU: 4, type: 'blade' },
    { heightU: 3, type: 'pdu' },
    { heightU: 3, type: 'pdu' },
  ];

  bladeSlots.forEach(slot => {
    const slotH = slot.heightU * unitHeight - 4;
    if (currentY + slotH > height - 4) return;

    ctx.fillStyle = '#131926';
    ctx.fillRect(innerLeft, currentY, innerWidth, slotH);
    ctx.strokeStyle = '#273549';
    ctx.lineWidth = 1;
    ctx.strokeRect(innerLeft, currentY, innerWidth, slotH);

    ctx.fillStyle = '#334155';
    ctx.fillRect(innerLeft + 4, currentY + 4, 8, slotH - 8);
    ctx.fillRect(innerRight - 12, currentY + 4, 8, slotH - 8);

    if (slot.type === 'gpu') {
      ctx.fillStyle = '#0b0f19';
      ctx.fillRect(innerLeft + 20, currentY + 6, innerWidth - 40, slotH - 12);
      ctx.strokeStyle = accentColorHex + '66';
      ctx.strokeRect(innerLeft + 20, currentY + 6, innerWidth - 40, slotH - 12);

      ctx.fillStyle = '#1e293b';
      for (let gx = innerLeft + 28; gx < innerRight - 28; gx += 10) {
        for (let gy = currentY + 12; gy < currentY + slotH - 12; gy += 10) {
          ctx.beginPath();
          ctx.arc(gx, gy, 1.8, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.fillStyle = accentColorHex;
      ctx.font = 'bold 9px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('NVIDIA HGX H100 ACCELERATOR', (innerLeft + innerRight) / 2, currentY + slotH / 2 + 3);

      for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.arc(innerLeft + 28 + i * 12, currentY + slotH - 10, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = i === 3 ? '#38bdf8' : '#10b981';
        ctx.fill();
      }
    } else if (slot.type === 'storage') {
      const baysPerRow = 6;
      const rows = 2;
      const bayW = (innerWidth - 44) / baysPerRow;
      const bayH = (slotH - 14) / rows;

      for (let r = 0; r < rows; r++) {
        for (let b = 0; b < baysPerRow; b++) {
          const bx = innerLeft + 20 + b * bayW;
          const by = currentY + 6 + r * bayH;
          ctx.fillStyle = '#182030';
          ctx.fillRect(bx, by, bayW - 3, bayH - 3);
          ctx.strokeStyle = '#334155';
          ctx.strokeRect(bx, by, bayW - 3, bayH - 3);

          ctx.fillStyle = '#475569';
          ctx.fillRect(bx + 2, by + bayH - 8, bayW - 7, 3);

          ctx.beginPath();
          ctx.arc(bx + 5, by + 5, 1.5, 0, Math.PI * 2);
          ctx.fillStyle = (b + r) % 5 === 0 ? '#38bdf8' : '#10b981';
          ctx.fill();
        }
      }
    } else if (slot.type === 'network') {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(innerLeft + 16, currentY + 3, innerWidth - 32, slotH - 6);

      const portCount = 16;
      const portW = (innerWidth - 50) / portCount;
      for (let p = 0; p < portCount; p++) {
        const px = innerLeft + 22 + p * portW;
        ctx.fillStyle = '#050810';
        ctx.fillRect(px, currentY + 5, portW - 2, slotH - 10);
        ctx.strokeStyle = '#475569';
        ctx.strokeRect(px, currentY + 5, portW - 2, slotH - 10);

        ctx.beginPath();
        ctx.arc(px + portW / 2 - 1, currentY + 8, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = '#38bdf8';
        ctx.fill();
      }
    } else if (slot.type === 'pdu') {
      ctx.fillStyle = '#0a0d16';
      ctx.fillRect(innerLeft + 16, currentY + 4, innerWidth - 32, slotH - 8);
      ctx.strokeStyle = '#ef444488';
      ctx.strokeRect(innerLeft + 16, currentY + 4, innerWidth - 32, slotH - 8);

      ctx.fillStyle = '#f87171';
      ctx.font = 'bold 8px monospace';
      ctx.textAlign = 'left';
      ctx.fillText('TITANIUM REDUNDANT PDU (3-PHASE 415V)', innerLeft + 24, currentY + 16);

      ctx.fillStyle = '#1e293b';
      ctx.fillRect(innerRight - 60, currentY + 6, 20, slotH - 12);
      ctx.fillRect(innerRight - 34, currentY + 6, 20, slotH - 12);
    } else {
      ctx.fillStyle = '#0d131f';
      ctx.fillRect(innerLeft + 16, currentY + 4, innerWidth - 32, slotH - 8);

      ctx.fillStyle = '#223048';
      for (let vy = currentY + 7; vy < currentY + slotH - 7; vy += 4) {
        ctx.fillRect(innerLeft + 20, vy, innerWidth - 90, 1.5);
      }

      ctx.fillStyle = '#1e293b';
      ctx.fillRect(innerRight - 65, currentY + 6, 45, slotH - 12);
      ctx.strokeStyle = '#38bdf855';
      ctx.strokeRect(innerRight - 65, currentY + 6, 45, slotH - 12);

      ctx.beginPath();
      ctx.arc(innerRight - 75, currentY + slotH / 2, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = '#10b981';
      ctx.fill();
    }

    currentY += slotH + 4;
  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

export interface MaterialLibrary {
  floorMaterials: Map<number, THREE.MeshStandardMaterial>;
  pillarMaterial: THREE.MeshStandardMaterial;
  glassMaterial: THREE.MeshPhysicalMaterial;
  conduitMaterial: THREE.MeshStandardMaterial;
  goldTrimMaterial: THREE.MeshStandardMaterial;
  cyberCyanMaterial: THREE.MeshStandardMaterial;
  emeraldMaterial: THREE.MeshStandardMaterial;
  purpleMaterial: THREE.MeshStandardMaterial;
  contactShadowMaterial: THREE.MeshBasicMaterial;
  particleMaterial: THREE.PointsMaterial;
  activePulseMaterial: THREE.MeshBasicMaterial;
  serverChassisMaterial: THREE.MeshStandardMaterial;
  serverTrimMaterial: THREE.MeshStandardMaterial;
  fiberRacewayMaterial: THREE.MeshStandardMaterial;
  coolingFanMaterial: THREE.MeshStandardMaterial;
}

export function initMaterialLibrary(isSoftwareGl: boolean): MaterialLibrary {
  const floorMaterials = new Map<number, THREE.MeshStandardMaterial>();

  const levelColorConfigs = [
    { level: 4, primary: '#f59e0b', grid: '#fbbf24', ring: '#f59e0b', roughness: 0.25, metalness: 0.6 },
    { level: 3, primary: '#06b6d4', grid: '#38bdf8', ring: '#0284c7', roughness: 0.35, metalness: 0.5 },
    { level: 2, primary: '#10b981', grid: '#34d399', ring: '#059669', roughness: 0.3, metalness: 0.5 },
    { level: 1, primary: '#f43f5e', grid: '#fb7185', ring: '#e11d48', roughness: 0.4, metalness: 0.4 },
  ];

  levelColorConfigs.forEach(cfg => {
    const tex = createTechFloorTexture(cfg.primary, cfg.grid, cfg.ring);
    const mat = new THREE.MeshStandardMaterial({
      map: tex,
      roughness: cfg.roughness,
      metalness: cfg.metalness,
      bumpScale: 0.05,
    });
    floorMaterials.set(cfg.level, mat);
  });

  const pillarMaterial = new THREE.MeshStandardMaterial({
    color: 0x1f293d,
    roughness: 0.3,
    metalness: 0.85,
  });

  const glassMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x88ccff,
    transparent: true,
    opacity: isSoftwareGl ? 0.35 : 0.45,
    roughness: 0.1,
    metalness: 0.15,
    transmission: isSoftwareGl ? 0 : 0.85,
    ior: 1.5,
    depthWrite: false,
  });

  const conduitMaterial = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x0284c7,
    emissiveIntensity: 0.8,
    roughness: 0.2,
    metalness: 0.4,
    transparent: true,
    opacity: 0.85,
  });

  const goldTrimMaterial = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    roughness: 0.2,
    metalness: 0.9,
    emissive: 0xd97706,
    emissiveIntensity: 0.3,
  });

  const cyberCyanMaterial = new THREE.MeshStandardMaterial({
    color: 0x06b6d4,
    roughness: 0.25,
    metalness: 0.8,
    emissive: 0x0891b2,
    emissiveIntensity: 0.4,
  });

  const emeraldMaterial = new THREE.MeshStandardMaterial({
    color: 0x10b981,
    roughness: 0.3,
    metalness: 0.7,
    emissive: 0x059669,
    emissiveIntensity: 0.4,
  });

  const purpleMaterial = new THREE.MeshStandardMaterial({
    color: 0x8b5cf6,
    roughness: 0.3,
    metalness: 0.7,
    emissive: 0x7c3aed,
    emissiveIntensity: 0.4,
  });

  const contactShadowTexture = createContactShadowTexture();
  const contactShadowMaterial = new THREE.MeshBasicMaterial({
    map: contactShadowTexture,
    transparent: true,
    opacity: 0.65,
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: -1,
  });

  const particleTexture = createParticleGlowTexture();
  const particleMaterial = new THREE.PointsMaterial({
    map: particleTexture,
    size: 0.6,
    transparent: true,
    opacity: 0.95,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  const activePulseMaterial = new THREE.MeshBasicMaterial({
    color: 0x67e8f9,
    transparent: true,
    opacity: 0.7,
    blending: THREE.AdditiveBlending,
  });

  // Enterprise Datacenter Server Rack Materials
  const serverChassisMaterial = new THREE.MeshStandardMaterial({
    color: 0x111726,
    roughness: 0.38,
    metalness: 0.82,
  });

  const serverTrimMaterial = new THREE.MeshStandardMaterial({
    color: 0x334155,
    roughness: 0.25,
    metalness: 0.9,
  });

  const fiberRacewayMaterial = new THREE.MeshStandardMaterial({
    color: 0xeab308,
    emissive: 0xa16207,
    emissiveIntensity: 0.35,
    roughness: 0.4,
    metalness: 0.2,
  });

  const coolingFanMaterial = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    roughness: 0.5,
    metalness: 0.6,
  });

  return {
    floorMaterials,
    pillarMaterial,
    glassMaterial,
    conduitMaterial,
    goldTrimMaterial,
    cyberCyanMaterial,
    emeraldMaterial,
    purpleMaterial,
    contactShadowMaterial,
    particleMaterial,
    activePulseMaterial,
    serverChassisMaterial,
    serverTrimMaterial,
    fiberRacewayMaterial,
    coolingFanMaterial,
  };
}
