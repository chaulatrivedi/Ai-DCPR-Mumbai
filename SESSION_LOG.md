# SESSION LOG — Milestone 2 & 3 (Dashboard + Project Management)

Branch: `feature/m2-m3-dashboard-projects` (not merged to main, not pushed to remote — per standing instruction).

This log is appended to as each task completes. See the end of the file for the full session summary once all tasks are done or the session runs out of runway.

---

## Task 0 — Test Schema Setup — Done (2026-08-11)

- Added Alembic migration `70897841a0b1_create_test_schema.py`: `CREATE SCHEMA IF NOT EXISTS test` on the same Supabase Postgres instance/connection as `public`. Applied with `alembic upgrade head` using the existing `DATABASE_URL` — no new credentials, no dashboard action.
- Fixed a pre-existing bug this surfaced: `backend/app/core/config.py`'s `Settings` model didn't declare `supabase_service_role_key`, so pydantic-settings raised `extra_forbidden` on load (backend/.env already had `SUPABASE_SERVICE_ROLE_KEY` from the M1 SMTP work) — this blocked Alembic entirely, before any M2/M3 change. Declared the field (`str | None = None`) so config loads. Not otherwise used yet this session.
- `backend/tests/` is new: `conftest.py` provides a `test_conn` fixture — a connection wrapped in a transaction that's always rolled back, so fixture data never actually persists even if a test forgets to clean up. All tests in this file operate only on `test.*` tables, asserted by `test_public_schema_untouched_by_test_fixtures`.
- Smoke test (`backend/tests/test_schema_setup.py`): creates `test.smoke_check`, inserts a row, reads it back, deletes it, confirms deletion, drops the table. All 3 tests pass (`python -m pytest tests -v`, run from `backend/`).
- **Confirmed working**: `test` schema is live in Supabase, isolated from `public`, wired to the existing `DATABASE_URL`, ready for all M3 automated tests.

### Test-schema strategy for the rest of this session (read before Task 3.1)

Supabase's REST layer (PostgREST, used by the frontend's `@supabase/ssr` client) only exposes schemas listed in the project's **Exposed Schemas** setting (Dashboard → Settings → API) — `public` by default. Adding `test` to that list is a dashboard action, and Task 0's instructions were explicit that this task needs *no* dashboard action. Rather than silently falling back to testing against `public` (explicitly forbidden) or quietly requiring a dashboard change mid-session (not pre-authorized), the DB-touching automated tests for M3 (Tasks 3.1–3.6) run as **backend pytest tests using a direct Postgres connection** (`sqlalchemy` + `psycopg`, same engine as this file) against `test.projects`, mirroring the exact SQL the Next.js Server Actions run against `public.projects`. Row-Level Security is exercised for real in these tests via `SET LOCAL ROLE authenticated; SET LOCAL request.jwt.claims = ...` — the same mechanism PostgREST uses under the hood — so RLS enforcement is genuinely tested, not assumed.

Frontend Vitest + React Testing Library tests cover component/UI behavior (form rendering, client-side validation, empty states, navigation, dark mode) and don't touch the database at all.

**Flagged for review**: this means the production Server Actions themselves aren't executed by an automated test against a live `test` schema end-to-end (only their SQL logic is, via the pytest mirror). Closing that gap would need either (a) exposing `test` in Supabase's Exposed Schemas setting (dashboard action, needs your sign-off), or (b) Playwright end-to-end tests against a running dev server (explicitly deferred to M4+ per the standing decisions in TASKS-M2-M3-loop-goal.md). Flagging rather than deciding silently since it's a testing-coverage tradeoff, not a pure implementation detail.

---

## Milestone 3 — Project Management — Done (2026-08-11)

All six tasks (3.1 Create, 3.2 Edit, 3.3 Delete/Trash, 3.4 Project Dashboard, 3.5 Timeline, 3.6 Incremental Inputs) shipped in order, each with its own backend pytest coverage against `test.projects` (RLS included) and, where there's client-side behavior, a Vitest/RTL test. 24 backend tests, all passing.

Key pieces: `public.projects` (+ mirrored `test.projects`) table with RLS scoping every operation to `auth.uid() = user_id`, a Postgres trigger (`clock_timestamp()`, not `now()` — see below) maintaining `updated_at`, soft-delete via `deleted_at` with a Trash view and Restore, and an `isProjectComplete()` helper driving the amber "Incomplete" badge until Road Width and Zoning are filled in.

**Bug caught and fixed mid-session**: the first version of the `updated_at` trigger used `now()`, which is fixed at *transaction* start in Postgres — harmless in production (each request is its own transaction) but made the trigger test fail, since the test's insert-then-update happens inside one rolled-back transaction. Switched to `clock_timestamp()` (true per-statement wall-clock time), which is arguably more correct in general, not just a test workaround.

