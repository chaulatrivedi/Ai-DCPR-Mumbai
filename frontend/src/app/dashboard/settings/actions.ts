"use server";

import { createClient } from "@/lib/supabase/server";

export type SettingsActionState = { error?: string; success?: string } | undefined;

// Deliberately separate from (auth)/actions.ts's updatePassword: that one
// backs the password-recovery flow and redirects to /login on success.
// This is a logged-in user changing their password from Settings — they
// should stay right where they are.
export async function updateAccountPassword(
  _prevState: SettingsActionState,
  formData: FormData,
): Promise<SettingsActionState> {
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (password.length < 6) {
    return { error: "Password must be at least 6 characters." };
  }
  if (password !== confirmPassword) {
    return { error: "Passwords do not match." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: error.message };

  return { success: "Password updated." };
}
