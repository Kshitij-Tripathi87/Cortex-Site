/* Cinematic system: subtle magnetic pull for primary CTAs. Fine pointers only. */
import { motion, useReducedMotion, useSpring } from "framer-motion";
import { useState, type ReactNode } from "react";

export default function Magnetic({ children, strength = 6 }: { children: ReactNode; strength?: number }) {
  const reduce = useReducedMotion();
  const [coarse] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches,
  );
  const x = useSpring(0, { stiffness: 220, damping: 18 });
  const y = useSpring(0, { stiffness: 220, damping: 18 });

  if (reduce || coarse) return <span style={{ display: "inline-block" }}>{children}</span>;

  return (
    <motion.span
      style={{ display: "inline-block", x, y }}
      onMouseMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        x.set(((event.clientX - rect.left) / rect.width - 0.5) * strength * 2);
        y.set(((event.clientY - rect.top) / rect.height - 0.5) * strength * 2);
      }}
      onMouseLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      {children}
    </motion.span>
  );
}
