# Workflo Website Design System & Experience Specification

- **Status:** Design direction locked for implementation
- **Brand:** Workflo
- **Product:** Automated QA testing & dev platform for software engineers
- **Scope:** Workflo public marketing website
- **Language:** English
- **Primary Goal:** Join early access waitlist
- **Secondary Goal:** Book a demo
- **Target Audience:** Software engineers, tech leads, QA teams, and SaaS builders

## 1. Design Direction

**Dark Cyber-Brutalism with 3D graphics, dynamic scroll effects, and neon accents.**

Workflo is an automated QA testing and development platform built for software engineers. The website should feel like a tool that engineers respect — technically serious, visually bold, and unapologetically dark. The aesthetic is cyber-brutalism: high contrast, sharp edges, neon green signal color, and 3D graphics that communicate real system behavior.

Desired emotional response:

- "This is built for engineers, not marketers."
- "The product is technically deep."
- "The 3D visuals represent something real about the system."
- "I want to try this."
- "This feels fast and modern."

Avoid: generic SaaS gradients, pastel colors, glassmorphism, stock illustrations, floating blobs, fake dashboards, feature-card grids as primary storytelling, hype copy, excessive whitespace, corporate stock photography.

## 2. Visual Identity

### Color

**Background — Deep Black:** `#050507`

Structural darks: `#0A0B0F` · `#0F1115` · `#14171D` · `#1A1E26`

**Neon Accent — Signal Green:** `#00FF88`

Neon variants: `#00E577` (hover) · `#00CC66` (pressed) · `#33FF99` (glow halo)

Secondary neon states: `#FF3366` (error/fail) · `#FFB800` (warning/pending) · `#00DDFF` (info/running)

Text: `#F0F2F5` (primary) · `#A0A8B0` (secondary) · `#5A6270` (muted)

### Usage Rules

- Neon green is the **only** accent color for interactive elements, CTAs, active states, and signal indicators.
- The background is always dark. Never use light backgrounds.
- Neon green appears as a signal — it draws attention to what matters: CTAs, active test states, key metrics, interactive elements.
- Error states use neon red `#FF3366`. Warning/pending states use neon amber `#FFB800`. Running/info states use neon cyan `#00DDFF`.
- Borders and dividers: `#1F242D` (subtle) · `#2A3140` (visible) · `#00FF88` at low opacity for active/glow borders.
- Glow effects: use `box-shadow` and `text-shadow` with neon green at low opacity (0.1–0.3) for layered depth. No glass/blur effects.

## 3. Typography

- **Display — Space Grotesk:** Hero headlines, section titles, product name, large metrics. Bold, tight, confident. Sizes 48px–120px desktop, 32px–64px mobile.
- **Body — Inter:** Explanatory copy, navigation, labels, form text, descriptions. 16px–20px, line-height 1.6.
- **Mono — JetBrains Mono:** Code snippets, test labels, technical metadata, section numbers, system states, timestamps, API references. 13px–16px.

### Typography Rules

- Headlines are large and bold. No thin or light weights for display text.
- Body text is readable on dark background — minimum `#A0A8B0` for secondary text.
- Code/mono text uses neon green for syntax highlighting in code blocks.
- Section numbers use mono font in neon green: `01 /`, `02 /`, etc.

## 4. Layout Philosophy

Full-width dark canvas. Desktop max-width 1440px content area, generous horizontal padding. 12-column desktop / 6-column tablet / 4-column mobile. Large vertical spacing between sections (120px–200px desktop). Sections flow edge-to-edge with internal content containers. Asymmetry is deliberate — not everything is centered.

No page breaks. The entire landing page is one continuous scroll experience with smooth animated transitions between sections.

## 5. Navigation

Desktop: `WORKFLO | Features Workflow Architecture Demo | [ Join Early Access ]`

- Transparent at hero, solid dark (`#050507` with border `#1F242D`) after scroll.
- Logo in neon green `#00FF88`.
- CTA button `[ Join Early Access ]` always visible — neon green border, dark fill, neon green text. On hover: neon green fill, black text.
- Mobile: logo + hamburger menu → full-screen dark overlay with neon green link accents.

