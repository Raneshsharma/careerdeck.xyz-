export async function GET() {
  const results = { ok: true, env: {}, checks: {} }

  // Env var presence (not values)
  results.env.SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "MISSING"
  results.env.hasSupabaseUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL
  results.env.hasServiceRoleKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY

  // Supabase connectivity
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const { supabase } = await import("@/lib/supabase")
      const { data, error } = await supabase
        .from("profiles")
        .select("id")
        .limit(1)
      results.checks.supabase = error ? `error: ${error.message}` : "ok"
    } catch (e) {
      results.checks.supabase = `unreachable: ${e.message}`
    }
  } else {
    results.checks.supabase = "not_configured"
  }

  // LLM connectivity
  if (process.env.OPENAI_API_KEY) {
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 8000)
      const res = await fetch("https://api.openai.com/v1/models", {
        headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
        signal: controller.signal,
      })
      clearTimeout(timeout)
      results.checks.llm = res.ok ? "ok" : `error: ${res.status}`
    } catch (e) {
      results.checks.llm = `unreachable: ${e.message}`
    }
  } else {
    results.checks.llm = "not_configured"
  }

  return Response.json(results)
}
