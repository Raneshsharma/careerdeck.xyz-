import { getServerSession } from "next-auth"
import { authConfig } from "@/lib/auth.config"
import { supabase } from "@/lib/supabase"

export async function DELETE() {
  let session
  try {
    session = await getServerSession(authConfig)
  } catch (err) {
    console.error("Delete account session error:", err)
  }
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { error: genErr } = await supabase
      .from("generations")
      .delete()
      .eq("user_id", session.user.id)
    if (genErr) throw genErr

    const { error: profErr } = await supabase
      .from("profiles")
      .delete()
      .eq("id", session.user.id)
    if (profErr) throw profErr
  } catch (err) {
    console.error("Delete account error:", err)
    return Response.json({ error: "Failed to delete account" }, { status: 500 })
  }

  return Response.json({ ok: true })
}
