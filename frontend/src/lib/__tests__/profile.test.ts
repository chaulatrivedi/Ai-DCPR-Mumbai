import type { User } from "@supabase/supabase-js";
import { describe, expect, it } from "vitest";

import { getDisplayName } from "@/lib/profile";

function makeUser(user_metadata: Record<string, unknown>): User {
  return { user_metadata } as unknown as User;
}

describe("getDisplayName", () => {
  it("reads display_name out of user_metadata", () => {
    expect(getDisplayName(makeUser({ display_name: "Chaula T." }))).toBe("Chaula T.");
  });

  it("falls back to an empty string when display_name was never set", () => {
    expect(getDisplayName(makeUser({}))).toBe("");
  });

  it("falls back to an empty string for a non-string display_name", () => {
    expect(getDisplayName(makeUser({ display_name: 42 }))).toBe("");
  });
});
