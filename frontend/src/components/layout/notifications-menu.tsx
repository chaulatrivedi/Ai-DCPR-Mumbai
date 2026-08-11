"use client";

import { Bell } from "lucide-react";
import { useState } from "react";

// Functional shell only — nothing in the app generates real notifications
// yet, so this always shows the empty state. Not in DESIGN_BRIEF.md's
// build-now component list explicitly, but the nav bar is, and this lives
// inside it; styled from the same tokens (ink bg, sand/muted text, card
// panel), no bespoke CSS.
export function NotificationsMenu() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Notifications"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex items-center justify-center rounded-button p-1.5 text-sand hover:bg-white/10"
      >
        <Bell size={16} />
      </button>
      {open && (
        <div className="absolute right-0 z-10 mt-2 w-64 rounded-card border-[0.5px] border-border bg-card p-4 text-ink shadow-none">
          <p className="text-card-title font-medium">Notifications</p>
          <p className="mt-2 text-muted-body text-muted-foreground">
            No notifications yet.
          </p>
        </div>
      )}
    </div>
  );
}
