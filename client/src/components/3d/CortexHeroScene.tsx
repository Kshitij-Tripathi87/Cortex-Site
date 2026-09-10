import { Canvas, useFrame } from "@react-three/fiber";
import { useReducedMotion } from "framer-motion";
import { Suspense, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

function hash(index: number) {
  const x = Math.sin(index * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

type Rig = {
  scroll: { current: number };
  pointer: { current: { x: number; y: number } };
};

function HeroWorld({ rig, reduced }: { rig: Rig; reduced: boolean }) {
  const root = useRef<THREE.Group>(null);
  const core = useRef<THREE.Group>(null);
  const beam = useRef<THREE.Mesh>(null);
  const pulse = useRef<THREE.Mesh>(null);
  const nodeRefs = useRef<THREE.Mesh[]>([]);
  const layerRefs = useRef<THREE.Mesh[]>([]);

  const nodes = useMemo(
    () =>
      Array.from({ length: 34 }, (_, index) => {
        const a = hash(index) * Math.PI * 2;
        const b = (hash(index + 40) - 0.5) * 1.3;
        const radius = 3.4 + hash(index + 80) * 3.8;
        return {
          position: [Math.cos(a) * radius, b * 2.2, Math.sin(a) * radius * 0.72] as [number, number, number],
          scale: 0.025 + hash(index + 120) * 0.055,
        };
      }),
    [],
  );

  const links = useMemo(() => {
    const lines: [THREE.Vector3, THREE.Vector3][] = [];
    for (let i = 0; i < nodes.length; i += 1) {
      let best = -1;
      let bestDistance = Number.POSITIVE_INFINITY;
      for (let j = 0; j < nodes.length; j += 1) {
        if (i === j) continue;
        const a = new THREE.Vector3(...nodes[i].position);
        const b = new THREE.Vector3(...nodes[j].position);
        const distance = a.distanceTo(b);
        if (distance < bestDistance && distance < 3.8) {
          bestDistance = distance;
          best = j;
        }
      }
      if (best >= 0 && best > i) lines.push([new THREE.Vector3(...nodes[i].position), new THREE.Vector3(...nodes[best].position)]);
    }
    return lines;
  }, [nodes]);

  const lineGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(links.length * 6);
    links.forEach(([a, b], index) => {
      positions.set([a.x, a.y, a.z, b.x, b.y, b.z], index * 6);
    });
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geometry;
  }, [links]);

  useFrame((state, delta) => {
    if (!root.current) return;
    const t = state.clock.elapsedTime;
    const scroll = THREE.MathUtils.clamp(rig.scroll.current, 0, 1);
    const pointerX = rig.pointer.current.x;
    const pointerY = rig.pointer.current.y;

    root.current.rotation.y += delta * (reduced ? 0.005 : 0.018);
    root.current.rotation.x = THREE.MathUtils.lerp(root.current.rotation.x, pointerY * -0.08 - scroll * 0.16, 0.045);
    root.current.position.y = THREE.MathUtils.lerp(root.current.position.y, scroll * 0.9, 0.055);

    if (core.current) {
      core.current.rotation.y = -pointerX * 0.22 + t * 0.045;
      core.current.rotation.x = pointerY * 0.13;
      const scale = 1 + Math.sin(t * 1.1) * 0.035 + scroll * 0.12;
      core.current.scale.setScalar(scale);
    }

    layerRefs.current.forEach((mesh, index) => {
      if (!mesh) return;
      const phase = index * 0.7;
      mesh.position.y = (index - 2) * 0.62 + Math.sin(t * 0.65 + phase) * 0.045 + scroll * (index - 2) * 0.18;
      mesh.rotation.z = Math.sin(t * 0.28 + phase) * 0.025 + pointerX * 0.035;
      mesh.rotation.x = Math.cos(t * 0.3 + phase) * 0.018 + pointerY * 0.02;
    });

    nodeRefs.current.forEach((node, index) => {
      if (!node) return;
      const base = nodes[index].position;
      const pulseAmount = reduced ? 0.01 : 0.035;
      node.position.x = base[0] + Math.sin(t * 0.33 + index) * pulseAmount;
      node.position.y = base[1] + Math.cos(t * 0.29 + index * 0.7) * pulseAmount;
      node.position.z = base[2] + Math.sin(t * 0.23 + index * 0.4) * pulseAmount;
      const s = nodes[index].scale * (1 + Math.sin(t * 0.9 + index) * 0.2);
      node.scale.setScalar(s);
    });

    if (beam.current) {
      beam.current.position.y = Math.sin(t * 0.7) * 2.8;
      (beam.current.material as THREE.MeshBasicMaterial).opacity = 0.1 + (Math.sin(t * 0.7) + 1) * 0.055;
    }
    if (pulse.current) {
      const cycle = (t % 8) / 8;
      pulse.current.scale.setScalar(0.5 + cycle * 3.8);
      (pulse.current.material as THREE.MeshBasicMaterial).opacity = Math.max(0, 0.26 * (1 - cycle));
    }

    state.camera.position.lerp(
      new THREE.Vector3(pointerX * 1.25, 0.2 + pointerY * -0.45 - scroll * 1.3, 11.5 - scroll * 2.1),
      1 - Math.exp(-delta * 2.3),
    );
    state.camera.lookAt(0, scroll * 0.7, 0);
  });

  const material = new THREE.MeshPhysicalMaterial({
    color: "#111722",
    metalness: 0.62,
    roughness: 0.22,
    transparent: true,
    opacity: 0.84,
    clearcoat: 0.9,
    clearcoatRoughness: 0.15,
  });

  return (
    <group ref={root}>
      <ambientLight intensity={0.36} />
      <directionalLight position={[4, 6, 7]} intensity={2.2} color="#b7c6ff" />
      <pointLight position={[0, 0, 0]} intensity={16} distance={9} color="#2457e6" />
      <pointLight position={[-4, 2, 4]} intensity={7} distance={8} color="#6b85ff" />

      <group ref={core}>
        {[0, 1, 2, 3, 4].map((index) => (
          <mesh
            key={index}
            ref={(mesh) => {
              if (mesh) layerRefs.current[index] = mesh;
            }}
            material={material}
            rotation={[0.08 * index, 0.14 * index, 0.035 * index]}
          >
            <boxGeometry args={[4.9 - index * 0.28, 1.35, 3.15 - index * 0.22]} />
            <lineSegments>
              <edgesGeometry args={[new THREE.BoxGeometry(4.9 - index * 0.28, 1.35, 3.15 - index * 0.22)]} />
              <lineBasicMaterial color="#6f8fff" transparent opacity={0.42} />
            </lineSegments>
          </mesh>
        ))}
        <mesh position={[0, 0.08, 0]}>
          <icosahedronGeometry args={[0.55, 2]} />
          <meshBasicMaterial color="#5b82ff" wireframe transparent opacity={0.9} />
        </mesh>
        <mesh position={[0, 0.08, 0]}>
          <octahedronGeometry args={[0.36, 0]} />
          <meshBasicMaterial color="#f5f7ff" transparent opacity={0.86} />
        </mesh>
      </group>

      <lineSegments geometry={lineGeometry}>
        <lineBasicMaterial color="#60719b" transparent opacity={0.18} />
      </lineSegments>

      {nodes.map((node, index) => (
        <mesh
          key={`node-${index}`}
          ref={(mesh) => {
            if (mesh) nodeRefs.current[index] = mesh;
          }}
          position={node.position}
          scale={node.scale}
        >
          <sphereGeometry args={[1, 8, 8]} />
          <meshBasicMaterial color="#5b82ff" />
        </mesh>
      ))}

      <mesh ref={beam} rotation={[0, 0, 0]} scale={[7.5, 0.002, 7.5]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial color="#5b82ff" transparent opacity={0.14} side={THREE.DoubleSide} />
      </mesh>

      <mesh ref={pulse} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <ringGeometry args={[1.1, 1.12, 96]} />
        <meshBasicMaterial color="#5b82ff" transparent opacity={0.2} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

export default function CortexHeroScene() {
  const reduced = useReducedMotion();
  const rig = useRef<Rig>({
    scroll: { current: 0 },
    pointer: { current: { x: 0, y: 0 } },
  });

  useEffect(() => {
    const onPointer = (event: PointerEvent) => {
      rig.current.pointer.current.x = (event.clientX / window.innerWidth - 0.5) * 2;
      rig.current.pointer.current.y = (event.clientY / window.innerHeight - 0.5) * 2;
    };
    const onScroll = () => {
      rig.current.scroll.current = Math.min(window.scrollY / Math.max(window.innerHeight * 0.95, 1), 1);
    };
    window.addEventListener("pointermove", onPointer, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <Canvas
      className="cx-cortex-hero-canvas"
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 11.5], fov: 42 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      frameloop="always"
    >
      <Suspense fallback={null}>
        <HeroWorld rig={rig.current} reduced={Boolean(reduced)} />
      </Suspense>
    </Canvas>
  );
}
