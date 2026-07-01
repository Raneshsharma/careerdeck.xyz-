"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import SourceTiles from "@/components/SourceTiles";
import SectionVoting from "@/components/SectionVoting";
import SectionFeedback from "@/components/SectionFeedback";
import Link from "next/link";

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

const TYPE_ACCENT = {
  company: "border-indigo-500/30 text-indigo-400",
  role: "border-emerald-500/30 text-emerald-400",
  jd: "border-amber-500/30 text-amber-400",
  news: "border-blue-500/30 text-blue-400",
  resume: "border-orange-500/30 text-orange-400",
};

function ActionBar({ onReset, handleCopy, handleDownload, handleExportWord, copied, isTop = false }) {
  return (
    <div className={`flex items-center gap-2 flex-wrap ${isTop ? "" : ""}`}>
      {isTop && (
        <button
          onClick={onReset}
          className="px-3 py-1.5 text-xs font-semibold rounded-full border border-white/[0.08] text-slate-300 hover:bg-white/[0.03] hover:text-white transition-all duration-200"
        >
          ← New
        </button>
      )}
      <button
        onClick={handleCopy}
        className={`flex-1 min-w-[100px] inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 border ${
          copied
            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
            : "border-white/[0.08] text-slate-300 hover:bg-white/[0.03] hover:text-white"
        }`}
      >
        {copied ? "✓ Copied!" : "📋 Copy"}
      </button>
      <button
        onClick={handleDownload}
        className="flex-1 min-w-[100px] inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border border-white/[0.08] text-slate-300 hover:bg-white/[0.03] hover:text-white transition-all duration-200"
      >
        📥 Markdown
      </button>
      <button
        onClick={handleExportWord}
        className="flex-1 min-w-[100px] inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border border-white/[0.08] text-slate-300 hover:bg-white/[0.03] hover:text-white transition-all duration-200"
      >
        📄 Word Doc
      </button>
      {!isTop && (
        <button
          onClick={onReset}
          className="flex-1 min-w-[120px] inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-[#F28C28] hover:bg-[#E07E1F] text-[#030712] transition-all duration-200 shadow-sm"
        >
          ← New Dossier
        </button>
      )}
    </div>
  );
}

export default function DossierResult({ content, onReset, isPartial, hideToolbar, hideShortBanner, genId, sourceMetadata, isFreeUser = true, dossierType = "company" }) {
  const [copied, setCopied] = useState(false);
  const [visible, setVisible] = useState(false);
  const resultRef = useRef(null);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

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

  const handleExportWord = () => {
    const htmlContent = (content || "")
      .replace(/^### (.+)$/gm, "<h3>$1</h3>")
      .replace(/^## (.+)$/gm, "<h2>$1</h2>")
      .replace(/^# (.+)$/gm, "<h1>$1</h1>")
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g, "<em>$1</em>")
      .replace(/^- (.+)$/gm, "<li>$1</li>")
      .replace(/\n\n/g, "</p><p>")
      .replace(/\n/g, "<br>");
    const doc = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="utf-8"><title>CareerDeck Dossier</title></head><body><p>${htmlContent}</p></body></html>`;
    const blob = new Blob([doc], { type: "application/msword" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "careerdeck-dossier.doc";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopy = async () => {
    try { await navigator.clipboard.writeText(content); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch {}
  };

  const wordCount = (content || "").split(/\s+/).filter(Boolean).length;

  const sections = useMemo(() => {
    const parts = (content || "").split(/(?=^## )/m);
    return parts.map((section) => {
      const match = section.match(/^## (.+)/m);
      const title = match ? match[1].trim() : "";
      return { title, id: slugify(title), body: section.trim() };
    }).filter((s) => s.body);
  }, [content]);

  const accentClass = TYPE_ACCENT[dossierType] || TYPE_ACCENT.company;
  const barProps = { onReset, handleCopy, handleDownload, handleExportWord, copied };

  return (
    <div ref={resultRef} className={`transition-all duration-500 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>

      {/* ── TOP STICKY TOOLBAR ── */}
      {!hideToolbar && (
        <div className="sticky top-0 z-10 bg-[#0B0F19]/90 border border-white/[0.08] backdrop-blur-md rounded-xl shadow-sm p-2.5 mb-4 no-print">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-slate-400 bg-white/[0.03] px-2.5 py-1 rounded-full font-medium shrink-0">
              {wordCount.toLocaleString()} words · ~{Math.ceil(wordCount / 250)} min
            </span>
            <ActionBar {...barProps} isTop />
          </div>
        </div>
      )}

      {isPartial && (
        <div className="bg-amber-500/10 border border-[#F28C28]/20 rounded-lg p-4 mb-4 no-print">
          <p className="text-sm text-amber-400"><strong>⚠️ Partial output:</strong> Generation was cut short — what was generated is fully usable.</p>
        </div>
      )}

      {!hideShortBanner && (
        <div className={`bg-white/[0.03] border ${accentClass} rounded-lg p-4 mb-6 no-print`}>
          <p className="text-sm"><strong>⏰ Short on time?</strong> Use the section navigator on the right to jump directly to Interview Prep or Key Financials.</p>
        </div>
      )}

      {/* ── DOSSIER CONTENT ── */}
      <div className="bg-[#0B0F19]/60 border border-white/[0.08] backdrop-blur-md rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.4)] p-6 sm:p-10 text-slate-200">
        <article className="dossier-markdown">
          {sections.map((section, idx) => (
            <div key={section.id || idx} id={section.id}>
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h2: ({ children, ...props }) => <h2 id={section.id} {...props}>{children}</h2>,
                }}
              >
                {section.body}
              </ReactMarkdown>
              {section.title && (
                <div className="mb-8 border-t border-white/[0.05] pt-4">
                  <SourceTiles sources={sourceMetadata} />
                  <SectionVoting dossierId={genId} sectionKey={section.title} />
                  <SectionFeedback dossierId={genId} sectionKey={section.title} />
                </div>
              )}
            </div>
          ))}
        </article>

        {/* Post-dossier upgrade CTA — only for free users */}
        {isFreeUser && (
          <div className="mt-8 pt-6 border-t border-white/[0.05] text-center no-print">
            <p className="text-sm text-slate-400 mb-3">Want unlimited dossiers and Word/PDF exports?</p>
            <Link
              href="/checkout?plan=pro"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#F28C28] hover:bg-[#E07E1F] text-[#030712] text-sm font-bold transition-all duration-200 shadow-[0_4px_14px_rgba(242,140,40,0.3)]"
            >
              Upgrade to Pro — just ₹149/mo
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        )}

        {/* ── BOTTOM ACTION BAR ── */}
        <div className="mt-8 pt-6 border-t border-white/[0.05] no-print">
          <ActionBar {...barProps} isTop={false} />
        </div>
      </div>
    </div>
  );
}
