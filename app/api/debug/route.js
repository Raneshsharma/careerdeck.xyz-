import { createClient } from "@/lib/supabase-server";

export async function GET() {
  const supabaseAuth = await createClient();
  const { data: { user } } = await supabaseAuth.auth.getUser();
  if (!user || user.email !== (process.env.ADMIN_EMAIL || "raneshsharma33@gmail.com")) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const results = { ok: true, env: {}, checks: {} };

  results.env.SITE_URL = !!process.env.NEXT_PUBLIC_SITE_URL;
  results.env.hasSupabaseUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
  results.env.hasServiceRoleKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const { supabase } = await import("@/lib/supabase");
      const { error } = await supabase.from("profiles").select("id").limit(1);
      results.checks.supabase = error ? "error" : "ok";
    } catch {
      results.checks.supabase = "unreachable";
    }
  } else {
    results.checks.supabase = "not_configured";
  }

  if (process.env.OPENAI_API_KEY) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
      const res = await fetch("https://api.openai.com/v1/models", {
        headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
        signal: controller.signal,
      });
      clearTimeout(timeout);
      results.checks.llm = res.ok ? "ok" : "error";
    } catch {
      results.checks.llm = "unreachable";
    }
  } else {
    results.checks.llm = "not_configured";
  }

  return Response.json(results);
}
