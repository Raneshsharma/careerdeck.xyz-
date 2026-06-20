import { getServerSession } from "next-auth"
import { authConfig } from "@/lib/auth.config"
import { supabase } from "@/lib/supabase"
import { FREE_MONTHLY_LIMIT } from "@/lib/generation-limits"

export async function GET() {
  const session = await getServerSession(authConfig)
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  let profile = null
  let usedThisMonth = 0
  let recent = []

  try {
    const { data } = await supabase
      .from("profiles")
      .select("name, email, avatar_url, industry, experience_level, plan_tier, onboarded")
      .eq("id", session.user.id)
      .single()
    profile = data
  } catch {}

  try {
    const { data, count } = await supabase
      .from("generations")
      .select("id, dossier_type, company_name, role, created_at", { count: "exact", head: false })
      .eq("user_id", session.user.id)
      .gte("created_at", new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())
      .order("created_at", { ascending: false })
      .limit(10)
    recent = data || []
    usedThisMonth = count ?? recent.length
  } catch {}

  const planLimit = profile?.plan_tier === "free" ? FREE_MONTHLY_LIMIT : 9999

  return Response.json({
    profile,
    usage: {
      used: usedThisMonth,
      limit: planLimit,
      recent,
    },
  })
}
