/* Cinematic system: sealed-chain / fan / tree SVGs. Quiet hairlines; only the
 * working path flows. Diagrams are illustration, never data. */
type Variant = "workflo" | "nexus" | "astra";

function Box({
  x,
  y,
  w,
  h,
  label,
  sub,
  hot = false,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  sub?: string;
  hot?: boolean;
}) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={2} className={`cx-arch-node${hot ? " is-hot" : ""}`} />
      <text x={x + w / 2} y={y + (sub ? h / 2 - 1 : h / 2 + 4)} textAnchor="middle" className="cx-arch-label">
        {label}
      </text>
      {sub && (
        <text x={x + w / 2} y={y + h / 2 + 14} textAnchor="middle" className="cx-arch-sub">
          {sub}
        </text>
      )}
    </g>
  );
}

function Edge({ d, flow = false, ret = false }: { d: string; flow?: boolean; ret?: boolean }) {
  return <path d={d} className={`cx-arch-edge${flow ? " is-flow" : ""}${ret ? " is-return" : ""}`} />;
}

function WorkfloDiagram() {
  return (
    <g>
      <Box x={16} y={150} w={128} h={60} label="INPUT" sub="source docs" />
      <Box x={180} y={150} w={128} h={60} label="CHECK" sub="rule engine" />
      <Box x={344} y={150} w={128} h={60} label="SEAL" sub="hash + anchor" hot />
      <Box x={508} y={150} w={116} h={60} label="RECORD" sub="immutable" />
      <Edge d="M144 180 H180" flow />
      <Edge d="M308 180 H344" flow />
      <Edge d="M472 180 H508" flow />
      <text x={320} y={262} textAnchor="middle" className="cx-arch-sub">
        MUTABLE REALITY → SEALED RECORD → VERIFIABLE PROOF
      </text>
      <text x={320} y={104} textAnchor="middle" className="cx-arch-sub">
        EVERY HANDOFF CARRIES ITS OWN PROOF
      </text>
    </g>
  );
}

function NexusDiagram() {
  return (
    <g>
      <Box x={16} y={70} w={140} h={52} label="SCHEDULE" sub="plan feed" />
      <Box x={16} y={154} w={140} h={52} label="CREW" sub="roster feed" />
      <Box x={16} y={238} w={140} h={52} label="FLEET" sub="asset feed" />
      <Box x={250} y={134} w={140} h={92} label="NEXUS" sub="forecast core" hot />
      <Box x={484} y={96} w={140} h={52} label="PLAN" sub="ranked options" />
      <Box x={484} y={212} w={140} h={52} label="ALERT" sub="early warning" />
      <Edge d="M156 96 C 210 96, 200 150, 250 160" />
      <Edge d="M156 180 H250" flow />
      <Edge d="M156 264 C 210 264, 200 210, 250 200" />
      <Edge d="M390 160 C 440 160, 430 122, 484 122" flow />
      <Edge d="M390 200 C 440 200, 430 238, 484 238" />
    </g>
  );
}

function AstraDiagram() {
  return (
    <g>
      <Box x={240} y={24} w={160} h={54} label="MISSION ORDER" sub="objective" hot />
      <Box x={40} y={140} w={150} h={54} label="ELEMENT A" sub="course" />
      <Box x={245} y={140} w={150} h={54} label="ELEMENT B" sub="course" />
      <Box x={450} y={140} w={150} h={54} label="ELEMENT C" sub="course" />
      <Box x={140} y={252} w={170} h={54} label="AFTER-ACTION" sub="sealed record" />
      <Box x={330} y={252} w={170} h={54} label="SANDBOX" sub="sandboxed sim" />
      <Edge d="M320 78 V104 H115 V140" />
      <Edge d="M320 78 V140" flow />
      <Edge d="M320 78 V104 H525 V140" />
      <Edge d="M225 194 V226 H240 V252" />
      <Edge d="M415 194 V226 H415 V252" flow />
      <Edge d="M140 279 H60 V52 H240" ret />
      <text x={320} y={336} textAnchor="middle" className="cx-arch-sub">
        EVERY RUN RETURNS ITS LESSONS — SANDBOXED, SEALED
      </text>
    </g>
  );
}

export default function ArchitectureDiagram({ variant, title }: { variant: Variant; title: string }) {
  return (
    <svg viewBox="0 0 640 360" className="cx-arch" role="img" aria-label={title}>
      {variant === "workflo" && <WorkfloDiagram />}
      {variant === "nexus" && <NexusDiagram />}
      {variant === "astra" && <AstraDiagram />}
    </svg>
  );
}
