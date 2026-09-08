/* Cinematic system: Cortex Intelligence Field. Signals → relationships →
 * core → propagation → decision. Layered depth (dust, graph, core), a periodic
 * convergence event with a shockwave ring, scroll-linked fade and dolly.
 * No spinning, no flashing — the cycle breathes on a 16s loop. */
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
const DUST_COLOR = new THREE.Color("#59616e");
const PULSE_COLOR = new THREE.Color("#5b82ff");
const CORE_COLOR = new THREE.Color("#2457e6");

const POINT_VERTEX = /* glsl */ `
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

const POINT_FRAGMENT = /* glsl */ `
  precision mediump float;
  uniform vec3 uColor;
  uniform float uOpacity;
  uniform float uFade;
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float disc = smoothstep(0.5, 0.1, d);
    if (disc < 0.01) discard;
    gl_FragColor = vec4(uColor, disc * vAlpha * uOpacity * uFade);
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
  const dustCount = compact ? 120 : 320;
  const maxEdges = compact ? 150 : 380;
  const pulseCount = compact ? 5 : 10;

  const groupRef = useRef<THREE.Group>(null!);
  const dustRef = useRef<THREE.Points>(null!);
  const coreRef = useRef<THREE.Mesh>(null!);
  const coreMatRef = useRef<THREE.MeshBasicMaterial>(null!);
  const glowRef = useRef<THREE.Sprite>(null!);
  const ringRef = useRef<THREE.Mesh>(null!);
  const ringMatRef = useRef<THREE.MeshBasicMaterial>(null!);
  const spriteRefs = useRef<(THREE.Sprite | null)[]>([]);
  const timeRef = useRef(0);

  const graph = useMemo(() => {
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

    // Background dust: a deep, quiet plane far behind the graph.
    const dustRand = mulberry32(77);
    const dustPositions = new Float32Array(dustCount * 3);
    const dustSizes = new Float32Array(dustCount);
    const dustPhases = new Float32Array(dustCount);
    for (let i = 0; i < dustCount; i++) {
      dustPositions[i * 3] = (dustRand() * 2 - 1) * 16;
      dustPositions[i * 3 + 1] = (dustRand() * 2 - 1) * 7;
      dustPositions[i * 3 + 2] = -4 - dustRand() * 13;
      dustSizes[i] = 0.8 + dustRand() * 1.4;
      dustPhases[i] = dustRand() * Math.PI * 2;
    }

    const pixelRatio = Math.min(window.devicePixelRatio, 1.75);
    const makePoints = (count: number, pos: Float32Array, size: Float32Array, phase: Float32Array, color: THREE.Color, opacity: number) => {
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      geometry.setAttribute("aSize", new THREE.BufferAttribute(size, 1));
      geometry.setAttribute("aPhase", new THREE.BufferAttribute(phase, 1));
      const material = new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uPixelRatio: { value: pixelRatio },
          uColor: { value: color },
          uOpacity: { value: opacity },
          uFade: { value: 1 },
        },
        vertexShader: POINT_VERTEX,
        fragmentShader: POINT_FRAGMENT,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
      return { geometry, material, count };
    };

    const nodes = makePoints(nodeCount, positions, sizes, phases, NODE_COLOR, 0.85);
    const dust = makePoints(dustCount, dustPositions, dustSizes, dustPhases, DUST_COLOR, 0.5);

    const edgeGeometry = new THREE.BufferGeometry();
    edgeGeometry.setAttribute("position", new THREE.BufferAttribute(edgePositions, 3));

    return { nodes, dust, edgeGeometry, endpoints: ends };
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
        edge: Math.floor(Math.random() * Math.max(1, graph.endpoints.length / 6)),
        t: Math.random(),
        speed: 0.1 + Math.random() * 0.16,
      })),
    [pulseCount, graph.endpoints],
  );

  const tmp = useMemo(() => new THREE.Vector3(), []);
  const camTarget = useMemo(() => new THREE.Vector3(), []);

  useFrame((state, delta) => {
    if (!rig.visible.current) return;
    const dt = Math.min(delta, 0.05);
    timeRef.current += dt;
    const t = timeRef.current;

    // Scroll: the field recedes and dissolves as the hero leaves.
    const scroll = Math.min(Math.max(rig.scroll.current, 0), 1);
    const fade = 1 - THREE.MathUtils.smoothstep(scroll, 0.25, 0.95);

    // State machine: 16s cycle. IDLE → SIGNAL → ACTIVATE → PROCESS → PATH → IDLE.
    const phase = t % 16;
    const signal = phase > 5.5 && phase < 9 ? Math.sin(((phase - 5.5) / 3.5) * Math.PI) : 0;
    const process = phase > 9 && phase < 12.5 ? Math.sin(((phase - 9) / 3.5) * Math.PI) : 0;
    const ringP = phase > 9 && phase < 12.5 ? (phase - 9) / 3.5 : -1;

    graph.nodes.material.uniforms.uTime.value = t;
    graph.nodes.material.uniforms.uFade.value = fade;
    graph.dust.material.uniforms.uTime.value = t;
    graph.dust.material.uniforms.uFade.value = fade;
    dustRef.current.rotation.y = t * 0.008;
    edgeMaterial.opacity = (0.2 + signal * 0.12) * fade;

    // Core breathes with the cycle; group drifts almost imperceptibly.
    const coreScale = 1 + process * 0.28 + Math.sin(t * 0.7) * 0.04;
    coreRef.current.scale.setScalar(coreScale);
    coreMatRef.current.opacity = fade;
    glowMaterial.opacity = (0.45 + signal * 0.25 + process * 0.25) * fade;
    glowRef.current.scale.setScalar(2.4 + process * 1.1);
    groupRef.current.rotation.y = Math.sin(t * 0.05) * 0.08;

    // Decision event: pulses converge on the core, which answers with one ring.
    const converge = 1 - process * 0.35;
    const edgeTotal = Math.max(1, graph.endpoints.length / 6);
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
        graph.endpoints[o] + (graph.endpoints[o + 3] - graph.endpoints[o]) * pulse.t,
        graph.endpoints[o + 1] + (graph.endpoints[o + 4] - graph.endpoints[o + 1]) * pulse.t,
        graph.endpoints[o + 2] + (graph.endpoints[o + 5] - graph.endpoints[o + 2]) * pulse.t,
      );
      tmp.multiplyScalar(converge);
      sprite.position.copy(tmp);
      const s = 0.34 + signal * 0.22;
      sprite.scale.set(s, s, 1);
    }
    pulseMaterial.opacity = (0.55 + signal * 0.4) * fade;

    if (ringP >= 0) {
      const s = 0.6 + ringP * 5.2;
      ringRef.current.scale.set(s, s, 1);
      ringMatRef.current.opacity = (1 - ringP) * 0.5 * fade;
    } else {
      ringMatRef.current.opacity = 0;
    }

    // Camera: pointer parallax + scroll drift and dolly, heavily damped.
    const pointer = rig.pointer.current;
    camTarget.set(pointer.x * 0.9, 0.6 + pointer.y * -0.5 + scroll * 2.4, 13 + scroll * 2.5);
    state.camera.position.lerp(camTarget, 1 - Math.exp(-dt * 2.2));
    state.camera.lookAt(0, scroll * 1.6, 0);
  });

  return (
    <group ref={groupRef}>
      <points geometry={graph.dust.geometry} material={graph.dust.material} frustumCulled={false} ref={dustRef} />
      <points geometry={graph.nodes.geometry} material={graph.nodes.material} frustumCulled={false} />
      {/* eslint-disable-next-line react/no-unknown-property */}
      <lineSegments geometry={graph.edgeGeometry} material={edgeMaterial} frustumCulled={false} />
      <mesh ref={coreRef}>
        <icosahedronGeometry args={[0.3, 1]} />
        <meshBasicMaterial ref={coreMatRef} color={CORE_COLOR} toneMapped={false} transparent />
      </mesh>
      <sprite ref={glowRef} material={glowMaterial} scale={[2.4, 2.4, 1]} />
      <mesh ref={ringRef}>
        <ringGeometry args={[0.95, 1, 64]} />
        <meshBasicMaterial ref={ringMatRef} color={PULSE_COLOR} toneMapped={false} transparent opacity={0} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
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
      camera={{ position: [0, 0.6, 13], fov: 42, near: 0.1, far: 80 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
      aria-hidden="true"
    >
      <Field rig={rig} compact={compact} />
    </Canvas>
  );
}
