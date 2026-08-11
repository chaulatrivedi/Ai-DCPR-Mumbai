import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

const updateDisplayNameMock = vi.fn();
vi.mock("../actions", () => ({
  updateDisplayName: (...args: unknown[]) => updateDisplayNameMock(...args),
}));

import { ProfileForm } from "@/app/dashboard/profile/profile-form";

describe("ProfileForm", () => {
  it("shows the current email as read-only and pre-fills the display name", () => {
    render(<ProfileForm email="chaula@example.com" displayName="Chaula" />);

    const email = screen.getByLabelText("Email");
    expect(email).toHaveValue("chaula@example.com");
    expect(email).toBeDisabled();

    const name = screen.getByLabelText("Display name");
    expect(name).toHaveValue("Chaula");
    expect(name).not.toBeDisabled();
    expect(name).toBeRequired();
  });

  it("the email field cannot be edited by typing into it", async () => {
    const user = userEvent.setup();
    render(<ProfileForm email="chaula@example.com" displayName="Chaula" />);

    const email = screen.getByLabelText("Email");
    await user.type(email, "someone-else@example.com");

    expect(email).toHaveValue("chaula@example.com");
  });

  it("editing the display name and submitting persists it", async () => {
    updateDisplayNameMock.mockResolvedValue({ success: "Saved." });
    const user = userEvent.setup();
    render(<ProfileForm email="chaula@example.com" displayName="Chaula" />);

    const name = screen.getByLabelText("Display name");
    await user.clear(name);
    await user.type(name, "Chaula T.");
    await user.click(screen.getByRole("button", { name: /Save changes|Saving/ }));

    expect(await screen.findByText("Saved.")).toBeInTheDocument();
    expect(updateDisplayNameMock).toHaveBeenCalled();
  });
});
