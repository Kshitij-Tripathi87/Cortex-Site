# Cortex-Site Repository Audit
**Date**: 2026-09-11  
**Purpose**: Foundation assessment before implementing locked cyber-brutalist design specification

---

## Current Architecture

### Tech Stack
- **Frontend**: React 19.2.1 + TypeScript + Vite 7.1.7
- **Routing**: Wouter 3.3.5 (SPA)
- **Styling**: Tailwind CSS 4.1.14 + tw-animate-css
- **UI Components**: Radix UI primitives (extensive)
- **Animation**: Framer Motion 12.23.22 (**No GSAP, No Lenis, No Three.js**)
- **Forms**: React Hook Form 7.64.0 + Zod 4.1.12
- **Server**: Express 4.21.2 + esbuild
- **Email**: Resend API
- **Storage**: File-based JSON (waitlist.json, contact-requests.json)

### Build Process
```bash
dev:     vite --host
build:   vite build && esbuild server/index.ts
start:   node dist/index.js
```

### Directory Structure
```
cortex-site/
├── client/src/
│   ├── App.tsx              # Router + ErrorBoundary + Theme
│   ├── main.tsx             # Entry point
│   ├── pages/
│   │   ├── Home.tsx         # 495 lines, split-screen SaaS hero
│   │   ├── DetailPage.tsx   # Product/case-study detail
│   │   ├── SectionPage.tsx  # Platform/docs/sales/company
│   │   ├── AdminWaitlistPage.tsx
│   │   └── NotFound.tsx
│   ├── components/
│   │   ├── SignalOrb.tsx    # Placeholder 3D visual (CSS-only)
│   │   └── ui/              # 50+ Radix UI primitives
│   ├── lib/
│   │   ├── cortexContent.ts # Re-exports from shared/catalog
│   │   └── utils.ts
│   └── index.css            # Tailwind + design tokens
│
├── server/
│   ├── index.ts             # Express server (617 lines)
│   │                        # - Admin auth (session cookies)
│   │                        # - Waitlist/contact endpoints
│   │                        # - AI Core chat endpoint (Ollama proxy or grounded fallback)
│   │                        # - Resend email integration
│   │                        # - SEO prerendering
│   └── prerender.ts         # Head injection, robots.txt, sitemap.xml
│
├── shared/
│   ├── catalog.ts           # **CANONICAL CONTENT** (277 lines)
│   │                        # - Products: Workflo, Nexus, ASTRA
│   │                        # - Case studies: Northstar, Vela, Aster
│   │                        # - Sections, routes, SEO metadata
│   ├── aiCore.ts            # AI Core grounding knowledge base
│   └── const.ts
│
└── vite.config.ts           # Aliases: @, @shared, @assets
```

---

## Working Tree Changes (Uncommitted)

| File | Status | Note |
|------|--------|------|
| `client/src/lib/cortexContent.ts` | Modified | Re-export layer to shared/catalog |
| `server/index.ts` | Modified | Production Express server |
| `server/prerender.ts` | New | SEO head injection |
| `shared/catalog.ts` | New | **Canonical content source** |

**These changes must be preserved** — they establish the isomorphic catalog pattern.

---

## Content Model (from `shared/catalog.ts`)

### Products
1. **Workflo** (Early Access) — "See the system, not just the signal"
2. **Nexus** (Coming Soon) — "Move from insight to action with context"
3. **ASTRA** (Coming Soon) — "Make the better way repeatable"

### Case Studies
1. **Northstar Health** — Healthcare operations
2. **Vela Financial** — Risk & compliance
3. **Aster Works** — Industrial systems

### Routes
- `/` — Home
- `/product` — Product overview
- `/product/:slug` — Workflo, Nexus, ASTRA
- `/case-study/:slug`
- `/platform`, `/docs`, `/sales`, `/company`
- `/admin/waitlist`

---

## Current Visual System

### Design Tokens (from `index.css`)
```css
--primary: #2457e6          /* Cortex cobalt */
--background: #f4f5f7       /* Light gray */
--foreground: #151922       /* Near black */
--card: #ffffff
```

