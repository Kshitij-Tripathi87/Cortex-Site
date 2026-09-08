/* Cinematic system: Cortex Intelligence Field. An abstract graph — nodes,
 * relationships, flowing signals, one cobalt core. Restrained state machine,
 * pointer parallax, scroll drift. No spinning, no flashing. */
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";

export type FieldRig = {
  scroll: { current: number };
  pointer: { current: { x: number; y: number } };
  visible: { current: boolean };
};

/** Deterministic RNG so the field is stable across mounts. */
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const NODE_COLOR = new THREE.Color("#aeb9c9");
const PULSE_COLOR = new THREE.Color("#5b82ff");
const CORE_COLOR = new THREE.Color("#2457e6");

const NODE_VERTEX = /* glsl */ `
  attribute float aSize;
  attribute float aPhase;
  uniform float uTime;
  uniform float uPixelRatio;
  varying float vAlpha;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    float twinkle = 0.7 + 0.3 * sin(uTime * 0.8 + aPhase);
    vAlpha = twinkle;
    gl_PointSize = aSize * uPixelRatio * (120.0 / -mv.z);
    gl_Position = projectionMatrix * mv;
  }
`;

const NODE_FRAGMENT = /* glsl */ `
  precision mediump float;
  uniform vec3 uColor;
  uniform float uOpacity;
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float disc = smoothstep(0.5, 0.1, d);
    if (disc < 0.01) discard;
    gl_FragColor = vec4(uColor, disc * vAlpha * uOpacity);
  }
`;

