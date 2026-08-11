// Provisional list (TASKS-M2-M3-loop-goal.md, Task 3.1) — pending
// refinement once Milestone 4 ingests the actual DCPR regulation text.
export const OCCUPANCY_TYPES = [
  "Residential",
  "Educational",
  "Institutional",
  "Assembly",
  "Business",
  "Mercantile",
  "Industrial",
  "Storage",
  "Hazardous",
  "Mixed-Use",
] as const;

export type OccupancyType = (typeof OCCUPANCY_TYPES)[number];

export function isOccupancyType(value: string): value is OccupancyType {
  return (OCCUPANCY_TYPES as readonly string[]).includes(value);
}
