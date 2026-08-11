import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

// The real actions.ts is a "use server" module that pulls in next/headers
// (via @/lib/supabase/server) — not usable outside a Next request context,
// so it's stubbed here. This test only exercises client-side form markup.
vi.mock("../actions", () => ({
  createProject: vi.fn(),
}));

import { NewProjectForm } from "@/app/dashboard/projects/new/new-project-form";

describe("NewProjectForm", () => {
  it("marks Project Name, Occupancy Type, and Plot Area as required", () => {
    render(<NewProjectForm />);

    expect(screen.getByLabelText("Project Name")).toBeRequired();
    expect(screen.getByLabelText("Occupancy Type")).toBeRequired();
    expect(screen.getByLabelText("Plot Area")).toBeRequired();
  });

  it("leaves Road Width and Zoning optional", () => {
    render(<NewProjectForm />);

    expect(screen.getByLabelText("Road Width (optional)")).not.toBeRequired();
    expect(screen.getByLabelText("Zoning (optional)")).not.toBeRequired();
  });

  it("offers the provisional occupancy type options", () => {
    render(<NewProjectForm />);
    const select = screen.getByLabelText("Occupancy Type");
    expect(
      Array.from(select.querySelectorAll("option")).map((o) => o.textContent),
    ).toContain("Residential");
  });
});
