import { createClient } from "@/lib/supabase-server";
import { supabase } from "@/lib/supabase";

export async function POST(request) {
  try {
    const supabaseAuth = await createClient();
    const { data: { user } } = await supabaseAuth.auth.getUser();

    const body = await request.json().catch(() => ({}));
    const { dossierId, sectionKey, vote, dossierType } = body;

    if (!dossierId || !sectionKey || vote === undefined) {
      return Response.json({ error: "dossierId, sectionKey, and vote are required" }, { status: 400 });
    }

    if (vote === 0) {
      // Remove vote (toggle off)
      await supabase
        .from("section_feedback")
        .delete()
        .eq("dossier_id", dossierId)
        .eq("section_key", sectionKey)
        .eq("user_id", user?.id || null);
    } else if ([1, -1, -2].includes(vote)) {
      await supabase.from("section_feedback").upsert({
        dossier_id:   dossierId,
        section_key:  sectionKey,
        vote,
        user_id:      user?.id || null,
        dossier_type: dossierType || null,
      }, { onConflict: "user_id,dossier_id,section_key" });
    } else {
      return Response.json({ error: "vote must be 1, -1, -2, or 0" }, { status: 400 });
    }

    // Return fresh tally for this section
    const { data: tally } = await supabase
      .from("section_feedback")
      .select("vote")
      .eq("dossier_id", dossierId)
      .eq("section_key", sectionKey);

    const helpful   = tally?.filter(r => r.vote === 1).length  || 0;
    const needsWork = tally?.filter(r => r.vote === -1).length || 0;
    const wrongInfo = tally?.filter(r => r.vote === -2).length || 0;

    return Response.json({ helpful, needsWork, wrongInfo, likes: helpful, dislikes: needsWork });
  } catch (e) {
    console.error("Vote error:", e);
    return Response.json({ error: "Failed to save vote" }, { status: 500 });
  }
}

