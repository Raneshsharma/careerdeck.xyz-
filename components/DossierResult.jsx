"use client";

import { useMemo, useState, useEffect, useRef, createContext, useContext } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import SourceTiles from "@/components/SourceTiles";
import FeedbackPanel from "@/components/FeedbackPanel";
import Link from "next/link";
import InlineBulletCoach from "@/components/InlineBulletCoach";
import toast from "react-hot-toast";

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

// ── Inline Coach Context ──────────────────────────────────────────────────────
const InlineCoachContext = createContext(null);

function extractText(node) {
  if (!node) return "";
  if (typeof node === "string") return node;
  if (typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(extractText).join("");
  if (node?.props?.children) return extractText(node.props.children);
  return "";
}

function applyBulletRewrite(rawContent, originalText, newText) {
  const lines = rawContent.split("\n");
  let replaced = false;
  const updated = lines.map((line) => {
    if (replaced) return line;
    const m = line.match(/^(\s*[-*+]\s+)(.*)/);
    if (m) {
      const lineText = m[2].replace(/\*\*/g, "").replace(/\*/g, "").replace(/`/g, "").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").trim();
      const clean = originalText.replace(/\*\*/g, "").replace(/\*/g, "").replace(/`/g, "").trim();
      if (lineText === clean || (clean.length > 30 && lineText.startsWith(clean.slice(0, 30)))) {
        replaced = true;
        return `${m[1]}${newText}`;
      }
    }
    return line;
  });
  return updated.join("\n");
}

function EnhancedListItem({ children }) {
  const ctx = useContext(InlineCoachContext);
  const [showCoach, setShowCoach] = useState(false);
  const bulletText = extractText(children);

  if (!ctx) return <li>{children}</li>;

  const handleApply = (original, rewrite) => {
    if (!ctx.onContentUpdate) return;
    const updated = applyBulletRewrite(ctx.content, original, rewrite);
    ctx.onContentUpdate(updated);
    setShowCoach(false);
  };

  return (
    <li className="group relative">
      <span>{children}</span>
      {!showCoach && (
        <button
          onClick={() => setShowCoach(true)}
          className="ml-2 opacity-0 group-hover:opacity-100 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-violet-500/10 border border-violet-500/20 text-violet-400 text-[10px] font-semibold hover:bg-violet-500/20 transition-all duration-200 align-middle no-print"
          title="Get AI coaching on this bullet"
        >
          ✨ Improve
        </button>
      )}
      {showCoach && (
        <InlineBulletCoach
          bulletText={bulletText}
          dossierContent={ctx.content}
          onClose={() => setShowCoach(false)}
          onApply={handleApply}
        />
      )}
    </li>
  );
}

function HeadlineOptionButton({ headline, children }) {
  const [applied, setApplied] = useState(false);
  const handleApply = () => {
    navigator.clipboard.writeText(headline);
    toast.success("Headline copied to clipboard! Update your LinkedIn headline to finalize.");
    setApplied(true);
    setTimeout(() => setApplied(false), 3000);
  };
  return (
    <button
      onClick={handleApply}
      className="inline-flex items-center gap-2.5 px-4 py-2 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 text-xs font-bold border border-sky-500/20 my-2 no-print cursor-pointer transition-all duration-200"
    >
      <span>{children}</span>
      <span className="text-[10px] uppercase font-bold opacity-80 bg-sky-500/25 px-1.5 py-0.5 rounded">
        {applied ? "✓ Copied" : "Copy"}
      </span>
    </button>
  );
}

function SyncButton({ target, actionData, children }) {
  const [synced, setSynced] = useState(false);
  const handleSync = () => {
    toast.success(`Discrepancy synced to ${target === "linkedin" ? "LinkedIn Profile" : "Resume"}!`);
    setSynced(true);
  };
  return (
    <button
      onClick={handleSync}
      disabled={synced}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 disabled:opacity-40 disabled:hover:bg-emerald-500/10 disabled:text-slate-500 disabled:border-slate-800 text-[11px] font-bold border border-emerald-500/20 my-1 no-print transition-all duration-200 cursor-pointer"
    >
      <span>{synced ? "✓ Synced" : children}</span>
    </button>
  );
}

function CopyTextButton({ text, children }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };
  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 text-xs font-bold border border-sky-500/20 my-2 no-print cursor-pointer transition-all duration-200"
    >
      <span>{children}</span>
      <span className="text-[10px] uppercase font-bold opacity-80 bg-sky-500/25 px-1.5 py-0.5 rounded">
        {copied ? "✓ Copied" : "Copy"}
      </span>
    </button>
  );
}

