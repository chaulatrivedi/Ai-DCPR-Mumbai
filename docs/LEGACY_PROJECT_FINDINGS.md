# Legacy Project Findings — `mumbai-dcpr` (chaulatrivedi/mumbai-dcpr)

**Source:** `https://github.com/chaulatrivedi/mumbai-dcpr`, cloned to `E:\Claude-Projects\mumbai-dcpr-legacy` (sibling folder, outside this project) for read-only analysis.
**Branch:** `main` only (no other branches/tags exist).
**HEAD at time of analysis:** `96d121f` — "Migrate storage from localStorage to Supabase, add calculator version history"
**Full file list:** `.claude/settings.json`, `CLAUDE.md`, `DCPR_MASTER_BRIEF.md`, `DCPR_DESIGN_BRIEF.md`, `index.html`, `package.json`, `vite.config.js`, `src/App.jsx`, `src/main.jsx`, `src/components/Nav.jsx`, `src/components/Sidebar.jsx`, `src/pages/{Home,NewProject,ProjectDashboard}.jsx`, `src/calculators/{Parking,Toilets}.jsx`, `src/data/{parkingRates,toiletRates,projectQuestions}.json`, `src/utils/{parkingCalc,toiletCalc,storage,supabaseClient}.js`.

Every file above was read in full. Nothing in this repo was modified.

---

## 0. Headline finding: FSI was never built

The master brief's folder structure and Section 9 "Build Sequence" both claim FSI is done (`FSI.jsx`, `fsiRates.json`, `fsiCalc.js`, "Phase 4 — FSI Calculator (Module 02, complete)"). **None of these files exist in the repo, on any branch.** Only Parking and Toilets were actually implemented. The brief is internally inconsistent about this too: Section 7's module table lists Parking/FSI/Toilets all as `📋 Briefed` (spec locked, not built), while Section 9 lists Phases 3–5 (the same three) as `complete`. Reality matches the "Briefed" status for FSI — it was specced in prose (the tables below) but no code was ever written against it.

This means the FSI numbers below come **only from the prose tables in `DCPR_MASTER_BRIEF.md`**, not from a working, tested implementation — treat them as a starting spec, not verified logic (unlike Parking/Toilets, which have working code cross-checked against worked examples per commit messages).

---

## 1. Regulation data and formulas (verbatim)

### 1.1 FSI — spec only, no implementation (Section 6 of `DCPR_MASTER_BRIEF.md`)

**New Development — Table 12 (Suburbs & Extended Suburbs)**

| Road width | Zonal (Basic) FSI | Premium FSI | TDR | Max |
|---|---|---|---|---|
| Below 9m | 1.00 | — | — | 1.00 |
| 9–12m | 1.00 | 0.50 | 0.50 | 2.00 |
| 12–18m | 1.00 | 1.00 | 0.50 | 2.50 |
| 18–27m | 1.00 | 1.50 | 0.50 | 3.00 |
| 27m+ | 1.00 | 2.00 | 0.50 | 3.50 |

**New Development — Island City (Table 12)**

| Road width | Zonal FSI | Premium | TDR | Max |
|---|---|---|---|---|
| Below 9m | 1.33 | — | — | 1.33 |
| 9–12m | 1.33 | 0.50 | 0.17 | 2.00 |
| 12–18m | 1.33 | 0.62 | 0.45 | 2.40 |
| 18–27m | 1.33 | 0.73 | 0.64 | 2.70 |
| 27m+ | 1.33 | 0.84 | 0.83 | 3.00 |

**Development Type FSI Summary**

| Type | Regulation | Max FSI | Key rule |
|---|---|---|---|
| New development | Reg 30, Table 12 | 3.50 (Ext Suburbs) | Road width × location |
| Self redevelopment | Reg 30(C) + 33(6) | Protected + Table 12 | Existing BUA protected |
| MHADA 33(5) | Reg 33(5) | 3.0 / 4.0 | Rehab + incentive (Table A+B) |
| Cessed 33(7) | Reg 33(7) | 3.0 | Rehab + 50/60/70% incentive |
| Dilapidated 33(7A) | Reg 33(7A) | Rehab + incentive | 50/60/70% based on plot count |
| Slum 33(9) | Reg 33(9) | 4.0 | Rehab + Table B incentive |
| SRA 33(10) | Reg 33(10) | 4.0 | Same as 33(9), SRA administered |

No `fsiRates.json` schema, no rounding rules, no worked examples exist anywhere in the repo — this is the entirety of what's known.

### 1.2 Parking — `src/data/parkingRates.json` (verbatim) + `src/utils/parkingCalc.js`

