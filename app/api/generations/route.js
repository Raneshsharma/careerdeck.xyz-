import { getServerSession } from "next-auth"
import { authConfig } from "@/lib/auth.config"
import { supabase } from "@/lib/supabase"

export async function GET() {
  const session = await getServerSession(authConfig)
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { data, error } = await supabase
      .from("generations")
      .select("id, dossier_type, company_name, role, created_at")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false })
      .limit(20)

    if (error) throw error
    return Response.json({ generations: data || [] })
  } catch (err) {
    console.error("Generations list error:", err)
    return Response.json({ error: "Failed to fetch generations" }, { status: 500 })
  }
}
