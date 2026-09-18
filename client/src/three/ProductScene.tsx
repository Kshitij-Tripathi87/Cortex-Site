/*
 * Cortex Product Scenes — dedicated 3D worlds per product.
 *
 *   Workflo (execution assurance): CODE → SANDBOX → EXECUTION → HASH → RECEIPT
 *     Sealed containers, pipeline trace, hash ring, receipt seal.
 *   Nexus (operational intelligence): DATA → WORLD STATE → GRAPH → SIGNALS → SIMULATION → DECISION
 *     Operational graph, flowing signal particles, decision core.
 *   ASTRA (mission engineering): MISSION → REQUIREMENTS → ARCHITECTURES → TRADE-OFFS → MISSION PLAN
 *     Orbital geometry, trade-off beam, mission components.
 *
 * All scenes share the performance-tier Canvas wrapper, ambient/idle motion,
 * and cursor parallax. Reduced motion freezes animation.
 */

import { Suspense, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import Scene from "./Scene";
import {
  createBlackMetalMaterial,
  createChromeMaterial,
  createCobaltEmissiveMaterial,
  createNeonCyanMaterial,
  createSmokedGlassMaterial,
} from "./materials";

export type ProductVariant = "workflo" | "nexus" | "astra";

function seeded(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

function useReducedMotion(): boolean {
  const query = useMemo(
    () => (typeof window === "undefined" ? null : window.matchMedia("(prefers-reduced-motion: reduce)")),
    [],
  );
  return query?.matches ?? false;
}

function useCursorParallax(motionless: boolean) {
  const group = useRef<THREE.Group>(null);
  const target = useRef({ x: 0, y: 0 });
  const { pointer } = useThree();

  useFrame((state, delta) => {
    if (!group.current) return;
    const eased = 1 - Math.pow(0.0001, delta);
    if (!motionless) {
      target.current.x = THREE.MathUtils.lerp(target.current.x, pointer.y * 0.14, eased);
      target.current.y = THREE.MathUtils.lerp(target.current.y, pointer.x * 0.24, eased);
    }
    group.current.rotation.x = 0.16 + target.current.x;
    group.current.rotation.y += motionless ? 0 : target.current.y * delta * 0.5;
    group.current.position.y = Math.sin(state.clock.elapsedTime * (motionless ? 0 : 0.4)) * 0.07;
  });

  return group;
}

function SceneLights({ cyanSide = false }: { cyanSide?: boolean }) {
  return (
    <>
      <color attach="background" args={["#050609"]} />
      <fog attach="fog" args={["#050609", 8, 20]} />
      <ambientLight intensity={0.22} />
      <directionalLight position={[6, 8, 4]} intensity={0.5} color="#f4f6f8" />
      <pointLight position={[0, 0.6, 0]} color="#2457E6" distance={13} intensity={12} />
      <pointLight position={[cyanSide ? -5 : 5, -3, -4]} color={cyanSide ? "#00D9FF" : "#4E7EF0"} intensity={3} distance={12} />
    </>
  );
}

function SceneFloor() {
  return <gridHelper args={[22, 22, "#2457E6", "#141821"]} position={[0, -2.5, 0]} />;
}

// ---------------------------------------------------------------------------
// Workflo — CODE → SANDBOX → EXECUTION → HASH → RECEIPT
// ---------------------------------------------------------------------------
function WorkfloWorld({ motionless }: { motionless: boolean }) {
  const rig = useCursorParallax(motionless);
  const materials = useMemo(
    () => ({
      metal: createBlackMetalMaterial(),
      glass: createSmokedGlassMaterial(),
      chrome: createChromeMaterial(),
      cobalt: createCobaltEmissiveMaterial(1.7),
      cyan: createNeonCyanMaterial(1.2),
    }),
    [],
  );
  const receipt = useRef<THREE.Mesh>(null);
  const traceLine = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (receipt.current && !motionless) {
      receipt.current.rotation.y += delta * 0.5;
      receipt.current.position.y = 0.9 + Math.sin(state.clock.elapsedTime * 0.8) * 0.08;
    }
    if (traceLine.current) {
      const mat = traceLine.current.material as THREE.MeshBasicMaterial;
      mat.opacity = motionless ? 0.5 : 0.35 + Math.abs(Math.sin(state.clock.elapsedTime * 1.6)) * 0.3;
    }
  });

  // Five pipeline slabs in a row: code → sandbox → execution → hash → receipt.
  const stages = [1.0, 0.85, 1.15, 0.9, 0.75];

  return (
    <>
      <SceneLights />
      <SceneFloor />
      <group ref={rig} position={[0, 0.1, 0]}>
        {stages.map((width, i) => (
          <mesh key={i} position={[(i - 2) * 1.15, -0.6, 0]} material={i === 4 ? materials.cobalt : i === 2 ? materials.chrome : materials.metal}>
            <boxGeometry args={[width, 0.14, 0.9]} />
          </mesh>
        ))}
        {/* Pipeline trace connecting the stages */}
        <mesh ref={traceLine} position={[0, -0.6, 0.2]}>
          <boxGeometry args={[5.4, 0.008, 0.02]} />
          <meshBasicMaterial color="#2457E6" transparent opacity={0.5} />
        </mesh>
        {/* Receipt seal */}
        <mesh ref={receipt} position={[0, 0.9, 0]} material={materials.cobalt}>
          <cylinderGeometry args={[0.42, 0.42, 0.16, 6]} />
        </mesh>
        {/* Floating sandbox container */}
        <mesh position={[-2.1, 0.5, -0.6]} material={materials.glass}>
          <boxGeometry args={[0.55, 0.55, 0.55]} />
        </mesh>
        {/* Hash fragment */}
        <mesh position={[1.9, 0.35, -0.8]} material={materials.cyan}>
          <boxGeometry args={[0.16, 0.16, 0.16]} />
        </mesh>
      </group>
    </>
  );
}

