import { createClient } from "@/lib/supabase-server";
import { supabase } from "@/lib/supabase";

export async function POST(request) {
  try {
    const supabaseAuth = await createClient();
    const { data: { user } } = await supabaseAuth.auth.getUser();

    const body = await request.json().catch(() => ({}));
    const { dossierId, sectionKey, comment } = body;

    if (!dossierId || !sectionKey || !comment?.trim()) {
      return Response.json({ error: "dossierId, sectionKey, and comment are required" }, { status: 400 });
    }

    if (comment.length > 2000) {
      return Response.json({ error: "Comment must be ≤2000 characters" }, { status: 400 });
    }

    const { error } = await supabase.from("section_comments").insert({
      dossier_id: dossierId,
      section_key: sectionKey,
      comment: comment.trim(),
      user_id: user?.id || null,
    });

    if (error) {
      console.error("Comment insert error:", error.message);
      return Response.json({ error: "Failed to save comment" }, { status: 500 });
    }

    return Response.json({ ok: true });
  } catch (e) {
    console.error("Comment error:", e);
    return Response.json({ error: "Failed to save comment" }, { status: 500 });
  }
}
