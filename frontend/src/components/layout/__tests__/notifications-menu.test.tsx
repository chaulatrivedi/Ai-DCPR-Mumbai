import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { NotificationsMenu } from "@/components/layout/notifications-menu";

describe("NotificationsMenu", () => {
  it("renders without error and starts closed", () => {
    render(<NotificationsMenu />);
    expect(screen.getByRole("button", { name: "Notifications" })).toBeInTheDocument();
    expect(screen.queryByText("No notifications yet.")).not.toBeInTheDocument();
  });

  it("shows a genuine empty state when opened", async () => {
    const user = userEvent.setup();
    render(<NotificationsMenu />);

    await user.click(screen.getByRole("button", { name: "Notifications" }));

    expect(screen.getByText("No notifications yet.")).toBeInTheDocument();
  });
});
