import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("../actions", () => ({
  updateAccountPassword: vi.fn(),
}));

import { PasswordForm } from "@/app/dashboard/settings/password-form";

describe("PasswordForm", () => {
  it("requires both fields and enforces a minimum length", () => {
    render(<PasswordForm />);

    const password = screen.getByLabelText("New password");
    const confirm = screen.getByLabelText("Confirm new password");

    expect(password).toBeRequired();
    expect(confirm).toBeRequired();
    expect(password).toHaveAttribute("minLength", "6");
    expect(confirm).toHaveAttribute("minLength", "6");
    expect(password).toHaveAttribute("type", "password");
  });
});
