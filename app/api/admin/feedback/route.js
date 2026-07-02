import { createClient } from "@/lib/supabase-server";
import { supabase } from "@/lib/supabase";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

export async function GET(request) {
  try {
    const supabaseAuth = await createClient();
    const { data: { user } } = await supabaseAuth.auth.getUser();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
    if (ADMIN_EMAIL && user.email !== ADMIN_EMAIL) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const dossierType = searchParams.get("dossierType") || null;
    const exportCsv   = searchParams.get("export") === "csv";
    const page        = parseInt(searchParams.get("page") || "1");
    const pageSize    = 25;
    const offset      = (page - 1) * pageSize;

    const { data: allVotes } = await supabase
      .from("section_feedback")
      .select("vote, dossier_type, section_key, created_at")
      .order("created_at", { ascending: false });

    const { data: allComments } = await supabase
      .from("section_comments")
      .select("id, section_key, dossier_type, comment, created_at")
      .order("created_at", { ascending: false });

    const filteredVotes    = dossierType ? (allVotes    || []).filter(v => v.dossier_type === dossierType) : (allVotes    || []);
    const filteredComments = dossierType ? (allComments || []).filter(c => c.dossier_type === dossierType) : (allComments || []);

    const helpful   = filteredVotes.filter(v => v.vote === 1).length;
    const needsWork = filteredVotes.filter(v => v.vote === -1).length;
    const wrongInfo = filteredVotes.filter(v => v.vote === -2).length;
    const total     = filteredVotes.length;
    const satisfaction = total > 0 ? Math.round((helpful / total) * 100) : 0;

    const sectionMap = {};
    for (const v of filteredVotes) {
      if (!sectionMap[v.section_key]) sectionMap[v.section_key] = { helpful: 0, needsWork: 0, wrongInfo: 0, total: 0 };
      if (v.vote === 1)  sectionMap[v.section_key].helpful++;
      if (v.vote === -1) sectionMap[v.section_key].needsWork++;
      if (v.vote === -2) sectionMap[v.section_key].wrongInfo++;
      sectionMap[v.section_key].total++;
    }
    const sections = Object.entries(sectionMap)
      .map(([key, counts]) => ({
        key, ...counts,
        satisfaction: counts.total > 0 ? Math.round((counts.helpful / counts.total) * 100) : 0,
      }))
      .sort((a, b) => a.satisfaction - b.satisfaction);

    const worstSection = sections[0]?.key ?? "none";

    if (exportCsv) {
      const rows = filteredComments.map(c =>
        [c.id, c.section_key, c.dossier_type || "", (c.comment || "").replace(/"/g, "\"\""), c.created_at]
          .map(f => `"${f}"`).join(",")
      );
      const csv = ["id,section_key,dossier_type,comment,created_at", ...rows].join("\n");
      return new Response(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="careerdeck-feedback-${Date.now()}.csv"`,
        },
      });
    }

    const paginatedComments = filteredComments.slice(offset, offset + pageSize);

    return Response.json({
      overview: { totalVotes: total, totalComments: filteredComments.length, helpful, needsWork, wrongInfo, satisfaction, worstSection },
      sections,
      comments: paginatedComments,
      pagination: { page, pageSize, total: filteredComments.length, totalPages: Math.ceil(filteredComments.length / pageSize) },
    });
  } catch (e) {
    console.error("Admin feedback error:", e);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
