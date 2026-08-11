"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// DESIGN_BRIEF.md §2 Sidebar spec: 220px fixed, sand bg, forest active bg,
// white active text, ink inactive text. The brief's mockup numbers
// calculator entries (01 Parking, 02 FSI, ...) — that numbering is
// Milestone 6 scope. Home/Projects/Settings/Profile are app-level nav
// items, not a calculator list, so they render without number prefixes
// (design judgment call — see SESSION_LOG.md).
const SIDEBAR_LINKS = [
  { href: "/dashboard", label: "Home" },
  { href: "/dashboard/projects", label: "Projects" },
  { href: "/dashboard/settings", label: "Settings" },
  { href: "/dashboard/profile", label: "Profile" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Main"
      className="flex w-[220px] shrink-0 flex-col gap-1 border-r border-border bg-sand p-4"
    >
      {SIDEBAR_LINKS.map((link) => {
        const isActive =
          link.href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={isActive ? "page" : undefined}
            className={
              isActive
                ? "rounded-button bg-forest px-3 py-2 text-sidebar-label text-white"
                : "rounded-button px-3 py-2 text-sidebar-label text-ink hover:bg-forest/10"
            }
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
