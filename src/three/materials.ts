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
}

export function initMaterialLibrary(isSoftwareGl: boolean): MaterialLibrary {
  const floorMaterials = new Map<number, THREE.MeshStandardMaterial>();

  const levelColorConfigs = [
    { level: 4, primary: '#f59e0b', grid: '#fbbf24', ring: '#f59e0b', roughness: 0.25, metalness: 0.6 },
    { level: 3, primary: '#06b6d4', grid: '#38bdf8', ring: '#0284c7', roughness: 0.35, metalness: 0.5 },
    { level: 2, primary: '#10b981', grid: '#34d399', ring: '#059669', roughness: 0.3, metalness: 0.5 },
    { level: 1, primary: '#8b5cf6', grid: '#a78bfa', ring: '#7c3aed', roughness: 0.4, metalness: 0.4 },
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
  };
}
