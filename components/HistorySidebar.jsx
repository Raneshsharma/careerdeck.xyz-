"use client";

import { useState, useEffect, useRef } from "react";

const TYPE_LABELS = {
  company: "Company",
  role: "Role",
  jd: "JD",
  news: "News",
};

export default function HistorySidebar({ onSelect, activeId, onDelete }) {
  const [generations, setGenerations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    setLoading(true);
    setError(null);

    fetch("/api/generations")
      .then((r) => r.json())
      .then((data) => {
        if (!mountedRef.current) return;
        if (data.error) throw new Error(data.error);
        setGenerations(data.generations || []);
      })
      .catch((err) => {
        if (!mountedRef.current) return;
        setError(err.name === "AbortError" ? "Request timed out" : err.message);
      })
      .finally(() => {
        if (mountedRef.current) setLoading(false);
      });

    return () => { mountedRef.current = false; };
  }, []);

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    const prev = generations;
    setGenerations((g) => g.filter((gen) => gen.id !== id));
    try {
      const res = await fetch(`/api/generations/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      if (onDelete) onDelete(id);
    } catch {
      setGenerations(prev);
    }
  };

  return (
    <div className="bg-[#0B0F19]/60 border border-white/[0.08] backdrop-blur-md p-4 shadow-[0_20px_50px_rgba(0,0,0,0.3)] rounded-2xl text-slate-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#F28C28" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 4l6 3 6-3M2 8l6 3 6-3M2 12l6 3 6-3" />
          </svg>
          <h3 className="text-sm font-bold text-white">Past Dossiers</h3>
        </div>
        {generations.length > 0 && (
          <span className="text-xs font-semibold text-[#F28C28] bg-[#F28C28]/10 px-2 py-0.5 rounded-full">{generations.length}</span>
        )}
      </div>

      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-3 bg-white/5 rounded w-3/4 mb-1.5" />
              <div className="h-2 bg-white/[0.02] rounded w-1/2" />
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
          <p className="text-xs font-medium text-red-400">Failed to load</p>
          <p className="text-xs text-red-500 mt-0.5">{error}</p>
        </div>
      )}

      {!loading && !error && generations.length === 0 && (
        <div className="text-center py-6">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-3">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
          <p className="text-sm text-slate-500 font-medium">No dossiers yet</p>
          <p className="text-xs text-slate-600 mt-0.5">Generate your first one to see it here</p>
        </div>
      )}

      {!loading && !error && generations.length > 0 && (
        <ul className="space-y-1 max-h-[60vh] overflow-y-auto pr-1">
          {generations.map((gen) => (
            <li key={gen.id} className="group flex items-stretch">
              <button
                onClick={() => onSelect(gen.id)}
                className={`flex-1 text-left px-3 py-2.5 rounded-l-lg transition-all duration-200 ${
                  activeId === gen.id
                    ? "bg-[#F28C28]/10 border border-white/[0.08] text-white font-semibold"
                    : "hover:bg-white/[0.02] border border-transparent text-slate-400 hover:text-white"
                }`}
              >
                <p className="text-sm font-semibold truncate leading-tight">
                  {gen.company_name || gen.role || "Untitled"}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                    activeId === gen.id
                      ? "bg-[#F28C28]/20 text-[#F28C28]"
                      : "bg-white/[0.03] text-slate-500"
                  }`}>
                    {TYPE_LABELS[gen.dossier_type] || gen.dossier_type}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {new Date(gen.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                  </span>
                </div>
              </button>
              <button
                onClick={(e) => handleDelete(e, gen.id)}
                className="px-2 rounded-r-lg opacity-0 group-hover:opacity-100 hover:bg-red-500/10 transition-all duration-200 flex items-center"
                aria-label="Delete dossier"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#EF4444" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 4.5 4.5 4.5 11 4.5" />
                  <path d="M4.5 4.5V3a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v1.5" />
                  <path d="M5.5 6.5v4" />
                  <path d="M8.5 6.5v4" />
                  <path d="M2.5 4.5h9l-1 8H3.5z" />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
