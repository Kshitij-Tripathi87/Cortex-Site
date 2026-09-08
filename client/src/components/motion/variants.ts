/* Cinematic system: per-product motion languages. Each system moves like it
 * works — Workflo stamps, Nexus converges, ASTRA branches. */
import type { Variants } from "framer-motion";

/** Workflo: sealed, decisive. Sections land like stamps — short drop, settle. */
export const sealVariants: Variants = {
  hidden: { opacity: 0, y: 26, scale: 0.985 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } },
};

/** Nexus: fan-in. Sections drift inward from alternating sides toward center. */
export const convergeVariants: Variants = {
  hidden: (i: number) => ({ opacity: 0, x: (i % 2 === 0 ? -1 : 1) * 64 }),
  show: { opacity: 1, x: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } },
};

/** ASTRA: mission tree. A cascading rise, each level slightly behind the last. */
export const cascadeVariants: Variants = {
  hidden: { opacity: 0, y: 36 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: (i % 4) * 0.09, ease: [0.22, 1, 0.36, 1] },
  }),
};
