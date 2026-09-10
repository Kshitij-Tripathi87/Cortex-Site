# Cortex Website Design System & Experience Specification

**Project:** Cortex public marketing website  
**Status:** Design direction locked for implementation  
**Scope:** Public Cortex website only  
**Products:** Workflo · Nexus · ASTRA  
**Primary website objective:** Make Cortex feel like a serious deep-tech system company and drive qualified demo / conversation requests.  
**Reference direction:** Dark cyber-brutalism, cinematic 3D product storytelling, smooth scroll-driven motion, editorial typography, and technically legible interfaces. The supplied Workflo landing-page reference is a visual benchmark for intensity, composition, pacing, and product visualization—not an asset, layout, copy, or brand to clone.

---

## 1. Design North Star

> **Cortex should feel like a product film, not a SaaS template.**

The site combines:

- dark cyber-brutalism
- premium technical editorial design
- cinematic 3D objects
- controlled neon signal color
- hard-edged structural geometry
- interactive system diagrams
- smooth scroll-linked choreography
- large, high-confidence typography
- proof/evidence over generic marketing language

The desired first impression is:

> **“There is a real system behind this.”**

The supplied reference demonstrates the right level of ambition: large headline + major 3D object, dark environment, product proof, workflow visualization, platform UI, and a strong final conversion block. Cortex should reach that level of visual density and polish while developing its own visual identity.

---

## 2. Core Creative Direction

### Dark Cyber-Brutalism

The site is predominantly black / near-black.

Structural language:

- rectangular and hard-edged surfaces
- thin technical rules
- asymmetrical compositions
- oversized typography
- exposed metadata
- minimal rounding
- visible grid structure
- strong material contrast

This is **not glassmorphism**.

Do not use translucent “frosted glass” cards as the primary visual language. 3D objects may use physically rendered glass-like materials where they are part of an illustration, but the website UI itself should remain opaque, sharp, and structural.

### Neo-futurist layer

Neo-futurism comes from:

- computational 3D
- system topology
- graph relationships
- signal paths
- technical overlays
- simulated telemetry
- spatial depth
- restrained glow
- responsive motion

Avoid cyberpunk clichés, excessive neon, hologram UI parody, or random particle effects.

---

## 3. Visual Hierarchy

Every viewport should have one dominant idea.

Priority order:

```text
1. Statement
2. Product / system visual
3. Supporting explanation
4. Technical metadata
5. CTA
```

Do not let navigation, decorative HUD elements, or motion compete with the primary statement.

---

## 4. Color System

### Base

- Void: `#050609`
- Near black: `#080A0D`
- Deep surface: `#0D1015`
- Surface: `#121720`
- Raised surface: `#181F2A`

### Light material

- Primary text: `#F4F6F8`
- Secondary text: `#B6BEC9`
- Muted text: `#707987`
- Faint rules: `rgba(244,246,248,0.12)`

### Cortex signal

- Cobalt: `#2457E6`
- Electric blue: `#5B82FF`

### Semantic accents

- Success: restrained green
- Attention: restrained amber
- Critical: restrained red

### Color rule

The interface stays mostly monochrome. The signal color appears when something is active:

```text
idle      → monochrome
signal    → cobalt
active    → electric blue
critical  → restrained red
success   → restrained green
```

Never turn the whole page into a blue gradient.

---

## 5. Typography

### Display — Space Grotesk

Use for:

- hero headlines
- major section statements
- product names
- CTA headlines
- evidence numerals

Characteristics:

- oversized
- compact line height
- tight tracking
- confident, editorial composition

### Body — IBM Plex Sans

Use for:

- explanatory text
- navigation
- forms
- labels
- secondary copy

### Technical — IBM Plex Mono

Use for:

- section numbers
- system state
- timestamps
- environment labels
- coordinates
- technical metadata
- diagrams
- benchmark context

---

## 6. Grid & Composition

### Desktop

- maximum content width: approximately 1440–1600px
- 12-column grid
- large outer gutters
- deliberate asymmetry
- image / object blocks allowed to break the grid

### Tablet

- 6-column structure
- fewer simultaneous visual elements
- reduced 3D density

### Mobile