function glowTexture(): THREE.Texture {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, "rgba(91,130,255,1)");
  gradient.addColorStop(0.25, "rgba(91,130,255,0.5)");
  gradient.addColorStop(0.6, "rgba(36,87,230,0.14)");
  gradient.addColorStop(1, "rgba(36,87,230,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function Field({ rig, compact }: { rig: FieldRig; compact: boolean }) {
  const nodeCount = compact ? 90 : 210;
  const maxEdges = compact ? 150 : 380;
  const pulseCount = compact ? 5 : 10;

  const pointsRef = useRef<THREE.Points>(null!);
  const groupRef = useRef<THREE.Group>(null!);
  const coreRef = useRef<THREE.Mesh>(null!);
  const glowRef = useRef<THREE.Sprite>(null!);
  const spriteRefs = useRef<(THREE.Sprite | null)[]>([]);
  const timeRef = useRef(0);

  const { nodeGeometry, nodeMaterial, edgeGeometry, endpoints } = useMemo(() => {
    const rand = mulberry32(20260908);
    const positions = new Float32Array(nodeCount * 3);
    const sizes = new Float32Array(nodeCount);
    const phases = new Float32Array(nodeCount);

    for (let i = 0; i < nodeCount; i++) {
      // Flattened ellipsoid, wide and shallow; every 5th node joins the core cluster.
      const core = i % 5 === 0;
      const spread = core ? 0.32 : 1;
      positions[i * 3] = (rand() * 2 - 1) * 9 * spread;
      positions[i * 3 + 1] = (rand() * 2 - 1) * 3.4 * spread;
      positions[i * 3 + 2] = (rand() * 2 - 1) * 4.2 * spread;
      sizes[i] = (core ? 5.2 : 2.6) + rand() * (core ? 2.4 : 2.2);
      phases[i] = rand() * Math.PI * 2;
    }

    // Connect near neighbors; keep the graph sparse.
    const threshold = compact ? 3.4 : 3.1;
    const pairs: [number, number][] = [];
    for (let i = 0; i < nodeCount && pairs.length < maxEdges; i++) {
      for (let j = i + 1; j < nodeCount && pairs.length < maxEdges; j++) {
        const dx = positions[i * 3] - positions[j * 3];
        const dy = positions[i * 3 + 1] - positions[j * 3 + 1];
        const dz = positions[i * 3 + 2] - positions[j * 3 + 2];
        if (dx * dx + dy * dy + dz * dz < threshold * threshold) pairs.push([i, j]);
      }
    }

    const edgePositions = new Float32Array(pairs.length * 6);
    const ends = new Float32Array(pairs.length * 6);
    pairs.forEach(([a, b], k) => {
      for (let c = 0; c < 3; c++) {
        edgePositions[k * 6 + c] = positions[a * 3 + c];
        edgePositions[k * 6 + 3 + c] = positions[b * 3 + c];
        ends[k * 6 + c] = positions[a * 3 + c];
        ends[k * 6 + 3 + c] = positions[b * 3 + c];
      }
    });

    const nodeGeometry = new THREE.BufferGeometry();
    nodeGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    nodeGeometry.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
    nodeGeometry.setAttribute("aPhase", new THREE.BufferAttribute(phases, 1));

    const nodeMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uPixelRatio: { value: Math.min(window.devicePixelRatio, 1.75) },
        uColor: { value: NODE_COLOR },
        uOpacity: { value: 0.85 },
      },
      vertexShader: NODE_VERTEX,
      fragmentShader: NODE_FRAGMENT,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const edgeGeometry = new THREE.BufferGeometry();
    edgeGeometry.setAttribute("position", new THREE.BufferAttribute(edgePositions, 3));

    return { nodeGeometry, nodeMaterial, edgeGeometry, endpoints: ends, edgeCount: pairs.length };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [compact]);

  const edgeMaterial = useMemo(
    () =>
      new THREE.LineBasicMaterial({
        color: new THREE.Color("#7d8798"),
        transparent: true,
        opacity: 0.24,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    [],
  );

  const pulseMaterial = useMemo(
    () =>
      new THREE.SpriteMaterial({
        map: glowTexture(),
        color: PULSE_COLOR,
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    [],
  );

  const glowMaterial = useMemo(
    () =>
      new THREE.SpriteMaterial({
        map: glowTexture(),
        color: CORE_COLOR,
        transparent: true,
        opacity: 0.55,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    [],
  );

  const pulses = useMemo(
    () =>
      Array.from({ length: pulseCount }, () => ({
        edge: Math.floor(Math.random() * Math.max(1, endpoints.length / 6)),
        t: Math.random(),
        speed: 0.1 + Math.random() * 0.16,
      })),
    [pulseCount, endpoints],
  );

  const tmp = useMemo(() => new THREE.Vector3(), []);
  const camTarget = useMemo(() => new THREE.Vector3(), []);

  useFrame((state, delta) => {
    if (!rig.visible.current) return;
    const dt = Math.min(delta, 0.05);
    timeRef.current += dt;
    const t = timeRef.current;

    // State machine: 16s cycle. IDLE → SIGNAL → ACTIVATE → PROCESS → PATH → IDLE.
    const phase = t % 16;
    const signal = phase > 5.5 && phase < 9 ? Math.sin(((phase - 5.5) / 3.5) * Math.PI) : 0;
    const process = phase > 9 && phase < 12.5 ? Math.sin(((phase - 9) / 3.5) * Math.PI) : 0;

    nodeMaterial.uniforms.uTime.value = t;
    edgeMaterial.opacity = 0.2 + signal * 0.12;

    // Core breathes with the cycle; group drifts almost imperceptibly.
    const coreScale = 1 + process * 0.28 + Math.sin(t * 0.7) * 0.04;
    coreRef.current.scale.setScalar(coreScale);
    glowMaterial.opacity = 0.45 + signal * 0.25 + process * 0.25;
    glowRef.current.scale.setScalar(2.4 + process * 1.1);
    groupRef.current.rotation.y = Math.sin(t * 0.05) * 0.08;

    // Signal pulses travel the relationships.
    const edgeTotal = Math.max(1, endpoints.length / 6);
    for (let i = 0; i < pulses.length; i++) {
      const pulse = pulses[i];
      pulse.t += dt * pulse.speed * (1 + signal * 1.6);
      if (pulse.t >= 1) {
        pulse.t = 0;
        pulse.edge = Math.floor(Math.random() * edgeTotal);
      }
      const sprite = spriteRefs.current[i];
      if (!sprite) continue;
      const o = pulse.edge * 6;
      tmp.set(
        endpoints[o] + (endpoints[o + 3] - endpoints[o]) * pulse.t,
        endpoints[o + 1] + (endpoints[o + 4] - endpoints[o + 1]) * pulse.t,
        endpoints[o + 2] + (endpoints[o + 5] - endpoints[o + 2]) * pulse.t,
      );
      sprite.position.copy(tmp);
      const s = 0.34 + signal * 0.22;
      sprite.scale.set(s, s, 1);
    }
    pulseMaterial.opacity = 0.55 + signal * 0.4;

    // Camera: pointer parallax + scroll drift, heavily damped.
    const pointer = rig.pointer.current;
    const scroll = Math.min(Math.max(rig.scroll.current, 0), 1);
    camTarget.set(pointer.x * 0.9, 0.6 + pointer.y * -0.5 + scroll * 2.4, 13);
    state.camera.position.lerp(camTarget, 1 - Math.exp(-dt * 2.2));
    state.camera.lookAt(0, scroll * 1.6, 0);
  });

  return (
    <group ref={groupRef}>
      <points ref={pointsRef} geometry={nodeGeometry} material={nodeMaterial} frustumCulled={false} />
      {/* eslint-disable-next-line react/no-unknown-property */}
      <lineSegments geometry={edgeGeometry} material={edgeMaterial} frustumCulled={false} />
      <mesh ref={coreRef}>
        <icosahedronGeometry args={[0.3, 1]} />
        <meshBasicMaterial color={CORE_COLOR} toneMapped={false} />
      </mesh>
      <sprite ref={glowRef} material={glowMaterial} scale={[2.4, 2.4, 1]} />
      {pulses.map((_, i) => (
        <sprite
          key={i}
          ref={(sprite) => {
            spriteRefs.current[i] = sprite;
          }}
          material={pulseMaterial}
          scale={[0.34, 0.34, 1]}
        />
      ))}
    </group>
  );
}

export default function FieldCanvas({ rig, compact }: { rig: FieldRig; compact: boolean }) {
  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ position: [0, 0.6, 13], fov: 42, near: 0.1, far: 60 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
      aria-hidden="true"
    >
      <Field rig={rig} compact={compact} />
    </Canvas>
  );
}
