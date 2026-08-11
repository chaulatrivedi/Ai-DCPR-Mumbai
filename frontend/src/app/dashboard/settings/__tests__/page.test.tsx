import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("../actions", () => ({
  updateAccountPassword: vi.fn(),
}));
vi.mock("@/app/(auth)/actions", () => ({
  signOut: vi.fn(),
}));

import SettingsPage from "@/app/dashboard/settings/page";

describe("SettingsPage", () => {
  it("loads with a password change form, appearance toggle, and sign out", () => {
    render(<SettingsPage />);

    expect(screen.getByText("Settings")).toBeInTheDocument();
    expect(screen.getByLabelText("New password")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Switch to Dark Mode" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sign out" })).toBeInTheDocument();
  });
});
