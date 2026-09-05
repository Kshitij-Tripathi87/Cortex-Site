# Cortex Site

Marketing website for **Cortex** — the intelligence layer for teams building critical systems. Three product pillars: **Sense**, **Decide**, **Scale**.

Built with React 19 + Vite + TypeScript + Tailwind 4, served in production by an Express host. The design language is **Silverline Systems** (charcoal trust layer, silver material, Cortex Cobalt `#2457E6` signal; Space Grotesk / IBM Plex Sans / IBM Plex Mono). See `ideas.md` for the full design direction.

## Stack

- **Client**: React 19, Vite 7, TypeScript, Tailwind CSS 4, wouter (routing), shadcn/ui, framer-motion, lucide-react
- **Server**: Express 4 (static hosting, SPA fallback, security headers, cache tuning, AI Core endpoint)
- **Shared**: `shared/aiCore.ts` grounding knowledge base used by both the client fallback and the server AI endpoint

## Getting started

```bash
pnpm install        # install dependencies (pnpm 10+)
pnpm dev            # Vite dev server at http://localhost:3000
```

## Scripts

| Script | Description |
|---|---|
| `pnpm dev` | Start the Vite dev server (`--host`) |
| `pnpm build` | Build the client (`vite build`) and bundle the server (`esbuild`) into `dist/` |
| `pnpm start` | Run the production server (`node dist/index.js`) |
| `pnpm preview` | Preview the built client with Vite |
| `pnpm check` | Type-check with `tsc --noEmit` |
| `pnpm format` | Format with Prettier |

## Project structure

```
client/          React SPA (Vite root)
  src/
    pages/       Home, DetailPage (product/case-study), SectionPage, NotFound
    components/  ui/ (shadcn), ErrorBoundary, SignalOrb (3D signal graphic)
    lib/         cortexContent.ts (products & case studies), utils
    contexts/    ThemeContext
    index.css    Silverline Systems design system + component styles
server/          Express production host + /api/ai/chat endpoint
shared/          aiCore.ts (AI Core grounding knowledge base)
```

## AI Core assistant

The in-site AI Core assistant is grounded in the Cortex platform/product/docs
knowledge base defined in `shared/aiCore.ts`. Each answer is mapped to a real
route so replies always cite a source.

- **Endpoint**: `POST /api/ai/chat` with `{ "prompt": "..." }`
- **Response**: `{ reply, source: { label, href }, followUps, model }`
- **Grounded fallback**: With no model configured, the endpoint returns the
  deterministic grounded answer so the assistant always works. The client
  (`Home.tsx`) also falls back locally if the request fails.
- **Live model (optional)**: Set `OLLAMA_BASE_URL` (and optionally
  `OLLAMA_MODEL`, default `llama3`) to proxy generation to a self-hosted
  [Ollama](https://ollama.com) instance. The grounded context is injected into
  the system prompt so the model stays on-topic and citations remain accurate.

## Environment variables

Copy `.env.example` to `.env` and fill in values as needed. `.env` is gitignored.

| Variable | Purpose |
|---|---|
| `OLLAMA_BASE_URL` | Self-hosted LLM base URL; unset uses the grounded fallback |
| `OLLAMA_MODEL` | Model name for the Ollama proxy (default `llama3`) |
| `PORT` | Server port (default `3000`) |

## Deployment

`pnpm build` produces `dist/public` (static client) and `dist/index.js` (server
bundle). Run `pnpm start` to serve. The server sets conservative security
headers and immutable caching for hashed assets.