- 4-column conceptual grid
- aggressive prioritization of headline + object + CTA
- simplified architecture diagrams
- reduced 3D complexity

### Core composition rule

Avoid “three equal cards across the screen” as the main design pattern.

Use large visual chapters instead.

---

## 7. Navigation

The header should feel like the control bar of a technical instrument.

### Desktop

```text
CORTEX    Product   Platform   Docs   Insights   Company   Search   [TALK TO CORTEX →]
```

Behavior:

- transparent / low-contrast at hero entry
- becomes opaque after scroll
- thin structural border
- restrained hover underline
- compact height
- CTA remains visually discoverable

### Product menu

```text
Workflo
Nexus
ASTRA
```

Each product item gets:

- product name
- short technical category
- one-line descriptor
- arrow / hover state

### Mobile

Minimal logo + menu trigger.

The menu opens as a full-screen dark navigation surface with large typographic links.

---

## 8. Homepage Experience Architecture

The homepage should read as one continuous film.

```text
01 HERO
02 THE PROBLEM
03 THE INTELLIGENCE LAYER
04 HOW CORTEX WORKS
05 THE PRODUCT SYSTEM
06 PROOF / EVIDENCE
07 USE CASES / SYSTEMS
08 TRUST / SECURITY
09 THE COMPANY
10 CONVERSION
11 FOOTER
```

Transitions between chapters must feel continuous. Avoid visually abrupt “page break” sections.

---

## 9. HERO — Major Visual Event

The hero is the biggest departure from the current flat landing-page appearance.

### Layout

Prefer a two-field composition inspired by the supplied reference:

```text
┌──────────────────────────────────────────────────────────────┐
│ CORTEX / metadata                                             │
│                                                              │
│ INTELLIGENCE              [large cinematic 3D system object] │
│ FOR CRITICAL              [graph / core / signal structure]  │
│ SYSTEMS.                                                     │
│                                                              │
│ supporting statement                                          │
│ [EXPLORE]   [TALK TO CORTEX]                                 │
│                                                              │
│ technical readout                         SCROLL TO EXPLORE ↓ │
└──────────────────────────────────────────────────────────────┘
```

The supplied screenshot demonstrates the desired visual principle: the headline occupies the left communication field while the right side is dominated by a large, highly art-directed 3D object.

### Cortex Intelligence Field

It should represent:

- connected entities
- relationships
- signals
- context
- a central intelligence core
- flowing paths
- temporal change

It must **not** look like a generic AI brain or a literal globe.

---

## 10. Hero 3D Art Direction

The hero needs an obvious cinematic object rather than a barely visible background graph.

Recommended direction:

### Primary object

A large floating / suspended **Cortex Core** constructed from:

- dark precision geometry
- luminous cobalt signal channels
- thin structural rings
- graph endpoints
- small orbiting nodes
- layered depth

### Secondary elements

- detached signal nodes
- moving traces
- translucent *material* elements only where useful to the illustration
- technical markers
- depth particles used sparingly

### Composition

The object should occupy substantial visual area and can partially break the hero bounds, as the supplied reference does with the product object.

It should feel engineered, not decorative.

---

## 11. Hero Animation System

The hero continuously communicates system state.

```text
IDLE
  ↓
SIGNAL ARRIVES
  ↓
RELATIONSHIP ACTIVATES
  ↓
CORE PROCESSES
  ↓
PATHS RECONFIGURE
  ↓
DECISION STATE
  ↓
IDLE
```

Cycle length can be approximately 10–18 seconds, with variation so it does not feel like an obvious looping GIF.

### Motion behaviors

- camera parallax
- subtle object drift
- graph activation
- traveling signal pulses
- ring expansion
- controlled camera dolly
- depth shifts
- occasional topology changes

### Do not use

- aggressive spinning
- flashing
- constant explosions
- random particle storms
- infinite camera orbit
- scroll hijacking

---

## 12. Scroll Choreography

Scrolling is the second animation layer.

The page should smoothly transform from one system state to another.

Example:

```text
Hero field
  ↓ scroll
signal nodes detach
  ↓
relationships become explicit
  ↓
context assembles
  ↓
scenario branches appear
  ↓
decision path converges
```