## 6. Page Structure

```text
01 HERO
02 QA FEATURES GRID
03 INTERACTIVE TEST WORKFLOW
04 PLATFORM ARCHITECTURE
05 EARLY ACCESS WAITLIST FORM
FOOTER
```

Single continuous landing page. No multi-page navigation. All sections on one page with smooth scroll.

## 7. Hero Section

Full-viewport dark opening. The signature experience.

### Layout

- Full-screen dark background with subtle 3D graphic (abstract test execution visualization — nodes, connections, flowing signals in neon green).
- Oversized headline: `SHIP QUALITY CODE. AUTOMATE THE TESTING.` or similar bold statement.
- Subheadline (1 line): "Automated QA testing and development platform for software engineers."
- Two CTAs: `[ Join Early Access ]` (primary — neon green fill, black text) and `[ Book a Demo ]` (secondary — neon green border, transparent fill).
- Scroll cue at bottom: `SCROLL TO EXPLORE ↓` in mono font, neon green.

### 3D Hero Graphic

Abstract 3D visualization of the testing pipeline — geometric shapes representing test nodes, connections between them, neon green signal flows showing test execution paths. Smooth, restrained animation: nodes pulse when "tests run," connections light up in sequence. Mouse parallax for depth. Not a literal dashboard — an abstract system representation.

### Hero Motion

States: `IDLE → TEST QUEUED → EXECUTION FLOW → RESULTS LIGHT UP → IDLE`. Subtle, persistent, never aggressive. Reduced-motion fallback: static 3D scene with no animation.

Stack: React + React Three Fiber + Three.js + custom shaders, with graceful degradation.

## 8. QA Features Grid

### Layout

Section label: `02 / FEATURES` in mono neon green.

Section title: `EVERYTHING YOU NEED TO TEST, SHIP, AND TRUST YOUR CODE.`

Grid of feature cards — 3 columns desktop, 2 tablet, 1 mobile. Each card:

- Dark background `#0F1115` with border `#1F242D`.
- Neon green icon (SVG) top-left.
- Feature name in Space Grotesk, bold, white.
- Short description in Inter, `#A0A8B0`.
- On hover: border glows neon green, subtle `box-shadow` glow, card lifts slightly (translateY -4px).

### Features

1. **Automated Test Execution** — Run tests across environments with parallel execution and real-time status.
2. **Smart Test Selection** — AI-driven test impact analysis runs only what matters for each change.
3. **Cryptographic Receipts** — Every test run produces a verifiable hash receipt for audit and compliance.
4. **Sandboxed Environments** — Isolated execution sandboxes per branch, per PR, per commit.
5. **Real-time Reporting** — Live test dashboards with failure traces, logs, and video captures.
6. **CI/CD Integration** — Native integrations with GitHub, GitLab, Jenkins, and more.

### Motion

Cards reveal on scroll with stagger — opacity 0 → 1, translateY 20px → 0, 150ms stagger between cards. Glow border activates on hover.

## 9. Interactive Test Workflow

### Layout

Section label: `03 / WORKFLOW` in mono neon green.

Section title: `SEE HOW IT WORKS.`

Interactive step-by-step visualization of the testing workflow:

```text
CODE COMMIT → TEST SELECTION → SANDBOX EXECUTION → RESULTS & RECEIPTS → SHIP
```

### Design

- Horizontal stepper on desktop (vertical on mobile).
- Each step is a node with neon green border and icon.
- Active step glows neon green. Completed steps show a checkmark in neon green. Future steps are dimmed.
- Clicking a step expands a detail panel below with:
  - Step description
  - Code snippet (mono font, dark background, neon green syntax highlighting)
  - Visual representation (mini 3D or animated diagram)
- Smooth transition between steps.

### Motion

Steps activate on scroll or click. Active step pulses subtly. Connection lines between steps light up in sequence (neon green flow animation). Reduced-motion: static steps with no flow animation.

