import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const updateProjectMock = vi.fn();
vi.mock("../../../actions", () => ({
  updateProject: (...args: unknown[]) => updateProjectMock(...args),
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
  use_mix: null,
  deleted_at: null,
  created_at: "2026-08-01T00:00:00Z",
  updated_at: "2026-08-01T00:00:00Z",
};

const mixedUseProject: Project = {
  ...project,
  occupancy_type: "Mixed-Use",
  use_mix: ["Residential", "Retail"],
};

describe("EditProjectForm", () => {
  beforeEach(() => {
    updateProjectMock.mockClear();
  });

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

  it("hides Use Mix for a non-Mixed-Use project", () => {
    render(<EditProjectForm project={project} />);
    expect(screen.queryByText("Use Mix (optional)")).not.toBeInTheDocument();
  });

  it("shows Use Mix pre-checked with the project's existing selections for a Mixed-Use project", () => {
    render(<EditProjectForm project={mixedUseProject} />);

    expect(screen.getByText("Use Mix (optional)")).toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: "Residential" })).toBeChecked();
    expect(screen.getByRole("checkbox", { name: "Retail" })).toBeChecked();
    expect(screen.getByRole("checkbox", { name: "Commercial" })).not.toBeChecked();
    expect(screen.getByRole("checkbox", { name: "Institutional" })).not.toBeChecked();
  });

  it("saves an updated set of Use Mix selections", async () => {
    const user = userEvent.setup();
    render(<EditProjectForm project={mixedUseProject} />);

    // starts checked with Residential + Retail; uncheck Retail, add Commercial
    await user.click(screen.getByRole("checkbox", { name: "Retail" }));
    await user.click(screen.getByRole("checkbox", { name: "Commercial" }));
    await user.click(screen.getByRole("button", { name: "Save changes" }));

    expect(updateProjectMock).toHaveBeenCalled();
    // updateProject is bound with the project id (updateProject.bind(null, project.id))
    // before being wired into useActionState, so the mock sees (id, prevState, formData).
    const formData = updateProjectMock.mock.calls[0][2] as FormData;
    expect(formData.getAll("useMix")).toEqual(["Residential", "Commercial"]);
  });
});
