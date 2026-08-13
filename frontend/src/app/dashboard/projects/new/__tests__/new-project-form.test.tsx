import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

// The real actions.ts is a "use server" module that pulls in next/headers
// (via @/lib/supabase/server) — not usable outside a Next request context,
// so it's stubbed here. This test only exercises client-side form markup.
// Path is relative to this file (src/app/.../new/__tests__/), one level
// deeper than new-project-form.tsx's own "../actions" import — it must
// resolve to the same src/app/dashboard/projects/actions.ts module for the
// mock to actually intercept what the component imports.
const createProjectMock = vi.fn();
vi.mock("../../actions", () => ({
  createProject: (...args: unknown[]) => createProjectMock(...args),
}));

import { NewProjectForm } from "@/app/dashboard/projects/new/new-project-form";

describe("NewProjectForm", () => {
  // createProjectMock isn't recreated between tests (it's module-scoped, for
  // vi.mock's hoisting), so .mock.calls keeps accumulating across tests —
  // without this, the two submit tests below would both read call index 0.
  beforeEach(() => {
    createProjectMock.mockClear();
  });

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

  it("hides Use Mix until Occupancy Type is set to Mixed-Use", async () => {
    const user = userEvent.setup();
    render(<NewProjectForm />);

    expect(screen.queryByText("Use Mix (optional)")).not.toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText("Occupancy Type"), "Residential");
    expect(screen.queryByText("Use Mix (optional)")).not.toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText("Occupancy Type"), "Mixed-Use");
    expect(screen.getByText("Use Mix (optional)")).toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: "Residential" })).toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: "Retail" })).toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: "Commercial" })).toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: "Institutional" })).toBeInTheDocument();

    // switching away hides it again, none of the options are required
    await user.selectOptions(screen.getByLabelText("Occupancy Type"), "Residential");
    expect(screen.queryByText("Use Mix (optional)")).not.toBeInTheDocument();
  });

  it("submits every checked Use Mix option when Occupancy Type is Mixed-Use", async () => {
    const user = userEvent.setup();
    render(<NewProjectForm />);

    await user.type(screen.getByLabelText("Project Name"), "Riverside Tower");
    await user.selectOptions(screen.getByLabelText("Occupancy Type"), "Mixed-Use");
    await user.type(screen.getByLabelText("Plot Area"), "1000");
    await user.click(screen.getByRole("checkbox", { name: "Residential" }));
    await user.click(screen.getByRole("checkbox", { name: "Commercial" }));
    await user.click(screen.getByRole("button", { name: "Create Project" }));

    expect(createProjectMock).toHaveBeenCalled();
    const formData = createProjectMock.mock.calls[0][1] as FormData;
    expect(formData.getAll("useMix")).toEqual(["Residential", "Commercial"]);
  });

  it("does not submit any useMix values when Occupancy Type isn't Mixed-Use", async () => {
    const user = userEvent.setup();
    render(<NewProjectForm />);

    await user.type(screen.getByLabelText("Project Name"), "Standard Block");
    await user.selectOptions(screen.getByLabelText("Occupancy Type"), "Residential");
    await user.type(screen.getByLabelText("Plot Area"), "1000");
    await user.click(screen.getByRole("button", { name: "Create Project" }));

    expect(createProjectMock).toHaveBeenCalled();
    const formData = createProjectMock.mock.calls[0][1] as FormData;
    expect(formData.getAll("useMix")).toEqual([]);
  });
});
