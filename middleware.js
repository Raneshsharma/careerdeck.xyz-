import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

export async function middleware(request) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  const { pathname, search } = request.nextUrl;
  const redirectTo = encodeURIComponent(pathname + search);

  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth";
    url.search = `?redirectTo=${redirectTo}`;
    return NextResponse.redirect(url);
  }

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, onboarded")
      .eq("id", user.id)
      .single();

    if (!profile && pathname !== "/onboarding") {
      const url = request.nextUrl.clone();
      url.pathname = "/onboarding";
      url.search = `?redirectTo=${redirectTo}`;
      return NextResponse.redirect(url);
    }

    if (profile && !profile.onboarded && pathname !== "/onboarding") {
      const url = request.nextUrl.clone();
      url.pathname = "/onboarding";
      url.search = `?redirectTo=${redirectTo}`;
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|logo.png|api/auth|auth).*)",
    "/",
    "/(api|trpc)(.*)",
  ],
};
