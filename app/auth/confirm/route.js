import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || origin;
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");

  if (tokenHash) {
    const supabase = await createClient();

    if (type === "signup" || type === "email_change") {
      const { error } = await supabase.auth.verifyOtp({
        type: "signup",
        token_hash: tokenHash,
      });
      if (error) {
        return NextResponse.redirect(`${siteUrl}/auth?error=verification_failed`);
      }
    }

    if (type === "recovery") {
      const { error } = await supabase.auth.verifyOtp({
        type: "recovery",
        token_hash: tokenHash,
      });
      if (error) {
        return NextResponse.redirect(`${siteUrl}/auth?error=reset_failed`);
      }
      return NextResponse.redirect(`${siteUrl}/auth?reset=true`);
    }

    const { data: { user } } = await supabase.auth.getUser().catch(() => ({ data: { user: null } }));
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("id, onboarded")
        .eq("id", user.id)
        .single()
        .catch(() => ({ data: null }));

      if (!profile || !profile.onboarded) {
        return NextResponse.redirect(`${siteUrl}/onboarding`);
      }
      return NextResponse.redirect(`${siteUrl}/dashboard`);
    }
  }

  return NextResponse.redirect(`${siteUrl}/auth?error=invalid_link`);
}
