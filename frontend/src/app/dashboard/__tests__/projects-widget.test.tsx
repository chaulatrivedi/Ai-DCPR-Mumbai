import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ProjectsWidget } from "@/app/dashboard/projects-widget";
import type { Project } from "@/lib/projects";

function makeProject(overrides: Partial<Project> = {}): Project {
  return {
    id: crypto.randomUUID(),
    user_id: "u1",
    name: "Test Project",
    occupancy_type: "Residential",
    plot_area: 500,
    road_width: 9,
    zoning: "R2",
    deleted_at: null,
    created_at: "2026-08-01T00:00:00Z",
    updated_at: "2026-08-01T00:00:00Z",
    ...overrides,
  };
}

describe("ProjectsWidget", () => {
  it("shows a clear empty state with zero projects", () => {
    render(<ProjectsWidget projects={[]} />);
    expect(
      screen.getByText(/don.t have any projects yet/i),
    ).toBeInTheDocument();
    expect(screen.queryByText(/^\d+ projects?$/i)).not.toBeInTheDocument();
  });

  it("reflects the real project count for the logged-in user", () => {
    const projects = [makeProject({ name: "A" }), makeProject({ name: "B" })];
    render(<ProjectsWidget projects={projects} />);
    expect(screen.getByText("2 projects")).toBeInTheDocument();
    expect(screen.getByText("A")).toBeInTheDocument();
    expect(screen.getByText("B")).toBeInTheDocument();
  });

  it("uses singular phrasing for exactly one project", () => {
    render(<ProjectsWidget projects={[makeProject()]} />);
    expect(screen.getByText("1 project")).toBeInTheDocument();
  });

  it("links each project card to its Project Dashboard page", () => {
    const project = makeProject({ name: "Linked Project" });
    render(<ProjectsWidget projects={[project]} />);
    expect(screen.getByRole("link", { name: /Linked Project/ })).toHaveAttribute(
      "href",
      `/dashboard/projects/${project.id}`,
    );
  });
});
