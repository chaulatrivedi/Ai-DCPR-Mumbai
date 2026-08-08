# ARCHITECTURE.md

## System Overview

```
Next.js (Vercel)  ──────►  FastAPI (Railway)  ──────►  Supabase
   frontend                   backend               (Postgres + pgvector
                                                       + Auth + Storage)
                                    │
                                    ▼
                              Claude API
                          (search, explanation,
                             tagging, chat)
```

Five conceptual systems this app is organized around:
1. Document System (regulation ingestion)
2. AI Knowledge System (search, explanation, chat)
3. Project Management System
4. Calculator Engine
5. Report Generator

## Frontend

| Layer | Choice |
|---|---|
| Framework | Next.js (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Components | shadcn/ui |
| Linting | ESLint |
| Hosting | Vercel |

## Backend

| Layer | Choice |
|---|---|
| Framework | FastAPI |
| Language | Python 3.12+ |
| ORM / migrations | SQLAlchemy + Alembic |
| Validation | Pydantic |
| Testing | pytest |
| Hosting | Railway |

## Data & Infrastructure

| Layer | Choice |
|---|---|
| Relational database | PostgreSQL (via Supabase) |
| Vector search | pgvector (same Postgres instance — not a separate vector DB) |
| Auth | Supabase Auth |
| File storage | Supabase Storage (uploaded regulation PDFs, generated reports) |
| AI | Claude API (Sonnet for chat/explanation, Haiku for cheap tagging tasks) |
| Embeddings | Voyage AI *(proposed, to be confirmed before Milestone 5 — see DECISIONS.md)* |

## Deferred / To Be Confirmed

See `DECISIONS.md` for full reasoning. Summary:
- **PDF parsing library** — decide before Milestone 4, tested against the real DCPR PDF
- **OCR strategy** — decide before Milestone 4, depends on PDF parsing test results
- **Embeddings provider** — confirm before Milestone 5, validated against real clause retrieval quality

## Repository Structure

```
AI-DCR/
├── docs/
│   ├── PRODUCT.md
│   ├── ARCHITECTURE.md
│   ├── DATABASE.md
│   ├── API.md
│   ├── TASKS.md
│   ├── DECISIONS.md
│   ├── CHANGELOG.md
│   └── AI_PROMPTS.md
├── frontend/
├── backend/
├── database/
├── regulations/
├── scripts/
├── tests/
└── README.md
```

## Development Workflow

Every coding session follows the same loop:

1. Open `TASKS.md`, choose one task (e.g., Task 6.2 — Parking Calculator)
2. Create a git branch (`feature/parking-calculator`)
3. Give Claude Code context: *"Read ARCHITECTURE.md, DATABASE.md, API.md, TASKS.md. Now implement Task 6.2. Do not modify unrelated files."*
4. Review — ask Claude Code to review its own code, find bugs, improve readability, reduce duplication, write tests
5. Run it — fix bugs, repeat
6. Commit
7. Update documentation — `API.md`, `DATABASE.md`, `TASKS.md`, `CHANGELOG.md`, and `DECISIONS.md` if an architectural choice was made

## Roles: Chat vs Claude Code vs Cowork

| Surface | Role | When used |
|---|---|---|
| **Claude Chat** | Planning, architecture, decisions, doc drafting/updates | Before a milestone starts, or whenever a new decision needs to be reasoned through |
| **Claude Code** | Executes the per-task development loop above, inside the actual repo | Every implementation task, milestone by milestone (M0 → M11) |
| **Claude Cowork** | Non-code, multi-step file/document work | PDF/OCR candidate testing against the real DCPR document (Milestone 4); processing existing project notes/consultant knowledge into Company Knowledge seed content (Milestone 10); formatting deliverables like the Planning Extract template (Milestone 8) |