**Assessment**: Light-mode default. Locked spec requires **black/near-black base + cobalt signals**.

### Typography
- Uses system fonts (no Space Grotesk, IBM Plex Sans, IBM Plex Mono)

### 3D/Animation
- **SignalOrb.tsx**: CSS-only placeholder (not Three.js)
- **No Three.js or React Three Fiber**
- **No GSAP or Lenis**
- Framer Motion available for basic transitions

**Gap**: Locked spec requires Three.js + R3F + GSAP + Lenis for cinematic scroll.

---

## Server Infrastructure

### API Endpoints
```
POST /api/waitlist           → Resend email + JSON storage
POST /api/contact            → Resend email + JSON storage
POST /api/admin/login        → Session cookie auth
POST /api/admin/logout
GET  /api/admin/session
GET  /api/admin/waitlist     → Auth required
GET  /api/admin/contact      → Auth required
POST /api/ai/chat            → Ollama proxy or grounded fallback
GET  /robots.txt
GET  /sitemap.xml
GET  *                       → SPA + prerendered head
```

### Email Flow (Resend)
```
Browser → Express → Resend API → Notification email
                  ↓
                JSON file persistence
```

### Environment Variables
```bash
PORT
NODE_ENV
CORTEX_SITE_URL
RESEND_API_KEY
WORKFLO_EMAIL_FROM
WORKFLO_WAITLIST_TO_EMAIL
CORTEX_CONTACT_EMAIL_FROM
CORTEX_CONTACT_TO_EMAIL
OLLAMA_BASE_URL              # Optional AI proxy
OLLAMA_MODEL
WORKFLO_ADMIN_TOKEN
WORKFLO_WAITLIST_FILE
CORTEX_CONTACT_FILE
```

### Deployment Target
- **Current**: Express server (Render/generic Node host)
- **Locked spec**: Cloudflare Workers + Supabase + Resend

**Migration needed**: Express → Cloudflare Workers, JSON files → Supabase.

---

## Homepage Structure (`Home.tsx`, 495 lines)

### Current Layout
1. **Header** — Logo, nav, search, AI Core, contact CTA
2. **Hero** — Split-screen: left text, right SVG placeholder
3. **Product tabs** — Workflo/Nexus/ASTRA switcher
4. **Platform** — 3-point explainer
5. **Case studies** — Carousel with 3 stories
6. **Insights** — Editorial posts grid
7. **Documentation CTA**
8. **Footer**

### Modals/Overlays
- Command palette search (⌘K)
- AI Core chat assistant
- Contact form with meeting scheduler
- Case study detail overlay

**Assessment**: Generic SaaS presentation. Locked spec replaces with:
```
01 HERO (full-width immersive 3D)
02 PROBLEM / STATEMENT (editorial)
03 INTELLIGENCE SYSTEM (scroll-driven)
04 PRODUCT CAPABILITIES (cinematic chapters)
05 PRODUCT PLATFORM
06 USE CASES
07 CTA
FOOTER
```

---

## Missing Dependencies (for locked spec)

### Critical
```json
"three": "^0.170.0"
"@react-three/fiber": "^8.18.5"
"@react-three/drei": "^9.118.3"
"gsap": "^3.12.5"
"lenis": "^1.1.19"
```

### Typography
```json
"@fontsource/space-grotesk": "^5.1.0"
"@fontsource/ibm-plex-sans": "^5.1.0"
"@fontsource/ibm-plex-mono": "^5.1.0"
```

### Build
```json
"@cloudflare/workers-types": "^4.20241127.0"
"wrangler": "^3.103.0"
```

### Database
```json
"@supabase/supabase-js": "^2.47.10"
```

---

## Reusable Assets

### ✅ Keep
1. **`shared/catalog.ts`** — Content model, routes, SEO metadata
2. **Express server patterns** — Auth, validation, email, rate limiting
3. **Form schemas** — Waitlist/contact validation logic
4. **Radix UI primitives** — Dialog, Popover, Accordion, etc.
5. **Error boundary, theme context**

