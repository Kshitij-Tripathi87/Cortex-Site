# Cortex Website Design System & Experience Specification

- **Status:** Design direction locked for implementation
- **Reference:** TensorDyne public website, https://www.tensordyne.ai/
- **Scope:** Cortex public marketing website only
- **Products:** Workflo · Nexus · ASTRA

## 1. Design Intent

Cortex should adopt the experience philosophy of the TensorDyne site without cloning its brand, copy, imagery, or exact composition.

The reference demonstrates a strong deep-tech marketing pattern:

- extremely visual hero
- oversized typography
- sparse navigation
- dark, premium presentation
- large product/technology imagery
- scroll-led storytelling
- numbered technical sections
- performance/evidence blocks
- product architecture explained progressively
- timeline/progress narrative
- industry-specific positioning
- strong closing conversion
- minimal footer

TensorDyne currently moves from a large opening statement into technical explanation, product architecture, development progress, performance, target audiences, contact, company story, and a final CTA. Its product page uses numbered sections (001, 002, etc.) and combines large visuals with technical explanations and benchmark-style proof.

Cortex should use the same high-level editorial rhythm:

```text
Statement → System → Architecture → Evidence → Applications → Trust → Conversion
```

But the visual language must be distinctly Cortex.

## 2. Core Creative Direction

**Positioning:** Cortex is not a generic SaaS platform. The website should feel like a frontier engineering company revealing an intelligence system.

Desired emotional response:

- "This is technically serious."
- "This company understands complex systems."
- "There is an actual architecture behind the claims."
- "The product is sophisticated but understandable."
- "I want to see how it works."

Avoid: generic AI gradients, floating blobs, stock "AI brain" graphics, excessive glassmorphism, generic dashboard mockups, feature-card grids as the primary storytelling device, fake numerical claims, noisy sci-fi decoration.

## 3. Cortex Visual Identity

**Color — Primary:** Charcoal / Near Black `#080A0D`

Structural darks: `#0D1014` · `#11151A` · `#171C22`

Material / silver: `#D8DCE2` · `#AEB5BF` · `#6F7782`

Signal: Cobalt `#2457E6`

Supporting signal states: restrained green / amber / red.

Use cobalt as a signal, not as a background wash. There should be very little persistent color on screen. Color appears when the system has something to communicate.

## 4. Typography

- **Display — Space Grotesk:** hero headlines, section statements, product names, large numeric evidence, closing CTA. Large, tight, confident, minimal line breaks.
- **Body — IBM Plex Sans:** explanatory copy, navigation, labels, metadata, forms.
- **Technical — IBM Plex Mono:** section numbers, system states, technical labels, data, timestamps, coordinates, metadata, small UI instrumentation.

## 5. Layout Philosophy

Wide editorial grid. Desktop max-width 1440–1600px, generous horizontal margins, 12-column desktop / 6-column tablet / 4-column mobile, large vertical spacing, strong alignment anchors. Asymmetry deliberate. Do not force every section into centered cards.

## 6. Navigation

Desktop: `CORTEX | Platform Products Solutions Resources Company | Security [ Talk to Cortex ]`, plus a compact `● SYSTEMS OPERATIONAL` indicator. Transparent/overlay at hero, solid/dark after scroll, subtle border, no oversized dropdowns; product dropdown shows Workflo / Nexus / ASTRA. CTA visually persistent. Mobile: logo + menu + full-screen navigation overlay.

## 7. Homepage Structure

A single continuous film, not SaaS sections:

```text
01 HERO · 02 CORE STATEMENT · 03 INTELLIGENCE LAYER · 04 HOW CORTEX WORKS
05 PRODUCT SYSTEM · 06 EVIDENCE · 07 USE CASES / SOLUTIONS · 08 SECURITY & TRUST
09 COMPANY / MISSION · 10 CONTACT / CTA · 11 FOOTER
```

