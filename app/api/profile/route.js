import { getServerSession } from "next-auth"
import { authConfig } from "@/lib/auth.config"
import { supabase } from "@/lib/supabase"
import { FREE_MONTHLY_LIMIT } from "@/lib/generation-limits"

export async function GET() {
  const session = await getServerSession(authConfig)
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("name, email, avatar_url, industry, experience_level, plan_tier")
    .eq("id", session.user.id)
    .single()

  const { data: usageData } = await supabase
    .from("generations")
    .select("id, dossier_type, company_name, role, created_at", { count: "exact" })
    .eq("user_id", session.user.id)
    .gte("created_at", new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())
    .order("created_at", { ascending: false })
    .limit(10)

  const planLimit = profile?.plan_tier === "free" ? FREE_MONTHLY_LIMIT : 9999

  return Response.json({
    profile: profile || null,
    usage: {
      used: usageData?.length || 0,
      limit: planLimit,
      recent: usageData || [],
    },
  })
}
