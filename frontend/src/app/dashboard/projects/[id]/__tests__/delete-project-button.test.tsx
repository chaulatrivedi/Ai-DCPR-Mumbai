import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

vi.mock("../../actions", () => ({
  softDeleteProject: Object.assign(vi.fn(), { bind: () => vi.fn() }),
}));

import { DeleteProjectButton } from "@/app/dashboard/projects/[id]/delete-project-button";

describe("DeleteProjectButton", () => {
  it("requires a confirmation step before deleting", async () => {
    const user = userEvent.setup();
    render(<DeleteProjectButton projectId="11111111-1111-1111-1111-111111111111" />);

    // Only one "Delete" affordance up front — no confirm/cancel yet.
    expect(screen.getByRole("button", { name: "Delete" })).toBeInTheDocument();
    expect(screen.queryByText("Delete this project?")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Delete" }));

    expect(screen.getByText("Delete this project?")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
  });

  it("cancel returns to the unconfirmed state without deleting", async () => {
    const user = userEvent.setup();
    render(<DeleteProjectButton projectId="11111111-1111-1111-1111-111111111111" />);

    await user.click(screen.getByRole("button", { name: "Delete" }));
    await user.click(screen.getByRole("button", { name: "Cancel" }));

    expect(screen.queryByText("Delete this project?")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Delete" })).toBeInTheDocument();
  });
});
