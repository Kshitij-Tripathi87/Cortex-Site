/* Silverline Systems reminder: detail content should read like an operating brief—specific, evidence-led, and organized by indexed systems language. */

export type ProductDetail = {
  slug: string;
  name: string;
  eyebrow: string;
  title: string;
  intro: string;
  description: string;
  metric: string;
  metricLabel: string;
  status: "Early access" | "Coming soon";
  capabilities: string[];
  sections: { label: string; title: string; body: string; points: string[] }[];
};

export const products: ProductDetail[] = [
  {
    slug: "workflo",
    name: "Workflo",
    eyebrow: "PRODUCT",
    title: "See the system, not just the signal.",
    intro: "Workflo gives teams a continuously legible view of the conditions shaping the business.",
    description: "Bring fragmented operational data into one context, then use a shared language to separate meaningful patterns from background noise.",
    metric: "",
    metricLabel: "faster issue resolution",
    status: "Early access",
    capabilities: ["Signal unification", "Root-cause exploration", "Shared operating picture", "Live and historical context"],
    sections: [
      { label: "INGEST", title: "Start with the signals you already have.", body: "Sense connects to the systems teams rely on today, preserving existing ownership while creating a consistent view across the organization.", points: ["Event streams and operational databases", "Business tools and workflow systems", "Human notes and domain context"] },
      { label: "INTERPRET", title: "Make the meaningful pattern visible.", body: "Trace relationships across time, teams, and systems. Sense helps operators understand why a signal matters before they commit to a response.", points: ["Contextual timelines", "Relationship-aware exploration", "Evidence linked to every insight"] },
      { label: "SHARE", title: "Give every team the same starting point.", body: "Create a durable operating picture that travels with the decision, so handoffs are clearer and teams stop rebuilding context from scratch.", points: ["Shared views and annotations", "Role-aware access", "Auditable decision context"] },
    ],
  },
  {
    slug: "nexus",
    name: "Nexus",
    eyebrow: "PRODUCT",
    title: "Move from insight to action with context.",
    intro: "Nexus turns a complex question into an explicit, evidence-backed decision path.",
    description: "Make the evidence, trade-offs, owners, and recommended next step visible to the people who need to move.",
    metric: "",
    metricLabel: "less time in review cycles",
    status: "Coming soon",
    capabilities: ["Plain-language questions", "Evidence trails", "Decision paths", "Owner routing"],
    sections: [
      { label: "ASK", title: "Start with the question, not the dashboard.", body: "Decide lets teams ask the question in the language they use every day, then maps it to the signals and systems that can answer it.", points: ["Natural-language exploration", "Reusable questions", "Role-specific context"] },
      { label: "WEIGH", title: "Make the trade-offs explicit.", body: "Bring the relevant assumptions, constraints, and supporting evidence into one decision frame so alignment does not depend on a meeting marathon.", points: ["Assumption tracking", "Scenario comparison", "Evidence citations"] },
      { label: "COMMIT", title: "Turn the call into a shared action.", body: "Route the decision to the right owner with a clear record of what was decided, why, and what the system should watch next.", points: ["Decision ownership", "Governed approvals", "Follow-up signals"] },
    ],
  },
  {
    slug: "astra",
    name: "ASTRA",
    eyebrow: "PRODUCT",
    title: "Make the better way repeatable.",
    intro: "ASTRA codifies what your best teams know into workflows that travel across functions and regions.",
    description: "Standardize proven operating patterns without forcing every team into the same local process.",
    metric: "",
    metricLabel: "more reusable workflows",
    status: "Coming soon",
    capabilities: ["Workflow templates", "Governed operating patterns", "Local flexibility", "Performance feedback"],
    sections: [
      { label: "CODIFY", title: "Capture the way strong teams work.", body: "Turn tacit operating knowledge into clear, reusable patterns with the context and guardrails that make them safe to adopt.", points: ["Pattern libraries", "Embedded rationale", "Owner and access controls"] },
      { label: "ADAPT", title: "Scale without flattening local expertise.", body: "Give regional and functional teams a reliable starting point while leaving room for the constraints only they can see.", points: ["Configurable steps", "Local overrides", "Shared standards"] },
      { label: "LEARN", title: "Let every run improve the next one.", body: "Use outcomes and feedback to evolve the operating model, so the system becomes more useful with every decision it supports.", points: ["Outcome capture", "Workflow performance", "Continuous improvement loops"] },
    ],
  },
];

export type CaseStudyDetail = {
  slug: string;
  company: string;
  sector: string;
  title: string;
  quote: string;
  result: string;
  resultLabel: string;
  image: string;
  overview: string;
  challenge: string;
  approach: string[];
  outcomes: string[];
};

export const caseStudies: CaseStudyDetail[] = [
  { slug: "northstar-health", company: "Northstar Health", sector: "Healthcare operations", title: "A shared language for complexity.", quote: "Cortex gave our teams a shared language for complexity. The conversation moved from ‘what happened?’ to ‘what do we do next?’", result: "", resultLabel: "", image: "/assets/cortex-case-editorial.svg", overview: "Northstar Health operates across a dense network of clinical, operational, and payer relationships. The team needed a way to see the conditions around an issue before it reached the escalation path.", challenge: "Teams were working from partial views. Each function had its own tools, terminology, and review cadence, which made cross-functional decisions slower than the underlying problem required.", approach: ["Connected patient access, staffing, and service signals into one operating context.", "Created shared views for frontline operators, regional leaders, and the central transformation team.", "Used decision trails to make escalation criteria explicit and reviewable."], outcomes: ["Fewer avoidable escalations", "Faster cross-functional response", "One shared operating picture across sites"] },
  { slug: "vela-financial", company: "Vela Financial", sector: "Risk & compliance", title: "From weekly reconciliation to a living risk picture.", quote: "We replaced a weekly reconciliation ritual with a living operating picture that risk, finance, and product can trust.", result: "", resultLabel: "", image: "/assets/cortex-vela-editorial.svg", overview: "Vela Financial needed to reduce the distance between risk review and product action without weakening the controls that made its operating model trusted.", challenge: "Risk and product teams were reconciling the same facts in parallel. By the time a shared view existed, the window for a low-cost response had often closed.", approach: ["Unified policy, product, and operational data into a common context.", "Made each recommendation traceable to evidence and control owners.", "Routed decisions into existing review and remediation workflows."], outcomes: ["Hours returned to each team each week", "Shorter review cycles", "A clearer audit trail for material decisions"] },
  { slug: "aster-works", company: "Aster Works", sector: "Industrial systems", title: "Confidence while the window is still open.", quote: "The value was not another dashboard. It was the confidence to make the call while the window was still open.", result: "", resultLabel: "", image: "/assets/cortex-aster-editorial.svg", overview: "Aster Works runs a network of industrial sites where a small delay in interpreting a signal can create a large operational cost.", challenge: "Site teams had the expertise, but not always the shared context to know which local anomalies pointed to a system-wide condition.", approach: ["Connected site-level telemetry with maintenance and supply context.", "Created a decision frame that surfaced the relevant constraints at the moment of action.", "Codified proven responses into reusable cross-site workflows."], outcomes: ["Faster cross-site decisions", "Fewer repeat incidents", "More reusable response workflows"] },
];
