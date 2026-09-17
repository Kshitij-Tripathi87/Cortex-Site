/*
 * Cortex 3D Materials — Cyber-Brutalist Material System
 *
 * GLSL-based materials for:
 * - Black Metal (hard edges, subtle sheen)
 * - Smoked Glass / Acrylic (transmission, blur)
 * - Chrome (metallic, reflective)
 * - Emissive Cobalt (signal glow)
 */

import { MeshStandardMaterial, MeshPhysicalMaterial, ShaderMaterial, UniformsLib } from "three";

// ---------------------------------------------------------------------------
// Black Metal — hard-edged, dark, subtle sheen
// ---------------------------------------------------------------------------
export function createBlackMetalMaterial() {
  return new MeshStandardMaterial({
    color: 0x0A0D11,
    metalness: 0.85,
    roughness: 0.35,
    envMapIntensity: 0.6,
    emissive: 0x000000,
  });
}

// ---------------------------------------------------------------------------
// Smoked Glass / Acrylic — transmission + blur
// ---------------------------------------------------------------------------
export function createSmokedGlassMaterial() {
  return new MeshPhysicalMaterial({
    color: 0x0A0D11,
    metalness: 0.1,
    roughness: 0.08,
    transmission: 0.85,
    thickness: 0.5,
    ior: 1.5,
    specularIntensity: 0.4,
    envMapIntensity: 0.5,
    emissive: 0x000000,
  });
}

// ---------------------------------------------------------------------------
// Chrome — highly reflective metal
// ---------------------------------------------------------------------------
export function createChromeMaterial() {
  return new MeshStandardMaterial({
    color: 0xC4CDD8,
    metalness: 1.0,
    roughness: 0.05,
    envMapIntensity: 1.2,
    emissive: 0x000000,
  });
}

// ---------------------------------------------------------------------------
// Emissive Cobalt — signal glow
// ---------------------------------------------------------------------------
export function createCobaltEmissiveMaterial(intensity: number = 1.0) {
  return new MeshStandardMaterial({
    color: 0x2457E6,
    emissive: 0x2457E6,
    emissiveIntensity: intensity,
    metalness: 0.5,
    roughness: 0.4,
  });
}

// ---------------------------------------------------------------------------
// Neon Cyan — occasional secondary signal
// ---------------------------------------------------------------------------
export function createNeonCyanMaterial(intensity: number = 1.0) {
  return new MeshStandardMaterial({
    color: 0x00D9FF,
    emissive: 0x00D9FF,
    emissiveIntensity: intensity,
    metalness: 0.7,
    roughness: 0.3,
  });
}

// ---------------------------------------------------------------------------
// Procedural GLSL — layered noise for organic signal flow
// ---------------------------------------------------------------------------
export const signalFlowVertexShader = `
  varying vec3 vPosition;
  varying vec3 vNormal;
  varying vec2 vUv;
  uniform float uTime;
  uniform float uIntensity;

  void main() {
    vPosition = position;
    vNormal = normalMatrix * normal;
    vUv = uv;

    vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * modelViewPosition;
  }
`;

export const signalFlowFragmentShader = `
  varying vec3 vPosition;
  varying vec3 vNormal;
  varying vec2 vUv;
  uniform float uTime;
  uniform float uIntensity;
  uniform vec3 uColor;

  // Simplex noise for organic signal flow
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 tinv(vec4 x) { return mod289((34.0 * x + 0.5) * x); }
  float snoise(vec3 v) {
    const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 i1 = x0.y < x0.x ? x0.xyz + vec3(1.0, 0.0, 0.0) : x0.xyz + vec3(0.0, 1.0, 0.0);
    vec3 x1 = x0 - i1 + D.xxx;
    vec3 x2 = x0 - D.yyy;
    i = mod289(i);
    vec3 p0 = tinv(i.zxy + vec3(0.0, 0.0, 0.0)).xyz;
    vec3 p1 = tinv(i.zxy + i1).xyz;
    vec3 p2 = tinv(i.zxy + vec3(1.0, 1.0, 1.0)).xyz;
    vec3 p3 = tinv(i.zxy + vec3(0.5, 0.5, 0.5)).xyz;
    vec4 ns = tinv(p0.zzyw, p1.zzyw, p2.zzyw, p3.zzyw) * 0.5;
    vec4 j = ns - floor(ns) * 4.0;
    vec4 x_ = dot(j, vec4(p0, p1, p2, p3));
    vec4 h_ = max(0.5 - dot(x_, x_), 0.0);
    vec4 n = h_ * h_ * h_ * dot(x_, j);
    return dot(n, vec4(1.0, 1.0, 1.0, 1.0)) * 0.5 + 0.5;
  }

  void main() {
    vec3 normal = normalize(vNormal);
    vec3 viewDir = normalize(cameraPosition - vPosition);
    float fresnel = pow(1.0 - max(dot(viewDir, normal), 0.0), 2.0);

    float noise = snoise(vPosition * 0.5 + uTime * 0.1);
    float flow = sin(vPosition.x * 5.0 + uTime * 2.0) * 0.5 + 0.5;

    vec3 color = uColor * (noise * 0.5 + 0.5) * uIntensity;
    color += uColor * fresnel * 0.6;
    color += uColor * flow * 0.3;

    gl_FragColor = vec4(color, 1.0);
  }
`;

export function createSignalFlowMaterial() {
  const material = new ShaderMaterial({
    vertexShader: signalFlowVertexShader,
    fragmentShader: signalFlowFragmentShader,
    uniforms: {
      uTime: { value: 0 },
      uIntensity: { value: 1.0 },
      uColor: { value: [0.14, 0.34, 0.90] }, // #2457E6
    },
    transparent: false,
  });
  return material;
}