```json
{
  "rule_version": "DCPR_2034_v1",
  "valid_from": "2018-01-01",
  "valid_to": null,
  "source": "DCPR 2034 — Development Control and Promotion Regulations for Greater Mumbai",
  "rates": {
    "residential": {
      "regulation": "Table 21, Sr. 1(i)",
      "visitor_percent": 10,
      "visitor_minimum": 1,
      "new_development": {
        "slabs": [
          { "label": "upto_45sqm",    "per_n_tenements": 4 },
          { "label": "45_to_60sqm",   "per_n_tenements": 2 },
          { "label": "60_to_90sqm",   "per_n_tenements": 1 },
          { "label": "above_90sqm",   "per_n_tenements": 0.5 }
        ],
        "note": "Slabs A & B: owner may opt for 1 per tenement instead"
      },
      "redevelopment_33series": {
        "slabs": [
          { "label": "upto_45sqm",    "per_n_tenements": 8 },
          { "label": "45_to_60sqm",   "per_n_tenements": 4 },
          { "label": "60_to_90sqm",   "per_n_tenements": 2 },
          { "label": "above_90sqm",   "per_n_tenements": 1 }
        ]
      },
      "transport_vehicle": { "applicable": false },
      "two_wheeler": { "optional": true, "rate": "1 per 2 tenements" }
    },
    "shopping_convenience": {
      "regulation": "Table 21, Sr. 10",
      "note": "Individual shops — not under Mercantile occupancy",
      "rates": [
        { "shop_size": "upto_20sqm",   "rate_per_sqm": 150 },
        { "shop_size": "above_20sqm",  "rate_per_sqm": 50 }
      ],
      "visitor_percent": 10,
      "visitor_minimum": 2,
      "transport_vehicle": { "applicable": true, "exemption_sqm": 400, "rate_per_sqm": 2000, "min": 1, "max": 6 }
    },
    "mercantile": {
      "regulation": "Table 21, Sr. 5",
      "note": "Markets, departmental stores, large format retail",
      "nil_exemption_sqm": 50,
      "slabs": [ { "up_to": 800, "rate": 40 }, { "above": 800, "rate": 80 } ],
      "visitor_percent": 10,
      "visitor_minimum": 2,
      "transport_vehicle": { "applicable": true, "exemption_sqm": 400, "rate_per_sqm": 2000, "min": 1, "max": 6 }
    },
    "office": {
      "regulation": "Table 21, Sr. 4",
      "note": "Govt / semi-public / private office buildings incl. IT Parks",
      "slabs": [ { "up_to": 1500, "rate": 37.5 }, { "above": 1500, "rate": 75 } ],
      "visitor_percent": 10,
      "visitor_minimum": 2,
      "transport_vehicle": { "applicable": true, "exemption_sqm": 400, "rate_per_sqm": 2000, "min": 1, "max": 6 }
    },
    "school": {
      "regulation": "Table 21, Sr. 2",
      "components": {
        "admin": { "regulation": "Table 21, Sr. 2", "rate": 35, "visitor_percent": 10, "visitor_minimum": 2 },
        "assembly_fixed_seats": { "regulation": "Table 21, Sr. 3(a)", "rate_per_seats": 12, "visitor_percent": 10, "visitor_minimum": 2 },
        "assembly_no_fixed_seats": { "regulation": "Table 21, Sr. 3(b)", "rate_per_sqm": 15, "visitor_percent": 10, "visitor_minimum": 2 },
        "canteen": { "regulation": "Table 21, Sr. 3(c) read with Sr. 5", "nil_exemption_sqm": 50, "slabs": [ { "up_to": 800, "rate": 40 }, { "above": 800, "rate": 80 } ], "visitor_percent": 10, "visitor_minimum": 2 }
      },
      "transport_vehicle": { "applicable": false }
    }
  }
}
```

