import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || origin;
  const code = searchParams.get("code");
  let next = searchParams.get("next") ?? "/dashboard";
  if (next.includes("@") || next.includes("//") || next.includes("\\") || !next.startsWith("/")) {
    next = "/dashboard";
  }

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("id, onboarded")
          .eq("id", user.id)
          .single();

        if (!profile || !profile.onboarded) {
          const redirectTo = encodeURIComponent(next);
          return NextResponse.redirect(
            `${siteUrl}/onboarding?redirectTo=${redirectTo}`
          );
        }

        return NextResponse.redirect(`${siteUrl}${next}`);
      }
    }
  }

  return NextResponse.redirect(`${siteUrl}/auth?error=auth_callback_error`);
}
