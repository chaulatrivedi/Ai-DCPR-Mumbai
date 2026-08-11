"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { getStoredTheme, setStoredTheme, type Theme } from "@/lib/theme";

export function DarkModeToggle() {
  const [theme, setTheme] = useState<Theme>("light");

  // Reads the already-applied class (set synchronously by the inline
  // script in layout.tsx before hydration) rather than assuming light,
  // so the label doesn't flip immediately after mount for dark-mode users.
  useEffect(() => {
    setTheme(getStoredTheme());
  }, []);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setStoredTheme(next);
    setTheme(next);
  }

  return (
    <Button variant="brief-secondary" onClick={toggle}>
      {theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
    </Button>
  );
}