Normal browser scrolling always remains in control.

No full-page scroll snapping.

---

## 13. Motion Quality

Motion should feel expensive, smooth, and deliberate.

### Timing

| Interaction | Target |
|---|---:|
| Micro UI | 150–250ms |
| Hover / control | 200–350ms |
| Section reveal | 500–900ms |
| Large system transition | 800–1400ms |
| 3D camera movement | heavily damped |

Motion must not create visual tearing, layout shifts, or interaction delays.

---

## 14. Hero Metadata / HUD

The cyber-brutalist layer can use a restrained technical HUD.

Example:

```text
CORTEX / INTELLIGENCE SYSTEMS
FIELD STUDY 001
WORLD STATE     ACTIVE
SIGNALS         124
RELATIONSHIPS   389
STATE           PROCESSING
```

Important: numeric values must not be presented as real product telemetry unless they actually are.

Use labels such as:

```text
CONCEPTUAL
SIMULATION
ILLUSTRATIVE
```

where appropriate.

---

## 15. Section 001 — The Problem

Large statement first.

Example direction:

> **Complexity is not the problem.**  
> **Invisible relationships are.**

Use huge typography + negative space + a slowly moving structural line.

No large card collection.

---

## 16. Section 002 — The Intelligence Layer

This chapter should feel like a technical sequence.

```text
RAW SIGNALS
      ↓
CONTEXT
      ↓
REASONING
      ↓
SIMULATION
      ↓
DECISION
      ↓
EVIDENCE
```

Visual behavior:

- each stage becomes active as the visitor scrolls
- relationships illuminate
- inactive stages remain subdued
- a signal travels through the chain
- current stage receives the signal color

The animation should explain rather than decorate.

---

## 17. Section 003 — How Cortex Works

Use a split composition similar in visual ambition to the supplied reference workflow section.

Left:

```text
HOW CORTEX WORKS

01  OBSERVE
02  UNDERSTAND
03  SIMULATE
04  RECOMMEND
05  AUTHORIZE
06  EXECUTE
07  VERIFY
```

Right:

A large 3D / diagrammatic layered system object.

Example visual:

```text
VERIFY
────────────
EXECUTE
────────────
AUTHORIZE
────────────
RECOMMEND
────────────
SIMULATE
```

The visual can be a stack of engineered plates, layers, or modules connected by glowing signal rails.

The site must explicitly preserve the boundary between reasoning and authorization.

---

## 18. Section 004 — The Cortex System

Headline:

> **THREE SYSTEMS. ONE INTELLIGENCE LAYER.**

Each product receives a large visual chapter instead of a small card.

### Workflo

Visual language:

```text
CODE
→ SANDBOX
→ EXECUTION
→ HASH
→ RECEIPT
```

Primary visual direction:

A sealed execution artifact / software object with cryptographic paths and receipt fragments.

### Nexus

Visual language:

```text
DATA
→ WORLD STATE
→ GRAPH
→ SIGNALS
→ SIMULATION
→ DECISION
```

Primary visual direction:

A large operational network / graph object with nodes, edge activation, branching scenarios, and a decision core.

### ASTRA

Visual language:

```text
MISSION
→ REQUIREMENTS
→ ARCHITECTURES
→ CONSTRAINTS
→ TRADE-OFFS
→ MISSION PLAN
```

Primary visual direction:

Orbital / mission-engineering geometry, constraint layers, trajectory lines, and architecture branches.

---

## 19. Product Visuals

Product visual studies should never appear as blank boxes.

Every large product visual needs:

- a primary 3D object, diagram, or real screenshot
- a readable focal point
- secondary technical annotations
- motion or state change when appropriate
- static fallback
- caption explaining whether it is conceptual, illustrative, or real

The supplied Workflo reference establishes the benchmark: product visuals occupy significant screen real estate and are treated as the narrative itself.

---

## 20. Product UI Mockups

When product interfaces are shown, they should be real screenshots or clearly labelled product concepts.

Visual treatment:

- near-black UI
- sharp panels
- sparse borders
- restrained signal colors
- realistic density
- meaningful labels
- believable hierarchy

Do not fabricate benchmark dashboards or operational metrics.

---

