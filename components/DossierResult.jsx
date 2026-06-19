"use client";

import { useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";

export default function DossierResult({ content, onReset, isPartial }) {
  const [copied, setCopied] = useState(false);

  const handlePrint = () => { window.print(); };

  const handleDownload = () => {
    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "interview-ready-dossier.md";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopy = async () => {
    try { await navigator.clipboard.writeText(content); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch {}
  };

  const wordCount = content.split(/\s+/).filter(Boolean).length;

  return (
    <div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6 no-print flex flex-wrap items-center justify-between gap-3">
        <span className="text-sm text-gray-500">{wordCount.toLocaleString()} words &middot; ~{Math.ceil(wordCount / 250)} min read</span>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={onReset} className="px-3 py-1.5 text-sm rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors">&#x2190; New Dossier</button>
          <button onClick={handleCopy} className={`px-3 py-1.5 text-sm rounded-md border transition-all ${copied ? "border-green-400 bg-green-50 text-green-700" : "border-gray-300 text-gray-600 hover:bg-gray-50"}`}>
            {copied ? "\u2705 Copied!" : "\uD83D\uDCCB Copy"}
          </button>
          <button onClick={handleDownload} className="px-3 py-1.5 text-sm rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors">&#x2B07; Download .md</button>
          <button onClick={handlePrint} className="px-3 py-1.5 text-sm rounded-md bg-brand-600 text-white hover:bg-brand-700 transition-colors">&#x1F5A8; Print / PDF</button>
        </div>
      </div>

      {isPartial && (
        <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4 mb-4 no-print">
          <p className="text-sm text-yellow-800"><strong>&#x26A0;&#xFE0F; Partial output:</strong> Generation was cut short — some later sections may be incomplete. What was generated is fully usable.</p>
        </div>
      )}

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 no-print">
        <p className="text-sm text-amber-800"><strong>&#x23F0; Short on time?</strong> Jump to the Interview Intelligence and Smart Questions sections for quick prep.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-10">
        <article className="dossier-markdown">
          <ReactMarkdown
            components={{
              h1: ({ children, ...props }) => {
                const text = String(children);
                const id = text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
                return <h1 id={id} {...props}>{children}</h1>;
              },
              h2: ({ children, ...props }) => {
                const text = String(children);
                const id = text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
                return <h2 id={id} {...props}>{children}</h2>;
              },
              h3: ({ children, ...props }) => {
                const text = String(children);
                const id = text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
                return <h3 id={id} {...props}>{children}</h3>;
              },
            }}
          >
            {content}
          </ReactMarkdown>
        </article>
      </div>
    </div>
  );
}