// ---------------------------------------------------------------------------
// Nexus — DATA → WORLD STATE → GRAPH → SIGNALS → SIMULATION → DECISION
// ---------------------------------------------------------------------------
function NexusWorld({ motionless, tier }: { motionless: boolean; tier: "high" | "medium" | "low" }) {
  const rig = useCursorParallax(motionless);
  const materials = useMemo(
    () => ({
      cobalt: createCobaltEmissiveMaterial(1.9),
      chrome: createChromeMaterial(),
      glass: createSmokedGlassMaterial(),
    }),
    [],
  );
  const decision = useRef<THREE.Mesh>(null);
  const flow = useRef<THREE.Points>(null);

  const graph = useMemo(() => {
    const rand = seeded(7723);
    const nodes: THREE.Vector3[] = [];
    const count = tier === "high" ? 16 : 10;
    for (let i = 0; i < count; i++) {
      const angle = rand() * Math.PI * 2;
      const radius = 1.4 + rand() * 1.7;
      nodes.push(new THREE.Vector3(Math.cos(angle) * radius, -1.2 + rand() * 2.6, Math.sin(angle) * radius));
    }
    const linePositions: number[] = [];
    nodes.forEach((a, i) => {
      nodes.forEach((b, j) => {
        if (i < j && a.distanceTo(b) < 1.6) linePositions.push(a.x, a.y, a.z, b.x, b.y, b.z);
      });
    });
    return { nodes, linePositions: new Float32Array(linePositions) };
  }, [tier]);

  const flowPositions = useMemo(() => {
    const rand = seeded(9182);
    const arr = new Float32Array(40 * 3);
    for (let i = 0; i < 40; i++) {
      const angle = rand() * Math.PI * 2;
      const radius = 0.8 + rand() * 2.2;
      arr[i * 3] = Math.cos(angle) * radius;
      arr[i * 3 + 1] = -1.4 + rand() * 3;
      arr[i * 3 + 2] = Math.sin(angle) * radius;
    }
    return arr;
  }, []);

  useFrame((state, delta) => {
    if (decision.current && !motionless) {
      decision.current.rotation.y += delta * 0.4;
      decision.current.rotation.x += delta * 0.15;
    }
    if (flow.current && !motionless) {
      flow.current.rotation.y -= delta * 0.3;
    }
  });

  return (
    <>
      <SceneLights cyanSide />
      <SceneFloor />
      <group ref={rig} position={[0, 0.1, 0]}>
        {/* Operational graph */}
        <points>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[new Float32Array(graph.nodes.flatMap((n) => [n.x, n.y, n.z])), 3]} />
          </bufferGeometry>
          <pointsMaterial size={0.09} color="#9cb4ff" sizeAttenuation transparent opacity={0.95} />
        </points>
        <lineSegments>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[graph.linePositions, 3]} />
          </bufferGeometry>
          <lineBasicMaterial color="#2457E6" transparent opacity={0.4} />
        </lineSegments>
        {/* Flowing signal particles */}
        <points ref={flow}>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[flowPositions, 3]} />
          </bufferGeometry>
          <pointsMaterial size={0.05} color="#00D9FF" sizeAttenuation transparent opacity={0.75} />
        </points>
        {/* Decision core */}
        <mesh ref={decision} position={[0, 0.2, 0]} material={materials.cobalt}>
          <octahedronGeometry args={[0.55, 0]} />
        </mesh>
        {/* World-state shell */}
        <mesh position={[0, 0.2, 0]} material={materials.glass}>
          <sphereGeometry args={[1.0, 24, 24]} />
        </mesh>
        <mesh rotation={[Math.PI / 2.4, 0, 0]} material={materials.chrome}>
          <torusGeometry args={[1.6, 0.012, 8, 96]} />
        </mesh>
      </group>
    </>
  );
}

