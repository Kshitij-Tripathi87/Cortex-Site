import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef, useState, useEffect } from "react";
import * as THREE from "three";
import type { ProductSlug } from "@/lib/designContent";
function Model({ slug }: { slug: ProductSlug }) {
  const group = useRef<THREE.Group>(null!);
  const core = useRef<THREE.Mesh>(null!);
  const clock = useRef(0);
  const geometry = useMemo(() => {
    const points: THREE.Vector3[] = [];
    if (slug === "nexus") {
      for (let i = 0; i < 12; i++) {
        const angle = (i * Math.PI) / 6;
        points.push(
          new THREE.Vector3(
            Math.cos(angle) * 3.5,
            Math.sin(angle) * 1.8,
            ((i % 3) - 1) * 1.5
          ),
          new THREE.Vector3(0, 0, 0)
        );
      }
    } else if (slug === "astra") {
      for (const side of [-1, 0, 1]) {
        points.push(
          new THREE.Vector3(0, 1.8, 0),
          new THREE.Vector3(side * 2.4, 0, 0)
        );
        for (const branch of [-1, 1])
          points.push(
            new THREE.Vector3(side * 2.4, 0, 0),
            new THREE.Vector3(side * 2.4 + branch * 0.65, -1.8, 0.5)
          );
      }
    } else {
      points.push(
        new THREE.Vector3(-4, 0, 0),
        new THREE.Vector3(-1.7, 0, 0),
        new THREE.Vector3(1.7, 0, 0),
        new THREE.Vector3(4, 0, 0)
      );
    }
    return new THREE.BufferGeometry().setFromPoints(points);
  }, [slug]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  useFrame((state, delta) => {
    clock.current += Math.min(delta, 0.04);
    group.current.rotation.y = THREE.MathUtils.damp(
      group.current.rotation.y,
      state.pointer.x * 0.12,
      2,
      delta
    );
    group.current.rotation.x = THREE.MathUtils.damp(
      group.current.rotation.x,
      state.pointer.y * -0.06,
      2,
      delta
    );
    core.current.scale.setScalar(1 + Math.sin(clock.current * 0.7) * 0.035);
  });
  const nodes = Array.from(geometry.attributes.position.array);
  return (
    <group ref={group}>
      <lineSegments geometry={geometry}>
        <lineBasicMaterial color="#8894a6" transparent opacity={0.6} />
      </lineSegments>
      <mesh
        ref={core}
        rotation={slug === "workflo" ? [0.2, 0.5, 0] : [0, 0, 0]}
      >
        {slug === "workflo" ? (
          <boxGeometry args={[2.2, 2.2, 2.2]} />
        ) : (
          <icosahedronGeometry args={[0.55, 1]} />
        )}
        <meshBasicMaterial
          color="#5b82ff"
          wireframe
          transparent
          opacity={0.85}
        />
      </mesh>
      {slug === "workflo" && (
        <mesh rotation={[0.2, 0.5, 0]}>
          <boxGeometry args={[3, 3, 3]} />
          <meshBasicMaterial
            color="#aeb5bf"
            wireframe
            transparent
            opacity={0.25}
          />
        </mesh>
      )}
      {Array.from({ length: nodes.length / 3 }, (_, i) => (
        <mesh
          key={i}
          position={[nodes[i * 3], nodes[i * 3 + 1], nodes[i * 3 + 2]]}
        >
          <octahedronGeometry args={[0.075]} />
          <meshBasicMaterial color="#d8dce2" />
        </mesh>
      ))}
    </group>
  );
}
export default function ProductCanvas({ slug }: { slug: ProductSlug }) {
  const [hidden, setHidden] = useState(document.hidden);
  useEffect(() => {
    const sync = () => setHidden(document.hidden);
    document.addEventListener("visibilitychange", sync);
    return () => document.removeEventListener("visibilitychange", sync);
  }, []);
  return (
    <Canvas
      dpr={[1, 1.5]}
      frameloop={hidden ? "never" : "always"}
      camera={{ position: [0, 0, 9], fov: 42 }}
      gl={{ alpha: true, antialias: false, powerPreference: "low-power" }}
      onCreated={({ gl }) => {
        gl.setClearColor(0x080a0d, 0.92);
        gl.domElement.addEventListener("webglcontextlost", () => {
          gl.domElement.style.display = "none";
        });
      }}
    >
      <Model slug={slug} />
    </Canvas>
  );
}
