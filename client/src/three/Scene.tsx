/*
 * Cortex 3D Scene — R3F + Three.js provider
 *
 * Provides the canvas, renderer, camera, and tone mapping for 3D scenes.
 * Performance-aware: reduces DPR and antialiasing on low-end GPUs and
 * reduced-motion contexts.
 */

import { Canvas } from "@react-three/fiber";
import { Suspense, useMemo, type ReactNode } from "react";
import { ACESFilmicToneMapping } from "three";

export type PerformanceTier = "high" | "medium" | "low";

export function getPerformanceTier(): PerformanceTier {
  if (typeof window === "undefined") return "high";
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) return "low";
  if (window.innerWidth < 1024) return "medium";
  return "high";
}

type SceneProps = {
  children: ReactNode;
  camera?: { position: [number, number, number]; fov?: number };
  className?: string;
  dpr?: number | [min: number, max: number];
};

export default function Scene({ children, camera, className = "", dpr }: SceneProps) {
  const performanceTier = useMemo(getPerformanceTier, []);

  const effectiveDpr = dpr ?? (performanceTier === "high" ? [1, 2] : [1, 1.5]);

  return (
    <div className={`cortex-3d-scene ${className}`} style={{ position: "relative", width: "100%", height: "100%" }}>
      <Canvas
        camera={camera ?? { position: [0, 0.6, 8], fov: 42 }}
        dpr={effectiveDpr as number | [number, number]}
        gl={{
          alpha: true,
          antialias: performanceTier !== "low",
          powerPreference: performanceTier === "low" ? "low-power" : "high-performance",
          toneMapping: ACESFilmicToneMapping,
          toneMappingExposure: 1.0,
        }}
        style={{ background: "transparent" }}
      >
        <Suspense fallback={null}>{children}</Suspense>
      </Canvas>
    </div>
  );
}
