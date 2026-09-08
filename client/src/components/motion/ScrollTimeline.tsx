/* Cinematic system: scroll progress as visual state. Never scroll-locked. */
import { motion, useReducedMotion, useScroll, type MotionValue } from "framer-motion";
import type { RefObject } from "react";

export function useSectionProgress(ref: RefObject<HTMLElement | null>): MotionValue<number> {
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.8", "end 0.35"] });
  return scrollYProgress;
}

/** Thin vertical line that fills as its section travels through the viewport. */
export function ScrollLine({ progress }: { progress: MotionValue<number> }) {
  const reduce = useReducedMotion();
  if (reduce) return null;
  return (
    <div aria-hidden="true" style={{ position: "relative", width: 1, alignSelf: "stretch", background: "rgba(216,220,226,0.12)" }}>
      <motion.div
        style={{ position: "absolute", inset: 0, background: "#5b82ff", transformOrigin: "top", scaleY: progress }}
      />
    </div>
  );
}
