"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import SourceTiles from "@/components/SourceTiles";
import SectionVoting from "@/components/SectionVoting";
import SectionFeedback from "@/components/SectionFeedback";
import Link from "next/link";

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export default function DossierResult({ content, onReset, isPartial, hideToolbar, hideShortBanner, genId, sourceMetadata }) {
  const [copied, setCopied] = useState(false);
  const [visible, setVisible] = useState(false);
  const resultRef = useRef(null);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  const handlePrint = () => { window.print(); };

  const handleDownload = () => {
    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "careerdeck-dossier.md";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopy = async () => {
    try { await navigator.clipboard.writeText(content); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch {}
  };

  const wordCount = content.split(/\s+/).filter(Boolean).length;

  const sections = useMemo(() => {
    const parts = content.split(/(?=^## )/m);
    return parts.map((section) => {
      const match = section.match(/^## (.+)/m);
      const title = match ? match[1].trim() : "";
      return { title, id: slugify(title), body: section.trim() };
    }).filter((s) => s.body);
  }, [content]);

  return (
    <div ref={resultRef} className={`transition-all duration-500 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
      {/* Toolbar */}
      {!hideToolbar && (
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200 p-3 mb-6 no-print flex items-center justify-between gap-3">
        <span className="text-xs text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full font-medium">
          {wordCount.toLocaleString()} words &middot; ~{Math.ceil(wordCount / 250)} min read
        </span>
        <div className="flex items-center gap-1.5">
          <button onClick={onReset} className="px-3 py-1.5 text-xs font-medium rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200">
            &larr; New
          </button>
          <button onClick={handleCopy} className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-all duration-200 ${copied ? "bg-green-50 text-green-700 border-green-200" : "border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300"}`}>
            {copied ? "Copied!" : "Copy"}
          </button>
          <button onClick={handleDownload} className="px-3 py-1.5 text-xs font-medium rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200">
            .md
          </button>
          <button onClick={handlePrint} className="px-3 py-1.5 text-xs font-medium rounded-full bg-brand-500 text-white hover:bg-brand-600 transition-all duration-200 shadow-sm">
            Print
          </button>
        </div>
      </div>
      )}

      {isPartial && (
        <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4 mb-4 no-print">
          <p className="text-sm text-yellow-800"><strong>&#x26A0;&#xFE0F; Partial output:</strong> Generation was cut short — some later sections may be incomplete. What was generated is fully usable.</p>
        </div>
      )}

      {!hideShortBanner && (
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 no-print">
        <p className="text-sm text-amber-800"><strong>&#x23F0; Short on time?</strong> Jump to the Interview Intelligence and Smart Questions sections for quick prep.</p>
      </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-10">
        <article className="dossier-markdown">
          {sections.map((section, idx) => (
            <div key={section.id || idx} id={section.id}>
              <ReactMarkdown
                components={{
                  h2: ({ children, ...props }) => <h2 id={section.id} {...props}>{children}</h2>,
                }}
              >
                {section.body}
              </ReactMarkdown>
              {section.title && (
                <div className="mb-8">
                  <SourceTiles sources={sourceMetadata} />
                  <SectionVoting dossierId={genId} sectionKey={section.title} />
                  <SectionFeedback dossierId={genId} sectionKey={section.title} />
                </div>
              )}
            </div>
          ))}
        </article>

        {/* Post‑dossier upgrade CTA */}
        <div className="mt-8 pt-6 border-t border-gray-100 text-center no-print">
          <p className="text-sm text-[#64748B] mb-3">Want unlimited dossiers and PDF exports?</p>
          <Link
            href="/checkout?plan=pro"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#F28C28] hover:bg-[#E07E1F] text-[#0F172A] text-sm font-bold transition-all duration-200 shadow-[0_4px_14px_rgba(242,140,40,0.3)]"
          >
            Upgrade to Pro — just ₹149/mo
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
