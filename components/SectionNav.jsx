"use client";

import { useEffect, useState } from "react";

const TYPE_COLORS = {
  company: {
    dot: "bg-indigo-400",
    desktopActive: "text-indigo-300 font-semibold bg-indigo-500/10",
    mobileActive: "bg-indigo-500 text-white shadow-sm shadow-indigo-500/20",
  },
  role: {
    dot: "bg-emerald-400",
    desktopActive: "text-emerald-300 font-semibold bg-emerald-500/10",
    mobileActive: "bg-emerald-500 text-white shadow-sm shadow-emerald-500/20",
  },
  jd: {
    dot: "bg-amber-400",
    desktopActive: "text-amber-300 font-semibold bg-amber-500/10",
    mobileActive: "bg-amber-500 text-white shadow-sm shadow-amber-500/20",
  },
  news: {
    dot: "bg-blue-400",
    desktopActive: "text-blue-300 font-semibold bg-blue-500/10",
    mobileActive: "bg-blue-500 text-white shadow-sm shadow-blue-500/20",
  },
  linkedin: {
    dot: "bg-sky-400",
    desktopActive: "text-sky-300 font-semibold bg-sky-500/10",
    mobileActive: "bg-sky-500 text-white shadow-sm shadow-sky-500/20",
  },
};

const DEFAULT_COLORS = {
  dot: "bg-[#F28C28]",
  desktopActive: "text-white font-semibold bg-[#F28C28]/10",
  mobileActive: "bg-[#F28C28] text-[#030712] shadow-sm",
};

export default function SectionNav({ content, className = "", dossierType = "company" }) {
  const [headings, setHeadings] = useState([]);
  const [activeId, setActiveId] = useState(null);

  useEffect(() => {
    const lines = (content || "").split("\n");
    const found = [];
    lines.forEach((line) => {
      const h1 = line.match(/^#\s+(.+)/);
      const h2 = line.match(/^##\s+(.+)/);
      if (h1) found.push({ level: 1, text: h1[1], id: slugify(h1[1]) });
      if (h2) found.push({ level: 2, text: h2[1], id: slugify(h2[1]) });
    });
    setHeadings(found);
  }, [content]);

  useEffect(() => {
    if (headings.length === 0) return;
    const elements = headings
      .map((h) => document.getElementById(h.id))
      .filter(Boolean);
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: "-80px 0px -60% 0px", threshold: 0 }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [headings]);

  const handleClick = (e, id) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (headings.length === 0) return null;

  const colors = TYPE_COLORS[dossierType] || DEFAULT_COLORS;

  return (
    <nav className={`no-print ${className}`}>
      {/* Desktop: vertical sidebar */}
      <div className="hidden lg:block bg-[#0B0F19]/80 border border-white/[0.08] backdrop-blur-md rounded-lg p-4 max-h-[calc(100vh-2rem)] overflow-y-auto shadow-sm">
        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">On this page</h4>
        <ul className="space-y-0.5">
          {headings.map((h) => (
            <li key={h.id} className={h.level === 2 ? "pl-4" : ""}>
              <a
                href={`#${h.id}`}
                onClick={(e) => handleClick(e, h.id)}
                className={`flex items-center gap-2 text-sm py-1.5 rounded px-2 transition-all duration-200 ${
                  activeId === h.id
                    ? colors.desktopActive
                    : "text-slate-400 hover:text-white hover:bg-white/[0.02]"
                } ${h.level === 1 ? "font-medium" : ""}`}
              >
                {activeId === h.id && (
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${colors.dot}`} />
                )}
                <span className="truncate">{h.text}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>

      {/* Mobile: horizontal scroll strip */}
      <div className="lg:hidden">
        <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
          {headings.map((h) => (
            <button
              key={h.id}
              onClick={(e) => handleClick(e, h.id)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap min-h-[36px] ${
                activeId === h.id
                  ? colors.mobileActive
                  : "bg-white/[0.03] border border-white/[0.08] text-slate-400 hover:bg-white/[0.06] hover:text-white"
              } ${h.level === 2 ? "ml-3" : ""}`}
            >
              {h.text}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}
