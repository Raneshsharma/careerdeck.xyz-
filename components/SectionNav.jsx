"use client";

import { useEffect, useState } from "react";

export default function SectionNav({ content }) {
  const [headings, setHeadings] = useState([]);

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

  if (headings.length === 0) return null;

  return (
    <nav className="no-print sticky top-4 bg-white rounded-lg border border-gray-200 p-4 max-h-[calc(100vh-2rem)] overflow-y-auto">
      <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Sections</h4>
      <ul className="space-y-1">
        {headings.map((h) => (
          <li key={h.id} className={h.level === 2 ? "pl-3" : ""}>
            <a
              href={`#${h.id}`}
              className={`block text-sm py-1 rounded px-2 hover:bg-brand-50 hover:text-brand-700 transition-colors ${h.level === 1 ? "font-semibold text-gray-800" : "text-gray-600"}`}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}
