"use client";

import { useState, useRef, useCallback } from "react";
import toast from "react-hot-toast";
import DossierTabs from "@/components/DossierTabs";
import DossierForm from "@/components/DossierForm";
import DossierResult from "@/components/DossierResult";
import SectionNav from "@/components/SectionNav";

const DOSSIER_LABELS = {
  company: "Company Dossier",
  role: "Role Dossier",
  jd: "JD Dossier",
  news: "News Dossier",
};

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
    <div className="min-h-screen">
      <header className="bg-white border-b border-gray-200 no-print">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:py-6">
          <div className="flex items-center gap-3 mb-1">
            <span className="text-3xl">&#x1F3AF;</span>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">CareerDeck</h1>
          </div>
          <p className="text-gray-500 text-sm sm:text-base">
            Company, Role, JD, and News dossiers — built for MBA students and early-career professionals.
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 sm:py-10">
        {!content && !generating && (
          <div className="max-w-2xl mx-auto">
            {errorMessage && (
              <div className="bg-red-50 border border-red-300 rounded-lg p-4 mb-4 flex items-start gap-3">
                <span className="text-red-500 shrink-0 mt-0.5">&#x26A0;&#xFE0F;</span>
                <div className="flex-1">
                  <p className="text-sm text-red-800">{errorMessage}</p>
                  <button onClick={() => setErrorMessage(null)} className="text-xs text-red-600 underline mt-1 hover:text-red-800">Dismiss</button>
                </div>
              </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
              <DossierTabs selected={dossierType} onChange={(t) => { setDossierType(t); setErrorMessage(null); }} disabled={generating} />
              <div className="mt-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-1">{DOSSIER_LABELS[dossierType]}</h2>
                <p className="text-sm text-gray-500 mb-6">
                  {dossierType === "company" && "Deep dive into a company's business model, strategy, culture, and interview prep."}
                  {dossierType === "role" && "Understand a role's responsibilities, skills, career path, and interview expectations."}
                  {dossierType === "jd" && "Decode a specific job description — hidden expectations, STAR blueprints, and hiring manager perspective."}
                  {dossierType === "news" && "Last 30 days of high-signal developments, analyzed for business and interview relevance."}
                </p>
                <DossierForm onSubmit={handleSubmit} generating={generating} dossierType={dossierType} />
              </div>
            </div>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { emoji: "&#x1F4CA;", title: "4 Dossier Types", desc: "Company, Role, JD, and News — each with its own deep, structured framework." },
                { emoji: "&#x1F50D;", title: "Real Data Powered", desc: "SerpAPI fetches financials, competitors, news, and salary data for real numbers." },
                { emoji: "&#x1F3AF;", title: "Interview Focused", desc: "Every section includes talking points, smart questions, and likely interview topics." },
                { emoji: "&#x26A1;", title: "MBA/Grad Optimized", desc: "Practical, business-aware language — never academic theory or encyclopedia fluff." },
              ].map((card) => (
                <div key={card.title} className="bg-white rounded-lg border border-gray-200 p-4 sm:p-5">
                  <p className="text-2xl mb-2" dangerouslySetInnerHTML={{ __html: card.emoji }} />
                  <h3 className="font-semibold text-gray-800 mb-1">{card.title}</h3>
                  <p className="text-sm text-gray-500">{card.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {generating && (
          <div className="max-w-2xl mx-auto text-center py-12">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <div className="animate-spin h-10 w-10 border-4 border-brand-200 border-t-brand-600 rounded-full mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Generating {DOSSIER_LABELS[dossierType]}...</h2>
              <p className="text-gray-500 mb-4">Building your dossier with CareerDeck AI. This takes about 60-90 seconds.</p>
              {newsCount !== null && (
                <p className="text-sm text-green-600 mb-2">&#x1F4F0; {newsCount} data points found for context</p>
              )}
              {content && (
                <p className="text-sm text-brand-600">{content.length.toLocaleString()} characters generated so far</p>
              )}
              <button onClick={handleCancel} className="mt-4 px-4 py-2 text-sm text-gray-600 hover:text-red-600 transition-colors">Cancel</button>
            </div>
            {content && (
              <div className="mt-8 text-left">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-10">
                  <div className="dossier-markdown" dangerouslySetInnerHTML={{ __html: renderMarkdownPreview(content) }} />
                </div>
              </div>
            )}
          </div>
        )}

        {content && !generating && (
          <>
            {errorMessage && (
              <div className="bg-red-50 border border-red-300 rounded-lg p-4 mb-4 flex items-start gap-3">
                <span className="text-red-500 shrink-0 mt-0.5">&#x26A0;&#xFE0F;</span>
                <div className="flex-1">
                  <p className="text-sm text-red-800">{errorMessage}</p>
                  <button onClick={() => setErrorMessage(null)} className="text-xs text-red-600 underline mt-1 hover:text-red-800">Dismiss</button>
                </div>
              </div>
            )}
            <div className="lg:grid lg:grid-cols-[1fr_220px] gap-6">
              <DossierResult content={content} onReset={handleReset} isPartial={wasPartial} />
              <div className="mt-6 lg:mt-0 lg:block">
                <SectionNav content={content} />
              </div>
            </div>
          </>
        )}
      </main>

      <footer className="bg-white border-t border-gray-200 mt-12 no-print">
        <div className="max-w-7xl mx-auto px-4 py-6 text-center text-sm text-gray-400">
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

