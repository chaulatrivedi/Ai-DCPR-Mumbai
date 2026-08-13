"use client";

import { LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { signOut } from "@/app/(auth)/actions";
import { NotificationsMenu } from "./notifications-menu";

// DESIGN_BRIEF.md §5 — Navigation bar (build now, reduced link set per the
// scope note in §4: only Home/Projects exist yet — Calculators/Regs/Ask AI
// land with their own milestones).
const NAV_LINKS = [
  { href: "/dashboard", label: "Home" },
  { href: "/dashboard/projects", label: "Projects" },
];

export function NavBar({ displayName }: { displayName?: string }) {
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
      <div className="flex items-center gap-3">
        {displayName && (
          <span className="text-nav-link text-sand">Welcome, {displayName}</span>
        )}
        <NotificationsMenu />
        {/* Renders in every /dashboard/* page via DashboardLayout, so sign-out
            is reachable from anywhere in the app, not just Settings. */}
        <form action={signOut}>
          <button
            type="submit"
            aria-label="Log out"
            className="flex items-center justify-center rounded-button p-1.5 text-sand hover:bg-white/10"
          >
            <LogOut size={16} />
          </button>
        </form>
      </div>
    </header>
  );
}
