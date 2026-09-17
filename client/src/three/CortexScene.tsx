/*
 * Cortex Intelligence Core — hero 3D system
 *
 * A floating architectural stack (black metal, smoked glass, chrome, cobalt
 * emissive) wrapped in a signal graph: nodes, connection lines, grid plane,
 * emissive ring, and a vertical signal spine. Responds to cursor position
 * (parallax drift) and scroll progress (layer separation + rotation + light).
 * Reduced motion / motionless mode freezes ambient animation.
 */

import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import {
  createBlackMetalMaterial,
  createChromeMaterial,
  createCobaltEmissiveMaterial,
  createNeonCyanMaterial,
  createSmokedGlassMaterial,
} from "./materials";

type CortexSceneProps = {
  /** 0..1 — scroll progress of the surrounding section; drives layer separation */
  scrollProgress?: number;
  /** Freeze ambient animation (reduced motion / low power) */
  motionless?: boolean;
  /** Visual density tier from the Scene wrapper */
  tier?: "high" | "medium" | "low";
};

// Deterministic pseudo-random for stable graph layout between renders.
function seeded(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

function SignalGraph({ count = 42 }: { count?: number }) {
  const { positions, linePositions } = useMemo(() => {
    const rand = seeded(1349);
    const nodes: THREE.Vector3[] = [];
    for (let i = 0; i < count; i++) {
      const angle = rand() * Math.PI * 2;
      const radius = 2.4 + rand() * 2.3;
      const height = -2.2 + rand() * 5.2;
      nodes.push(new THREE.Vector3(Math.cos(angle) * radius, height, Math.sin(angle) * radius));
    }
    const positions = new Float32Array(nodes.length * 3);
    nodes.forEach((node, i) => {
      positions[i * 3] = node.x;
      positions[i * 3 + 1] = node.y;
      positions[i * 3 + 2] = node.z;
    });
    const lines: number[] = [];
    nodes.forEach((a, i) => {
      nodes.forEach((b, j) => {
        if (i < j && a.distanceTo(b) < 1.75) {
          lines.push(a.x, a.y, a.z, b.x, b.y, b.z);
        }
      });
    });
    return { positions, linePositions: new Float32Array(lines) };
  }, [count]);

  return (
    <group>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <pointsMaterial size={0.055} color="#9cb4ff" sizeAttenuation transparent opacity={0.9} />
      </points>
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[linePositions, 3]} />
        </bufferGeometry>
        <lineBasicMaterial color="#2457E6" transparent opacity={0.32} />
      </lineSegments>
    </group>
  );
}

function IntelligenceStack({ separation }: { separation: number }) {
  const materials = useMemo(
    () => ({
      metal: createBlackMetalMaterial(),
      glass: createSmokedGlassMaterial(),
      chrome: createChromeMaterial(),
      cobalt: createCobaltEmissiveMaterial(1.6),
      cyan: createNeonCyanMaterial(1.1),
    }),
    [],
  );

  // Five architectural layers: signals → world state → simulation → decision → evidence.
  const layers = useMemo(
    () => [
      { key: "signals", size: 2.6, material: materials.metal },
      { key: "world", size: 2.25, material: materials.glass },
      { key: "simulation", size: 1.9, material: materials.chrome },
      { key: "decision", size: 1.55, material: materials.glass },
      { key: "evidence", size: 1.2, material: materials.cobalt },
    ],
    [materials],
  );

  return (
    <group>
      {layers.map((layer, index) => {
        const y = (index - 2) * (0.62 + separation * 0.55);
        return (
          <mesh key={layer.key} position={[0, y, 0]} material={layer.material} castShadow>
            <boxGeometry args={[layer.size, 0.18, layer.size]} />
          </mesh>
        );
      })}
      {/* Signal spine through the stack */}
      <mesh position={[0, 0, 0]} material={materials.cyan}>
        <boxGeometry args={[0.022, 3.4 + separation, 0.022]} />
      </mesh>
    </group>
  );
}

export default function CortexScene({ scrollProgress = 0, motionless = false, tier = "high" }: CortexSceneProps) {
  const rig = useRef<THREE.Group>(null);
  const light = useRef<THREE.PointLight>(null);
  const ring = useRef<THREE.Mesh>(null);
  const { pointer } = useThree();

  const target = useRef({ x: 0, y: 0 });

  useFrame((state, delta) => {
    if (!rig.current) return;
    const eased = 1 - Math.pow(0.0001, delta);

    if (!motionless) {
      target.current.x = THREE.MathUtils.lerp(target.current.x, pointer.y * 0.18, eased);
      target.current.y = THREE.MathUtils.lerp(target.current.y, pointer.x * 0.3, eased);
      rig.current.rotation.y += delta * 0.12;
    }

    rig.current.rotation.x = 0.18 + target.current.x;
    rig.current.rotation.y += motionless ? 0 : target.current.y * delta * 0.6;

    // Scroll drives stack separation + ring expansion + light intensity.
    const separation = Math.min(1, scrollProgress * 1.15);
    rig.current.position.y = Math.sin(state.clock.elapsedTime * (motionless ? 0 : 0.42)) * 0.08;
    rig.current.scale.setScalar(1 + separation * 0.12);

    if (ring.current) {
      ring.current.rotation.z += motionless ? 0 : delta * 0.2;
      const ringMat = ring.current.material as THREE.MeshStandardMaterial;
      ringMat.emissiveIntensity = 0.6 + separation * 1.6;
    }
    if (light.current) {
      light.current.intensity = 14 + separation * 22;
    }
  });

  const chromeMaterial = useMemo(() => createChromeMaterial(), []);
  const cobaltEdge = useMemo(() => createCobaltEmissiveMaterial(1.2), []);

  return (
    <>
      <color attach="background" args={["#050609"]} />
      <fog attach="fog" args={["#050609", 9, 22]} />

      <ambientLight intensity={0.22} />
      <directionalLight position={[6, 8, 4]} intensity={0.55} color="#f4f6f8" />
      <pointLight ref={light} position={[0, 0.4, 0]} color="#2457E6" distance={14} intensity={14} />
      <pointLight position={[-5, -3, -4]} color="#00D9FF" intensity={3.4} distance={12} />

      <group ref={rig} position={[0, 0.15, 0]}>
        <IntelligenceStack separation={Math.min(1, scrollProgress * 1.15)} />
        <SignalGraph count={tier === "high" ? 46 : tier === "medium" ? 32 : 20} />

        {/* Emissive orbit ring */}
        <mesh ref={ring} rotation={[Math.PI / 2.35, 0, 0]} material={cobaltEdge}>
          <torusGeometry args={[3.35, 0.016, 16, 128]} />
        </mesh>
        <mesh rotation={[Math.PI / 2.6, 0, 0.5]} material={chromeMaterial}>
          <torusGeometry args={[3.95, 0.01, 8, 128]} />
        </mesh>
      </group>

      {/* Technical floor grid */}
      <gridHelper args={[26, 26, "#2457E6", "#141821"]} position={[0, -2.6, 0]}>
        <lineBasicMaterial attach="material" color="#1c2129" transparent opacity={0.5} />
      </gridHelper>
    </>
  );
}