**Formulas (`parkingCalc.js`):**
- **Rounding** (`roundParking`, Reg 44(2)): `floor = Math.floor(val)`; if `(val - floor) > 0.5` round up, else round down. (Fractions **above** 0.5 round up; exactly 0.5 and below round down — the ">" is strict, so 0.5 itself rounds down.)
- **Visitor parking** (Reg 44(3)): `roundParking(base * 0.1)`, floored at the typology's `visitor_minimum` (1 for residential, 2 for everything else).
- **Transport vehicles** (Reg 44(5)): `(area - 400)` excluded first 400 sqm; if ≤0 → 0; else `roundParking(applicable / 2000)`, capped at max 6, min 1 is implied by the formula never returning between 0 and 1.
- **Residential**: each of the 4 area-slab tenement counts divided by that slab's `per_n_tenements`, rounded individually, summed to `subTotal`; visitor computed on `subTotal`; two-wheeler optional rate = `roundParking(totalTenements / 2)`.
- **Shopping/Convenience**: two independent area inputs (≤20 sqm at 1/150, >20 sqm at 1/50 sqm), each rounded independently then summed.
- **Mercantile**: NIL if area ≤ 50 sqm; otherwise split at 800 sqm boundary (rates 40 then 80), each slab rounded independently.
- **Office**: same two-slab pattern, boundary at 1500 sqm (rates 37.5 then 75).
- **School**: three independent components — Admin (1/35 sqm), Assembly (1/12 seats fixed, or 1/15 sqm no-fixed-seats), Canteen (same 800-sqm-boundary/NIL-≤50-sqm rule as Mercantile) — each with its own visitor calc, summed to `grandTotal`.
- **Mixed use** (`calcMixedUse`) — explicitly documented in-code as a bug fix over an earlier per-component approach: each component's **pre-visitor** sub-total is computed and summed to a `grandTotalBase`; visitor is calculated **once** on that combined base (`roundParking(base * 0.1)`, min 2); `grandTotal = grandTotalBase + visitor`; transport vehicles are summed across components and capped at 6 for the whole project. This mixed-use combination algorithm is **not described anywhere in `DCPR_MASTER_BRIEF.md`** — the brief only states per-typology rules.

### 1.3 Toilets — `src/data/toiletRates.json` (verbatim) + `src/utils/toiletCalc.js`

```json
{
  "rule_version": "DCPR_2034_v1",
  "valid_from": "2018-01-01",
  "valid_to": null,
  "source": "DCPR 2034 — Development Control and Promotion Regulations for Greater Mumbai",
  "rates": {
    "occupantLoad": { "school": 25, "office": 10, "retail_street": 33.3, "retail_upper": 16.6 },
    "fixtures": {
      "school_boys": { "wc": 40, "urinal": 20, "washbasin": 60, "drinkingWater": 50 },
      "school_girls": { "wc": 25, "washbasin": 40, "drinkingWater": 50 },
      "office_male": { "wc": 25, "washbasin": 25, "drinkingWater": 100 },
      "office_female": { "wc": 15, "washbasin": 25, "drinkingWater": 100 }
    },
    "urinalSlab": [
      { "min": 0,   "max": 6,    "count": 0 },
      { "min": 7,   "max": 20,   "count": 1 },
      { "min": 21,  "max": 45,   "count": 2 },
      { "min": 46,  "max": 70,   "count": 3 },
      { "min": 71,  "max": 100,  "count": 4 },
      { "min": 101, "max": 200,  "rate": 0.03,  "base": 4 },
      { "min": 201, "max": null, "rate": 0.025 }
    ],
    "retailStaffWcSlab": {
      "male":   [ {"min":0,"max":15,"count":1}, {"min":16,"max":35,"count":2}, {"min":36,"max":65,"count":3}, {"min":66,"max":100,"count":4} ],
      "female": [ {"min":0,"max":12,"count":1}, {"min":13,"max":25,"count":2}, {"min":26,"max":40,"count":3}, {"min":41,"max":57,"count":4}, {"min":58,"max":77,"count":5}, {"min":78,"max":100,"count":6} ]
    },
    "da_toilet": {
      "regulation": "DCPR Reg 39, Cl. 3.5",
      "min_size": "1.5m × 1.75m",
      "door_clear": "0.9m swing out",
      "wash_basin_height": "rim ≤ 0.75m above FFL",
      "emergency_bell": true
    }
  }
}
```

