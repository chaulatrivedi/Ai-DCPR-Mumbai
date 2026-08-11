import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { DarkModeToggle } from "@/components/dark-mode-toggle";

beforeEach(() => {
  window.localStorage.clear();
  document.documentElement.classList.remove("dark");
});

afterEach(() => {
  window.localStorage.clear();
  document.documentElement.classList.remove("dark");
});

describe("DarkModeToggle", () => {
  it("switches to dark mode and persists it on click", async () => {
    const user = userEvent.setup();
    render(<DarkModeToggle />);

    await user.click(screen.getByRole("button", { name: "Switch to Dark Mode" }));

    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(window.localStorage.getItem("theme")).toBe("dark");
    expect(
      screen.getByRole("button", { name: "Switch to Light Mode" }),
    ).toBeInTheDocument();
  });

  it("reflects an already-dark page on mount and can switch back", async () => {
    document.documentElement.classList.add("dark");
    window.localStorage.setItem("theme", "dark");
    const user = userEvent.setup();

    render(<DarkModeToggle />);
    expect(
      await screen.findByRole("button", { name: "Switch to Light Mode" }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Switch to Light Mode" }));
    expect(document.documentElement.classList.contains("dark")).toBe(false);
    expect(window.localStorage.getItem("theme")).toBe("light");
  });
});
