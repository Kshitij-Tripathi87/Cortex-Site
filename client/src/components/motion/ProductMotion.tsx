/* Cinematic system: product-motion wrapper. Picks the movement language by
 * system slug; renders static under reduced motion. */
import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { cascadeVariants, convergeVariants, sealVariants } from "./variants";

const MAP = {
  workflo: sealVariants,
  nexus: convergeVariants,
  astra: cascadeVariants,
} as const;

export type ProductSlug = keyof typeof MAP;

export default function ProductMotion({
  slug,
  index = 0,
  children,
  className,
}: {
  slug: ProductSlug;
  index?: number;
  children: ReactNode;
  className?: string;
}) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      variants={MAP[slug]}
      custom={index}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-10% 0px" }}
    >
      {children}
    </motion.div>
  );
}