## 8. HERO — The Signature Experience

Full-viewport deep-tech opening. Oversized `INTELLIGENCE / FOR CRITICAL / SYSTEMS.` statement, one supporting line, `[ Explore Cortex ] [ Talk to Cortex ]`, and the Cortex Intelligence Field below — an abstract graph/system of nodes, relationships, flowing signals, subtle depth, dynamic clustering, and a central Cortex core. Not a literal globe. Ends with a `SCROLL ↓` cue.

## 9. Hero Motion

Persistent but restrained. States: `IDLE → SIGNAL ARRIVES → RELATIONSHIP ACTIVATES → CORE PROCESSES → NEW PATH EMERGES → IDLE`. Mouse parallax, subtle node depth, occasional signal propagation, scroll-shifted camera. No infinite aggressive spinning, no flashing, reduced-motion fallback. Stack: React + React Three Fiber + Three.js + custom GLSL + Motion, with graceful degradation on low-power devices.

## 10. Hero Typography

Short. `INTELLIGENCE / FOR CRITICAL / SYSTEMS.` plus: "Cortex connects operational data, reasoning, simulation, and evidence into one decision layer." No product-terminology overload; discovery follows below.

## 11. Scroll Cue

Minimal technical cue: `SCROLL TO EXPLORE ─────↓` (or `001 / SYSTEM`) opening the numbered editorial system.

## 12. Section Numbering System

Every major section receives `001`, `002`, … in small understated IBM Plex Mono (e.g. `001 / THE PROBLEM`). Never louder than the headline.

## 13. Core Statement Section

Large statement, almost no cards, giant typography, horizontal rule, subtle animated signal line, generous negative space. Makes the problem intellectually obvious.

## 14. Intelligence Layer Section

`002 / THE INTELLIGENCE LAYER BETWEEN SIGNAL AND ACTION.` Animated sequence `RAW SIGNALS → CONTEXT → REASONING → SIMULATION → DECISION → EVIDENCE`, each stage activating a different visual state.

## 15. How Cortex Works

Core explanatory section: large statement left, interactive system diagram right. Pipeline: `OBSERVE → UNDERSTAND → SIMULATE → RECOMMEND → AUTHORIZE → EXECUTE → VERIFY`. Never imply autonomous execution; clearly differentiate DEMO / SIMULATION from LIVE PRODUCT.

## 16. Product System

Products as components of one architecture — `THE CORTEX SYSTEM`: WORKFLO (Execution Assurance) · NEXUS (Operations Intelligence) · ASTRA (Mission Engineering). Substantial screen real estate each; no tiny three-card SaaS grids.

## 17. Product Showcase Pattern

Per product: name + technical category, large statement, short explanation, `[ Explore product ]`, large visual, then deeper technical info. Flows: Workflo `CODE → SANDBOX → EXECUTION → HASH → RECEIPT`; Nexus `DATA → WORLD STATE → GRAPH → SIGNALS → SIMULATION → DECISION`; ASTRA `MISSION → REQUIREMENTS → ARCHITECTURES → CONSTRAINTS → TRADE-OFFS → MISSION PLAN`.

## 18. Product Page Design

Numbered editorial system per product page: `001 INTRODUCTION · 002 CORE CAPABILITY · 003 ARCHITECTURE · 004 HOW IT WORKS · 005 PERFORMANCE / EVIDENCE · 006 WORKLOADS / USE CASES · 007 SECURITY / TRUST · 008 CTA`.

## 19. Architecture Visualization

Conceptual animated system diagrams (never frontend → backend → database). Nexus example: WORLD STATE fanning to SIGNALS / GRAPH / EVENTS, converging to NEXUS CORE, fanning to SCENARIO / AGENTS / EVIDENCE, converging to DECISION.

## 20. Evidence Section

