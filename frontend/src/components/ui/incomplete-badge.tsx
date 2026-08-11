// DESIGN_BRIEF.md §7: status pills use 20px radius; amber is the
// warning color (§2). Shown while Road Width and/or Zoning haven't been
// filled in yet (Task 3.6 — Incremental Inputs).
export function IncompleteBadge() {
  return (
    <span className="rounded-pill border border-amber bg-amber/20 px-2 py-0.5 text-reg-tag font-medium text-ink">
      Incomplete
    </span>
  );
}