## 21. Evidence Section

Headline:

> **EVIDENCE, NOT PROMISES.**

Use a visual rhythm similar to the supplied reference's metric + platform panel section.

Possible layout:

```text
[PROOF ITEM]       [TECHNICAL NOTE]

[LARGE METRIC]     [PRODUCT / SYSTEM VIEW]
metadata           provenance
method             environment
```

Every metric requires provenance.

Illustrative values must say:

> ILLUSTRATIVE

---

## 22. Solutions / Use Cases

Use larger editorial blocks rather than a repetitive card wall.

Possible system categories:

- complex operations
- critical software
- supply networks
- mission engineering
- infrastructure
- enterprise AI

Each chapter should explain:

```text
SYSTEM PRESSURE
↓
CORTEX ROLE
↓
PRODUCT FIT
↓
EVIDENCE
```

---

## 23. Trust / Security

Headline:

> **TRUST IS PART OF THE SYSTEM.**

Visual treatment is quieter than the hero but should still contain a technical visual:

```text
IDENTITY
   ↓
AUTHORIZE
   ↓
VERIFY
   ↓
RECORD
```

Do not rely on security badges alone.

---

## 24. Company / Mission

Editorial treatment.

Possible presentation:

```text
CORTEX / COMPANY

Build systems that keep
complexity inspectable.
```

Use actual company information only.

No fabricated founders, team members, offices, investors, or milestones.

---

## 25. Conversion Design

The primary site conversion should be obvious throughout the journey.

### Primary CTA

> **TALK TO CORTEX →**

### Secondary CTA

> **REQUEST A DEMO →**

The supplied reference demonstrates an effective pattern: repeat the conversion action near the hero, near proof, and in the closing section without making the site feel like a sales funnel template.

### Closing chapter

```text
LET'S BUILD
THE RIGHT SYSTEM.

A technical problem.
A deployment constraint.
An architecture worth discussing.

[TALK TO CORTEX →]
[REQUEST A TECHNICAL BRIEFING →]
```

---

## 26. Footer

Minimal and dense.

```text
CORTEX
Intelligence for critical systems.

Platform
Products
Solutions
Resources
Company
Security
Contact
Legal

© 2026 Cortex
```

Avoid overly decorative footers.

---

## 27. Interaction Rules

### Buttons

Hard-edged, strong contrast, directional arrow.

Hover:

- slight lift
- signal-color transition
- subtle shadow / glow
- arrow translation

No bouncing.

### Links

Technical underline or bottom rule.

### Cards

Cards are secondary components, not the core narrative device.

### Cursor effects

Avoid excessive cursor-following.

Use magnetic behavior only for highly important CTAs and only where it remains accessible.

---

## 28. 3D Technical Architecture

### Primary stack

```text
React
  ↓
React Three Fiber
  ↓
Three.js
  ↓
custom materials / shaders
```

### Scene requirements

- deterministic initialization
- lazy loading
- capped DPR
- frustum-aware rendering
- offscreen pause
- lower-density mobile mode
- reduced-motion mode
- static poster fallback
- error isolation

### Performance behavior

Desktop may use full-detail scenes.

Tablet reduces geometry and effects.

Mobile uses a simplified scene or poster.

Low-power / save-data devices should not be punished by the 3D layer.

---

## 29. 3D Scene Composition

The site should use **art-directed scenes**, not one generic canvas reused everywhere.

Recommended scene families:

```text
Cortex Core
Intelligence Field
System Layers
Workflo Execution Artifact
Nexus Operational Graph
ASTRA Mission Geometry
```

Each scene receives its own geometry, motion logic, color behavior, and narrative purpose.

---

## 30. Image Direction

Images are supporting assets, not the core visual language.

Good:

- industrial systems
- compute infrastructure
- code artifacts
- spacecraft / mission systems
- supply-chain environments
- technical materials
- architectural details

Treatment:

- dark
- high contrast
- desaturated
- deliberate negative space
- cobalt highlights only when meaningful

Avoid:

- generic AI stock imagery
- smiling corporate teams as hero content
- glowing brains
- generic server racks with no context
- overused sci-fi imagery

---

## 31. Responsive Experience

### Desktop