## 10. Platform Architecture

### Layout

Section label: `04 / ARCHITECTURE` in mono neon green.

Section title: `BUILT FOR SCALE. DESIGNED FOR ENGINEERS.`

Large architectural diagram showing the Workflo platform:

```text
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│  Your Code   │────▶│  Workflo API  │────▶│  Test Scheduler   │
│  Repository  │     │  Gateway      │     │  & Orchestrator   │
└─────────────┘     └──────────────┘     └────────┬────────┘
                                                   │
                    ┌──────────────────────────────┘
                    ▼
              ┌─────────────┐     ┌──────────────┐
              │  Sandboxed   │────▶│  Results &    │
              │  Executors   │     │  Receipts     │
              └─────────────┘     └──────────────┘
                    │                      │
                    ▼                      ▼
              ┌─────────────┐     ┌──────────────┐
              │  Real-time  │     │  Cryptographic│
              │  Dashboard  │     │  Hash Receipts│
              └─────────────┘     └──────────────┘
```

### Design

- Dark background with the diagram rendered in neon green lines and nodes.
- Each component is a card with border `#2A3140`, icon, and label.
- Active connections glow neon green. Data flow animated with moving dots along connection lines.
- On hover, each component expands to show a brief description.
- Below the diagram: 3-4 key architecture highlights with mono labels:
  - `HORIZONTAL_SCALE` — Auto-scaling test executors
  - `ZERO_TRUST` — Sandboxed isolation per execution
  - `AUDIT_TRAIL` — Cryptographic receipts for every run
  - `SUB_100MS` — Test scheduling latency

### Motion

Data flow dots animate along connection lines (neon green, continuous). Components reveal on scroll with stagger. Diagram is interactive — hover to expand components.

## 11. Early Access Waitlist Form

### Layout

Section label: `05 / EARLY ACCESS` in mono neon green.

Section title: `JOIN THE EARLY ACCESS WAITLIST.`

Subheadline: "Be first to ship quality code with Workflo. Limited spots available."

### Form Design

- Dark card `#0F1115` with neon green border glow.
- Centered, max-width 560px.
- Fields:
  - **Full Name** — dark input `#0A0B0F`, border `#2A3140`, neon green focus border.
  - **Work Email** — same styling.
  - **Company** (optional) — same styling.
- Submit button: `[ Join Early Access ]` — full width, neon green fill, black text, bold. On hover: brightens, subtle glow intensifies.
- On success: form fades out, success message appears with neon green checkmark: `✓ You're on the list. We'll be in touch soon.`
- On error: neon red error message below form.

### Trust Indicators Below Form

- `✓ No spam. Ever.`
- `✓ Early access means early input.`
- `✓ Cancel anytime.`

In mono font, `#5A6270`, small.

### Motion

Form card reveals on scroll with glow pulse. Input focus: border transitions to neon green with subtle glow. Submit: button shows loading spinner (neon green), then success/error state.

## 12. Footer

Minimal, dark, dense.

- `WORKFLO` logo in neon green, left.
- Links: Features · Workflow · Architecture · Demo · Early Access
- Social: GitHub · Twitter/X · LinkedIn (neon green icons)
- `© 2026 Workflo. All rights reserved.`
- Border-top `#1F242D`.

## 13. Component System

```text
components/
├── 3d/            TestField, NodeGraph, SignalFlow, ExecutionScene
├── motion/        Reveal, Stagger, Parallax, GlowPulse, ScrollFlow
├── ui/            NeonButton, GlowCard, DarkInput, StepNode, CodeBlock
├── sections/      Hero, FeaturesGrid, WorkflowStepper, Architecture, WaitlistForm
└── navigation/    Header, MobileMenu, Footer
```

## 14. Motion Rules

Motion communicates system behavior — test execution, data flow, state changes.

**Allowed:** opacity, transform, scale, glow pulses, line drawing, node activation, scroll-driven reveals, parallax depth, connection flow animation.

