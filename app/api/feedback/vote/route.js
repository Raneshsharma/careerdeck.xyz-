import { supabase } from "@/lib/supabase";

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { dossierId, sectionKey, vote } = body;

    if (!dossierId || !sectionKey || !vote) {
      return Response.json({ error: "dossierId, sectionKey, and vote are required" }, { status: 400 });
    }

    if (![1, -1].includes(vote)) {
      return Response.json({ error: "vote must be 1 or -1" }, { status: 400 });
    }

    const { error } = await supabase.from("section_feedback").upsert({
      dossier_id: dossierId,
      section_key: sectionKey,
      vote,
      user_id: null,
    }, { onConflict: "user_id, dossier_id, section_key" });

    if (error) {
      console.error("Vote upsert error:", error.message);
      return Response.json({ error: "Failed to save vote" }, { status: 500 });
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
