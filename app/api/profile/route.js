import { createClient } from "@/lib/supabase-server";
import { supabase } from "@/lib/supabase";
import { FREE_MONTHLY_LIMIT } from "@/lib/generation-limits"

export async function GET() {
  const supabaseAuth = await createClient();
  const { data: { user } } = await supabaseAuth.auth.getUser();
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  let profile = null
  let usedThisMonth = 0
  let recent = []

  try {
    const { data } = await supabase
      .from("profiles")
      .select("name, email, avatar_url, industry, experience_level, plan_tier, onboarded")
      .eq("id", user.id)
      .single()
    profile = data
  } catch (err) {
    console.error("Profile fetch error:", err)
  }

  try {
    const { data, count } = await supabase
      .from("generations")
      .select("id, dossier_type, company_name, role, created_at", { count: "exact", head: false })
      .eq("user_id", user.id)
      .gte("created_at", new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())
      .order("created_at", { ascending: false })
      .limit(10)
    recent = data || []
    usedThisMonth = count ?? recent.length
  } catch (err) {
    console.error("Generations fetch error:", err)
  }

  const planLimit = (profile?.plan_tier === "free" || !profile?.plan_tier) ? FREE_MONTHLY_LIMIT : 9999

  return Response.json({
    profile,
    usage: {
      used: usedThisMonth,
      limit: planLimit,
      recent,
    },
  })
}
