import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import DashboardError from "@/app/dashboard/error";

describe("DashboardError", () => {
  it("shows the error message and a way to retry", async () => {
    const reset = vi.fn();
    const user = userEvent.setup();
    render(<DashboardError error={new Error("An unexpected response was received from the server.")} reset={reset} />);

    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    expect(
      screen.getByText("An unexpected response was received from the server."),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Try again" }));
    expect(reset).toHaveBeenCalled();
  });

  it("falls back to a generic message when the error has no message", () => {
    render(<DashboardError error={new Error()} reset={vi.fn()} />);
    expect(screen.getByText("An unexpected error occurred.")).toBeInTheDocument();
  });
});