`EVIDENCE, NOT PROMISES.` Verified benchmarks, architecture diagrams, measured outcomes, case studies, technical notes, whitepapers, demonstrations. Every number must have provenance; synthetic figures labeled `ILLUSTRATIVE`; never manufacture benchmarks.

## 21. Performance / Metrics Design

Validated metrics in very large numerical typography with datasheet metadata (benchmark, environment, date, methodology).

## 22. Timeline / Progress Section

`CORTEX EVOLUTION` adapted from the reference timeline. Only real milestones; later driven from Supabase CMS.

## 23. Solutions / Workloads

Audience-style section: `BUILT FOR SYSTEMS WHERE DECISIONS MATTER.` Verticals (Complex Operations, Critical Software, Supply Networks, Mission Engineering, Infrastructure, Enterprise AI) each with problem, Cortex role, product mapping, supporting evidence.

## 24. Image Direction

Cinematic engineering imagery: server environments, abstract compute, dark technical environments, materials close-ups, diagrams, industrial structures, satellite/mission imagery for ASTRA, code/sandbox language for Workflo, network/logistics for Nexus. Dark, desaturated, high contrast, controlled highlights, negative space.

## 25. Video / Motion

Optional cinematic product film (`WATCH THE SYSTEM [ PLAY ]`) in modal with controls/captions/poster; never the only way to understand the product.

## 26. Contact / Conversion

`LET'S BUILD THE RIGHT SYSTEM.` Technical-requirement framing, `[ Talk to Cortex ] [ Request a technical briefing ]`, optional PRODUCT / SALES / TECHNICAL / PARTNERS routing. No fabricated employee profiles or contact information.

## 27. Company Section

`THE COMPANY` — mission, engineering philosophy, team, locations, careers, story. Editorial, not corporate.

## 28. Security Section

Before final conversion: `TRUST IS PART OF THE SYSTEM.` Identity, access control, data protection, auditability, infrastructure security, privacy. Quiet technical visualization; links to Security overview, Privacy, Trust documentation, Status.

## 29. Footer

Minimal, dense, premium: CORTEX + line, Products (Workflo/Nexus/ASTRA), Platform, Solutions, Resources, Company, Security, Status, Contact, Legal set, `© 2026 Cortex`.

## 30. Component System

```text
components/
├── 3d/         IntelligenceField, NetworkScene, SignalFlow, ProductScene
├── motion/     Reveal, Stagger, Parallax, Magnetic, ScrollTimeline
├── editorial/  SectionNumber, Statement, Divider, Metric, Timeline, TechnicalLabel
├── products/   ProductHero, ProductSystem, ArchitectureDiagram, ProductEvidence, ProductCTA
└── navigation/ Header, ProductMenu, MobileMenu, Footer
```

## 31. Motion Rules

Communicate system behavior. Allowed: opacity, transform, scale, camera movement, line drawing, node activation, blur entrance, clipping reveal, horizontal translation. Avoid: bouncing, excessive 3D rotation, particle explosions, scroll hijacking, blocking transitions, readability-harming animation. Timing: micro 150–250ms, UI 300–500ms, section 600–900ms, hero/system 800–1400ms. Spring/smooth easing.

## 32. Scroll Behavior

Scroll-driven, never scroll-locked. Normal browser scroll drives visual state (camera / graph / text). No full-site scroll snapping.

## 33. Responsive Behavior

Desktop: full WebGL, large type, asymmetric layouts. Tablet: reduced 3D. Mobile: portrait-first, simplified field, shorter timelines, dominant typography. Reduced motion: static scene, opacity transitions, minimal transforms.

## 34. Performance Rules

Lazy-load 3D, GPU instancing, capped DPR, reduced particles on low-end hardware, pause offscreen, no huge textures, critical hero assets only, route-split JS. Usable without WebGL.

## 35. Accessibility

Reduced-motion equivalents, keyboard navigation, visible focus, semantic headings, contrast, alt text, accessible dialogs/menus, captions/transcripts, never color-only information.

