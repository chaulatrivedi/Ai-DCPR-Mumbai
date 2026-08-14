"use client";

import { useSyncExternalStore } from "react";

import { Button } from "@/components/ui/button";
import { getStoredTheme, setStoredTheme, subscribeToTheme, type Theme } from "@/lib/theme";

// Matches the server-rendered default (layout.tsx never has access to
// localStorage during SSR) so hydration's first client render doesn't
// mismatch; useSyncExternalStore then re-reads the real value itself
// without the extra render-then-setState an effect would need.
function getServerTheme(): Theme {
  return "light";
}

export function DarkModeToggle() {
  const theme = useSyncExternalStore(subscribeToTheme, getStoredTheme, getServerTheme);

  function toggle() {
    setStoredTheme(theme === "dark" ? "light" : "dark");
  }

  return (
    <Button variant="brief-secondary" onClick={toggle}>
      {theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
    </Button>
  );
}
