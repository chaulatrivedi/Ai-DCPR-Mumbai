import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("../../actions", () => ({ signIn: vi.fn() }));

import { LoginForm } from "@/app/(auth)/login/login-form";

describe("LoginForm", () => {
  it("carries the next destination through as a hidden field, so signIn can redirect back to it", () => {
    render(<LoginForm next="/dashboard/profile" />);

    const hiddenNext = document.querySelector('input[type="hidden"][name="next"]');
    expect(hiddenNext).toHaveValue("/dashboard/profile");
  });

  it("omits the hidden next field when there is nothing to return to", () => {
    render(<LoginForm />);

    expect(document.querySelector('input[type="hidden"][name="next"]')).not.toBeInTheDocument();
  });

  it("still shows an initialError passed from the URL", () => {
    render(<LoginForm initialError="Invalid credentials" />);
    expect(screen.getByText("Invalid credentials")).toBeInTheDocument();
  });
});
