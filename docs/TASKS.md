# TASKS.md

Milestones follow the exact order defined in the source Coding Structure document. No reordering applied (see DECISIONS.md — "Process decisions" for the trade-off this implies).

Each task should be picked one at a time and run through the Daily Workflow described in `ARCHITECTURE.md`.

---

## Milestone 0 — Setup

- [x] Task 0.1 — Initialize GitHub repository with folder structure
- [x] Task 0.2 — Setup Next.js (TypeScript, Tailwind, ESLint, App Router)
- [x] Task 0.3 — Setup shadcn/ui
- [ ] Task 0.4 — Setup FastAPI (auth middleware, logging, config management, API versioning)
- [ ] Task 0.5 — Setup PostgreSQL (Docker, Postgres, pgvector, migrations via Supabase)

**No AI. No calculations. No uploads. Just the skeleton running.**

## Milestone 1 — Authentication

- [ ] Login
- [ ] Signup
- [ ] Forgot Password
- [ ] Session Management
- [ ] Protected Routes
- [ ] User Roles

**Do not add any AI yet.**

## Milestone 2 — Dashboard

- [ ] Home Page
- [ ] Sidebar
- [ ] Projects
- [ ] Recent Chats
- [ ] Recent Calculations
- [ ] Notifications
- [ ] Settings
- [ ] Profile
- [ ] Dark Mode

**Just UI — nothing complicated.**

## Milestone 3 — Project Management

- [ ] 3.1 — Create Project
- [ ] 3.2 — Edit Project
- [ ] 3.3 — Delete Project
- [ ] 3.4 — Project Dashboard
- [ ] 3.5 — Project Timeline
- [ ] 3.6 — Incremental Inputs (support gradual data entry, not all-at-once)

## Milestone 4 — Regulation Library

- [ ] PDF Upload
- [ ] OCR *(library TBD — see DECISIONS.md, test against real DCPR PDF)*
- [ ] PDF Storage
- [ ] Metadata
- [ ] Text Extraction *(library TBD — see DECISIONS.md)*
- [ ] Chunking
- [ ] Embeddings *(provider TBD — see DECISIONS.md)*
- [ ] Vector DB (pgvector)
- [ ] Document Viewer
- [ ] Document Search
- [ ] Version Control

## Milestone 5 — AI Search

- [ ] Chat UI
- [ ] Retrieval
- [ ] Prompt Builder
- [ ] Claude Integration
- [ ] Source Citations
- [ ] Conversation History
- [ ] Suggested Questions
- [ ] Bookmarks
- [ ] Feedback

**Always answer from retrieved clauses — never from general knowledge.**

## Milestone 6 — Calculator Engine

Build the framework first, not FSI first:
- [ ] Calculator Framework
- [ ] Input Forms
- [ ] Validation
- [ ] Calculation Pipeline
- [ ] Rule References
- [ ] Result Cards
- [ ] History
- [ ] Export

Then implement calculators one at a time:
- [ ] Task 6.1 — FSI
- [ ] Task 6.2 — Parking
- [ ] Task 6.3 — Open Space
- [ ] Task 6.4 — Staircase
- [ ] Task 6.5 — Toilet
- [ ] Task 6.6 — Fire
- [ ] Task 6.7 — Refuge Area

## Milestone 7 — Rule Recommendation Engine

- [ ] Project Type Detection
- [ ] Rule Mapping
- [ ] Priority Rules
- [ ] Suggested Reading
- [ ] Related Clauses
- [ ] Exception Detection

## Milestone 8 — Planning Extract

- [ ] Extract Template
- [ ] Data Aggregation
- [ ] AI Summary
- [ ] Clause References
- [ ] PDF Export
- [ ] Word Export
- [ ] Print Layout

## Milestone 9 — Compliance Checker

- [ ] Rule Engine
- [ ] Checklist
- [ ] Pass/Fail Logic
- [ ] Warnings
- [ ] Risk Level
- [ ] Compliance Report

## Milestone 10 — Company Knowledge

- [ ] Previous Projects
- [ ] Lessons Learned
- [ ] FAQs
- [ ] Consultant Notes
- [ ] Decision Log
- [ ] Project Search

## Milestone 11 — Future Features

- [ ] CAD Analysis
- [ ] Premium Calculator
- [ ] Feasibility Report
- [ ] Drawing Review
- [ ] BMC Submission
- [ ] Multi-city Support