Full cinematic composition.

Large 3D scenes are allowed to dominate.

### Tablet

Reduce scene complexity and typography scale.

### Mobile

Preserve:

```text
headline
→ visual object
→ explanation
→ CTA
```

Compress decorative metadata and simplify system diagrams.

---

## 32. Reduced Motion

When `prefers-reduced-motion: reduce` is active:

- remove continuous 3D movement
- freeze complex scene states
- retain readable diagrams
- use opacity / simple transitions
- preserve product visuals as static compositions

Reduced motion must still look intentionally designed, not broken.

---

## 33. Accessibility

- semantic HTML
- keyboard navigation
- visible focus
- sufficient contrast
- accessible forms
- text alternatives for visual explanations
- captions for video
- no color-only state indication
- no interaction dependent on pointer precision

3D is enhancement, never the sole source of product meaning.

---

## 34. Performance

Visual intensity must not become a performance liability.

Rules:

- lazy-load 3D
- lazy-load below-the-fold media
- use compressed responsive images
- limit texture dimensions
- cap pixel ratio
- pause offscreen scenes
- reduce particle counts on constrained devices
- code split routes / heavy visual modules
- avoid layout shifts

The first meaningful paint must communicate the Cortex story even before the full 3D scene initializes.

---

## 35. SEO

Visual content must coexist with crawlable HTML.

Every route needs:

- semantic heading hierarchy
- route-specific title
- meta description
- canonical URL
- Open Graph
- Twitter metadata
- JSON-LD where appropriate
- crawlable body copy

No essential claim may exist only inside a canvas.

---

## 36. Content Tone

Voice:

- technical
- direct
- controlled
- precise
- confident
- evidence-led

Prefer:

> **Turn signals into context.**

over:

> **Unlock the unprecedented power of AI.**

Do not use:

- revolutionary
- game-changing
- limitless
- magic
- unprecedented
- AI-powered everything

unless a specific claim actually requires the term and can be supported.

---

## 37. Anti-Patterns

Never drift into:

- light generic SaaS themes
- purple AI gradients
- primary glassmorphism UI
- empty 3D canvases
- placeholder-looking image boxes
- generic dashboard cards
- meaningless particle effects
- excessive neon
- spinning logos
- random scanlines
- cursor gimmicks
- scroll hijacking
- fake telemetry
- fake benchmarks
- fake customer logos
- fake testimonials
- fabricated product functionality

---

## 38. Visual Quality Benchmark

The supplied Workflo reference establishes the benchmark for:

- cinematic product visualization
- large visual objects
- dark background treatment
- neon accent discipline
- large typography
- smooth vertical rhythm
- strong CTA repetition
- product workflow storytelling
- polished section transitions
- meaningful product UI imagery

Cortex must match that **level of visual ambition**, not reproduce the Workflo brand or exact composition.

---

## 39. Homepage Wireframe

