import { getServerSession } from "next-auth"
import { authConfig } from "@/lib/auth.config"
import { supabase } from "@/lib/supabase"

export async function DELETE(request, { params }) {
  const session = await getServerSession(authConfig)
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = params

  try {
    const { data: existing } = await supabase
      .from("generations")
      .select("user_id")
      .eq("id", id)
      .single()

    if (!existing || existing.user_id !== session.user.id) {
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
  const session = await getServerSession(authConfig)
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = params

  try {
    const { data, error } = await supabase
      .from("generations")
      .select("id, user_id, dossier_type, company_name, role, created_at")
      .eq("id", id)
      .single()

    if (error || !data) {
      return Response.json({ error: "Not found" }, { status: 404 })
    }

    if (data.user_id !== session.user.id) {
      return Response.json({ error: "Forbidden" }, { status: 403 })
    }

    // Optionally fetch content column (may not exist yet)
    const { data: contentRow } = await supabase
      .from("generations")
      .select("content")
      .eq("id", id)
      .single()
      .catch(() => ({ data: null }))

    return Response.json({ generation: { ...data, content: contentRow?.content || null } })
  } catch (err) {
    console.error("Generation fetch error:", err)
    return Response.json({ error: "Failed to fetch generation" }, { status: 500 })
  }
}

export async function PATCH(request, { params }) {
  const session = await getServerSession(authConfig)
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = params
  const { content } = await request.json()

  if (!content) {
    return Response.json({ error: "Content is required" }, { status: 400 })
  }

  try {
    const { data: existing } = await supabase
      .from("generations")
      .select("user_id")
      .eq("id", id)
      .single()

    if (!existing || existing.user_id !== session.user.id) {
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
