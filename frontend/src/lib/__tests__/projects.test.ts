import { describe, expect, it } from "vitest";

import { isProjectComplete, type Project } from "@/lib/projects";

const base: Project = {
  id: "1",
  user_id: "u1",
  name: "Test Project",
  occupancy_type: "Residential",
  plot_area: 500,
  road_width: null,
  zoning: null,
  deleted_at: null,
  created_at: "2026-08-01T00:00:00Z",
  updated_at: "2026-08-01T00:00:00Z",
};

describe("isProjectComplete", () => {
  it("is incomplete when created with only the 3 required fields", () => {
    expect(isProjectComplete(base)).toBe(false);
  });

  it("is still incomplete with only one of Road Width / Zoning filled", () => {
    expect(isProjectComplete({ ...base, road_width: 9 })).toBe(false);
    expect(isProjectComplete({ ...base, zoning: "R2" })).toBe(false);
  });

  it("is complete once both Road Width and Zoning are filled", () => {
    expect(isProjectComplete({ ...base, road_width: 9, zoning: "R2" })).toBe(true);
  });
});
