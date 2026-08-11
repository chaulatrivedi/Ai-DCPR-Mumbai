import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("../../../actions", () => ({
  updateProject: vi.fn(),
}));

import { EditProjectForm } from "@/app/dashboard/projects/[id]/edit/edit-project-form";
import type { Project } from "@/lib/projects";

const project: Project = {
  id: "11111111-1111-1111-1111-111111111111",
  user_id: "22222222-2222-2222-2222-222222222222",
  name: "Existing Tower",
  occupancy_type: "Residential",
  plot_area: 750,
  road_width: 9,
  zoning: "R2",
  deleted_at: null,
  created_at: "2026-08-01T00:00:00Z",
  updated_at: "2026-08-01T00:00:00Z",
};

describe("EditProjectForm", () => {
  it("pre-populates every field with the existing project's data", () => {
    render(<EditProjectForm project={project} />);

    expect(screen.getByLabelText("Project Name")).toHaveValue("Existing Tower");
    expect(screen.getByLabelText("Occupancy Type")).toHaveValue("Residential");
    expect(screen.getByLabelText("Plot Area")).toHaveValue(750);
    expect(screen.getByLabelText("Road Width (optional)")).toHaveValue(9);
    expect(screen.getByLabelText("Zoning (optional)")).toHaveValue("R2");
  });

  it("shows a Save changes button", () => {
    render(<EditProjectForm project={project} />);
    expect(screen.getByRole("button", { name: "Save changes" })).toBeInTheDocument();
  });
});
