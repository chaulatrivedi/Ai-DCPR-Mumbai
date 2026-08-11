import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { applyTheme, getStoredTheme, setStoredTheme } from "@/lib/theme";

beforeEach(() => {
  window.localStorage.clear();
  document.documentElement.classList.remove("dark");
});

afterEach(() => {
  window.localStorage.clear();
  document.documentElement.classList.remove("dark");
});

describe("theme", () => {
  it("defaults to light when nothing is stored", () => {
    expect(getStoredTheme()).toBe("light");
  });

  it("applies the dark class to <html> when set to dark", () => {
    applyTheme("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("removes the dark class when set to light", () => {
    applyTheme("dark");
    applyTheme("light");
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  it("persists the choice so a fresh read (simulated reload) sees it", () => {
    setStoredTheme("dark");

    // Simulate a reload: nothing but localStorage carries over.
    document.documentElement.classList.remove("dark");
    expect(getStoredTheme()).toBe("dark");
  });
});
