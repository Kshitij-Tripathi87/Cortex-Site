/*
 * HeroScene — full-viewport Intelligence Core composite.
 *
 * Wires the performance tier + reduced-motion detection to the Cortex
 * Intelligence Core scene and exposes a scroll channel so the hero can
 * couple camera-adjacent motion with page scroll.
 */

import { useEffect, useMemo, useState } from "react";
import Scene, { getPerformanceTier, type PerformanceTier } from "./Scene";
import CortexScene from "./CortexScene";

export default function HeroScene({ scrollProgress = 0 }: { scrollProgress?: number }) {
  const tier: PerformanceTier = useMemo(getPerformanceTier, []);
  const [motionless, setMotionless] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setMotionless(query.matches);
    const onChange = () => setMotionless(query.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  return (
    <Scene className="hero-scene-canvas">
      <CortexScene scrollProgress={scrollProgress} motionless={motionless || tier === "low"} tier={tier} />
    </Scene>
  );
}