function DraftPostButton({ bullet, onTriggerCoach, children }) {
  const handleDraft = () => {
    if (onTriggerCoach) {
      onTriggerCoach(`Draft a highly engaging, thought-leadership LinkedIn post based on this experience bullet:\n\n"${bullet}"`);
    }
  };
  return (
    <button
      onClick={handleDraft}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/25 text-sky-400 text-[10px] font-bold no-print my-1 transition-all duration-200 cursor-pointer"
    >
      <span>{children}</span>
    </button>
  );
}

function CollapsibleDrawer({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="my-3 border border-white/[0.05] bg-white/[0.01] hover:bg-white/[0.02] rounded-xl overflow-hidden transition-all duration-200">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2.5 flex items-center justify-between text-left text-xs font-bold text-slate-400 hover:text-white transition-colors"
      >
        <span className="flex items-center gap-2">
          <span>🔍</span> {isOpen ? "Hide Detailed Analysis" : "Expand Detailed Analysis"}
        </span>
        <svg
          className={`w-3.5 h-3.5 transform transition-transform duration-200 text-slate-500 ${isOpen ? "rotate-180" : ""}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <div className="px-4 pb-4 pt-1 text-xs text-slate-300 leading-relaxed border-t border-white/[0.03] bg-[#090D16]/50 coach-response">
          {children}
        </div>
      )}
    </div>
  );
}

const TYPE_ACCENT = {
  company: "border-indigo-500/30 text-indigo-400",
  role: "border-emerald-500/30 text-emerald-400",
  jd: "border-amber-500/30 text-amber-400",
  news: "border-blue-500/30 text-blue-400",
  resume: "border-orange-500/30 text-orange-400",
  linkedin: "border-sky-500/30 text-sky-400",
};

// ── LinkedIn Health Table ─────────────────────────────────────────────────
function LinkedInHealthTable({ data }) {
  const statusColor = (status) => {
    const s = (status || "").toLowerCase();
    if (s.includes("excellent")) return { bar: "bg-emerald-500", badge: "bg-emerald-500/10 text-emerald-400", border: "border-emerald-500/20" };
    if (s.includes("good")) return { bar: "bg-sky-500", badge: "bg-sky-500/10 text-sky-400", border: "border-sky-500/20" };
    if (s.includes("needs work")) return { bar: "bg-amber-500", badge: "bg-amber-500/10 text-amber-400", border: "border-amber-500/20" };
    return { bar: "bg-red-500", badge: "bg-red-500/10 text-red-400", border: "border-red-500/20" };
  };
  return (
    <div className="my-6 space-y-3 no-print">
      {data.map((row, idx) => {
        const score = parseInt(row.score) || 0;
        const colors = statusColor(row.status);
        return (
          <div key={idx} className={`bg-white/[0.02] border ${colors.border} rounded-xl p-4 hover:bg-white/[0.04] transition-all duration-200`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-white">{row.metric}</span>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${colors.badge}`}>{row.status}</span>
                <span className="text-xs text-slate-500 font-mono">{score}</span>
              </div>
            </div>
            <div className="w-full bg-white/[0.04] h-1.5 rounded-full overflow-hidden mb-2">
              <div className={`h-full rounded-full transition-all duration-700 ${colors.bar}`} style={{ width: `${score}%` }} />
            </div>
            {row.detail && <p className="text-xs text-slate-400">{row.detail}</p>}
          </div>
        );
      })}
    </div>
  );
}

// ── Networking Cards Table ─────────────────────────────────────────────────
function NetworkingCardTable({ data }) {
  const actionColor = (action) => {
    const a = (action || "").toLowerCase();
    if (a.includes("connect")) return "bg-sky-500/10 border-sky-500/20 text-sky-400";
    if (a.includes("follow")) return "bg-violet-500/10 border-violet-500/20 text-violet-400";
    if (a.includes("join")) return "bg-emerald-500/10 border-emerald-500/20 text-emerald-400";
    return "bg-amber-500/10 border-amber-500/20 text-amber-400";
  };
  return (
    <div className="grid grid-cols-2 gap-3 my-6 no-print">
      {data.map((row, idx) => (
        <div key={idx} className={`border rounded-xl p-4 flex flex-col gap-1 hover:bg-white/[0.02] transition-all duration-200 bg-white/[0.01] ${actionColor(row.action).split(" ")[1]}`}>
          <span className={`text-xs font-bold uppercase tracking-wider ${actionColor(row.action).split(" ")[2]}`}>{row.action}</span>
          <span className="text-2xl font-extrabold text-white leading-none">{row.count}</span>
          <span className="text-xs text-slate-400 leading-snug">{row.target}</span>
        </div>
      ))}
    </div>
  );
}

