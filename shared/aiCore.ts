/* Cinematic system: AI Core answers like a calm operator — grounded in the
 * platform docs, specific, and always citing where the answer comes from. */

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
  "Cortex is the intelligence layer for critical systems, organized around three systems: " +
  "Workflo (execution assurance — sealed proof of every action), Nexus (operations intelligence — forecasts with evidence), and ASTRA (mission engineering — sandboxed rehearsal before consequential orders). " +
  "Answer in 2-4 sentences. Be specific and evidence-led. Never invent features. " +
  "If you are unsure, point the user to the documentation overview.";

export const groundingEntries: GroundingEntry[] = [
  { keywords: ["workflo", "proof", "seal", "sealed", "audit", "assurance", "record"], answer: "Workflo is the execution assurance layer: it seals every action with authorship, timestamp, and terms at the moment it happens, then anchors the record so tampering breaks the chain visibly. It is in early access now.", source: { label: "Workflo system brief", href: "/products/workflo" } },
  { keywords: ["nexus", "forecast", "predict", "intelligence", "option", "operation"], answer: "Nexus is operations intelligence: many signal feeds converge on one forecast core, and what fans out is small — ranked options with their evidence attached, routed to an owner. A live demo is available.", source: { label: "Nexus system brief", href: "/products/nexus" } },
  { keywords: ["astra", "mission", "rehears", "simulat", "sandbox", "course of action", "twin"], answer: "ASTRA is mission engineering: it rehearses courses of action against a sandboxed mission twin, then seals the after-action lessons. Simulation only — it never touches live systems.", source: { label: "ASTRA system brief", href: "/products/astra" } },
  { keywords: ["platform", "architecture", "integration", "sandbox", "connect"], answer: "The Cortex platform connects the systems teams already trust, unifies signals into one operating picture, and seals what was decided into verifiable records.", source: { label: "Platform foundations", href: "/platform" } },
  { keywords: ["docs", "documentation", "api", "sdk", "start"], answer: "Start with the documentation foundations for core concepts, then move into APIs, SDKs, integrations, and trust and governance.", source: { label: "Documentation overview", href: "/docs" } },
  { keywords: ["security", "trust", "governance", "permission", "audit"], answer: "Cortex governance covers security, role-aware permissions, and auditable decision trails so operators can move quickly without losing control.", source: { label: "Trust & governance", href: "/security" } },
  { keywords: ["price", "pricing", "cost", "sales", "demo", "contact"], answer: "Bring us the hard question and we will make the first conversation useful. Start with a working session to walk through one decision your team needs to make better.", source: { label: "Book a demo", href: "/demo" } },
  { keywords: ["solution", "industry", "health", "finance", "industrial"], answer: "Cortex serves healthcare operations, risk and compliance, and industrial systems teams — each with operating patterns shaped to their constraints.", source: { label: "Solutions overview", href: "/solutions" } },
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
    answer: "AI Core can answer from the Cortex platform guides, including system fit, platform foundations, integrations, workflows, and documentation paths.",
    source: { label: "Documentation overview", href: "/docs" },
  };
}

// Contextual follow-up suggestions based on the prompt topic.
export function followUpsFor(prompt: string): string[] {
  const lower = prompt.toLowerCase();
  if (lower.includes("workflo") || lower.includes("seal")) return ["How do sealed records work?", "What does the pilot include?", "Compare Workflo and Nexus"];
  if (lower.includes("nexus") || lower.includes("forecast")) return ["How does the forecast core work?", "Compare Nexus and Workflo", "Where do I start in the docs?"];
  if (lower.includes("astra") || lower.includes("rehears")) return ["How does sandboxed rehearsal work?", "What is the after-action seal?", "Show platform foundations"];
  if (lower.includes("platform") || lower.includes("docs")) return ["Show platform foundations", "How do integrations work?", "Explain Cortex governance"];
  if (lower.includes("price") || lower.includes("demo") || lower.includes("sales")) return ["Book a working session", "What does a pilot include?", "Talk to Cortex"];
  return ["Which system fits our operating model?", "Where should I start in the docs?", "Explain Workflo"];
}