### 🔄 Adapt
1. **Button components** — Add locked spec animation (sweep, signal, glow, magnetic)
2. **Header/Footer** — Minimal layout, scroll-aware behavior
3. **AI Core** — Visual command-center interaction
4. **Contact form** — Preserve backend, upgrade visual

### ❌ Replace
1. **Home.tsx hero** — Split-screen → immersive 3D
2. **Product tabs** — Cards → cinematic chapters
3. **SignalOrb.tsx** — CSS placeholder → Three.js intelligence stack
4. **Case study carousel** — Standard carousel → spatial presentation

---

## Implementation Path

### Phase 0: Foundation ✅ (Current)
- Audit complete
- Dependencies identified
- Content model preserved

### Phase 1: Install Dependencies
```bash
pnpm add three @react-three/fiber @react-three/drei gsap lenis
pnpm add @fontsource/space-grotesk @fontsource/ibm-plex-sans @fontsource/ibm-plex-mono
pnpm add @supabase/supabase-js
pnpm add -D @cloudflare/workers-types wrangler
```

### Phase 2: Design System
- Update `index.css` with locked tokens (black, cobalt, chrome, glass)
- Add typography (Space Grotesk, IBM Plex Sans, IBM Plex Mono)
- Create `AnimatedButton.tsx` (sweep, signal, magnetic)
- Build responsive framework

### Phase 3: 3D Engine
- Replace `SignalOrb.tsx` with Three.js intelligence stack
- Build layered architectural object (black metal, acrylic, chrome)
- Integrate GSAP ScrollTrigger for cinematic scroll
- Add Lenis smooth scrolling
- Cursor interaction system

### Phase 4: Homepage Rebuild
- Hero: full-width 3D + centered typography
- Problem statement: large editorial
- Intelligence system: scroll-driven transformation
- Product capabilities: Workflo/Nexus/ASTRA chapters
- Platform: visual connection diagram
- Use cases: interactive system explorer
- CTA: cinematic closing

### Phase 5: Cloudflare Migration
- Convert Express routes → Workers
- Migrate JSON storage → Supabase
- Set up Wrangler config
- Environment variables → Cloudflare secrets
- Static assets → Cloudflare CDN

### Phase 6: Responsive & Accessibility
- Desktop: 50% typography, 50% 3D
- Mobile: 65% typography, 35% 3D
- Reduced motion fallback
- Keyboard navigation
- Semantic HTML + ARIA
- Performance optimization

---

## Risk Assessment

### High Risk
1. **No Three.js experience in codebase** — Need robust 3D architecture from scratch
2. **Cloudflare Workers migration** — Express patterns don't translate directly
3. **Performance** — Cinematic 3D + scroll animations = GPU intensive

### Medium Risk
1. **Content preservation** — Must keep product/case-study factual content
2. **Form backend** — Supabase migration without breaking existing flow
3. **SEO** — Maintain prerendering during visual overhaul

### Low Risk
1. **Design tokens** — CSS variable swap
2. **Typography** — Font loading
3. **UI primitives** — Radix components are framework-agnostic

---

## Recommendations

1. **Start with Phase 2 (Design System)** before touching 3D
   - Establishes visual foundation
   - Low risk, immediate visual impact
   - Sets tokens for 3D materials

2. **Build 3D engine in isolation** before integrating into Home
   - Create `client/src/scenes/` directory
   - Test performance early
   - Ensure mobile/reduced-motion fallbacks

3. **Preserve current Home.tsx** during development
   - Create `Home_v2.tsx` alongside
   - Switch when ready, not mid-implementation

4. **Delay Cloudflare migration** until visual system is stable
   - Express server works fine for development
   - Migrate once frontend is locked

5. **Use feature flags** for progressive rollout
   - `ENABLE_3D_HERO=true/false`
   - Allows A/B testing and rollback

---

## Next Action

**Start Task #2: Establish Visual Foundation**
- Install typography fonts
- Update design tokens (black/cobalt system)
- Create `AnimatedButton.tsx` component
- Update header/footer to minimal layout

This gives immediate visual progress while planning the 3D architecture in parallel.
