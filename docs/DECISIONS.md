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

## SMTP/email

| Decision | Reason | Date |
|---|---|---|
| SMTP provider (dev/testing): Gmail SMTP | Switched from Mailgun sandbox to Gmail SMTP (via App Password) for local development, after Mailgun sandbox's 5-recipient authorization limit made testing with multiple independent accounts impractical. Supabase flags Gmail SMTP as unsuited for transactional email at scale (deliverability warning) — acceptable for solo dev testing only. **Follow-up required:** Must switch to a production-grade transactional provider with a verified custom domain (e.g. Mailgun, SendGrid, Postmark, Resend) before onboarding any real user beyond solo dev testing. | 2026-08-10 |

## Deferred decisions (not yet finalized)

| Item | Status | To be confirmed by | Notes |
|---|---|---|---|
| PDF parsing library (pypdf / pdfplumber / unstructured) | Deferred | Before Milestone 4 (Regulation Library) | Test candidates against the actual Mumbai DCPR PDF rather than deciding abstractly |
| OCR strategy (pytesseract vs hosted API) | Deferred | Before Milestone 4 | Depends on whether the DCPR PDF is clean digital text or scanned/complex-layout |
| Embeddings provider (Voyage AI proposed) | Deferred | Before Milestone 5 (AI Search) | Confirm retrieval quality against real DCPR clauses before locking in |

## Scope decisions

| Decision | Reason | Date |
|---|---|---|
| No User Roles in Milestone 1 | TASKS.md lists "User Roles" under Milestone 1, but PRODUCT.md's user table (Architects, Junior/Senior Architects, Town Planners) implies role-based permissions that aren't otherwise specified anywhere (what each role can/can't do). Building it now would mean inventing a permissions model with no spec to build against. Milestone 1 ships email+password auth and session management only; role-based access is deferred until a real permissions requirement exists. | 2026-08-09 |

## Flagged assumptions (Milestone 1 — Authentication)

Decisions made autonomously during Milestone 1 because they weren't covered by PRODUCT.md, ARCHITECTURE.md, or existing DECISIONS.md entries. Flagged per the project owner's instruction to keep going rather than stop and ask.

| Decision | Reason | Date |
|---|---|---|
| `proxy.ts` instead of `middleware.ts` for route protection | Next.js 16 deprecated the `middleware.ts` file convention and renamed it to `proxy.ts` (confirmed in `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md` — same behavior, `export function proxy()` instead of `export function middleware()`). The task asked for "middleware.ts"; that convention no longer exists in the installed Next.js version, so `proxy.ts` was used instead. | 2026-08-09 |
| `@supabase/ssr` + Server Actions for all auth mutations (signup, login, sign-out, password reset) | Official Supabase-recommended pattern for Next.js App Router: Server Components can't set cookies, so session-mutating calls (`signInWithPassword`, `signUp`, `signOut`, `resetPasswordForEmail`, `updateUser`) go through `'use server'` actions that use the server Supabase client, matching `@supabase/ssr`'s cookie-write requirements. | 2026-08-09 |
| Session refresh (`updateSession`) runs on every route, not just `/dashboard/*` | Supabase's official SSR guidance: the proxy's cookie refresh must run on (almost) every navigation so the access token stays valid; only the *redirect-if-unauthenticated* check is scoped to `/dashboard`. Narrowing the matcher to `/dashboard/*` only would let the session go stale on public pages. | 2026-08-09 |
| `/auth/confirm` route handler (`token_hash` + `verifyOtp`) for email confirmation + password-reset links | Not explicitly requested, but required for the confirmation-email and reset-password flows to function at all. Originally implemented as `/auth/callback` using the PKCE `code` + `exchangeCodeForSession` flow; replaced after real-world testing found it broken for password reset — see the bug-fix entry below. | 2026-08-09 |

## Bug fixes

| Bug | Root cause | Fix | Date |
|---|---|---|---|
| Password-reset email link led to "Could not verify the link" on `/login` instead of the reset-password form | `/auth/callback` used the PKCE `code` + `exchangeCodeForSession` flow, expecting a `?code=` query param. Confirmed via a throwaway Admin API test (`scripts/test-recovery-link.mjs`, not committed) that this Supabase project's hosted `/auth/v1/verify` endpoint — which is what the *default* `{{ .ConfirmationURL }}` email template links to — redirects using the **implicit flow**: session tokens land in the URL **hash fragment** (`#access_token=...&refresh_token=...`), not a `?code=` query param. Hash fragments are never sent to the server, so `searchParams.get("code")` was always `null` and the route failed 100% of the time, regardless of cookies, browser, or device. Redirect-URL allow-list config was never the issue — the link correctly reached the route on the right port; it simply never received a code to exchange. | Replaced `/auth/callback` (`exchangeCodeForSession`) with `/auth/confirm` (`supabase.auth.verifyOtp({ type, token_hash })`) — reads `token_hash` from the query string directly, sidestepping the hash-fragment problem entirely. Verified working by calling the Admin API's `generateLink` directly for a `hashed_token`, then hitting `/auth/confirm?token_hash=...&type=recovery&next=/reset-password` — landed cleanly on the reset-password form. **Requires a manual, non-code step**: the Supabase project's Auth email templates (Authentication → Email Templates in the dashboard) must be edited to link to `{{ .RedirectTo }}?token_hash={{ .TokenHash }}&type=recovery` (Reset Password template) and `{{ .RedirectTo }}?token_hash={{ .TokenHash }}&type=signup&next=/dashboard` (Confirm signup template) instead of the default `{{ .ConfirmationURL }}`, which routes through the hosted verify endpoint's hash-fragment redirect described above. Until that dashboard edit is made, real emails still carry the old-style link regardless of app code. | 2026-08-09 |
| Clicking a password-reset email link landed the user on `/dashboard`, already signed in, instead of the reset-password form — the reset step was skipped entirely | Self-inflicted by the previous fix's own instructions: `/auth/confirm` defaults `next` to `/dashboard` when the query string omits it (`route.ts` had `searchParams.get("next") ?? "/dashboard"`), but the Reset Password email-template text given to the project owner was `{{ .RedirectTo }}?token_hash={{ .TokenHash }}&type=recovery` — no `&next=/reset-password`. So every recovery verification silently fell through to the dashboard default. `proxy.ts` was not at fault: it has no rule touching `/reset-password` at all; the wrong destination came directly from the route's own redirect, before middleware ever ran. | `/auth/confirm` now special-cases `type === "recovery"`: it always redirects to `/reset-password`, ignoring `next` entirely for that type (not just defaulting to it). This makes the correct destination a property of the code, not of the email-template text staying correctly configured — a future template edit (or a missing `next`) can no longer regress this. Verified by generating a fresh recovery `hashed_token` via the Admin API and hitting `/auth/confirm?token_hash=...&type=recovery` with **no** `next` param at all (reproducing the exact bug) — confirmed it now lands on `/reset-password`. | 2026-08-09 |

## Process decisions

| Decision | Reason | Date |
|---|---|---|
| Follow Milestones M0–M11 in the exact order defined in the Coding Structure document (no risk-first reordering) | Explicit choice by project owner, after being shown the trade-off (AI Search validation happens later, at M5, rather than early) | 2026-08-06 |
| Maintain this DECISIONS.md, updated after every architectural choice | Prevents "why did we build it this way" amnesia months into the project; keeps Claude Code consistent across sessions | 2026-08-06 |
