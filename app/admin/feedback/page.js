"use client";

import { useState, useEffect, useCallback } from "react";

const TYPES = ["all", "company", "role", "jd", "resume", "linkedin", "news"];
const TYPE_LABELS = { all: "All", company: "Company", role: "Role", jd: "JD", resume: "Resume", linkedin: "LinkedIn", news: "News" };

function StatCard({ label, value, sub, color }) {
  const c = color || "text-white";
  return (
    <div className="bg-[#0f1117] border border-white/[0.07] rounded-2xl p-5 flex flex-col gap-1">
      <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">{label}</p>
      <p className={`text-3xl font-extrabold tabular-nums leading-tight ${c}`}>{value}</p>
      {sub && <p className="text-xs text-slate-500">{sub}</p>}
    </div>
  );
}

function Bar({ pct, label, count, color }) {
  return (
    <div className="flex items-center gap-3 text-xs">
      <span className="w-44 shrink-0 text-slate-400 truncate text-[11px]">{label}</span>
      <div className="flex-1 h-2 bg-white/[0.05] rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: pct + "%" }} />
      </div>
      <span className="w-10 text-right text-slate-500 font-mono">{pct}%</span>
      <span className="w-6 text-right text-slate-600 font-mono text-[10px]">{count}</span>
    </div>
  );
}

function ago(iso) {
  const s = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (s < 60) return s + "s ago";
  if (s < 3600) return Math.floor(s/60) + "m ago";
  if (s < 86400) return Math.floor(s/3600) + "h ago";
  return Math.floor(s/86400) + "d ago";
}

export default function AdminFeedbackPage() {
  const [filter, setFilter] = useState("all");
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);
  const [page, setPage]     = useState(1);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const p = new URLSearchParams({ page: String(page) });
      if (filter !== "all") p.set("dossierType", filter);
      const res = await fetch("/api/admin/feedback?" + p.toString());
      const json = await res.json();
      if (!res.ok) { setError(json.error || "Error"); return; }
      setData(json);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, [filter, page]);

  useEffect(() => { setPage(1); }, [filter]);
  useEffect(() => { load(); }, [load]);

  function exportCsv() {
    const p = new URLSearchParams({ export: "csv" });
    if (filter !== "all") p.set("dossierType", filter);
    window.open("/api/admin/feedback?" + p.toString(), "_blank");
  }

  const ov  = data?.overview || {};
  const secs = data?.sections || [];
  const cmts = data?.comments || [];
  const pg   = data?.pagination;

  return (
    <div className="min-h-screen bg-[#030712] text-white font-sans">
      <div className="border-b border-white/[0.06] px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold">Feedback Intelligence</h1>
          <p className="text-xs text-slate-500">CareerDeck admin</p>
        </div>
        <button onClick={exportCsv} className="px-4 py-2 text-xs font-semibold rounded-xl bg-white/[0.06] hover:bg-white/[0.10] border border-white/[0.08] text-slate-300 transition-all cursor-pointer flex items-center gap-2">
          Download CSV
        </button>
      </div>

      <div className="px-6 py-3 border-b border-white/[0.04] flex gap-2 overflow-x-auto">
        {TYPES.map(t => (
          <button key={t} onClick={() => setFilter(t)}
            className={"px-3 py-1.5 rounded-full text-xs font-semibold border transition-all shrink-0 cursor-pointer " + (filter === t ? "bg-[#F28C28] text-[#030712] border-[#F28C28]" : "bg-white/[0.03] border-white/[0.08] text-slate-400 hover:text-white")}>
            {TYPE_LABELS[t]}
          </button>
        ))}
      </div>

      <div className="px-6 py-6 max-w-6xl mx-auto space-y-8">
        {error && <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-sm text-red-400">{error === "Forbidden" ? "You do not have admin access." : error}</div>}

        {loading && <div className="flex justify-center py-20"><div className="w-8 h-8 rounded-full border-2 border-white/10 border-t-[#F28C28] animate-spin" /></div>}

        {!loading && data && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard label="Total Votes"   value={ov.totalVotes}    sub={"Helpful " + ov.helpful + " / Needs Work " + ov.needsWork + " / Wrong " + ov.wrongInfo} />
              <StatCard label="Satisfaction"  value={ov.satisfaction + "%"} color={ov.satisfaction >= 80 ? "text-emerald-400" : ov.satisfaction >= 60 ? "text-amber-400" : "text-red-400"} sub="Helpful votes / total" />
              <StatCard label="Comments"      value={ov.totalComments} sub="Written notes from users" />
              <StatCard label="Worst Section" value={ov.worstSection}  color="text-red-400" sub="Lowest satisfaction score" />
            </div>

            <div className="bg-[#0f1117] border border-white/[0.07] rounded-2xl p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-sm font-bold">Section Breakdown</h2>
                <span className="text-xs text-slate-500">Worst first</span>
              </div>
              {secs.length === 0
                ? <p className="text-xs text-slate-500">No votes yet.</p>
                : <div className="space-y-4">{secs.map(s => (
                    <div key={s.key}>
                      <Bar label={s.key} pct={s.satisfaction} count={s.total} color={s.satisfaction >= 80 ? "bg-emerald-500" : s.satisfaction >= 60 ? "bg-amber-500" : "bg-red-500"} />
                      <div className="flex gap-4 text-[10px] text-slate-600 mt-0.5 pl-44">
                        <span>Helpful {s.helpful}</span><span>Needs Work {s.needsWork}</span><span>Wrong {s.wrongInfo}</span>
                      </div>
                    </div>
                  ))}</div>
              }
            </div>

            <div className="bg-[#0f1117] border border-white/[0.07] rounded-2xl p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-sm font-bold">User Notes</h2>
                {pg && <span className="text-xs text-slate-500">{pg.total} total · page {pg.page}/{pg.totalPages}</span>}
              </div>
              {cmts.length === 0
                ? <p className="text-xs text-slate-500">No notes yet.</p>
                : <div className="space-y-3">{cmts.map(c => (
                    <div key={c.id} className="border border-white/[0.05] rounded-xl p-4 hover:bg-white/[0.02] transition-all">
                      <p className="text-sm text-slate-200 leading-relaxed">{c.comment}</p>
                      <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-500 flex-wrap">
                        <span className="bg-white/[0.05] px-2 py-0.5 rounded">{c.section_key}</span>
                        {c.dossier_type && <span className="bg-white/[0.05] px-2 py-0.5 rounded capitalize">{c.dossier_type}</span>}
                        <span className="ml-auto">{ago(c.created_at)}</span>
                      </div>
                    </div>
                  ))}</div>
              }
              {pg && pg.totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 mt-6">
                  <button disabled={page === 1} onClick={() => setPage(p => p-1)} className="px-3 py-1.5 text-xs rounded-lg border border-white/[0.08] text-slate-400 disabled:opacity-30 hover:bg-white/[0.05] cursor-pointer">Prev</button>
                  <span className="text-xs text-slate-500">{page} / {pg.totalPages}</span>
                  <button disabled={page === pg.totalPages} onClick={() => setPage(p => p+1)} className="px-3 py-1.5 text-xs rounded-lg border border-white/[0.08] text-slate-400 disabled:opacity-30 hover:bg-white/[0.05] cursor-pointer">Next</button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}