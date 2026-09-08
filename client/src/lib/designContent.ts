/** Public architecture descriptions, not a declaration of live product availability. */
export const intelligenceStages = [
  {
    name: "Raw signals",
    body: "Bring operational inputs into view without losing their source or timestamp.",
    output: "Source + timestamp",
  },
  {
    name: "Context",
    body: "Map entities, relationships, and events into a shared World State.",
    output: "World State",
  },
  {
    name: "Reasoning",
    body: "Trace the relationships behind a problem. Keep assumptions attached to the explanation.",
    output: "Reasoning + assumptions",
  },
  {
    name: "Simulation",
    body: "Explore possible consequences in an isolated scenario, not in a live environment.",
    output: "Scenario comparison",
  },
  {
    name: "Decision",
    body: "Present options to an accountable owner. A recommendation is not authorization.",
    output: "Options for human review",
  },
  {
    name: "Evidence",
    body: "Keep the inputs, decision, authorization, and resulting record together for review.",
    output: "Reviewable decision trail",
  },
];
export const operatingStages = [
  {
    name: "Observe",
    body: "Identify the source, freshness, and scope of each signal.",
    output: "Operational inputs",
  },
  {
    name: "Understand",
    body: "Resolve relationships into context; expose missing information.",
    output: "Context + uncertainty",
  },
  {
    name: "Simulate",
    body: "Compare alternatives in a sandbox. Nothing in this illustration affects a live system.",
    output: "Illustrative scenarios",
  },
  {
    name: "Recommend",
    body: "Rank options with their constraints and evidence. Stop short of execution.",
    output: "Reviewable options",
  },
  {
    name: "Authorize",
    body: "An accountable operator reviews scope, permissions, and consequences before approving an action.",
    output: "Explicit authorization required",
  },
  {
    name: "Execute",
    body: "In a deployed integration, only an authorized action may enter the execution boundary. This website does not execute product workloads.",
    output: "Authorized execution boundary",
  },
  {
    name: "Verify",
    body: "Inspect the resulting record against the authorized request. Preserve failures as well as outcomes.",
    output: "Execution evidence",
  },
];
export type ProductSlug = "workflo" | "nexus" | "astra";
export const productDesign = {
  workflo: {
    name: "Workflo",
    category: "Execution Assurance",
    headline: "Execution, with evidence.",
    intro:
      "A sealed boundary between the code you authorize and the record you can verify.",
    capability: "The work and its proof belong together.",
    body: "Workflo's architecture connects an authorized request, a sandboxed run, and a verifiable receipt. The evidence should describe what ran and under which conditions—not stand in for a review of the code itself.",
    flow: ["Code", "Sandbox", "Execution", "Hash", "Receipt"],
    details: [
      "Bind the source and request to an explicit execution scope.",
      "Isolate the workload and define its permitted resources.",
      "Run only within the approved scope; record failures as well as output.",
      "Associate the result with a content hash for integrity checks.",
      "Return the run context and integrity record for independent inspection.",
    ],
    workloads: [
      "Review a critical software change before deployment.",
      "Preserve a reproducible record of an approved run.",
      "Inspect an execution record during an audit.",
    ],
    trust:
      "A receipt demonstrates integrity of a record, not correctness of arbitrary code. Isolation, permissions, and verification behavior must be assessed for the actual deployment.",
  },
  nexus: {
    name: "Nexus",
    category: "Operations Intelligence",
    headline: "See the relationships. Understand the decision.",
    intro:
      "Operational signals become a shared World State, then options an accountable team can inspect.",
    capability: "Context before recommendation.",
    body: "Nexus brings entities, signals, and events into a relational model. Scenario analysis explains how an option follows from its inputs, with assumptions and uncertainty kept visible.",
    flow: ["Data", "World State", "Graph", "Signals", "Simulation", "Decision"],
    details: [
      "Identify operational inputs and their provenance.",
      "Resolve entities into a shared operating context.",
      "Represent dependencies and relationships explicitly.",
      "Identify changes that warrant investigation.",
      "Compare possible responses under stated assumptions.",
      "Present evidence-linked options for an owner to review.",
    ],
    workloads: [
      "Investigate a supply-network dependency.",
      "Compare responses to an operational disruption.",
      "Bring conflicting planning inputs into one review.",
    ],
    trust:
      "A forecast is conditional, not a guarantee. Recommendations require human review; they do not grant authority to change connected systems.",
  },
  astra: {
    name: "ASTRA",
    category: "Mission Engineering",
    headline: "Explore the mission. Before committing to it.",
    intro:
      "Requirements, candidate architectures, and trade-offs held in one inspectable mission model.",
    capability: "Make the trade-offs visible.",
    body: "ASTRA's conceptual workflow branches a mission into candidate architectures, evaluates constraints, and brings the trade space back to a reviewable plan. Simulation remains separate from live operations.",
    flow: [
      "Mission",
      "Requirements",
      "Architectures",
      "Constraints",
      "Trade-offs",
      "Mission plan",
    ],
    details: [
      "State the objective and the boundary of the mission.",
      "Capture requirements with their sources and priorities.",
      "Build alternatives rather than committing to a single path.",
      "Evaluate feasibility against explicit constraints.",
      "Compare candidates and document compromises.",
      "Assemble a plan for review—not an autonomous launch instruction.",
    ],
    workloads: [
      "Compare mission architecture alternatives.",
      "Trace a requirement to its design implications.",
      "Rehearse a plan without touching a live environment.",
    ],
    trust:
      "Simulation results depend on model assumptions. A mission plan is an engineering artifact for review, not authorization for live execution.",
  },
} as const;
export const workloads: {
  name: string;
  problem: string;
  role: string;
  products: ProductSlug[];
}[] = [
  {
    name: "Complex operations",
    problem: "Decisions cross teams faster than context does.",
    role: "Map dependencies, compare responses, and retain the decision trail.",
    products: ["nexus", "workflo"],
  },
  {
    name: "Critical software",
    problem: "A successful run alone is not a verifiable record.",
    role: "Connect the approved request to its execution evidence.",
    products: ["workflo"],
  },
  {
    name: "Supply networks",
    problem: "A local disruption can become a system-wide constraint.",
    role: "Inspect connected dependencies and compare alternative plans.",
    products: ["nexus"],
  },
  {
    name: "Mission engineering",
    problem: "Requirements compete across a large design space.",
    role: "Branch alternatives, surface constraints, and preserve trade-offs.",
    products: ["astra"],
  },
  {
    name: "Infrastructure",
    problem: "A change must be understood before it reaches a critical system.",
    role: "Explore a scenario, review its implications, and preserve authorization.",
    products: ["nexus", "workflo"],
  },
  {
    name: "Enterprise AI",
    problem: "A recommendation needs boundaries, context, and an owner.",
    role: "Separate reasoning from authority and connect action to evidence.",
    products: ["nexus", "workflo", "astra"],
  },
];