// ---------------------------------------------------------------------------
// ASTRA — MISSION → REQUIREMENTS → ARCHITECTURES → TRADE-OFFS → MISSION PLAN
// ---------------------------------------------------------------------------
function AstraWorld({ motionless }: { motionless: boolean }) {
  const rig = useCursorParallax(motionless);
  const materials = useMemo(
    () => ({
      chrome: createChromeMaterial(),
      metal: createBlackMetalMaterial(),
      cobalt: createCobaltEmissiveMaterial(1.6),
      glass: createSmokedGlassMaterial(),
    }),
    [],
  );
  const core = useRef<THREE.Mesh>(null);
  const ringA = useRef<THREE.Mesh>(null);
  const ringB = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (core.current && !motionless) core.current.rotation.y += delta * 0.35;
    if (ringA.current && !motionless) ringA.current.rotation.z += delta * 0.22;
    if (ringB.current && !motionless) ringB.current.rotation.z -= delta * 0.16;
  });

  return (
    <>
      <SceneLights />
      <SceneFloor />
      <group ref={rig} position={[0, 0.1, 0]}>
        {/* Mission core */}
        <mesh ref={core} position={[0, 0.3, 0]} material={materials.chrome}>
          <octahedronGeometry args={[0.6, 0]} />
        </mesh>
        {/* Trade-off beam balanced on the core */}
        <mesh position={[0, 1.15, 0]} material={materials.metal}>
          <boxGeometry args={[2.6, 0.05, 0.12]} />
        </mesh>
        <mesh position={[-1.15, 1.32, 0]} material={materials.cobalt}>
          <boxGeometry args={[0.3, 0.3, 0.3]} />
        </mesh>
        <mesh position={[1.15, 1.32, 0]} material={materials.glass}>
          <boxGeometry args={[0.3, 0.3, 0.3]} />
        </mesh>
        {/* Orbital rings */}
        <mesh ref={ringA} rotation={[Math.PI / 2.2, 0.4, 0]} material={materials.cobalt}>
          <torusGeometry args={[2.1, 0.014, 12, 110]} />
        </mesh>
        <mesh ref={ringB} rotation={[Math.PI / 1.8, -0.5, 0.4]} material={materials.chrome}>
          <torusGeometry args={[2.7, 0.01, 8, 110]} />
        </mesh>
        {/* Mission components */}
        <mesh position={[2.1, -0.4, 0.3]} material={materials.metal}>
          <boxGeometry args={[0.28, 0.28, 0.28]} />
        </mesh>
        <mesh position={[-2.0, -0.6, -0.4]} material={materials.glass}>
          <boxGeometry args={[0.34, 0.34, 0.34]} />
        </mesh>
      </group>
    </>
  );
}

export default function ProductScene({ variant, motionless = false }: { variant: ProductVariant; motionless?: boolean }) {
  const tier = useMemo(() => {
    if (typeof window === "undefined") return "high" as const;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return "low" as const;
    if (window.innerWidth < 1024) return "medium" as const;
    return "high" as const;
  }, []);

  const reduced = useReducedMotion();
  const frozen = motionless || reduced || tier === "low";

  return (
    <Scene className="product-scene-canvas" camera={{ position: [0, 0.9, 7], fov: 42 }}>
      {variant === "workflo" && <WorkfloWorld motionless={frozen} />}
      {variant === "nexus" && <NexusWorld motionless={frozen} tier={tier} />}
      {variant === "astra" && <AstraWorld motionless={frozen} />}
    </Scene>
  );
}
