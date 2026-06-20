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
    <div className="bg-white rounded-2xl border-2 border-amber-200 p-4 shadow-md">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#F28C28" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 4l6 3 6-3M2 8l6 3 6-3M2 12l6 3 6-3" />
          </svg>
          <h3 className="text-sm font-bold text-[#0F172A]">Past Dossiers</h3>
        </div>
        {generations.length > 0 && (
          <span className="text-xs font-semibold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full">{generations.length}</span>
        )}
      </div>

      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-3 bg-amber-100 rounded w-3/4 mb-1.5" />
              <div className="h-2 bg-amber-50 rounded w-1/2" />
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-xs font-medium text-red-700">Failed to load</p>
          <p className="text-xs text-red-500 mt-0.5">{error}</p>
        </div>
      )}

      {!loading && !error && generations.length === 0 && (
        <div className="text-center py-6">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="12" y1="18" x2="12" y2="12" />
            <line x1="9" y1="15" x2="15" y2="15" />
          </svg>
          <p className="text-sm text-gray-400 font-medium">No dossiers yet</p>
          <p className="text-xs text-gray-300 mt-0.5">Create your first one above</p>
        </div>
      )}

      {!loading && !error && generations.length > 0 && (
        <ul className="space-y-1 max-h-[60vh] overflow-y-auto">
          {generations.map((gen) => (
            <li key={gen.id} className="group flex items-stretch">
              <button
                onClick={() => onSelect(gen.id)}
                className={`flex-1 text-left px-3 py-2.5 rounded-l-lg transition-all duration-200 ${
                  activeId === gen.id
                    ? "bg-brand-50 border border-brand-200 text-brand-700"
                    : "hover:bg-gray-50 border border-transparent text-gray-600"
                }`}
              >
                <p className="text-sm font-semibold truncate leading-tight">
                  {gen.company_name || gen.role || "Untitled"}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                    activeId === gen.id
                      ? "bg-brand-100 text-brand-600"
                      : "bg-gray-100 text-gray-500"
                  }`}>
                    {TYPE_LABELS[gen.dossier_type] || gen.dossier_type}
                  </span>
                  <span className="text-[10px] text-gray-400">
                    {new Date(gen.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                  </span>
                </div>
              </button>
              <button
                onClick={(e) => handleDelete(e, gen.id)}
                className="px-2 rounded-r-lg opacity-0 group-hover:opacity-100 hover:bg-red-50 transition-all duration-200 flex items-center"
                aria-label="Delete dossier"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#EF4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
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
