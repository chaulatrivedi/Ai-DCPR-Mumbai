# TASKS — Milestone 2 & 3 (Loop/Goal Format)

**Session type:** Unattended (Anchor-then-Loop not required — no external accounts/dashboards needed for either milestone)
**Sequencing note:** M3 (Project Management) is built first within this session, even though M2 is numbered first, because M2's "Projects" dashboard widget needs M3's real data model to avoid building throwaway placeholder logic. Both are still delivered under their original milestone numbers — this is an execution-order optimization, not a scope change.
**Design reference:** Read `DESIGN_BRIEF.md` (v2.0) before building any UI. Colors, type, spacing, and component specs are locked — implemented as Tailwind tokens, not raw values. Only build the components marked "build now" in that doc (Section 5) — Calculators/Regulations/Ask AI UI is out of scope until their own milestones.

## Standing decisions for this session (2026-08-09)

- **Project visibility: private per-user.** Every project row must be tied to the creating user (`user_id` / `created_by` foreign key to `auth.users`). Enforce this with Supabase **Row Level Security (RLS)** policies — not just app-level filtering — so a user genuinely cannot query another user's projects even via a direct API call. This applies to every task below that touches Projects.
- **Delete = soft-delete.** Deleting a project sets a `deleted_at` timestamp rather than removing the row. Deleted projects are hidden from all normal views but recoverable from a "Trash" view for a defined period (30 days — reasonable default, flag if you want a different window). **Automatic permanent purge after that period is out of scope for M3** — that's a scheduled job better suited to a later milestone; for now, just mark and hide correctly. Note this explicitly in SESSION_LOG.md as deferred, not forgotten.
- **Automated tests run against an isolated Postgres schema** (e.g. `test`), not the `public` schema your real data lives in — same Supabase project, same connection, logically separated. Tests must create their own fixture data inside the `test` schema and clean up after themselves; they must never read/write `public` schema tables. If this schema separation isn't trivial to wire into the existing SQLAlchemy/Alembic setup, stop and log it in SESSION_LOG.md rather than falling back to testing against real data.
- **Frontend testing framework:** Vitest + React Testing Library for component/unit tests (lightweight, fits Next.js well). Full browser-driven end-to-end testing (Playwright) is deferred until flows get more complex (M4+) — not needed for CRUD forms and a dashboard.
- **User feedback pattern:** use toast notifications (shadcn's toast/sonner component) for success/error states across all forms — consistent with the "Save changes" → "Saved" active-voice convention. No silent failures, no browser `alert()`.
- **Responsive scope:** target down to tablet width (this is a professional desktop-first tool for architects at workstations, not a mobile-first consumer app). Full phone-width optimization is not required for M2/M3 — flag if you want this reconsidered later.



## Task 0 — Test Schema Setup (do this first, before anything else)

**Goal:** An isolated `test` Postgres schema exists in Supabase, separate from `public`, ready for all automated tests in this session to use.
**Definition of Done:**
- [ ] `test` schema created in Supabase via migration/SQL, using the existing `DATABASE_URL` connection — no new credentials, no dashboard action needed
- [ ] Test database config/fixtures point at the `test` schema, confirmed separate from `public`
- [ ] A trivial smoke test (create + read + delete a dummy row) run against `test` schema to confirm it's wired correctly, before any real M3 task begins
- [ ] Note in SESSION_LOG.md once confirmed working
**This task requires no approval from Chaula — purely additive, non-destructive, runs on existing credentials.** If it fails, stop and log the blocker rather than proceeding with M3/M2 tasks unverified.

---

## Milestone 3 — Project Management (build first in this session)

### Task 3.1 — Create Project
**Goal:** A user can create a new project with core fields, saved to Supabase.
**Field spec (decided 2026-08-09):**
- Project Name — text, **required**
- Occupancy Type — dropdown, **required**. Provisional options (pending refinement once Milestone 4 ingests actual DCPR text): Residential, Educational, Institutional, Assembly, Business, Mercantile, Industrial, Storage, Hazardous, Mixed-Use
- Plot Area — number, **required**, unit: sq. meters
- Road Width — number, optional, unit: meters (fillable later per Task 3.6)
- Zoning — text/dropdown, optional (fillable later)
**Definition of Done:**
- [ ] "New Project" form built with the field spec above
- [ ] Form validates the 3 required fields before submit; optional fields can be left blank
- [ ] New project row stores `user_id` set to the creating user; Supabase RLS policy enforces users can only read/write their own projects
- [ ] Submission writes a new row to the Projects table in Supabase
- [ ] User is redirected to the new project's page on success
- [ ] Automated test: creating a project with valid data succeeds; creating one with missing required fields is rejected
**Loop:** Implement → run automated test → pass → commit to feature branch → next task. Fail after 2 retries → log blocker in SESSION_LOG.md → move on.

### Task 3.2 — Edit Project
**Goal:** A user can update any field of an existing project, changes persist.
**Definition of Done:**
- [ ] Edit form pre-populated with existing project data
- [ ] Submission updates the existing Supabase row (not a duplicate)
- [ ] Automated test: editing a field persists correctly on reload
**Loop:** Same as above.

### Task 3.3 — Delete Project
**Goal:** A user can soft-delete a project, with confirmation to prevent accidental loss, and can recover it from Trash within the recovery window.
**Definition of Done:**
- [ ] Delete action requires a confirmation step (dialog or equivalent)
- [ ] Confirmed delete sets `deleted_at`, does not remove the row
- [ ] Deleted projects are hidden from all normal project lists/dashboard
- [ ] A "Trash" view lists soft-deleted projects with a Restore action
- [ ] Restore clears `deleted_at` and returns the project to normal views
- [ ] Automated test (in the `test` schema): delete sets deleted_at and hides from lists; restore reverses it; cancel leaves it untouched
**Note:** Automatic permanent purge after 30 days is out of scope for this task — log as deferred in SESSION_LOG.md.
**Loop:** Same as above.

### Task 3.4 — Project Dashboard
**Goal:** Each project has its own overview page showing its key details at a glance.
**Definition of Done:**
- [ ] Project page displays all stored fields clearly
- [ ] Links/buttons to Edit and Delete are present
- [ ] Automated test: navigating to a project's page shows correct data for that project (not another one)
**Loop:** Same as above.

### Task 3.5 — Project Timeline
**Goal:** Each project shows a simple chronological log of when it was created/edited (placeholder for richer activity tracking later).
**Definition of Done:**
- [ ] Created/last-updated timestamps stored and displayed
- [ ] Automated test: timestamp updates on edit
**Loop:** Same as above.

### Task 3.6 — Incremental Inputs
**Goal:** A user isn't forced to fill every field at once — a project can be created with partial data and completed later.
**Definition of Done:**
- [ ] Only Name + Occupancy Type + Plot Area required to create a project (per Task 3.1 field spec); Road Width and Zoning optional at creation
- [ ] Remaining (optional) fields can be filled in later via Edit without error
- [ ] Automated test: creating with only the 3 required fields succeeds; project shows "incomplete" state until Road Width and Zoning are also filled
**Loop:** Same as above.

---

## Milestone 2 — Dashboard (build second, now wired to real M3 data)

### Home Page
**Goal:** A logged-in user lands on a dashboard showing a real summary of their work.
**Definition of Done:**
- [ ] Home page renders after login (protected route, per M1)
- [ ] Shows count/list of real projects from Supabase (via M3)
- [ ] Automated test: home page reflects actual project count for the logged-in user
**Loop:** Standard.

### Sidebar
**Goal:** Consistent navigation is available across all pages.
**Definition of Done:**
- [ ] Sidebar with links to Home, Projects, Settings, Profile present on all authenticated pages
- [ ] Active page is visually indicated
- [ ] Automated test: navigation links route to the correct pages
**Loop:** Standard.

### Projects (dashboard widget)
**Goal:** Dashboard shows a real, live list of the user's projects (not mock data).
**Definition of Done:**
- [ ] Widget pulls from the same Supabase Projects table as M3
- [ ] Clicking a project navigates to its Project Dashboard page (Task 3.4)
- [ ] Empty state shown clearly if the user has zero projects yet
- [ ] Automated test: widget reflects real project data, empty state renders correctly with zero projects
**Loop:** Standard.

### Recent Chats
**Goal:** A placeholder section exists, ready to be wired to real data once Milestone 5 (AI Search) exists.
**Definition of Done:**
- [ ] UI section present with a clear "Coming soon" or empty state
- [ ] No hardcoded fake chat data — genuinely empty until M5
- [ ] Automated test: section renders without error in its empty state
**Loop:** Standard. **Do not build fake/mock chat data** — this creates cleanup work later.

### Recent Calculations
**Goal:** Same placeholder approach, ready for Milestone 6 (Calculator Engine).
**Definition of Done:**
- [ ] UI section present with a clear empty state
- [ ] Automated test: renders without error
**Loop:** Standard. Same no-fake-data rule as above.

### Notifications
**Goal:** A notifications UI shell exists (functional structure, even if nothing generates real notifications yet).
**Definition of Done:**
- [ ] Notification icon/panel present in the UI
- [ ] Empty state shown (no notifications yet — nothing in the app generates them until later milestones)
- [ ] Automated test: renders without error
**Loop:** Standard.

### Settings
**Goal:** A basic settings page exists for account-level preferences.
**Definition of Done:**
- [ ] Settings page accessible from sidebar
- [ ] At minimum: change password option (via Supabase Auth), Dark Mode toggle lives here or is linked from here
- [ ] Automated test: settings page loads, password change form validates input
**Loop:** Standard.

### Profile
**Goal:** A user can view/edit their display name. Email editing is out of scope for now (Supabase email-change requires re-verification — adds complexity not needed yet).
**Definition of Done:**
- [ ] Profile page shows current user info (name, email — email read-only)
- [ ] Display name is editable and saves correctly
- [ ] Automated test: display name edit persists; email field is not editable
**Loop:** Standard.

### Dark Mode
**Goal:** User can toggle between light/dark theme, preference persists across sessions.
**Decided (2026-08-09):** Browser-only storage (localStorage) — not tied to a Supabase account. Works pre-login, avoids a database round-trip, no per-user dependency.
**Definition of Done:**
- [ ] Toggle available (Settings or a global control)
- [ ] Preference saved to localStorage, persists on reload (same browser/device)
- [ ] All existing pages/components render correctly in both themes
- [ ] Automated test: toggle changes theme and persists on reload
**Loop:** Standard.

---

## Session-End Requirements (applies to the whole M2+M3 session)

- [ ] `SESSION_LOG.md` written summarizing: tasks completed, any blockers, any assumptions made and why, anything flagged for review
- [ ] All work committed to a feature branch (e.g. `feature/m2-m3-dashboard-projects`) — **not merged to main**
- [ ] `TASKS.md` in the main docs updated to check off completed items
- [ ] No `.env`, database-destructive, or merge/push-to-remote actions taken without prior authorization
