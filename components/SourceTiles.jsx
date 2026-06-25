"use client";

import { useState, useRef, useEffect } from "react";

export default function SourceTiles({ sources }) {
  const [openSource, setOpenSource] = useState(null);
  const popRef = useRef(null);

  useEffect(() => {
    if (!openSource) return;
    const h = (e) => { if (popRef.current && !popRef.current.contains(e.target)) setOpenSource(null); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [openSource]);

  if (!sources || sources.length === 0) return null;

  return (
    <div className="mt-3 pt-3 border-t border-gray-100 no-print">
      <span className="text-xs text-[#94A3B8] mr-2">Sources:</span>
      <div className="inline-flex flex-wrap gap-1.5">
        {sources.map((s, i) => (
          <div key={i} className="relative">
            <button
              onClick={() => setOpenSource(openSource === i ? null : i)}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                openSource === i
                  ? "bg-brand-100 text-brand-700"
                  : "bg-gray-100 text-[#64748B] hover:bg-gray-200"
              }`}
            >
              {s.source === "Wikipedia" ? (
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
              ) : (
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
              )}
              {s.source}
            </button>
            {openSource === i && (
              <div
                ref={popRef}
                className="absolute z-50 bottom-full mb-2 left-0 w-72 md:w-80 bg-white rounded-xl shadow-xl border border-gray-200 p-4 animate-slide-up"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-[#0F172A]">{s.source}</span>
                  {s.url && (
                    <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-xs text-brand-500 hover:underline">
                      View source
                    </a>
                  )}
                </div>
                <p className="text-xs text-[#64748B] leading-relaxed max-h-48 overflow-y-auto">
                  {s.text?.length > 500 ? s.text.substring(0, 500) + "..." : s.text}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
