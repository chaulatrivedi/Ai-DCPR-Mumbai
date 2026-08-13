// Task 3.1 follow-up — Use Mix multi-select, shown only when Occupancy
// Type is "Mixed-Use". Distinct list from OCCUPANCY_TYPES (occupancy-types.ts).
export const USE_MIX_OPTIONS = [
  "Residential",
  "Retail",
  "Commercial",
  "Institutional",
] as const;

export type UseMixOption = (typeof USE_MIX_OPTIONS)[number];

export function isUseMixOption(value: string): value is UseMixOption {
  return (USE_MIX_OPTIONS as readonly string[]).includes(value);
}