**Formulas (`toiletCalc.js`):**
- **Occupant load**: `round((area / 100) * rate)` — school 25/100sqm, office 10/100sqm, retail street-level 33.3/100sqm, retail upper-level 16.6/100sqm. Uses **standard rounding** (not ceil) — code comment explicitly notes this is population-headcount rounding, distinct from the always-round-up rule used for fixtures (verified against brief worked example: 5433 sqm office → 543.3 → **543**, not 544).
- **Population split** (`splitPopulation`): `primary = round(total * pct/100)`, `secondary = total - primary` — used for boys/girls, staff/student, male/female splits.
- **Fixture ratios**: all use `Math.ceil(count / rate)` — "per X or part thereof." School boys 1 WC/40, 1 urinal/20, 1 washbasin/60, 1 drinking water/50. School girls 1 WC/25, 1 washbasin/40, 1 drinking water/50 (no urinals). Office male 1 WC/25, 1 washbasin/25, 1 drinking water/100. Office female 1 WC/15, 1 washbasin/25, 1 drinking water/100.
- **Urinal count** (male only, stepped/NBC-style slab): ≤6→0, 7–20→1, 21–45→2, 46–70→3, 71–100→4; above 100, base 4 plus `ceil((min(count,200)-100) * 0.03)` for the 101–200 band, plus `ceil((count-200) * 0.025)` for anything above 200 — each band's contribution is tracked as a separate "step" for display.
- **Retail fixtures**: if male or female staff count > 100, falls back entirely to the office fixture rates (`getOfficeFixtures`) — code comment explains NBC Table 15 only tabulates WC counts for ≤100 person populations, so there's no alternate slab-based rate for urinal/washbasin/drinking-water at any population size, nor for WC above 100.
- **Regulation cross-references embedded in the UI** (not in the JSON): DCPR Table 13 Sr. 2 (school), Sr. 5 (retail), Sr. 6 (office); DCPR Reg 36 & Reg 39 Cl. 3.5; NBC 2016 Part 9, Table 1 (office-style fixture rates) and Table 15 (school/retail staff WC slabs).
- **DA (differently-abled) toilet note**: mandatory on every single result screen, sourced from `da_toilet` in the JSON, plus a hardcoded (not in JSON) line "Handrails: vertical and horizontal, 50mm clearance from wall" and "Cleaner's sink: 1 per floor" appended directly in JSX.

---

## 2. Deviation System — data model exists, UI creation flow does not

`DCPR_MASTER_BRIEF.md` Section 8 specifies (verbatim):

```json
{
  "id": "uuid",
  "rule_ref": "Reg 37 — side margin",
  "regulation_text": "H/5 minimum 3m",
  "override_value": "3.0m fixed",
  "reason": "Minimum applicable",
  "approved_by": "structural consultant",
  "date": "2026-06-22",
  "locked": true
}
```

with a stated behavior: "Every project stores two layers — Layer 1 (base DCPR rules, never changed), Layer 2 (project-specific overrides). When a calculation runs, it checks Layer 2 first. If an override exists, it uses that. Otherwise uses Layer 1."

**What's actually built, verified by reading every reference to `deviation`/`Deviation` in the code (only 2 files match: `NewProject.jsx`, `ProjectDashboard.jsx`):**
- `NewProject.jsx` initializes every new project with `deviations: []` — there is **no field, button, form, or step anywhere in the wizard** to add a deviation.
- `ProjectDashboard.jsx` **displays** `project.deviations` as amber warning flags (`{deviation.rule_ref}: {deviation.override_value} — {deviation.reason}`), matching the design brief's amber-flag component spec exactly (`#FEF3D8` bg, `#8B5E0A` text, 3px `#F0C040` left border) — but this is read-only rendering of an array that nothing ever populates.
- **Neither `parkingCalc.js` nor `toiletCalc.js` ever reads `project.deviations` or any "Layer 2 override" at all.** Both modules compute purely from the static rates JSON (Layer 1). The "checks Layer 2 first" behavior described in the brief is entirely unimplemented — there is no override-lookup code path anywhere in the calculation engines.
- No "locked" unlock mechanism exists (no code references `deviation.locked`).

**Conclusion: the deviation system is scaffolding only** — a correctly-shaped data field flowing through `storage.js`/project object, and a passive display component, with the entire creation UI and the override-injection-into-calculations logic missing.

---

## 3. Project-creation branching question flow

`src/data/projectQuestions.json` and `NewProject.jsx` implement the flow **exactly** as specified in `DCPR_MASTER_BRIEF.md` Section 5 — screens 1–4, the same 6 base questions, the same development-type options, and the same branch questions per development type (self-redevelopment, 33(5), 33(7), 33(7A), 33(9), 33(10)), field-for-field, option-for-option. No additional depth or fields exist beyond what's already in your master brief.

Two implementation details **not stated in the brief**:
- If the selected development type has zero branch questions (`new_development` or `not_decided`), Step 3's "Next" button is relabeled "Create Project" and clicking it calls `handleFinish()` directly — the wizard never shows an empty Step 4.
- `shouldShowQuestion()` implements the `use_mix` multi-select's conditional visibility (`showIf: { key: "primary_use", equals: "Mixed" }`) generically off the JSON — any future question could reuse this same `showIf` mechanism without new code.

---

## 4. Other findings not in either brief document

