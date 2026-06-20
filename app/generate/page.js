"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";
import DossierTabs from "@/components/DossierTabs";
import DossierForm from "@/components/DossierForm";
import DossierResult from "@/components/DossierResult";
import SectionNav from "@/components/SectionNav";
import NonReversingReveal from "@/components/NonReversingReveal";

const DOSSIER_LABELS = {
  company: "Company Dossier",
  role: "Role Dossier",
  jd: "JD Dossier",
  news: "News Dossier",
};

const INFO_CARDS = [
  { stat: "4", label: "Dossier Types", desc: "Company, Role, JD, News" },
  { stat: "3+", label: "Data Sources", desc: "SerpAPI, OpenAI, real-time news" },
  { stat: "21", label: "Sections Deep", desc: "From strategy to interview questions" },
  { stat: "90s", label: "Generation Time", desc: "From input to complete dossier" },
];

export default function GeneratePage() {
  const [dossierType, setDossierType] = useState("company");
  const [content, setContent] = useState("");
  const [generating, setGenerating] = useState(false);
  const [newsCount, setNewsCount] = useState(null);
  const [wasPartial, setWasPartial] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const abortRef = useRef(null);

  const handleSubmit = useCallback(async (data) => {
    if (generating || abortRef.current) return;

    setGenerating(true);
    setContent("");
    setNewsCount(null);
    setWasPartial(false);
    setErrorMessage(null);

    const controller = new AbortController();
    abortRef.current = controller;

    let stallTimer = null;
    let lastChunkTime = Date.now();

    const resetStallTimer = () => {
      lastChunkTime = Date.now();
      if (stallTimer) clearTimeout(stallTimer);
      stallTimer = setTimeout(() => {
        const elapsed = Math.round((Date.now() - lastChunkTime) / 1000);
        toast("No new content for " + elapsed + "s — still generating...", { icon: "\u23F3", duration: 5000 });
      }, 45000);
    };

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, dossierType }),
        signal: controller.signal,
      });

      if (!res.ok) {
        let errMsg = "Failed to generate dossier";
        try { const err = await res.json(); errMsg = err.error || errMsg; } catch {}
        throw new Error(errMsg);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let receivedDone = false;
      let contentAccumulated = "";

      while (true) {
        let readResult;
        try { readResult = await reader.read(); } catch (readerErr) {
          if (contentAccumulated.length > 0) {
            setWasPartial(true);
            toast("Stream interrupted, but partial dossier was saved.", { icon: "\u26A0\uFE0F" });
            break;
          }
          throw readerErr;
        }

        const { done, value } = readResult;
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split("\n\n");
        buffer = parts.pop() || "";

        for (const part of parts) {
          const lines = part.split("\n");
          let eventType = "message";
          let data = "";

          for (const line of lines) {
            if (line.startsWith("event: ")) eventType = line.slice(7).trim();
            else if (line.startsWith("data: ")) data = line.slice(6);
          }

          if (!data) continue;

          try {
            const parsed = JSON.parse(data);

            if (eventType === "chunk") {
              contentAccumulated += parsed.content;
              setContent((prev) => prev + parsed.content);
              resetStallTimer();
            } else if (eventType === "news-status") {
              setNewsCount(parsed.count);
            } else if (eventType === "done") {
              receivedDone = true;
            } else if (eventType === "error") {
              if (contentAccumulated.length > 0) {
                setWasPartial(true);
                receivedDone = true;
              } else {
                setErrorMessage(parsed.message || "LLM API error — check your API key");
                setGenerating(false);
                return;
              }
            }
          } catch { /* skip */ }
        }
      }

      if (receivedDone && contentAccumulated.length > 0) {
        if (wasPartial) toast("Partial dossier saved.", { icon: "\u26A0\uFE0F" });
        else toast.success("Dossier generated successfully!");
      } else if (contentAccumulated.length > 0) {
        setWasPartial(true);
        toast("Partial output saved.", { icon: "\u26A0\uFE0F" });
      } else {
        setErrorMessage("No content was generated. Please try again.");
      }
    } catch (err) {
      if (err.name === "AbortError") {
        toast("Generation cancelled");
      } else if (content.length > 0) {
        setWasPartial(true);
        toast("Connection lost, but partial dossier was saved.", { icon: "\u26A0\uFE0F" });
      } else {
        setErrorMessage(err.message || "Something went wrong");
      }
    } finally {
      if (stallTimer) clearTimeout(stallTimer);
      setGenerating(false);
      abortRef.current = null;
    }
  }, [dossierType, content.length, generating]);

  const handleCancel = () => { if (abortRef.current) abortRef.current.abort(); };

  const handleReset = () => {
    setContent("");
    setGenerating(false);
    setNewsCount(null);
    setWasPartial(false);
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* ── Header ── */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2.5">
            <Image src="/logo.png" alt="CareerDeck" height={32} width={48} className="h-8 w-auto" />
            <span className="text-sm font-bold text-[#0F172A] hidden sm:inline">CareerDeck</span>
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/profile" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">Profile</Link>
            <Link href="/" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">Home</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8 sm:py-12">
        {/* ── IDLE STATE: form + info ── */}
        {!content && !generating && (
          <div className="max-w-2xl mx-auto">
            {errorMessage && (
              <div className="bg-red-50 border border-red-300 rounded-lg p-4 mb-4 flex items-start gap-3 animate-shake">
                <span className="text-red-500 shrink-0 mt-0.5">&#x26A0;&#xFE0F;</span>
                <div className="flex-1">
                  <p className="text-sm text-red-800">{errorMessage}</p>
                  <button onClick={() => setErrorMessage(null)} className="text-xs text-red-600 underline mt-1 hover:text-red-800">Dismiss</button>
                </div>
              </div>
            )}

            <NonReversingReveal id="form-card" className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
              <div className="mb-6">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">{DOSSIER_LABELS[dossierType]}</h1>
                <p className="text-sm text-[#64748B] mt-1">
                  {dossierType === "company" && "Deep dive into a company's business model, strategy, culture, and interview prep."}
                  {dossierType === "role" && "Understand a role's responsibilities, skills, career path, and interview expectations."}
                  {dossierType === "jd" && "Decode a specific job description — hidden expectations, STAR blueprints, and hiring manager perspective."}
                  {dossierType === "news" && "Last 30 days of high-signal developments, analyzed for business and interview relevance."}
                </p>
              </div>
              <DossierTabs selected={dossierType} onChange={(t) => { setDossierType(t); setErrorMessage(null); }} disabled={generating} />
              <div className="mt-6">
                <DossierForm onSubmit={handleSubmit} generating={generating} dossierType={dossierType} />
              </div>
            </NonReversingReveal>

            <NonReversingReveal id="generate-stats" className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {INFO_CARDS.map((card) => (
                <div key={card.label} className="bg-white rounded-xl border border-gray-100 p-4 text-center hover:shadow-sm hover:-translate-y-0.5 transition-all duration-200">
                  <p className="text-2xl font-extrabold text-brand-500">{card.stat}</p>
                  <p className="text-sm font-semibold text-[#0F172A] mt-0.5">{card.label}</p>
                  <p className="text-xs text-[#94A3B8] mt-0.5">{card.desc}</p>
                </div>
              ))}
            </NonReversingReveal>
          </div>
        )}

        {/* ── GENERATING STATE ── */}
        {generating && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
              <div className="w-14 h-14 rounded-full border-4 border-amber-200 border-t-brand-500 animate-spin mx-auto mb-5 animate-pulse-glow" />
              <h2 className="text-xl font-bold text-[#0F172A] mb-1">Building Your {DOSSIER_LABELS[dossierType]}</h2>
              <p className="text-sm text-[#64748B] mb-8">Gathering intelligence, analyzing data, and structuring your dossier</p>

              {/* Status pipeline */}
              <div className="max-w-xs mx-auto space-y-4 text-left">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center text-xs shrink-0">&#x2713;</span>
                  <div>
                    <p className="text-sm font-medium text-green-700">Research complete</p>
                    {newsCount !== null && (
                      <p className="text-xs text-green-500">{newsCount} data points found</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                    <span className="w-2.5 h-2.5 rounded-full bg-brand-500 animate-pulse" />
                  </span>
                  <div>
                    <p className="text-sm font-medium text-amber-700">Generating dossier</p>
                    {content && (
                      <p className="text-xs text-amber-500">{content.length.toLocaleString()} characters so far</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                    <span className="w-2 h-2 rounded-full bg-gray-300" />
                  </span>
                  <p className="text-sm text-gray-400">Formatting output</p>
                </div>
              </div>

              <button onClick={handleCancel} className="mt-8 text-xs text-gray-400 hover:text-red-500 transition-colors">
                Cancel generation
              </button>
            </div>

            {/* Live preview */}
            {content && (
              <div className="mt-8 transition-all duration-300">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-10 opacity-90 hover:opacity-100 transition-opacity">
                  <div className="dossier-markdown" dangerouslySetInnerHTML={{ __html: renderMarkdownPreview(content) }} />
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── RESULT STATE ── */}
        {content && !generating && (
          <>
            {errorMessage && (
              <div className="max-w-5xl mx-auto mb-4 bg-red-50 border border-red-300 rounded-lg p-4 flex items-start gap-3 animate-shake">
                <span className="text-red-500 shrink-0 mt-0.5">&#x26A0;&#xFE0F;</span>
                <div className="flex-1">
                  <p className="text-sm text-red-800">{errorMessage}</p>
                  <button onClick={() => setErrorMessage(null)} className="text-xs text-red-600 underline mt-1 hover:text-red-800">Dismiss</button>
                </div>
              </div>
            )}
            <div className="lg:grid lg:grid-cols-[1fr_220px] gap-6 max-w-5xl mx-auto">
              <DossierResult content={content} onReset={handleReset} isPartial={wasPartial} />
              <div className="mt-6 lg:mt-0 lg:block">
                <SectionNav content={content} />
              </div>
            </div>
          </>
        )}
      </main>

      {/* ── Footer ── */}
      <footer className="bg-white border-t border-gray-100 mt-16 no-print">
        <div className="max-w-7xl mx-auto px-8 py-6 text-center text-xs text-gray-400">
          <p><strong className="text-gray-500">CareerDeck</strong> — Verify critical facts before your interview. Good luck!</p>
        </div>
      </footer>
    </div>
  );
}

function renderMarkdownPreview(md) {
  let html = escapeHTML(md);
  html = html.replace(/^#### (.+)$/gm, "<h4>$1</h4>");
  html = html.replace(/^### (.+)$/gm, "<h3>$1</h3>");
  html = html.replace(/^## (.+)$/gm, "<h2>$1</h2>");
  html = html.replace(/^# (.+)$/gm, "<h1>$1</h1>");
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>");
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");
  html = html.replace(/`([^`]+)`/g, "<code>$1</code>");
  html = html.replace(/^={20,}$/gm, "<hr/>");
  html = html.replace(/^- (.+)$/gm, "<li>$1</li>");
  html = html.replace(/((?:<li>.*<\/li>\n?)+)/g, "<ul>$1</ul>");
  html = html.replace(/^(?!<[a-z]|$)(.+)$/gm, "<p>$1</p>");
  html = html.replace(/<p>\s*<\/p>/g, "");
  html = html.replace(/<\/ul>\n?<ul>/g, "");
  return html;
}

function escapeHTML(text) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}
