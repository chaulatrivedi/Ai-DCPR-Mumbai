"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { NotificationsMenu } from "./notifications-menu";

// DESIGN_BRIEF.md §5 — Navigation bar (build now, reduced link set per the
// scope note in §4: only Home/Projects exist yet — Calculators/Regs/Ask AI
// land with their own milestones).
const NAV_LINKS = [
  { href: "/dashboard", label: "Home" },
  { href: "/dashboard/projects", label: "Projects" },
];

export function NavBar() {
  const pathname = usePathname();

  return (
    <header className="flex h-12 shrink-0 items-center justify-between bg-ink px-4">
      <div className="flex items-center gap-6">
        <span className="flex items-center gap-2 text-nav-brand font-medium text-sand">
          <span className="text-terracotta" aria-hidden="true">
            ◆
          </span>
          Mumbai DCPR
        </span>
        <nav className="flex items-center gap-4">
          {NAV_LINKS.map((link) => {
            const isActive =
              link.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={
                  isActive
                    ? "border-b-2 border-terracotta pb-1 text-nav-link text-sand"
                    : "border-b-2 border-transparent pb-1 text-nav-link text-muted-foreground hover:text-sand"
                }
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
      <NotificationsMenu />
    </header>
  );
}