```text
┌──────────────────────────────────────────────────────────────┐
│ CORTEX     Product Platform Docs Insights Company Search CTA │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  CORTEX / INTELLIGENCE                                       │
│                                                              │
│  INTELLIGENCE                 [ LARGE 3D CORTEX CORE ]       │
│  FOR CRITICAL                 [ signals / graph / depth ]   │
│  SYSTEMS.                                                   │
│                                                              │
│  Intelligence layer for critical systems.                    │
│                                                              │
│  [TALK TO CORTEX]  [EXPLORE PLATFORM]                       │
│                                                              │
│  SYSTEM STATE / CONCEPTUAL             SCROLL ↓              │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│ 001 / THE PROBLEM                                            │
│                                                              │
│ COMPLEXITY IS NOT THE PROBLEM.                               │
│ INVISIBLE RELATIONSHIPS ARE.                                 │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│ 002 / THE INTELLIGENCE LAYER                                │
│                                                              │
│ RAW → CONTEXT → REASON → SIMULATE → DECIDE → EVIDENCE       │
│              [ SCROLL-LINKED SYSTEM ANIMATION ]             │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│ 003 / HOW CORTEX WORKS                                       │
│                                                              │
│ OBSERVE            [ STACKED 3D SYSTEM OBJECT ]              │
│ UNDERSTAND        [ SIGNAL RAILS / LAYER ACTIVATION ]       │
│ SIMULATE                                                      │
│ RECOMMEND                                                      │
│ AUTHORIZE                                                      │
│ EXECUTE                                                        │
│ VERIFY                                                         │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│ 004 / THE CORTEX SYSTEM                                     │
│                                                              │
│ WORKFLO             [ LARGE PRODUCT VISUAL ]                 │
│ NEXUS               [ LARGE PRODUCT VISUAL ]                 │
│ ASTRA               [ LARGE PRODUCT VISUAL ]                 │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│ 005 / EVIDENCE                                               │
│                                                              │
│ EVIDENCE, NOT PROMISES.                                      │
│ [METRIC] [PROVENANCE] [SYSTEM VIEW]                          │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│ 006 / APPLICATIONS                                          │
│                                                              │
│ BUILT FOR SYSTEMS WHERE DECISIONS MATTER.                    │
│ [SYSTEM TYPE CHAPTERS]                                       │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│ 007 / TRUST                                                   │
│ TRUST IS PART OF THE SYSTEM.                                 │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│ 008 / COMPANY                                                │
│                                                              │
│ ENGINEERING THAT KEEPS COMPLEXITY INSPECTABLE.               │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│ 009 / START A CONVERSATION                                   │
│                                                              │
│ LET'S BUILD THE RIGHT SYSTEM.                                │
│ [TALK TO CORTEX] [REQUEST A TECHNICAL BRIEFING]              │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 40. Component Direction

```text
components/
├── 3d/
│   ├── IntelligenceField
│   ├── CortexCore
│   ├── SystemLayers
│   ├── ProductScene
│   └── SceneBoundary
│
├── motion/
│   ├── Reveal
│   ├── Stagger
│   ├── Parallax
│   ├── Magnetic
│   └── ScrollTimeline
│
├── editorial/
│   ├── SectionNumber
│   ├── Statement
│   ├── Divider
│   ├── Metric
│   └── TechnicalLabel
│
├── product/
│   ├── ProductHero
│   ├── ProductVisual
│   ├── ArchitectureDiagram
│   ├── EvidenceBlock
│   └── ProductCTA
│
└── navigation/
    ├── Header
    ├── ProductMenu
    ├── MobileMenu
    └── Footer
```

---

## 41. Design Tokens

The design token system should expose the following categories:

```text
colors
  void / surface / raised / text / muted / signal / semantic

type
  display / body / mono / weights / tracking / leading

space
  section / chapter / component / inline

motion
  micro / ui / reveal / hero / spring

layout
  max-width / gutter / columns / breakpoints

3d
  dpr / particle-density / camera-distance / scene-quality
```

The implementation should consume tokens rather than scattering magic numbers through individual pages.

---

## 42. Production / Reality Rules

The cinematic website must never imply capabilities that do not exist.

Visual labels must distinguish:

```text
LIVE
DEMO
SIMULATION
CONCEPTUAL
ILLUSTRATIVE
```

Where a visual is not real telemetry, say so.

When the site presents a system workflow, its purpose is to explain product behavior—not to claim that the marketing page itself controls a production environment.

---

## 43. Definition of Done

The design is considered implemented when:

- hero contains a clearly visible cinematic 3D experience
- 3D feels like a meaningful product object, not background noise
- scrolling produces smooth visual state changes
- homepage has uninterrupted cinematic rhythm
- visual language is dark cyber-brutalist
- UI is not dependent on glassmorphism
- neon color is restrained and semantic
- Workflo / Nexus / ASTRA each have substantial visual chapters
- product visuals are never blank
- metrics are provenance-aware
- accessibility modes retain a deliberate design
- mobile remains fast and legible
- page content is crawlable without WebGL
- CTAs are obvious and repeated at appropriate narrative points
- the website feels differentiated from generic AI/SaaS templates

---

## 44. Final Principle

> **Make the invisible system visible.**

Cortex should use typography to make the idea legible, 3D to make the system tangible, animation to make relationships understandable, and brutalist structure to make the product feel engineered.

The objective is not to make the website louder.

The objective is to make it feel **alive, technical, physical, and credible**.
