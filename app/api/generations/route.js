import { createClient } from "@/lib/supabase-server";
import { supabase } from "@/lib/supabase"

export async function GET() {
  const supabaseAuth = await createClient();
  const { data: { user } } = await supabaseAuth.auth.getUser();
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { data, error } = await supabase
      .from("generations")
      .select("id, dossier_type, company_name, role, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20)

    if (error) throw error
    return Response.json({ generations: data || [] })
  } catch (err) {
    console.error("Generations list error:", err)
    return Response.json({ error: "Failed to fetch generations" }, { status: 500 })
  }
}
