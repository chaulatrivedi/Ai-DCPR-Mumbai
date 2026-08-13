import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  usePathname: () => "/dashboard/projects",
}));

vi.mock("@/app/(auth)/actions", () => ({ signOut: vi.fn() }));

import { NavBar } from "@/components/layout/nav-bar";

describe("NavBar", () => {
  it("renders a Log out action, present regardless of which page NavBar mounts on", () => {
    // usePathname is mocked above to a non-dashboard-home page — NavBar is
    // part of the shared DashboardLayout, not a per-page control, so the
    // Log out action must render here too, not just on /dashboard.
    render(<NavBar />);

    const logoutButton = screen.getByRole("button", { name: "Log out" });
    expect(logoutButton.closest("form")).toBeInTheDocument();
  });

  it("links to Home and Projects, and marks the current page active", () => {
    render(<NavBar />);

    const home = screen.getByRole("link", { name: "Home" });
    const projects = screen.getByRole("link", { name: "Projects" });

    expect(home).toHaveAttribute("href", "/dashboard");
    expect(projects).toHaveAttribute("href", "/dashboard/projects");

    // active link (current pathname) gets the sand/terracotta-underline treatment
    expect(projects.className).toContain("border-terracotta");
    expect(home.className).not.toContain("border-terracotta");
  });

  it("does not render Calculators, Regulations, or Ask AI links", () => {
    render(<NavBar />);
    expect(screen.queryByText(/Calculator/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Regulation/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Ask AI/i)).not.toBeInTheDocument();
  });

  it("greets the user by display name when one is provided", () => {
    render(<NavBar displayName="Chaula T." />);
    expect(screen.getByText("Welcome, Chaula T.")).toBeInTheDocument();
  });

  it("shows no greeting when there is no display name yet", () => {
    render(<NavBar />);
    expect(screen.queryByText(/Welcome,/)).not.toBeInTheDocument();
  });
});
