import { useId } from "react";
import type { ProductSlug } from "@/lib/designContent";
function Box({
  x,
  y,
  label,
  hot = false,
}: {
  x: number;
  y: number;
  label: string;
  hot?: boolean;
}) {
  return (
    <g>
      <rect
        x={x - 85}
        y={y - 23}
        width={170}
        height={46}
        className={`cx-arch-node${hot ? " is-hot" : ""}`}
      />
      <text x={x} y={y + 4} textAnchor="middle" className="cx-arch-label">
        {label}
      </text>
    </g>
  );
}
const descriptions = {
  workflo:
    "Authorized code enters an isolated sandbox. Execution produces a hash and receipt for verification. This is a conceptual model, not a live runner.",
  nexus:
    "World State branches into signals, graph, and events; these converge on the Nexus core. Scenarios, agents, and evidence inform a decision for human review.",
  astra:
    "A mission leads to requirements and candidate architectures. Constraints and trade-offs inform a mission plan. All exploration stays in simulation.",
};
export default function ArchitectureDiagram({
  variant,
  title,
}: {
  variant: ProductSlug;
  title: string;
}) {
  const id = useId();
  const rows =
    variant === "nexus"
      ? [
          ["WORLD STATE"],
          ["SIGNALS", "GRAPH", "EVENTS"],
          ["NEXUS CORE"],
          ["SCENARIO", "AGENTS", "EVIDENCE"],
          ["DECISION"],
        ]
      : variant === "workflo"
        ? [
            ["AUTHORIZED CODE"],
            ["SANDBOX"],
            ["EXECUTION"],
            ["HASH"],
            ["RECEIPT"],
          ]
        : [
            ["MISSION"],
            ["REQUIREMENTS"],
            ["ARCHITECTURE A", "ARCHITECTURE B", "ARCHITECTURE C"],
            ["CONSTRAINTS", "TRADE-OFFS"],
            ["MISSION PLAN"],
          ];
  const positions = (count: number) =>
    count === 1 ? [320] : count === 2 ? [210, 430] : [110, 320, 530];
  return (
    <div
      className="cx-architecture-scroll"
      tabIndex={0}
      role="region"
      aria-label={`${title}, scroll horizontally on small screens`}
    >
      <svg
        viewBox="0 0 640 480"
        className="cx-arch cx-arch-tall"
        role="img"
        aria-labelledby={`${id}-title ${id}-desc`}
      >
        <title id={`${id}-title`}>{title}</title>
        <desc id={`${id}-desc`}>{descriptions[variant]}</desc>
        {rows.slice(0, -1).map((row, i) => (
          <g key={i}>
            {positions(row.length).map(x => (
              <path
                key={`a${x}`}
                d={`M${x} ${53 + i * 88} V${74 + i * 88} H320`}
                className="cx-arch-edge is-flow"
              />
            ))}
            {positions(rows[i + 1].length).map(x => (
              <path
                key={`b${x}`}
                d={`M320 ${74 + i * 88} H${x} V${95 + i * 88}`}
                className="cx-arch-edge is-flow"
              />
            ))}
          </g>
        ))}
        {rows.map((row, i) =>
          row.map((label, n) => (
            <Box
              key={label}
              x={positions(row.length)[n]}
              y={30 + i * 88}
              label={label}
              hot={i === 2}
            />
          ))
        )}
        <text x={320} y={451} textAnchor="middle" className="cx-arch-sub">
          CONCEPTUAL MODEL / HUMAN REVIEW REQUIRED
        </text>
      </svg>
    </div>
  );
}
