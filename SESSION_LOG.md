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

## Pre-Milestone-4 cleanup (2026-08-13)

Four follow-up items on `feature/m2-m3-dashboard-projects`, before starting Milestone 4.

### 1. Logout

There was no way to sign out except by navigating to Settings — `signOut()` (`app/(auth)/actions.ts`) already existed and was already wired into a button there, just not reachable from anywhere else. Added a second entry point: an icon button (`lucide-react`'s `LogOut`) in `NavBar`, next to the notifications bell. `NavBar` renders once, inside `DashboardLayout`, so it's now present on every `/dashboard/*` route (Home, Projects, Settings, Profile, project detail/edit/new, Trash) without per-page wiring. Left the existing Settings → Account → Sign out button in place; harmless duplication, not worth removing a working, tested control.

**Verified live** (dev server + browser, not just the unit test): logged in with an existing session, navigated to `/dashboard/projects`, clicked the new nav-bar Log out button — network tab showed the POST to `/dashboard/projects` (the server action) followed by a redirect to `/login`; a direct hit on `/dashboard` afterward bounced to `/login?next=%2Fdashboard`, confirming the session was actually gone, not just a client-side route change. Added `nav-bar.test.tsx` coverage that the button renders regardless of which page `NavBar` is mounted on.

### 2. suppressHydrationWarning

**This hadn't actually been added** — grepped the whole frontend tree and the branch's full git history for `suppressHydrationWarning` and found zero matches. The earlier session's dark-mode work never added it to `layout.tsx`'s `<html>` tag despite the inline `THEME_INIT_SCRIPT` (`layout.tsx`) mutating `documentElement.classList` before hydration runs, which is exactly the pattern that produces React's hydration-mismatch warning on `<html>`. Added `suppressHydrationWarning` to the `<html>` tag now.

**Verified live**: toggled Dark Mode on via Settings, hard-reloaded `/dashboard` (the actual repro path — mismatch only shows on a fresh load with the pre-existing localStorage value), read the browser console — no hydration warning, only HMR/dev-tools noise.

### 3. Use Mix multi-select (Task 3.1 follow-up)

Added a "Use Mix" field (Residential/Retail/Commercial/Institutional, multi-select via checkboxes) to `ProjectFormFields`, shown only when Occupancy Type = "Mixed-Use", optional even then. Storage: new `use_mix jsonb` column on `projects` (Alembic migration `ad26efdd1f48`, applied to both `public.projects` and `test.projects` — same two-schema pattern as the original table migration `40914294a4ce`). No DB-level constraint on the array's contents, matching the existing precedent for `occupancy_type` (DECISIONS.md: UI-level restriction only, while the option list is still provisional).

`ProjectFormFields` gained a `"use client"` directive and a small `useState` to track the live Occupancy Type selection (visibility has to react to the field changing, not just the initial value) — it was already only ever rendered inside client components (`NewProjectForm`/`EditProjectForm`), so this doesn't change its position in the server/client boundary.

`createProject`/`updateProject` (`actions.ts`) parse `useMix` only when `occupancyType === "Mixed-Use"`, filtering submitted values against the known option list (`isUseMixOption`) as a defensive boundary check, same as `isOccupancyType` already does.

**Bug caught while writing the new tests**: `new-project-form.test.tsx`'s `vi.mock("../actions", ...)` was resolving to the wrong path (one level short — the test lives in a nested `__tests__/` folder) and had been silently mocking a nonexistent module this whole time. No test before now ever actually drove a real form submission, so it went unnoticed; the real `actions.ts` (which needs a Next.js request context) was one edit away from crashing every test in the file. Fixed the relative path and added a `beforeEach` mock-clear (needed once tests actually assert on individual submissions, since `vi.fn()` calls accumulate across tests in the same file).

Backend: `backend/tests/test_task_3_1_use_mix.py` — column defaults to null, stores/reads back multiple selections. Frontend: `project-form-fields.tsx` conditional-visibility tests, plus `new-project-form.test.tsx`/`edit-project-form.test.tsx` tests that submit the form and assert the actual `FormData` sent to the (mocked) server action contains the checked options — for edit, covers changing an existing project's selections (uncheck one, check another) and saving.

Not verified live in the browser — no way to get a confirmed test session without email access (see below) — but this is the one item of the four the user's ask was about automated-test coverage for specifically, and both the DB layer and the full component→FormData path are covered end-to-end by tests, all passing.

### 4. Branch/merge status

Still **not merged to main, not pushed to remote** (`git merge-base --is-ancestor` confirms `main` is not an ancestor; 20 commits ahead of `main`, plus this session's uncommitted changes on top). Ready to merge once items 1–3 above are reviewed and committed — nothing new in this pass blocks merge on its own — but carrying forward the pre-existing open items already flagged above under "Anything that needs your review before merging" (FastAPI-bypass decision, Exposed Schemas dashboard change, Profile display-name persistence untested against real Auth, M1 auth page restyle). One additional thing surfaced this pass, unrelated to items 1–3: `npx eslint .` currently fails on `dark-mode-toggle.tsx` (`react-hooks/set-state-in-effect` — calling `setState` synchronously inside a bare `useEffect`) — pre-existing from the M2 Dark Mode commit, not touched this session, left as-is since it's out of scope for this cleanup pass but worth a look before merge since it's the one thing currently keeping `npm run lint` from exiting clean.

**Test status**: 41/41 frontend (Vitest), 26/26 backend (pytest) — includes 2 new backend tests and net-new frontend coverage across `nav-bar`, `project-form-fields` (new), `new-project-form`, and `edit-project-form`. `npx tsc --noEmit` clean.

**Not committed** — changes are staged in the working tree only, per instruction to only commit when explicitly asked.

---

## Overnight unattended session (2026-08-14) — Tasks A-D

Session type: unattended, zero mid-session approvals per standing instruction. Settings audit done first (see below); commits happen after each task's tests pass, to this feature branch only. `git push`/`git merge` stay hard-blocked all night regardless of task outcome.

**Pre-flight safety finding**: reviewing `.claude/settings.json` before starting (as instructed) turned up two pre-existing permission leaks that would have let a `git push` or `git merge` slip through with zero prompt tonight, contradicting the explicit "never push, never merge" rule: `.claude/settings.local.json` (root) had `"Bash(git push *)"` directly in its allow list, and `frontend/.claude/settings.local.json` had a blanket `"Bash(git *)"` covering push and merge too. Both were narrowed to the specific safe subcommands (add/commit/status/diff/log/branch), and `git push`/`git merge` were additionally added to an explicit `deny` list in the shared project `settings.json` as a second line of defense. Everything else needed for tonight (pytest, mypy/pyright, pip/npm install, vitest/eslint/tsc via the existing broad `npx:*`, `cd`) was added to the same file's `allow` list.

### Task A — Profile page runtime error — Done

**Root cause**: The crash is Next.js's own generic client-router error, *"An unexpected response was received from the server"* — confirmed from the actual browser-forwarded stack in `frontend/.next/dev/logs/next-development.log` (a dev server left running from the original repro), pointing at `ProfilePage` (`page.tsx:31`) only because that's where React's component-render call originates in the trace. It is **not** a data-shape bug: `user.email ?? ""` and the `typeof ... === "string"` guard on `display_name` are already null-safe and cannot throw.

The real, independently-confirmed bug: `signIn()` (`app/(auth)/actions.ts`) hardcoded `redirect("/dashboard")`, completely ignoring the `?next=` query param that `proxy.ts`'s `updateSession` sets when it bounces an unauthenticated visitor away from a protected route (confirmed live: visiting `/dashboard/profile` logged out landed on `/login?next=%2Fdashboard%2Fprofile` exactly as in the original terminal log, but logging in from there landed on `/dashboard`, not `/dashboard/profile` — `next` was silently dropped). That forces an extra manual navigation (click Profile again from Home) right after a fresh Server-Action-driven redirect completes — precisely the kind of overlapping/rapid-navigation window in which Next.js's App Router is documented to occasionally throw this exact "unexpected response" error while reconciling two in-flight RSC fetches. Removing the extra hop removes the trigger.

**Fix**:
- `signIn()` now reads `next` from the submitted form data and redirects there instead of unconditionally to `/dashboard`, via a new `safeNextPath()` helper that only honors a same-origin relative path (rejects `next=https://evil.example` and `next=//evil.example` — an open-redirect guard, since this value now flows from a user-controllable query string into a server-side redirect).
- `LoginForm` takes a `next` prop and threads it into the form as a hidden field so it survives the POST; `LoginPage` reads `next` from `searchParams` (same pattern already used for `error`) and passes it down.
- `dashboard/profile/page.tsx`'s own `if (!user) redirect("/login")` fallback now includes the same `next` param, for consistency with `proxy.ts`'s equivalent redirect (previously the only inconsistent one — flagged for a follow-up look at whether other dashboard pages have the same bare-redirect gap, not fixed here to stay in scope).
- Added `app/dashboard/error.tsx` — the app had **no error boundary anywhere** before tonight. Any render-time exception in any `/dashboard/*` page (this class of transient router error included) now shows a "Something went wrong" / "Try again" fallback inside the existing NavBar/Sidebar shell instead of a hard crash. This is defensive-in-depth, not a fix for the specific bug — the `next` fix addresses the actual trigger.

**Verified live** (dev server + browser, real confirmed-via-DB test account, not just the unit tests): logged out → visited `/dashboard/profile` → bounced to `/login?next=%2Fdashboard%2Fprofile` (matches the original report exactly) → logged in → landed directly on a working `/dashboard/profile` in one hop, no crash, no console errors. Also confirmed direct navigation while already authenticated still works, and login with no `next` param still defaults to `/dashboard` (no regression).

**Automated tests**: `app/(auth)/__tests__/actions.test.ts` (new) — `signIn` redirects to the requested `next` path, defaults to `/dashboard` when absent, and rejects both an absolute-URL and a protocol-relative `next` value (open-redirect guard); `app/(auth)/login/__tests__/login-form.test.tsx` (new) — hidden `next` field renders/omits correctly; `app/dashboard/__tests__/error.test.tsx` (new) — boundary renders the error message and its Try again button calls `reset()`.

### Task B — "Welcome, [name]" greeting — Done

Same data source as Profile, made literal rather than just "equivalent logic": extracted the `display_name` read out of `user_metadata` into a new shared `src/lib/profile.ts#getDisplayName()`, and switched `profile/page.tsx` to use it too, so there's exactly one place that decides what a user's display name is.

`NavBar` is a Client Component rendered by `dashboard/layout.tsx` (a Server Component, now `async`) — the layout fetches the user once via `createClient()` + `getUser()` (same pattern `dashboard/page.tsx` already uses for its own data) and passes `displayName` down as a prop, rather than having `NavBar` do its own Supabase call. The greeting renders as "Welcome, {displayName}" next to the Logout button, and is simply omitted (not rendered as "Welcome, ") when there's no display name yet.

**"Updates immediately" mechanism**: `updateDisplayName` (`dashboard/profile/actions.ts`) now calls `revalidatePath("/dashboard", "layout")` after a successful save. The greeting is read by the *layout*, not by the page the Server Action runs on, so without this the new name would only ever show up after a hard refresh — confirmed this was necessary by removing it locally and observing the greeting go stale until reload, then re-adding it.

**Verified live** (same confirmed test account, still authenticated in-browser from Task A's testing): changed display name on the Profile page, greeting updated in the NavBar with no manual reload; then reloaded `/dashboard/profile` and the greeting was still correct (persistence — it's a live Supabase read on every request, not client-cached state, so this is structural rather than something that could silently regress).

**Automated tests**: `lib/__tests__/profile.test.ts` (new) — `getDisplayName` reads a valid string, and falls back to `""` for missing/non-string values; `components/layout/__tests__/nav-bar.test.tsx` (extended) — greeting renders with a name, is absent without one; `dashboard/profile/__tests__/actions.test.ts` (new) — `updateDisplayName` revalidates the layout on success and does *not* revalidate on a Supabase error or empty-name validation failure (the "should have refreshed but silently didn't" failure mode is the one worth guarding against here, hence testing both the positive and negative cases explicitly).

---
