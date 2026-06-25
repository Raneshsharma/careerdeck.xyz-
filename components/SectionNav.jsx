"use client";

import { useEffect, useState, useRef } from "react";

export default function SectionNav({ content, className = "" }) {
  const [headings, setHeadings] = useState([]);
  const [activeId, setActiveId] = useState(null);

  useEffect(() => {
    const lines = content.split("\n");
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

  return (
    <nav className={`no-print ${className}`}>
      {/* Desktop: vertical sidebar */}
      <div className="hidden lg:block bg-white/80 backdrop-blur-sm rounded-lg border border-gray-200 p-4 max-h-[calc(100vh-2rem)] overflow-y-auto shadow-sm">
        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">On this page</h4>
        <ul className="space-y-0.5">
          {headings.map((h) => (
            <li key={h.id} className={h.level === 2 ? "pl-4" : ""}>
              <a
                href={`#${h.id}`}
                onClick={(e) => handleClick(e, h.id)}
                className={`flex items-center gap-2 text-sm py-1.5 rounded px-2 transition-all duration-200 ${
                  activeId === h.id
                    ? "text-brand-600 font-semibold bg-brand-50"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                } ${h.level === 1 ? "font-medium" : ""}`}
              >
                {activeId === h.id && (
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-500 shrink-0" />
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
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap min-h-[36px] ${
                activeId === h.id
                  ? "bg-brand-500 text-white shadow-sm"
                  : "bg-white border border-gray-200 text-[#64748B] hover:bg-gray-50"
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