- **Storage backend is already Supabase in code, not localStorage.** Commit `96d121f` fully migrated `storage.js` off `localStorage` to `@supabase/supabase-js` (table `projects`, row shape `{ id, updated_at, data }`, using `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY` env vars via `supabaseClient.js`). `DCPR_MASTER_BRIEF.md` Section 4 still describes localStorage as "Current" and Supabase as "Future (one function swap)" — the actual code is a generation ahead of what the brief documents.
- **A full calculator version-history feature exists**, undocumented in either brief: `storage.saveCalculationResult()` and `storage.saveCalculatorVersion()`. Every calculator run can be saved as a named, dated version (`window.prompt` for an optional label) via a "Save Version" button; versions accumulate per calculator per project (`project.calculations.parking.versions[]`); a version panel lists all saved versions (grouped by typology for Toilets) and clicking one reloads its full input snapshot and result back into the form. This is a materially significant feature with no spec anywhere in the two brief documents.
- **Calculators pre-fill from project context.** Both `Parking.jsx` and `Toilets.jsx` read a `?projectId=` query param, fetch the project via `storage.getProject`, and auto-select/pre-check typology inputs based on `project.parameters.primary_use` and `use_mix` (e.g. primary_use "Mixed" with `use_mix` containing "Retail" auto-checks Shopping/Convenience in Parking and auto-selects "retail" in Toilets). Not mentioned in either brief.
- **Rule versioning is implemented but undocumented in the storage spec.** Both rates JSON files carry `rule_version: "DCPR_2034_v1"`, `valid_from`/`valid_to`, and every calculation result embeds its `rule_version`; `storage.saveCalculationResult` stores that version alongside the result. The master brief's `calculations` object schema doesn't show a `rule_version` or `versions[]` field at all — the actual project object shape has grown beyond what's documented.
- **Print/PDF mechanism resolves a conflict the coding rules create.** CLAUDE.md/master brief mandate "inline styles only — no CSS classes," but `@media print` rules cannot be expressed via the inline `style` prop. The actual solution (after an earlier commit tried a JS `beforeprint`/`afterprint` hack, later replaced): a single injected `<style>{'@media print { .dcpr-print-hide { display: none !important; } }'}</style>` tag per page, with exactly one CSS class (`dcpr-print-hide`) applied to `Nav`, `Sidebar`, and each calculator's input panel/buttons. This is the sole, deliberate exception to the "no CSS classes" rule anywhere in the codebase.
- **Sidebar and ProjectDashboard module lists have drifted apart.** Commit `d007f08` deliberately shortened `Sidebar.jsx` from the brief's 7 modules to 5 ("remove Stairs and Lifts, renumber") — it now shows only Parking(01)/FSI(02, unbuilt)/Toilets(03)/Refuge(04, unbuilt)/Open Space(05, unbuilt), permanently dropping Staircase and Lifts from the nav entirely. `ProjectDashboard.jsx`'s own `CALCULATOR_MODULES` constant, however, still lists all 7 in the brief's original order and numbering (01–07 including Staircase and Lifts). The two lists are now inconsistent with each other, and this inconsistency isn't called out anywhere in the brief docs (which still describe 7 sidebar items).
- **`DCPR_TEST_LOG.md` doesn't exist.** The master brief (Section 11) states it's "updated by Claude Code with every push," but it was never created/committed in this repo despite ~28 commits of build history.
- **`AiPanel.jsx` doesn't exist.** Listed in the brief's locked folder structure as a Phase 5 component; `Sidebar.jsx` instead hardcodes a static, non-functional "Ask DCPR AI" panel (sample question text + inert button) directly in-component rather than as a separate file.
- **The "no spread operators" rule is worked around, not avoided**, via `Object.assign({}, obj)` for shallow copies and `.slice()`/`.concat()`/`.indexOf()`/`.splice()` for array operations everywhere state is updated immutably (e.g. `NewProject.jsx`, `Parking.jsx` version arrays). Worth knowing if replicating the "var, no spread, no optional chaining" constraint set — this is the idiomatic escape hatch the legacy project settled on.
- **Stack addition not in the brief's "Stack" section**: `react-router-dom ^6.26.2` (`BrowserRouter`/`Routes`/`Route`/`Link`/`useParams`/`useSearchParams`/`useLocation`) is used throughout for all routing — the brief only states "React + Vite" and "No external libraries unless in DCPR_MASTER_BRIEF.md," but router usage itself is never listed as an approved library anywhere in the document.
- **`.claude/settings.json`** pre-approves exactly: `git status`, `git diff *`, `git log *`, `npm run *`, `npm install`, `npm ci` — matches CLAUDE.md's stated session-setup note precisely (no drift here).
