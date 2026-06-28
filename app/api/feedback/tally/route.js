import { supabase } from "@/lib/supabase";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const dossierId = searchParams.get("dossierId");
  const sectionKey = searchParams.get("sectionKey");

  if (!dossierId || !sectionKey) {
    return Response.json({ error: "dossierId and sectionKey are required" }, { status: 400 });
  }

  try {
    const { data } = await supabase
      .from("section_feedback")
      .select("vote")
      .eq("dossier_id", dossierId)
      .eq("section_key", sectionKey);

    const likes = data?.filter((r) => r.vote === 1).length || 0;
    const dislikes = data?.filter((r) => r.vote === -1).length || 0;

    return Response.json({ likes, dislikes });
  } catch (e) {
    console.error("Tally error:", e);
    return Response.json({ likes: 0, dislikes: 0 }, { status: 500 });
  }
}