**Deferred, not forgotten**: automatic permanent purge of trashed projects after the 30-day recovery window is explicitly out of scope for M3 per the standing decision — nothing currently deletes old trash. That's scheduled-job work suited to a later milestone.

## Milestone 2 — Dashboard — Done (2026-08-11)

All nine pieces shipped: app shell (nav bar + sidebar), Home page with a real Projects widget, genuinely-empty Recent Chats/Recent Calculations placeholders, a Notifications bell with an empty-state panel, Settings (password change + Dark Mode toggle), Profile (display name editable, email read-only), and Dark Mode itself (localStorage-backed, FOUC-safe). 34 Vitest tests, all passing.

**Testing-coverage gap, flagged for review**: Profile's display name is stored in Supabase Auth's `user_metadata`, not a Postgres table — there's no `test`-schema equivalent for Auth, and creating throwaway real Auth users to test persistence end-to-end wasn't pre-authorized. The `ProfileForm` component (pre-fill, email read-only, required field, calls the action on submit) is tested; the actual `updateUser()` round-trip against Supabase Auth is not. Same category of gap as the Server-Action-vs-pytest-mirror one above — not silently skipped, just not achievable within this session's constraints without either a dashboard change or new test infrastructure.

**Also flagged**: Dark Mode's "all existing pages/components render correctly in both themes" requirement is satisfied structurally (every color in use is a semantic Tailwind token with both a light and dark definition, not a raw hex value) rather than verified with an actual browser visual pass — no browser-driven testing was run this session (Playwright is explicitly deferred to M4+). Worth a manual toggle-and-look before merging if that matters to you.

## What's built vs. what's still a placeholder

- **Real, working, tested**: Projects (create/edit/soft-delete/restore/trash), the Home dashboard's Projects widget, Settings' password change, Profile's display name, Dark Mode, the nav bar/sidebar shell.
- **Intentionally empty, not fake**: Recent Chats (M5), Recent Calculations (M6), Notifications panel (nothing generates notifications yet) — no mock data anywhere, per your explicit instruction.
- **Not built, correctly out of scope**: Calculators/Regulations/Ask AI UI (M4-M6, per DESIGN_BRIEF.md's own scope note), trash auto-purge after 30 days (M3, deferred by design), FastAPI wiring for Projects (see below).

## Assumptions made this session, and why

Full detail and reasoning for each is in `docs/DECISIONS.md` under "Flagged assumptions (Milestone 2 & 3)". Summary:

1. **Projects CRUD bypasses FastAPI, goes straight from Next.js Server Actions to Supabase**, mirroring the existing M1 auth pattern. FastAPI's auth middleware is still a placeholder; building real JWT verification there for no functional gain (RLS already enforces access at the DB layer either way) didn't seem like the right use of this session. If the architecture is meant to route through FastAPI going forward, this is the biggest thing to flag before more milestones build on the current pattern.
2. **`occupancy_type` is unconstrained `text` at the DB level**, not a Postgres enum — the option list is explicitly provisional pending Milestone 4's real DCPR text, so a DB constraint would just mean migration churn between now and then. The `<select>` dropdown restricts input at the UI layer today.
3. **Sidebar nav items don't carry the calculator-style number prefixes** shown in the DESIGN_BRIEF.md mockup — that numbering is specific to the (not-yet-built) calculator list.
4. **Delete confirmation is an inline two-step button toggle, not a modal** — DESIGN_BRIEF.md's build-now component list doesn't include a Dialog, and the task spec explicitly allowed "a dialog or equivalent."
5. **Profile's display name lives in Supabase Auth `user_metadata`**, not a new `profiles` table, since it's a single field.
6. **Dark mode's color values are derived, not separately locked** — DESIGN_BRIEF.md v2.0 only freezes the light palette.

## Anything that needs your review before merging

- The FastAPI-bypass decision (#1 above) — the biggest architectural fork, worth confirming before Milestone 4 builds further on it.
- Whether `test` should be added to Supabase's Exposed Schemas setting (a dashboard action) so future sessions can run true end-to-end tests against Server Actions rather than the SQL-mirror strategy used here.
- Dark mode's derived color palette — not itself frozen by DESIGN_BRIEF.md v2.0, worth an actual look in a browser.
- The M1 auth pages (login/signup/forgot/reset-password) changed visual appearance as a side effect of restyling the shared Card/Button/Input primitives to match DESIGN_BRIEF.md — no behavior changed, but worth a glance since M1 was already signed off.
- Profile display-name persistence against real Supabase Auth isn't covered by an automated test (see above) — worth a manual click-through.

## Housekeeping

- `docs/TASKS.md` updated: Milestones 2 and 3 checked off, both noting the feature branch.
- `docs/DECISIONS.md` updated with this session's flagged assumptions.
- All work is on `feature/m2-m3-dashboard-projects`, **not merged to main, not pushed to remote**, per your standing instruction.
- No blockers were hit that required stopping — every task's automated test passed on first or second attempt; nothing needed the "log blocker and move on" fallback.

---
