# DCPR DESIGN BRIEF
## Mumbai DCPR — Smart App
**Version:** 2.0
**Date:** 2026-08-09
**Status:** FROZEN (colors, type scale, spacing, component specs) — implementation method updated for editing flexibility
**Supersedes:** v1.0 (22 June 2026)
**Changed by:** Master chat session, 2026-08-09 — sign-off per v1.0's own amendment rule

---

## What changed from v1.0, and why

v1.0 specified raw hex values applied via inline styles on every element, and explicitly said "no CSS classes." That works, but it means changing a color later requires hunting through every element that uses it — brittle for a project that will grow across 11 more milestones.

**v2.0 keeps every color, type size, spacing value, and component spec from v1.0 completely unchanged.** The only change: these values are now defined **once**, as a Tailwind theme configuration, and referenced by name everywhere (e.g. `bg-terracotta` instead of `style="background-color: #CC6644"`). This is also required to reconcile with the project's already-locked tech stack (Tailwind CSS + shadcn/ui, per DECISIONS.md) — true inline-styles-only isn't compatible with shadcn's component model.

"No CSS classes" is amended to: **no ad-hoc/bespoke custom CSS classes** (e.g. no hand-rolled `.my-button-2` piling up in a stylesheet). Tailwind's predefined utility classes, built from the token values below, are the implementation method — not a violation of the original intent, which was about avoiding messy, inconsistent styling debt.

Everything else in this document is locked exactly as v1.0 approved it.

---

## 1. DESIGN PERSONALITY

**3 words:** Authoritative. Warm. Precise.

The app feels like a well-designed Indian professional tool — not a government portal, not a generic SaaS product. Architects open it under deadline pressure; every element must be immediately readable and trustworthy.

---

## 2. COLOUR PALETTE — LOCKED VALUES, DEFINED AS TAILWIND TOKENS

Implementation: define these as custom colors in `tailwind.config` (or CSS variables consumed by it), named as shown. Never hardcode the hex value directly in a component — always reference the token name.

```
Token name           Hex        Usage
sand                 #F5F0E8    Page background
ink                   #1E2820   Nav bar, dark panels, primary text
forest                #2D5A3D   Active sidebar item
terracotta             #CC6644  Primary action button
teal                   #4A7C5F  Regulation tag background
card                   #FFFFFF  Card surface
border                 #E2DDD5  Card border, dividers
muted                  #787774  Secondary text
amber                  #F0C040  Warning
error                  #C0392B  Error
success-bg             #E8F4F0  Success badge background
success-text           #2D5A3D  Success badge text
```

**Never use blue as a primary action colour.** Terracotta (`terracotta`) is the only primary action color.

---

## 3. TYPOGRAPHY — LOCKED VALUES, DEFINED AS TAILWIND THEME EXTENSION

```
Font family:      system-ui (no Google Fonts, no external font imports —
                   set once in Tailwind's fontFamily config, referenced 
                   via font-sans everywhere)

Nav brand name:    13px, font-weight 500, color sand
Nav links:         12px, font-weight 400, color muted (inactive) / sand (active)

Sidebar numbers:   11px, font-weight 400, color muted
Sidebar labels:    13px, font-weight 400, color ink (inactive) / white (active)

Section labels:    10px, uppercase, letter-spacing 0.08em, color muted
Input text:        14px, font-weight 400, color ink
Input placeholder: 14px, font-weight 400, color #BCBCBC (define as token: placeholder-grey)

Result number:     48px, font-weight 700, color white (on dark panel)
Result unit:       14px, font-weight 400, color #9BB5BF (define as token: ice-blue)
Stat numbers:      18px, font-weight 500, color white
Stat labels:       10px, font-weight 400, color ice-blue

Basis line:        12px, font-style italic, color ice-blue
Regulation tag:    11px, font-weight 500, color white

Body text:         14px, font-weight 400, color ink
Muted body:        13px, font-weight 400, color muted

Card title:        15px, font-weight 500, color ink
Page heading:      28px, font-weight 600, color ink
Page subheading:   14px, font-weight 400, color muted
```

---

## 4. LAYOUT — LOCKED

### Overall structure (full app, once all milestones are built)
```
┌─────────────────────────────────────────────────┐
│  NAV BAR (ink)                                   │
│  [logo] Mumbai DCPR   Calculators Regs Ask AI    │
└─────────────────────────────────────────────────┘
┌───────────┬─────────────────────────────────────┐
│ SIDEBAR   │  CONTENT AREA                        │
│ (sand)    │  (sand background)                   │
│           │                                      │
│ 01 Parking│  ┌──────────────┬────────────────┐   │
│ 02 FSI    │  │ INPUTS PANEL │ RESULTS PANEL  │   │
│ 03 Toilets│  │ (card white) │ (ink dark)     │   │
│ 04 Refuge │  │              │                │   │
│ 05 Stairs │  └──────────────┴────────────────┘   │
│ 06 Open Sp│                                      │
│ 07 Lifts  │                                      │
│           │                                      │
│ ─────────│                                       │
│ ASK AI    │                                      │
│ panel     │                                      │
└───────────┴─────────────────────────────────────┘
```

