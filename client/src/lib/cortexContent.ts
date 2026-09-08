/* Cinematic system: product and case-study content. Written in the sealed-system
 * voice — Workflo proves, Nexus forecasts, ASTRA rehearses. Structural facts
 * only; nothing here claims measured outcomes. */

export type MovementStep = { index: string; title: string; body: string };
export type StackSpec = { title: string; body: string; meta: string };
export type ProofStat = { value: string; label: string; meta?: string };

export type ProductDetail = {
  slug: "workflo" | "nexus" | "astra";
  name: string;
  category: string;
  statement: string;
  statementDim: string;
  declaration: string;
  declarationDim: string;
  intro: string;
  description: string;
  image: string;
  imageAlt: string;
  tag: string;
  status: "Early access" | "Coming soon";
  whereItActs: { title: string; body: string; bullets: string[] };
  movement: MovementStep[];
  mechanism: { title: string; body: string; bullets: string[]; note?: string };
  stack: StackSpec[];
  proof: ProofStat[];
  proofNote: string;
  handoff: string;
};

export const products: ProductDetail[] = [
  {
    slug: "workflo",
    name: "Workflo",
    category: "Execution Assurance",
    statement: "The record the work creates.",
    statementDim: "Before anyone asks for it.",
    declaration: "The system must act with intent, then prove it.",
    declarationDim: "Workflo is where Cortex proves what it did — in records no one can quietly rewrite.",
    intro: "Governance that arrives after the work is paperwork. Workflo seals each handoff where it happens.",
    description:
      "Workflo is the execution assurance layer: every action sealed with proof at the moment it happens. Early access.",
    image: "/images/workflo-sealed.jpg",
    imageAlt: "A sealed corridor of records — the Workflo proof surface",
    tag: "LIVE PILOT",
    status: "Early access",
    whereItActs: {
      title: "Proof belongs at the point of action.",
      body: "Audits fail when evidence is reconstructed from memory. Workflo makes the record a byproduct of the work itself — created at the handoff, verified in seconds, trusted by people who were never in the room.",
      bullets: [
        "Every handoff sealed at the moment of creation",
        "Anchor checks before any downstream step relies on a record",
        "The record travels with the work — evidence attached, not appended",
      ],
    },
    movement: [
      { index: "001", title: "ACT", body: "The system does the work — routes, approves, escalates." },
      { index: "002", title: "SEAL", body: "Each action is sealed with authorship, timestamp, and terms." },
      { index: "003", title: "ANCHOR", body: "Seals anchor to an immutable ledger; tampering breaks the chain." },
      { index: "004", title: "PROVE", body: "Anyone verifies in seconds: what happened, who ordered it, under what terms." },
    ],
    mechanism: {
      title: "A chain anyone can verify.",
      body: "Workflo wraps every action in a sealed record — who ordered it, what was done, under which terms — then anchors it where no participant can quietly rewrite it.",
      bullets: [
        "Sealed records with authorship and timestamp",
        "Immutable anchoring — edits break the chain",
        "One-step verification for auditors and operators",
      ],
    },
    stack: [
      {
        title: "Sealed handoffs",
        body: "Every action wrapped with authorship, timestamp, and terms — proof created with the work, not after it.",
        meta: "MECHANISM / 001",
      },
      {
        title: "Immutable anchor",
        body: "Seals anchor to a ledger no participant can quietly rewrite. Tampering breaks the chain visibly.",
        meta: "LEDGER / 002",
      },
      {
        title: "Instant verification",
        body: "Auditors and operators verify any record in seconds — what happened, who ordered it, under what terms.",
        meta: "INTERFACE / 003",
      },
    ],
    proof: [
      { value: "04", label: "sealed stages", meta: "act → seal → anchor → prove" },
      { value: "01", label: "record per action", meta: "no batch paperwork" },
      { value: "00", label: "quiet edits", meta: "tampering breaks the chain visibly" },
    ],
    proofNote: "Structural properties of the mechanism — not performance claims. Pilot deployments publish their own verification reports.",
    handoff: "Where Nexus forecasts and ASTRA rehearses, Workflo proves. See the other systems — or bring your hardest audit trail.",
  },
  {
    slug: "nexus",
    name: "Nexus",
    category: "Operations Intelligence",
    statement: "The forecast you can act on.",
    statementDim: "Before the window closes.",
    declaration: "Decide early, with the evidence attached.",
    declarationDim: "Nexus turns operational signals into ranked options — each one carrying its evidence.",
    intro: "Dozens of feeds in, one forecast out. Nexus ranks what matters and routes it to the owner who can act.",
    description:
      "Nexus is operations intelligence: many signals in, ranked options with evidence out. Live demo.",
    image: "/images/nexus-network.jpg",
    imageAlt: "Converging signal paths — the Nexus forecast core",
    tag: "LIVE DEMO",
    status: "Coming soon",
    whereItActs: {
      title: "Intelligence at the moment of choice.",
      body: "Dashboards describe the past; meetings negotiate the present. Nexus projects trajectories while the window is still open — with assumptions on the surface and evidence attached to every option.",
      bullets: [
        "Signals unified into one operating picture",
        "Forecasts with visible assumptions and confidence",
        "Ranked options routed to the owner who can act",
      ],
    },
    movement: [
      { index: "001", title: "UNIFY", body: "Signals stream in from schedules, rosters, fleets, and ledgers." },
      { index: "002", title: "FORECAST", body: "The core projects trajectories — with assumptions on the surface." },
      { index: "003", title: "RANK", body: "Options are ranked by consequence, cost, and reversibility." },
      { index: "004", title: "ROUTE", body: "Each option arrives with its evidence, routed to its owner." },
    ],
    mechanism: {
      title: "Fan-in to one forecast.",
      body: "Dozens of feeds converge on the forecast core; what fans out is small — ranked options with evidence attached, each routed to the person who can act on it.",
      bullets: [
        "Many feeds, one core — fan-in architecture",
        "Assumptions visible on every projection",
        "Evidence travels with each recommendation",
      ],
    },
    stack: [
      {
        title: "Signal unification",
        body: "Every feed mapped into one operating picture — schedules, crew, fleet, ledger.",
        meta: "INGEST / 001",
      },
      {
        title: "Forecast core",
        body: "Trajectories projected with assumptions and confidence on the surface.",
        meta: "MODEL / 002",
      },
      {
        title: "Ranked routing",
        body: "Options ranked by consequence and routed with evidence to their owner.",
        meta: "OUTPUT / 003",
      },
    ],
    proof: [
      { value: "04", label: "feeds in the demo core", meta: "schedule · crew · fleet · ledger" },
      { value: "03", label: "outputs per cycle", meta: "plan · alert · evidence trail" },
      { value: "01", label: "owner per option", meta: "no orphaned recommendations" },
    ],
    proofNote: "Structure of the live demonstration core — your deployment maps its own feeds.",
    handoff: "Nexus forecasts, Workflo seals what you did about it, ASTRA rehearses the next move.",
  },
  {
    slug: "astra",
    name: "ASTRA",
    category: "Mission Engineering",
    statement: "Rehearse the mission.",
    statementDim: "Before the mission rehearses you.",
    declaration: "Every course of action, tested before it's ordered.",
    declarationDim: "ASTRA rehearses missions in a sandboxed twin — then seals what was learned.",
    intro: "Consequential choices deserve rehearsal. ASTRA tests courses of action in a sandbox the live system never feels.",
    description:
      "ASTRA is mission engineering: rehearse courses of action in a sandboxed twin. Simulation only.",
    image: "/images/astra-mission.jpg",
    imageAlt: "A mission corridor under rehearsal — the ASTRA sandbox",
    tag: "SIMULATION",
    status: "Coming soon",
    whereItActs: {
      title: "A sandbox for consequential choices.",
      body: "The most expensive lessons are learned live. ASTRA moves them earlier — competing courses of action rehearsed against a mission twin, sandboxed and repeatable, with every lesson sealed for review.",
      bullets: [
        "Courses of action tested against the mission twin",
        "Sandboxed runs — the live system is never touched",
        "After-action records sealed for review and learning",
      ],
    },
    movement: [
      { index: "001", title: "ORDER", body: "The mission order enters: objective, constraints, elements." },
      { index: "002", title: "BRANCH", body: "Courses of action branch across the mission twin." },
      { index: "003", title: "REHEARSE", body: "Each course runs sandboxed — sandboxed, repeatable." },
      { index: "004", title: "SEAL", body: "After-action records seal what worked, what failed, and why." },
    ],
    mechanism: {
      title: "A tree that reports back.",
      body: "Mission orders branch into courses across elements; every run returns its lessons through a sandboxed feedback loop — lessons, never commands.",
      bullets: [
        "Mission tree: order → elements → courses",
        "Sandboxed simulation — live systems untouched",
        "After-action loop seals every lesson",
      ],
      note: "Simulation only. ASTRA never touches live systems — the return line carries lessons, never commands.",
    },
    stack: [
      {
        title: "Mission twin",
        body: "A sandboxed model of the objective, the elements, and the constraints.",
        meta: "MODEL / 001",
      },
      {
        title: "Course engine",
        body: "Competing courses of action rehearsed against the twin, repeatably.",
        meta: "ENGINE / 002",
      },
      {
        title: "After-action seal",
        body: "Every run returns sealed lessons — what worked, what failed, why.",
        meta: "RECORD / 003",
      },
    ],
    proof: [
      { value: "03", label: "elements per mission tree", meta: "branching courses of action" },
      { value: "02", label: "records per run", meta: "after-action + sandbox log" },
      { value: "00", label: "live systems touched", meta: "simulation is sandboxed" },
    ],
    proofNote: "Anatomy of the rehearsal structure — outcomes depend on the mission modeled.",
    handoff: "ASTRA rehearses, Nexus forecasts the live picture, Workflo seals what was ordered.",
  },
];

