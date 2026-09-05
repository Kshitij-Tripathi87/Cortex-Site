/* Silverline Systems reminder: AI Core should answer like a calm operator—grounded in the platform docs, specific, and always citing where the answer comes from. */

// Shared knowledge base used by both the server AI endpoint (fallback grounding)
// and the client. Keep entries short, specific, and mapped to a real route so
// every answer can cite a source.
export type GroundingEntry = {
  keywords: string[];
  answer: string;
  source: { label: string; href: string };
};

export const AI_SYSTEM_PROMPT =
  "You are Cortex AI Core, a calm, precise operator assistant for the Cortex platform. " +
  "Cortex is the intelligence layer for teams building critical systems, organized around three products: " +
  "Sense (see the system, not just the signal), Decide (move from insight to action with context), and Scale (make the better way repeatable). " +
  "Answer in 2-4 sentences. Be specific and evidence-led. Never invent features. " +
  "If you are unsure, point the user to the documentation overview.";

export const groundingEntries: GroundingEntry[] = [
  { keywords: ["sense", "signal", "context", "observe"], answer: "Cortex Sense connects operational signals into a shared context so teams can investigate what changed and why it matters before it becomes a costly surprise.", source: { label: "Sense product guide", href: "/product/sense" } },
  { keywords: ["decide", "decision", "evidence", "action"], answer: "Cortex Decide turns a complex question into an evidence-backed decision path with visible trade-offs, owners, and next actions.", source: { label: "Decide product guide", href: "/product/decide" } },
  { keywords: ["scale", "workflow", "repeat", "standardize"], answer: "Cortex Scale codifies proven operating patterns into governed workflows that travel across functions without flattening local expertise.", source: { label: "Scale product guide", href: "/product/scale" } },
  { keywords: ["platform", "architecture", "integration", "sandbox", "connect"], answer: "The Cortex platform connects the systems teams already trust, creates a shared operating context, and routes decisions into governed workflows.", source: { label: "Platform foundations", href: "/platform" } },
  { keywords: ["docs", "documentation", "api", "sdk", "start"], answer: "Start with the documentation foundations for core concepts, then move into APIs, SDKs, integrations, and trust and governance.", source: { label: "Documentation overview", href: "/docs" } },
  { keywords: ["security", "trust", "governance", "permission", "audit"], answer: "Cortex governance covers security, role-aware permissions, and auditable decision trails so operators can move quickly without losing control.", source: { label: "Trust & governance", href: "/docs" } },
  { keywords: ["price", "pricing", "cost", "sales", "demo", "contact"], answer: "Bring us the hard question and we will make the first conversation useful. Start with a working session to walk through one decision your team needs to make better.", source: { label: "Talk to Cortex", href: "/sales" } },
];

// Pick the best grounded answer for a free-text prompt. Returns a default
// pointer to the docs overview when nothing matches.
export function groundPrompt(prompt: string): GroundingEntry {
  const lower = prompt.toLowerCase();
  const scored = groundingEntries
    .map((entry) => ({ entry, score: entry.keywords.filter((keyword) => lower.includes(keyword)).length }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score);
  return scored[0]?.entry ?? {
    keywords: [],
    answer: "AI Core can answer from the Cortex platform guides, including product fit, platform foundations, integrations, workflows, and documentation paths.",
    source: { label: "Documentation overview", href: "/docs" },
  };
}

// Contextual follow-up suggestions based on the prompt topic.
export function followUpsFor(prompt: string): string[] {
  const lower = prompt.toLowerCase();
  if (lower.includes("sense")) return ["How does Sense connect signals?", "What should we instrument first?", "Compare Sense and Decide"];
  if (lower.includes("decide")) return ["How are decision trails governed?", "Compare Decide and Sense", "Where do I start in the docs?"];
  if (lower.includes("scale")) return ["How do governed workflows work?", "Can teams keep local overrides?", "Show platform foundations"];
  if (lower.includes("platform") || lower.includes("docs")) return ["Show platform foundations", "How do integrations work?", "Explain Cortex governance"];
  return ["Which product fits our operating model?", "Where should I start in the docs?", "Explain Cortex Sense"];
}
