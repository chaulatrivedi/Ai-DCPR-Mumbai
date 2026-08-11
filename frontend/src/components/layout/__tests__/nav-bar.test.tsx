import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  usePathname: () => "/dashboard/projects",
}));

import { NavBar } from "@/components/layout/nav-bar";

describe("NavBar", () => {
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
});
