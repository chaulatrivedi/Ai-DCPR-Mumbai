// Dark Mode (TASKS-M2-M3-loop-goal.md, decided 2026-08-09): browser-only
// localStorage, not tied to a Supabase account — works pre-login, no DB
// round-trip. Light is always the default when nothing is stored yet
// (DESIGN_BRIEF.md §8: never default to dark mode).
export const THEME_STORAGE_KEY = "theme";

export type Theme = "light" | "dark";

export function getStoredTheme(): Theme {
  try {
    return window.localStorage.getItem(THEME_STORAGE_KEY) === "dark"
      ? "dark"
      : "light";
  } catch {
    return "light";
  }
}

export function applyTheme(theme: Theme): void {
  document.documentElement.classList.toggle("dark", theme === "dark");
}

export function setStoredTheme(theme: Theme): void {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // localStorage unavailable (private browsing, etc.) — theme just
    // won't persist across reloads; still applies for this session.
  }
  applyTheme(theme);
}