## 36. SEO Integration

Semantic crawlable HTML; every page gets title/description/canonical/OG/Twitter/JSON-LD/breadcrumbs. Effects never replace content; core story never canvas-only.

## 37. Content Style

Precise, technical, confident, restrained, evidence-led. Concrete nouns and verbs. Never hype-copy ("revolutionary", "unprecedented", "unlock possibilities").

## 38. Anti-Patterns

No generic purple AI gradient, AI brain graphic, glass cards, fake dashboards, fake logos/benchmarks/testimonials, floating elements, cursor-following effects, modal overload, or non-existent product functionality.

## 39. Design Relationship to TensorDyne

Borrow principles, never assets: large-scale editorial typography, dark cinematic presentation, technical storytelling, numbered sections, large product visuals, scroll narrative, architecture-first explanation, performance/evidence blocks, minimal navigation, strong final CTA. Never copy logo, marks, layouts, copy, images, illustrations, animation sequences, graphics, or spacing.

## 40. Cortex vs TensorDyne Translation

AI inference hero → Intelligence for critical systems · Napier hardware → Cortex intelligence layer · Rack/pod architecture → World State / Graph / Agent architecture · Benchmarks → Evidence / decision outcomes · Hardware timeline → Cortex platform evolution · Inference modes → Operational / simulation workflows · Data-center economics → System impact / decision economics · Silicon sections → Cortex architecture · Target audiences → Critical-system workflows · Beta CTA → Technical briefing / product exploration.

## 41. Final Homepage Wireframe

```text
CORTEX  Platform Products ... CTA
INTELLIGENCE / FOR CRITICAL / SYSTEMS. + [3D INTELLIGENCE FIELD] + SCROLL ↓
001 COMPLEXITY IS NOT THE PROBLEM. INVISIBLE RELATIONSHIPS ARE.
002 THE INTELLIGENCE LAYER — SIGNAL → CONTEXT → REASON → SIMULATE → DECIDE → EVIDENCE
003 HOW CORTEX WORKS — [INTERACTIVE SYSTEM DIAGRAM]
004 THREE SYSTEMS. ONE INTELLIGENCE LAYER. — WORKFLO / NEXUS / ASTRA
005 EVIDENCE, NOT PROMISES. — [METRIC] [CASE STUDY] [TECHNICAL NOTE]
006 BUILT FOR SYSTEMS WHERE DECISIONS MATTER. — [SOLUTIONS / INDUSTRIES]
007 TRUST IS PART OF THE SYSTEM. — SECURITY · PRIVACY · STATUS
008 LET'S BUILD THE RIGHT SYSTEM. — [TALK TO CORTEX]
FOOTER
```

## 42. Implementation Priority

- **P0:** design tokens, typography, navigation, hero Intelligence Field, section-number system, statement sections, intelligence flow, product showcase, architecture visualizations, evidence sections, CTA system, responsive behavior.
- **P1:** scroll-linked 3D transitions, product 3D scenes, timeline, cinematic media, CMS-driven evidence, interactive solutions.
- **P2:** advanced shaders, richer WebGL, detailed simulations, experimental transitions. Never delay launch for P2.

## 43. Definition of Done

Distinctive hero · not generic SaaS · 3D communicates system · every section purposeful · technical product pages · understandable architecture · evidence over adjectives · one product family · cinematic desktop · fast readable mobile · reduced-motion works · semantic SEO HTML · no fake claims/metrics/interactions · marketing vs product CTA paths distinct.

## 44. Final Design Principle

North star: **a cinematic technical publication wrapped around an intelligence system** — engineering laboratory + mission control + technical journal + premium product film. TensorDyne proves large statements, technical depth, visual storytelling, disciplined pacing. Cortex expresses it through World State, operational graph, reasoning, simulation, authorization, execution evidence, and the Workflo / Nexus / ASTRA family.
