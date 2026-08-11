import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  RecentCalculationsWidget,
  RecentChatsWidget,
} from "@/app/dashboard/recent-activity-widgets";

describe("RecentChatsWidget", () => {
  it("renders a genuine empty state without error", () => {
    render(<RecentChatsWidget />);
    expect(screen.getByText("Recent Chats")).toBeInTheDocument();
    expect(screen.getByText(/Coming soon/)).toBeInTheDocument();
  });
});

describe("RecentCalculationsWidget", () => {
  it("renders a genuine empty state without error", () => {
    render(<RecentCalculationsWidget />);
    expect(screen.getByText("Recent Calculations")).toBeInTheDocument();
    expect(screen.getByText(/Coming soon/)).toBeInTheDocument();
  });
});