### ⚠️ Scope note for current build (Milestone 2 & 3)

Calculators (M6), Regulations (M4), and Ask AI (M5) don't exist yet. **For now:**
- Nav bar shows only what's real: logo, "Mumbai DCPR," and links to what's actually built (Home, Projects). Add Calculators/Regs/Ask AI links as those milestones land — don't build dead links now.
- Sidebar bottom "Ask AI" panel: omit entirely until Milestone 5. Don't build a non-functional placeholder for it — unlike the dashboard's Recent Chats/Calculations widgets (which show an intentional empty state because the *user's own data* will eventually appear there), this is a whole app section that doesn't exist yet.
- The two-panel Inputs/Results layout is for Milestone 6 (Calculators) — not needed for M2/M3.
- What **does** apply now: the Card spec below, for the Dashboard's project cards.

### Sidebar
```
Width:            220px fixed
Background:       sand
Active item bg:   forest
Active item text: white
Inactive text:    ink
Number prefix:    muted
Separator:        1px border token
```

### Cards (project dashboard, home screen) — applies now
```
Background:     card (white)
Border:         0.5px solid border token
Border-radius:  8px
Padding:        16px 20px
Shadow:         none
```

---

## 5. COMPONENTS — LOCKED (build now: Nav bar shell, Primary/Secondary buttons, Input field, Cards. Build later: Regulation tag, Results panel, Basis line, AI panel, Amber warning flag — Milestone 4+)

### Navigation bar (build now, reduced link set per scope note above)
```
Height:         48px
Background:     ink
Logo mark:      Diamond ◆ in terracotta
Brand name:     "Mumbai DCPR" in sand
Active nav link: sand, underline or bg pill
Inactive link:  muted
```

### Primary button (build now)
```
Background:     terracotta
Text:           white
Font:           13px, font-weight 500
Padding:        8px 20px
Border-radius:  6px
Hover:          #B85A3A (10% darker — define as token: terracotta-hover)
```

### Secondary button (build now)
```
Background:     ink
Text:           sand
Font:           13px, font-weight 400
Padding:        6px 16px
Border-radius:  6px
```

### Input field (build now — used in Create/Edit Project forms)
```
Background:     sand
Border:         0.5px solid border token
Border-radius:  5px
Padding:        6px 10px
Font:           14px, ink
Unit label:     right-aligned inside field, muted (e.g. "sq.m" for Plot Area)
Focus border:   terracotta
```

### Dropdown select (build now — used for Occupancy Type)
```
Same as input field
Arrow indicator: muted
```

*(Regulation tag, Results panel stats, Basis line, Amber warning flag, AI panel — deferred, see scope note. Full specs preserved from v1.0, unchanged, for when those milestones start.)*

---

## 6. SPACING SYSTEM — LOCKED

```
4px   — micro gap (icon to label)
8px   — small gap (between related elements)
12px  — medium gap (between fields)
16px  — section padding
20px  — card padding
24px  — large section gap
32px  — between major sections
```

---

## 7. BORDER RADIUS — LOCKED

```
Input fields, dropdowns:  5px
Cards, panels:            8px
Buttons:                  6px
Tags / pills:             4px (regulation tags) / 20px (status pills)
Nav bar:                  0
```

---

## 8. WHAT TO NEVER DO

```
✗ Do not use Google Fonts or external font imports
✗ Do not use box shadows on cards
✗ Do not use pure white (#FFFFFF) as page background
✗ Do not use blue as primary action colour
✗ Do not default to dark mode (toggle may exist — see Dark Mode task in TASKS-M2-M3-loop-goal.md — but light is default)
✗ Do not add advisory notes or disclaimers to calculator outputs
✗ Do not use border-radius above 8px on panels
✗ Do not invent ad-hoc/bespoke custom CSS classes — use Tailwind tokens defined in Section 2 & 3 only
✗ Do not use gradients
✗ Do not use animation except subtle hover state changes
✗ Do not build UI for milestones that haven't started yet (see Scope note, Section 4)
```

---

## 9. REFERENCE

**Approved mockup (colors/type/components):** Claude Design output, reviewed and confirmed by Chaula, 22 June 2026 (v1.0).
**Implementation method updated:** Master chat, 2026-08-09 (v2.0) — reconciled with locked Tailwind + shadcn/ui stack decision (DECISIONS.md).
**Comparable feel:** Figma sidebar + municipal authority + warm Indian professional tool.

---

*End of DCPR Design Brief v2.0*
*Colors, type scale, spacing, and component specs remain frozen. Further changes require master chat sign-off and version increment.*
