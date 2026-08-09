import { NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/server";

// Landing point for Supabase email links (signup confirmation, password
// reset). Uses `token_hash` + `verifyOtp` rather than the PKCE `code` +
// `exchangeCodeForSession` flow: verifyOtp is a stateless server-side
// lookup, so it works regardless of which browser/device/tab opens the
// link. exchangeCodeForSession requires a `code_verifier` cookie set on
// the same browser that originally requested the email, which email
// links routinely violate (webmail, a different device, or the email
// provider's link-scanning bot pre-fetching the URL) — see DECISIONS.md.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;

  if (token_hash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash });
    if (!error) {
      // A recovery session is not a normal login: it must always land on
      // the reset-password form so the user actually sets a new password,
      // regardless of what `next` says (or whether it's present at all —
      // a missing/misconfigured `next` must never drop the user into
      // /dashboard already signed in).
      const next =
        type === "recovery"
          ? "/reset-password"
          : (searchParams.get("next") ?? "/dashboard");
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(
    `${origin}/login?error=Could not verify the link. Please try again.`,
  );
}