// ── Consistency Visual Table ───────────────────────────────────────────────
function ConsistencyTable({ data }) {
  const iconColor = (status) => {
    const s = (status || "").toString();
    if (s.includes("✅")) return "text-emerald-400 bg-emerald-500/10";
    if (s.includes("⚠")) return "text-amber-400 bg-amber-500/10";
    return "text-red-400 bg-red-500/10";
  };
  const statusIcon = (status) => {
    const s = (status || "").toString();
    if (s.includes("✅")) return "✅";
    if (s.includes("⚠")) return "⚠️";
    return "❌";
  };
  return (
    <div className="my-6 space-y-2 no-print">
      {data.map((row, idx) => (
        <div key={idx} className="flex items-center gap-3 bg-white/[0.02] border border-white/[0.05] rounded-xl px-4 py-3 hover:bg-white/[0.04] transition-all duration-150">
          <span className={`text-sm w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${iconColor(row.status)}`}>{statusIcon(row.status)}</span>
          <div className="flex-1 min-w-0">
            <span className="text-sm font-semibold text-white">{row.field}</span>
            {row.detail && <p className="text-xs text-slate-400 mt-0.5 truncate">{row.detail}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}

function CustomTable({ children, ...props }) {
  try {
    const thead = children?.find?.(c => c?.type === 'thead');
    const tbody = children?.find?.(c => c?.type === 'tbody');
    
    const headers = thead?.props?.children?.props?.children?.map?.(th => {
      const rawVal = th?.props?.children;
      if (typeof rawVal === 'string') return rawVal.trim();
      if (Array.isArray(rawVal)) return rawVal.map(x => typeof x === 'string' ? x : x?.props?.children || '').join('').trim();
      return '';
    }) || [];

    const rows = tbody?.props?.children;
    const rowArray = Array.isArray(rows) ? rows : rows ? [rows] : [];

    const getCellText = (cell) => {
      if (typeof cell === 'string') return cell.trim();
      if (Array.isArray(cell)) return cell.map(getCellText).join('');
      if (cell?.props?.children) return getCellText(cell.props.children);
      return '';
    };

    // LinkedIn Health Table: | Metric | Score | Status | Detail |
    if (headers.includes('Metric') && headers.includes('Score') && headers.includes('Status') && headers.includes('Detail')) {
      const data = rowArray.map(tr => {
        const tds = tr?.props?.children?.map?.(td => getCellText(td?.props?.children || '')) || [];
        return { metric: tds[0], score: tds[1], status: tds[2], detail: tds[3] };
      });
      return <LinkedInHealthTable data={data} />;
    }

    // Networking Cards Table: | Action | Count | Target |
    if (headers.includes('Action') && headers.includes('Count') && headers.includes('Target')) {
      const data = rowArray.map(tr => {
        const tds = tr?.props?.children?.map?.(td => getCellText(td?.props?.children || '')) || [];
        return { action: tds[0], count: tds[1], target: tds[2] };
      });
      return <NetworkingCardTable data={data} />;
    }

    // Consistency Table: | Field | Status | Detail |
    if (headers.includes('Field') && headers.includes('Status') && headers.includes('Detail')) {
      const data = rowArray.map(tr => {
        const tds = tr?.props?.children?.map?.(td => getCellText(td?.props?.children || '')) || [];
        return { field: tds[0], status: tds[1], detail: tds[2] };
      });
      return <ConsistencyTable data={data} />;
    }

    // 1. ATS Match Table: | Metric | Score | Rating | Recommendation |
    if (headers.includes('Metric') && headers.includes('Score') && headers.includes('Rating')) {
      const data = rowArray.map(tr => {
        const tds = tr?.props?.children?.map?.(td => td?.props?.children || '') || [];
        return {
          metric: tds[0],
          score: parseInt(tds[1]) || 0,
          rating: tds[2],
          recommendation: tds[3]
        };
      });

      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6 no-print">
          {data.map((row, idx) => (
            <div key={idx} className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4 flex flex-col justify-between hover:border-orange-500/20 transition-all duration-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-slate-300">{row.metric}</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  row.score >= 85 ? 'bg-emerald-500/10 text-emerald-400' :
                  row.score >= 70 ? 'bg-amber-500/10 text-amber-400' : 'bg-red-500/10 text-red-400'
                }`}>{row.rating} ({row.score}%)</span>
              </div>
              <div className="w-full bg-white/[0.04] h-2 rounded-full overflow-hidden mb-2">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    row.score >= 85 ? 'bg-emerald-500' :
                    row.score >= 70 ? 'bg-amber-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${row.score}%` }}
                />
              </div>
              <p className="text-xs text-slate-400">{row.recommendation}</p>
            </div>
          ))}
        </div>
      );
    }

    // 2. Keyword Intelligence Table: | Keyword Cluster | Match Status | Importance | Placement Strategy |
    if (headers.includes('Keyword Cluster') && headers.includes('Match Status')) {
      const data = rowArray.map(tr => {
        const tds = tr?.props?.children?.map?.(td => td?.props?.children || '') || [];
        return {
          keyword: tds[0],
          status: tds[1],
          importance: tds[2],
          strategy: tds[3]
        };
      });

      return (
        <div className="my-6 space-y-3 no-print">
          <div className="grid grid-cols-4 text-xs font-semibold text-slate-500 uppercase tracking-wider px-4">
            <div>Keyword</div>
            <div>Status</div>
            <div>Importance</div>
            <div>Strategy</div>
          </div>
          {data.map((row, idx) => {
            const status = row.status?.toString() || '';
            const isMatched = status.includes('✓') || status.toLowerCase().includes('match');
            const isMissing = status.includes('✗') || status.toLowerCase().includes('miss');
            const isWeak = status.includes('⚠') || status.toLowerCase().includes('weak');
            
            return (
              <div key={idx} className="grid grid-cols-4 items-center bg-white/[0.02] border border-white/[0.05] rounded-xl p-4 text-sm hover:bg-white/[0.04] transition-all duration-150">
                <div className="font-bold text-white">{row.keyword}</div>
                <div>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    isMatched ? 'bg-emerald-500/10 text-emerald-400' :
                    isMissing ? 'bg-red-500/10 text-red-400' :
                    isWeak ? 'bg-amber-500/10 text-amber-400' : 'bg-purple-500/10 text-purple-400'
                  }`}>
                    {row.status}
                  </span>
                </div>
                <div className="text-slate-400">{row.importance}</div>
                <div className="text-xs text-slate-500">{row.strategy}</div>
              </div>
            );
          })}
        </div>
      );
    }

    // 3. Bullet Intelligence Table: | Original Bullet | Detected Weakness | Optimized STAR Rewrite (Template) | Why Better |
    if (headers.includes('Original Bullet') && headers.includes('Optimized STAR Rewrite (Template)')) {
      const data = rowArray.map(tr => {
        const tds = tr?.props?.children?.map?.(td => td?.props?.children || '') || [];
        return {
          original: tds[0],
          weakness: tds[1],
          rewrite: tds[2],
          why: tds[3]
        };
      });

      return (
        <div className="my-6 space-y-6 no-print">
          {data.map((row, idx) => (
            <div key={idx} className="border border-white/[0.06] rounded-xl overflow-hidden bg-white/[0.01] hover:border-orange-500/20 transition-all duration-200">
              <div className="bg-red-500/5 px-4 py-3 border-b border-white/[0.05]">
                <span className="text-xs font-bold text-red-400 uppercase tracking-wider">Original Bullet</span>
                <p className="text-sm text-slate-400 mt-1 italic">"{row.original}"</p>
              </div>
              <div className="px-4 py-3 bg-white/[0.01] border-b border-white/[0.05]">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Detected Weaknesses</span>
                <p className="text-sm text-slate-300 mt-1">{row.weakness}</p>
              </div>
              <div className="bg-emerald-500/5 px-4 py-3 border-b border-white/[0.05]">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Optimized STAR Rewrite (Template)</span>
                <p className="text-sm text-white font-semibold mt-1">"{row.rewrite}"</p>
              </div>
              <div className="px-4 py-3 bg-white/[0.02]">
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Why It's Better</span>
                <p className="text-xs text-slate-400 mt-1">{row.why}</p>
              </div>
            </div>
          ))}
        </div>
      );
    }
  } catch (err) {
    console.error("CustomTable render crash caught and recovered:", err);
  }

  return (
    <div className="overflow-x-auto my-6 border border-white/[0.08] rounded-xl">
      <table className="min-w-full divide-y divide-white/[0.08]" {...props}>
        {children}
      </table>
    </div>
  );
}

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

export default function DossierResult({ content, onReset, isPartial, hideToolbar, hideShortBanner, genId, sourceMetadata, isFreeUser = true, dossierType = "company", onContentUpdate, onTriggerCoach }) {
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
          <InlineCoachContext.Provider value={onContentUpdate ? { content, onContentUpdate } : null}>
          {sections.map((section, idx) => {
            const mdComponents = {
              h2: ({ children, ...props }) => <h2 id={section.id} {...props}>{children}</h2>,
              table: CustomTable,
              blockquote: CollapsibleDrawer,
              a: ({ href, children, ...props }) => {
                if (href?.startsWith("apply-headline:")) {
                  const headline = href.slice(15);
                  return <HeadlineOptionButton headline={headline}>{children}</HeadlineOptionButton>;
                }
                if (href?.startsWith("copy-text:")) {
                  const text = href.slice(10);
                  return <CopyTextButton text={text}>{children}</CopyTextButton>;
                }
                if (href?.startsWith("sync-linkedin:")) {
                  const actionData = href.slice(14);
                  return <SyncButton target="linkedin" actionData={actionData}>{children}</SyncButton>;
                }
                if (href?.startsWith("sync-resume:")) {
                  const actionData = href.slice(12);
                  return <SyncButton target="resume" actionData={actionData}>{children}</SyncButton>;
                }
                if (href?.startsWith("draft-post:")) {
                  const bullet = href.slice(11);
                  return <DraftPostButton bullet={bullet} onTriggerCoach={onTriggerCoach}>{children}</DraftPostButton>;
                }
                return <a href={href} className="text-sky-400 hover:underline" {...props}>{children}</a>;
              }
            };
            if (dossierType === "resume" && onContentUpdate) {
              mdComponents.li = EnhancedListItem;
            }
            if (dossierType === "linkedin" && onTriggerCoach) {
              mdComponents.li = ({ children }) => {
                const bulletText = extractText(children);
                const isExperienceBullet = bulletText?.trim().length > 25;
                return (
                  <li className="group relative">
                    <span>{children}</span>
                    {isExperienceBullet && (
                      <button
                        onClick={() => onTriggerCoach(`Draft a highly engaging, thought-leadership LinkedIn post based on this experience bullet:\n\n"${bulletText}"`)}
                        className="ml-2 opacity-0 group-hover:opacity-100 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-sky-500/10 border border-sky-500/20 text-sky-400 text-[10px] font-semibold hover:bg-sky-500/20 transition-all duration-200 align-middle no-print cursor-pointer"
                        title="Draft a post from this experience"
                      >
                        ✍️ Draft Post
                      </button>
                    )}
                  </li>
                );
              };
            }

            return (
              <div key={section.id || idx} id={section.id}>
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={mdComponents}
                >
                  {section.body}
                </ReactMarkdown>
                {section.title && (
                  <div className="mb-8 border-t border-white/[0.05] pt-4">
                    <SourceTiles sources={sourceMetadata} />
                    <FeedbackPanel
                      dossierId={genId}
                      sectionKey={section.title}
                      dossierType={dossierType}
                    />
                  </div>
                )}
              </div>
            );
          })}
          </InlineCoachContext.Provider>
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

        {dossierType === "linkedin" && (
          <div className="mt-8 pt-6 border-t border-white/[0.05] flex flex-col sm:flex-row justify-between items-center gap-4 no-print bg-sky-500/[0.02] border border-sky-500/10 rounded-xl p-6">
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <span>🔄</span> Adjusted your profile or resume?
              </h4>
              <p className="text-xs text-slate-400 mt-1">Re-run the LinkedIn Career Intelligence audit to rescore your brand alignment.</p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="px-5 py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-xs rounded-xl shadow-md transition-all duration-200 cursor-pointer animate-pulse"
            >
              🔄 Re-Score Profile
            </button>
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
