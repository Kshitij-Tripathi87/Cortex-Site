/* Cinematic system: giant editorial statement with muted second voice. */
import type { ReactNode } from "react";

export function Dim({ children }: { children: ReactNode }) {
  return <span className="cx-dim">{children}</span>;
}

export default function Statement({
  children,
  wide = false,
  level = 2,
}: {
  children: ReactNode;
  wide?: boolean;
  level?: 1 | 2;
}) {
  const Tag = level === 1 ? "h1" : "h2";
  return <Tag className={`cx-statement${wide ? " cx-statement-wide" : ""}`}>{children}</Tag>;
}
