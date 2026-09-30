import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

// Supabase sends people here from the confirmation email. Depending on the
// project's flow it arrives either as ?code= (PKCE), as ?token_hash=&type=
// (the newer email links), or as a #access_token fragment the server never
// sees. The first two are handled here; the third is handled by /auth/confirm.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/onboarding";
  const supabase = await createClient();

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (!error) return NextResponse.redirect(`${origin}${next}`);
    return NextResponse.redirect(`${origin}/auth/confirm?reason=${encodeURIComponent(error.message)}`);
  }

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${next}`);
    return NextResponse.redirect(`${origin}/auth/confirm?reason=${encodeURIComponent(error.message)}`);
  }

  // No recognised query parameters. It may still be a fragment link, which only
  // the browser can read, so hand it to the client page rather than erroring.
  return NextResponse.redirect(`${origin}/auth/confirm`);
}
