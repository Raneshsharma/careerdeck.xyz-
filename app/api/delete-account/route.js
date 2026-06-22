import { createClient } from "@/lib/supabase-server";
import { supabase } from "@/lib/supabase"

export async function DELETE() {
  let user
  try {
    const supabaseAuth = await createClient();
    const { data } = await supabaseAuth.auth.getUser();
    user = data.user;
  } catch (err) {
    console.error("Delete account session error:", err)
  }
  if (!user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { error: genErr } = await supabase
      .from("generations")
      .delete()
      .eq("user_id", user.id)
    if (genErr) throw genErr

    const { error: profErr } = await supabase
      .from("profiles")
      .delete()
      .eq("id", user.id)
    if (profErr) throw profErr

    const { error: authErr } = await supabase.auth.admin.deleteUser(user.id)
    if (authErr) {
      console.error("Failed to delete auth user:", authErr.message)
      return Response.json({ error: "Account data removed but auth deletion failed. Contact support." }, { status: 500 })
    }
  } catch (err) {
    console.error("Delete account error:", err)
    return Response.json({ error: "Failed to delete account" }, { status: 500 })
  }

  return Response.json({ ok: true })
}
