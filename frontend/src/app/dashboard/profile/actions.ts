"use server";

import { createClient } from "@/lib/supabase/server";

export type ProfileActionState = { error?: string; success?: string } | undefined;

// Email editing is explicitly out of scope (Supabase email-change requires
// re-verification — see TASKS-M2-M3-loop-goal.md). No profiles table exists
// yet, so display name lives in Supabase Auth's user_metadata rather than
// a new table added just for one field.
export async function updateDisplayName(
  _prevState: ProfileActionState,
  formData: FormData,
): Promise<ProfileActionState> {
  const displayName = String(formData.get("displayName") ?? "").trim();
  if (!displayName) return { error: "Display name is required." };

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    data: { display_name: displayName },
  });
  if (error) return { error: error.message };

  return { success: "Saved." };
}