export type CaseStudyDetail = {
  slug: string;
  company: string;
  sector: string;
  systemUsed: string;
  title: string;
  quote: string;
  source: string;
  image: string;
  constraint: { title: string; body: string; bullets: string[] };
  figures: ProofStat[];
  figuresNote: string;
  approach: string[];
  outcomes: string[];
};

export const caseStudies: CaseStudyDetail[] = [
  {
    slug: "northstar-health",
    company: "Northstar Health",
    sector: "Healthcare operations",
    systemUsed: "Workflo + Nexus",
    title: "A shared language for complexity.",
    quote:
      "Cortex gave our teams a shared language for complexity. The conversation moved from “what happened?” to “what do we do next?”",
    source: "Deployment notes — regional operations",
    image: "/assets/cortex-case-editorial.svg",
    constraint: {
      title: "Three functions, three versions of the truth.",
      body: "Patient access, staffing, and service lines each ran their own tools, terminology, and review cadence. Cross-functional decisions moved slower than the problems they were meant to solve.",
      bullets: [
        "Partial views per function",
        "Review cadence slower than the problem",
        "Escalations decided on incomplete context",
      ],
    },
    figures: [
      { value: "03", label: "signal domains unified", meta: "access · staffing · service" },
      { value: "03", label: "operating views shipped", meta: "frontline · regional · central" },
      { value: "01", label: "shared picture", meta: "carried into every escalation" },
    ],
    figuresNote: "Structure of the deployment described in this brief — an illustrated account, not a measured trial.",
    approach: [
      "Connected patient access, staffing, and service signals into one operating context.",
      "Created shared views for frontline operators, regional leaders, and the central transformation team.",
      "Used decision trails to make escalation criteria explicit and reviewable.",
    ],
    outcomes: ["Fewer avoidable escalations", "Faster cross-functional response", "One shared operating picture across sites"],
  },
  {
    slug: "vela-financial",
    company: "Vela Financial",
    sector: "Risk & compliance",
    systemUsed: "Nexus + Workflo",
    title: "From weekly reconciliation to a living risk picture.",
    quote:
      "We replaced a weekly reconciliation ritual with a living operating picture that risk, finance, and product can trust.",
    source: "Deployment notes — risk operations",
    image: "/assets/cortex-vela-editorial.svg",
    constraint: {
      title: "Parallel reconciliations, closed windows.",
      body: "Risk and product teams reconciled the same facts in parallel. By the time a shared view existed, the window for a low-cost response had often closed.",
      bullets: [
        "Same facts reconciled twice",
        "Shared view arrived after the window closed",
        "Controls strong, but slowing the response",
      ],
    },
    figures: [
      { value: "03", label: "domains in one context", meta: "policy · product · operations" },
      { value: "01", label: "evidence trail per recommendation", meta: "owner-attached" },
      { value: "01", label: "review workflow", meta: "decisions routed, not re-typed" },
    ],
    figuresNote: "Structure of the deployment described in this brief — an illustrated account, not a measured trial.",
    approach: [
      "Unified policy, product, and operational data into a common context.",
      "Made each recommendation traceable to evidence and control owners.",
      "Routed decisions into existing review and remediation workflows.",
    ],
    outcomes: ["Hours returned to each team each week", "Shorter review cycles", "A clearer audit trail for material decisions"],
  },
  {
    slug: "aster-works",
    company: "Aster Works",
    sector: "Industrial systems",
    systemUsed: "ASTRA + Nexus",
    title: "Confidence while the window is still open.",
    quote: "The value was not another dashboard. It was the confidence to make the call while the window was still open.",
    source: "Deployment notes — network operations",
    image: "/assets/cortex-aster-editorial.svg",
    constraint: {
      title: "Expert sites, isolated context.",
      body: "Site teams had the expertise, but not always the shared context to know which local anomalies pointed to a system-wide condition. Small delays in interpretation carried large operational costs.",
      bullets: [
        "Local anomalies without system context",
        "Interpretation delays compounding into cost",
        "Proven responses trapped at single sites",
      ],
    },
    figures: [
      { value: "03", label: "contexts connected", meta: "telemetry · maintenance · supply" },
      { value: "02", label: "records per response", meta: "decision frame + sealed log" },
      { value: "01", label: "response library", meta: "proven patterns, reusable cross-site" },
    ],
    figuresNote: "Structure of the deployment described in this brief — an illustrated account, not a measured trial.",
    approach: [
      "Connected site-level telemetry with maintenance and supply context.",
      "Created a decision frame that surfaced the relevant constraints at the moment of action.",
      "Codified proven responses into reusable cross-site workflows.",
    ],
    outcomes: ["Faster cross-site decisions", "Fewer repeat incidents", "More reusable response workflows"],
  },
];
