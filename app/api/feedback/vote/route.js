import { createClient } from "@/lib/supabase-server";
import { supabase } from "@/lib/supabase";

export async function POST(request) {
  try {
    const supabaseAuth = await createClient();
    const { data: { user } } = await supabaseAuth.auth.getUser();

    const body = await request.json().catch(() => ({}));
    const { dossierId, sectionKey, vote } = body;

    if (!dossierId || !sectionKey || vote === undefined) {
      return Response.json({ error: "dossierId, sectionKey, and vote are required" }, { status: 400 });
    }

    if (vote === 0) {
      const { error } = await supabase
        .from("section_feedback")
        .delete()
        .eq("dossier_id", dossierId)
        .eq("section_key", sectionKey)
        .eq("user_id", user?.id || null);
      if (error) {
        return Response.json({ error: "Failed to remove vote" }, { status: 500 });
      }
    } else if ([1, -1].includes(vote)) {
      const { error } = await supabase.from("section_feedback").upsert({
        dossier_id: dossierId,
        section_key: sectionKey,
        vote,
        user_id: user?.id || null,
      }, { onConflict: "user_id, dossier_id, section_key" });
      if (error) {
        return Response.json({ error: "Failed to save vote" }, { status: 500 });
      }
    } else {
      return Response.json({ error: "vote must be 1, -1, or 0" }, { status: 400 });
    }

    const { data: tally } = await supabase
      .from("section_feedback")
      .select("vote")
      .eq("dossier_id", dossierId)
      .eq("section_key", sectionKey);

    const likes = tally?.filter((r) => r.vote === 1).length || 0;
    const dislikes = tally?.filter((r) => r.vote === -1).length || 0;

    return Response.json({ likes, dislikes });
  } catch (e) {
    console.error("Vote error:", e);
    return Response.json({ error: "Failed to save vote" }, { status: 500 });
  }
}
