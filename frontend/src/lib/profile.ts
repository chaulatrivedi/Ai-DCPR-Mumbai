import type { User } from "@supabase/supabase-js";

// Single source of truth for reading display name out of Supabase Auth's
// user_metadata — shared by the Profile page and the NavBar greeting (Task B)
// so both are guaranteed to read the exact same value the same way.
export function getDisplayName(user: User): string {
  return typeof user.user_metadata?.display_name === "string"
    ? user.user_metadata.display_name
    : "";
}
