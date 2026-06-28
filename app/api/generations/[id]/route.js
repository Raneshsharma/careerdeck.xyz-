import { createClient } from "@/lib/supabase-server";
import { supabase } from "@/lib/supabase"

export async function DELETE(request, { params }) {
  const supabaseAuth = await createClient();
  const { data: { user } } = await supabaseAuth.auth.getUser();
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = params

  try {
    const { data: existing } = await supabase
      .from("generations")
      .select("user_id")
      .eq("id", id)
      .single()

    if (!existing || existing.user_id !== user.id) {
      return Response.json({ error: "Not found" }, { status: 404 })
    }

    const { error } = await supabase
      .from("generations")
      .delete()
      .eq("id", id)

    if (error) throw error
    return Response.json({ ok: true })
  } catch (err) {
    console.error("Generation delete error:", err)
    return Response.json({ error: "Failed to delete generation" }, { status: 500 })
  }
}

export async function GET(request, { params }) {
  try {
    const supabaseAuth2 = await createClient();
    const { data: { user: user2 } } = await supabaseAuth2.auth.getUser();
    if (!user2) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = params

    const { data, error } = await supabase
      .from("generations")
      .select("id, user_id, dossier_type, company_name, role, created_at")
      .eq("id", id)
      .single()

    if (error || !data) {
      console.error("GET generation supabase error:", error, "data:", data)
      return Response.json({ error: "Not found" }, { status: 404 })
    }

    if (data.user_id !== user2.id) {
      return Response.json({ error: "Forbidden" }, { status: 403 })
    }

    let content = null
    const { data: contentData } = await supabase
      .from("generations")
      .select("content")
      .eq("id", id)
      .single()
    if (contentData) content = contentData.content

    return Response.json({ generation: { ...data, content } })
  } catch (err) {
    console.error("Generation fetch error:", err?.message || err, "stack:", err?.stack)
    return Response.json({ error: "Failed to fetch generation" }, { status: 500 })
  }
}

export async function PATCH(request, { params }) {
  const supabaseAuth3 = await createClient();
  const { data: { user: user3 } } = await supabaseAuth3.auth.getUser();
  if (!user3) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = params
  const { content } = await request.json()

  if (!content || content.length > 500000) {
    return Response.json({ error: "Content required and must be ≤500,000 characters" }, { status: 400 })
  }

  try {
    const { data: existing } = await supabase
      .from("generations")
      .select("user_id")
      .eq("id", id)
      .single()

    if (!existing || existing.user_id !== user3.id) {
      return Response.json({ error: "Not found" }, { status: 404 })
    }

    const { error } = await supabase
      .from("generations")
      .update({ content })
      .eq("id", id)

    if (error) {
      // If column doesn't exist, ignore silently
      if (error.message?.includes("column") || error.code === "PGRST204") {
        return Response.json({ ok: true, note: "content column not available" })
      }
      throw error
    }
    return Response.json({ ok: true })
  } catch (err) {
    console.error("Generation update error:", err)
    return Response.json({ error: "Failed to save content" }, { status: 500 })
  }
}