**Avoid:** bouncing, excessive 3D rotation, particle explosions, scroll hijacking, page breaks, blocking transitions, cursor-following effects, glass/blur effects.

**Timing:**
- Micro interactions: 150–250ms
- UI transitions: 300–500ms
- Section reveals: 500–800ms
- Hero/3D scenes: 800–1400ms

**Easing:** smooth spring or cubic-bezier(0.16, 1, 0.3, 1) for natural motion.

## 15. Scroll Behavior

Smooth, continuous, single-page experience. Normal browser scroll drives visual state (3D camera, section reveals, step activations). No scroll snapping. No page breaks. No multi-page navigation. Everything flows.

## 16. Responsive Behavior

**Desktop:** Full 3D, large type, 3-column grids, horizontal stepper, full architecture diagram.

**Tablet:** Reduced 3D, 2-column grids, simplified architecture diagram.

**Mobile:** Portrait-first, minimal 3D (or static), 1-column grids, vertical stepper, stacked architecture. Dominant typography. Touch-optimized form.

**Reduced motion:** Static 3D scene, opacity transitions only, no flow animations, no parallax.

## 17. Performance Rules

- Lazy-load 3D scenes below the fold.
- GPU instancing for repeated 3D elements.
- Capped device pixel ratio (max 2x).
- Pause offscreen 3D rendering.
- Route-split JavaScript (only load what's needed).
- Critical hero assets only — everything else deferred.
- Usable without WebGL (fallback to static visuals).
- No large textures or heavy models.

## 18. Accessibility

- Reduced-motion equivalents for all animations.
- Keyboard navigation through interactive elements (stepper, form, architecture).
- Visible focus states (neon green focus ring).
- Semantic HTML headings.
- Sufficient contrast: white on dark, neon green on dark (WCAG AA minimum).
- Alt text for all images and 3D fallbacks.
- Accessible form labels and error messages.
- Never color-only information — always pair neon green with text or icons.

## 19. SEO Configuration

- Semantic crawlable HTML — every section has proper heading hierarchy.
- Page title: `Workflo — Automated QA Testing & Dev Platform`
- Meta description: `Automated QA testing and development platform for software engineers. Join the early access waitlist.`
- Canonical URL, OG tags, Twitter Card tags.
- JSON-LD: SoftwareApplication schema with name, description, applicationCategory.
- Sitemap.xml and robots.txt.
- Core content is HTML, not canvas-only — 3D enhances, never replaces text.

## 20. Visitor Analytics

- First-party, privacy-conscious analytics.
- Consent-gated tracking (no cookies without permission).
- Track: page views, CTA clicks, form submissions, scroll depth, section engagement.
- No third-party analytics scripts.
- Analytics stored in Supabase, viewable in admin dashboard.

## 21. Content Style

Precise, technical, confident, engineer-to-engineer tone.

- Use concrete terms: "test execution," "sandboxed environments," "cryptographic receipts."
- Avoid hype: no "revolutionary," "unprecedented," "game-changing."
- Short sentences. Active voice. Technical accuracy over marketing polish.
- Code snippets where appropriate to show real usage.

## 22. Anti-Patterns

No light backgrounds. No glassmorphism or blur effects. No pastel colors. No generic SaaS feature cards with stock icons. No fake testimonials. No fabricated metrics or benchmarks. No floating elements without purpose. No cursor-following effects. No modal overload. No multi-page navigation. No page breaks between sections. No glass effect.

## 23. Color Reference

```css
:root {
  --bg-deep: #050507;
  --bg-dark: #0A0B0F;
  --bg-card: #0F1115;
  --bg-elevated: #14171D;
  --bg-hover: #1A1E26;

  --neon-green: #00FF88;
  --neon-green-hover: #00E577;
  --neon-green-pressed: #00CC66;
  --neon-green-glow: #33FF99;

  --neon-red: #FF3366;
  --neon-amber: #FFB800;
  --neon-cyan: #00DDFF;

  --text-primary: #F0F2F5;
  --text-secondary: #A0A8B0;
  --text-muted: #5A6270;

  --border-subtle: #1F242D;
  --border-visible: #2A3140;
  --border-active: #00FF88;
}
```

## 24. Final Homepage Wireframe

```text
WORKFLO  Features Workflow Architecture Demo | [ Join Early Access ]

─────────────────────────────────────────────────────────

  [3D TEST FIELD — abstract nodes, neon green signal flows]

  SHIP QUALITY CODE.
  AUTOMATE THE TESTING.

  Automated QA testing and development platform for software engineers.

  [ Join Early Access ]   [ Book a Demo ]

  SCROLL TO EXPLORE ↓

─────────────────────────────────────────────────────────

02 / FEATURES

EVERYTHING YOU NEED TO TEST, SHIP, AND TRUST YOUR CODE.

┌──────────┐  ┌──────────┐  ┌──────────┐
│ Automated │  │ Smart    │  │ Crypto   │
│ Test Exec │  │ Selection│  │ Receipts │
└──────────┘  └──────────┘  └──────────┘
┌──────────┐  ┌──────────┐  ┌──────────┐
│ Sandboxed │  │ Real-time │  │ CI/CD    │
│ Envs      │  │ Reporting│  │ Integrate │
└──────────┘  └──────────┘  └──────────┘

─────────────────────────────────────────────────────────

03 / WORKFLOW

SEE HOW IT WORKS.

CODE → SELECT → SANDBOX → RESULTS → SHIP
 ●──────●───────●─────────●────────●

[Step detail panel with code snippet and visual]

─────────────────────────────────────────────────────────

04 / ARCHITECTURE

BUILT FOR SCALE. DESIGNED FOR ENGINEERS.

[Interactive architecture diagram with neon green data flows]

HORIZONTAL_SCALE   ZERO_TRUST   AUDIT_TRAIL   SUB_100MS

─────────────────────────────────────────────────────────

05 / EARLY ACCESS

JOIN THE EARLY ACCESS WAITLIST.

Be first to ship quality code with Workflo. Limited spots available.

┌───────────────────────────────────────┐
│  Full Name                            │
│  Work Email                           │
│  Company (optional)                   │
│                                       │
│  [      Join Early Access      ]      │
│                                       │
│  ✓ No spam. Ever.                     │
│  ✓ Early access means early input.    │
│  ✓ Cancel anytime.                    │
└───────────────────────────────────────┘

─────────────────────────────────────────────────────────

WORKFLO  Features · Workflow · Architecture · Demo · Early Access
GitHub · Twitter/X · LinkedIn                          © 2026 Workflo
```

## 25. Implementation Priority

- **P0:** Design tokens (dark + neon green), typography, navigation, hero with 3D test field, features grid, workflow stepper, architecture diagram, waitlist form, footer, responsive behavior, smooth scroll.
- **P1:** Scroll-linked 3D transitions, interactive architecture hover states, advanced glow effects, analytics integration.
- **P2:** Richer WebGL shaders, detailed 3D test execution scenes, experimental scroll transitions. Never delay launch for P2.

## 26. Definition of Done

Dark cyber-brutalism aesthetic achieved. Neon green is the only accent color. 3D communicates real system behavior. Every section is purposeful. Single continuous scroll — no page breaks. Hero is bold and immediately communicates the product. Features grid is scannable. Workflow is interactive. Architecture is understandable. Waitlist form is frictionless. Desktop is cinematic. Mobile is fast and readable. Reduced-motion works. Semantic SEO HTML. No fake claims or metrics. Primary CTA (Join Early Access) is always visible.

## 27. Final Design Principle

North star: **a dark, bold, engineer-first landing page that uses 3D and neon to make automated QA testing feel as serious and real as the code it tests.** The visual language is cyber-brutalism — high contrast, sharp, no decoration without purpose. Neon green is the signal. Dark is the canvas. 3D is the system. One page, one scroll, one goal: join early access.
