# DECISIONS.md

A running log of architectural and technical decisions for the AI-DCR (Mumbai DCPR Assistant) project. Every decision includes the reasoning and alternatives considered, so future sessions (with Claude or otherwise) understand *why*, not just *what*.

---

## Frontend

| Decision | Reason | Alternatives considered | Date |
|---|---|---|---|
| Next.js (App Router) | Largest ecosystem, best Vercel deploy story, most AI training data for high-quality code generation | Remix, plain Vite + React | 2026-08-06 |
| TypeScript | Structured data (projects, clauses, calculator I/O) flows constantly between frontend/backend; type safety catches bugs early, especially valuable with no second reviewer (solo dev) | Plain JavaScript | 2026-08-06 |
| Tailwind CSS | Keeps styling co-located with markup; required by shadcn/ui | Plain CSS, CSS Modules, styled-components | 2026-08-06 |
| ESLint | Standard, free, ships with `create-next-app`; catches sloppy code with no second reviewer | — | 2026-08-06 |
| shadcn/ui | Component *source code* copied into the repo (not a black-box dependency) — matters because calculators, clause viewers, and compliance checklists need custom, non-standard UI behavior | MUI, Chakra UI | 2026-08-06 |

## Backend

| Decision | Reason | Alternatives considered | Date |
|---|---|---|---|
| FastAPI (Python 3.12+) | Python's PDF/OCR/embedding ecosystem (pypdf, unstructured, pytesseract) is far more mature than Node's — core to Phases/Milestones 4–6 | Node/Express backend | 2026-08-06 |
| SQLAlchemy + Alembic | Standard ORM + migrations pairing for FastAPI | — | 2026-08-06 |
| Pydantic | Ships with FastAPI; validation for free | — | 2026-08-06 |
| pytest | Standard Python testing framework | — | 2026-08-06 |
| pgvector (not a dedicated vector DB) | Keeps infrastructure simpler during MVP — one database for both relational data and embeddings instead of syncing two systems. *(Originally proposed in the Coding Structure document's own worked DECISIONS.md example.)* | Pinecone, Weaviate | 2026-08-06 |

## Infrastructure

| Decision | Reason | Alternatives considered | Date |
|---|---|---|---|
| Supabase (Postgres + pgvector + Auth + Storage) | Consolidates 3–4 services into one — fewer vendors, less operational overhead for a solo builder | Self-hosted Postgres + Clerk (auth) + S3 (storage) | 2026-08-06 |
| Vercel | Frontend hosting, free tier to start | — | 2026-08-06 |
| Railway | Backend hosting — minimal setup (points at GitHub repo, auto-detects FastAPI), lets solo dev's attention stay on the AI/PDF pipeline rather than infra config | Fly.io (more powerful but more infra-config overhead; multi-region/scale-to-zero benefits not needed at current scale) | 2026-08-06 |
| Claude API | AI search, explanation, tagging — already have Anthropic access | — | 2026-08-06 |
| No local Docker Postgres | Task 0.5's title mentioned Docker, but it was superseded by using the hosted Supabase project directly (already provisioned with pgvector enabled) — connecting straight to it avoids running/maintaining a separate local Postgres container that would need to be kept in sync | Local Docker Postgres for development, synced to Supabase later | 2026-08-09 |

## Deferred decisions (not yet finalized)

| Item | Status | To be confirmed by | Notes |
|---|---|---|---|
| PDF parsing library (pypdf / pdfplumber / unstructured) | Deferred | Before Milestone 4 (Regulation Library) | Test candidates against the actual Mumbai DCPR PDF rather than deciding abstractly |
| OCR strategy (pytesseract vs hosted API) | Deferred | Before Milestone 4 | Depends on whether the DCPR PDF is clean digital text or scanned/complex-layout |
| Embeddings provider (Voyage AI proposed) | Deferred | Before Milestone 5 (AI Search) | Confirm retrieval quality against real DCPR clauses before locking in |

## Process decisions

| Decision | Reason | Date |
|---|---|---|
| Follow Milestones M0–M11 in the exact order defined in the Coding Structure document (no risk-first reordering) | Explicit choice by project owner, after being shown the trade-off (AI Search validation happens later, at M5, rather than early) | 2026-08-06 |
| Maintain this DECISIONS.md, updated after every architectural choice | Prevents "why did we build it this way" amnesia months into the project; keeps Claude Code consistent across sessions | 2026-08-06 |
