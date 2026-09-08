/* Cinematic system: small mono instrumentation label. */
import type { ReactNode } from "react";

export default function TechnicalLabel({ children }: { children: ReactNode }) {
  return <span className="cx-tech-label">{children}</span>;
}
