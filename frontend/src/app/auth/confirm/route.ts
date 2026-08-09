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
  const next = searchParams.get("next") ?? "/dashboard";

  if (token_hash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash });
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(
    `${origin}/login?error=Could not verify the link. Please try again.`,
  );
}
