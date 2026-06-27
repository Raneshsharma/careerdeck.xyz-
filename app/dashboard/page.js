"use client";

import { useState, useRef, useCallback, useMemo } from "react";
import { useAuth } from "@/components/SessionProvider";
import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";
import DossierTabs from "@/components/DossierTabs";
import DossierForm from "@/components/DossierForm";
import DossierResult from "@/components/DossierResult";
import SectionNav from "@/components/SectionNav";
import HistorySidebar from "@/components/HistorySidebar";
import NonReversingReveal from "@/components/NonReversingReveal";
import UserMenu from "@/components/UserMenu";
import MobileNavbar from "@/components/MobileNavbar";
import BottomNav from "@/components/BottomNav";
import OnboardingTour, { shouldShowTour } from "@/components/OnboardingTour";

const DOSSIER_LABELS = {
  company: "Company Dossier",
  role: "Role Dossier",
  jd: "JD Dossier",
  news: "News Dossier",
};

const INFO_CARDS = [
  { stat: "4", label: "Dossier Types", desc: "Company, Role, JD, News" },
  { stat: "3+", label: "Data Sources", desc: "Wikipedia, OpenAI, real-time" },
  { stat: "21", label: "Sections Deep", desc: "From strategy to interview questions" },
  { stat: "90s", label: "Generation Time", desc: "From input to complete dossier" },
];

function DashboardContent() {
  const [dossierType, setDossierType] = useState("company");
  const [content, setContent] = useState("");
  const [generating, setGenerating] = useState(false);
  const [newsCount, setNewsCount] = useState(null);
  const [wasPartial, setWasPartial] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [genId, setGenId] = useState(null);
  const [activeDossierId, setActiveDossierId] = useState(null);
  const [sidebarVersion, setSidebarVersion] = useState(0);
  const [usageVersion, setUsageVersion] = useState(0);
  const [copied, setCopied] = useState(false);
  const [sourceMetadata, setSourceMetadata] = useState(null);
  const [tourVisible, setTourVisible] = useState(false);
  const [loadingDossier, setLoadingDossier] = useState(false);
  const abortRef = useRef(null);
  const prevStateRef = useRef({ activeDossierId: null, content: "" });

  const { user, loading } = useAuth();
  const tourLoaded = useRef(false);

  useEffect(() => {
    if (user && shouldShowTour() && !tourLoaded.current) {
      tourLoaded.current = true;
      const t = setTimeout(() => setTourVisible(true), 600);
      return () => clearTimeout(t);
    }
  }, [user]);

  const wordCount = useMemo(() => content.split(/\s+/).filter(Boolean).length, [content]);
  const minRead = useMemo(() => Math.ceil(wordCount / 250), [wordCount]);

  const handleCopy = useCallback(async () => {
    try { await navigator.clipboard.writeText(content); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch {}
  }, [content]);

  const handleDownload = useCallback(() => {
    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "careerdeck-dossier.md";
    document.body.appendChild(a); a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [content]);

  const handlePrint = useCallback(() => { window.print(); }, []);

  const handleDeleteDossier = useCallback((deletedId) => {
    if (activeDossierId === deletedId) {
      setContent("");
      setActiveDossierId(null);
      setWasPartial(false);
      setErrorMessage(null);
    }
  }, [activeDossierId]);

  const loadDossier = useCallback(async (id) => {
    prevStateRef.current = { activeDossierId, content };

    setContent("");
    setLoadingDossier(true);
    setWasPartial(false);
    setErrorMessage(null);
    setGenerating(false);
    setGenId(null);
    setNewsCount(null);
    setActiveDossierId(id);

    try {
      const res = await fetch(`/api/generations/${id}`);
      if (!res.ok) {
        let detail = "";
        try { const e = await res.json(); detail = e.error || ""; } catch {}
        throw new Error(`Failed to load dossier (${res.status}${detail ? ": " + detail : ""})`);
      }
      const data = await res.json();
      if (!data.generation?.content) {
        setContent("");
        setErrorMessage("This dossier has no saved content yet.");
        setLoadingDossier(false);
        return;
      }
      setContent(data.generation.content);
    } catch (err) {
      setActiveDossierId(prevStateRef.current.activeDossierId);
      setContent(prevStateRef.current.content);
      toast.error(err.message, {
        style: { background: "#DC2626", color: "#fff", fontSize: "14px" },
      });
    } finally {
      setLoadingDossier(false);
    }
  }, [activeDossierId, content]);

  const saveContent = useCallback(async (id, dossierContent) => {
    try {
      await fetch(`/api/generations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: dossierContent }),
      })
    } catch (err) {
      console.error("Save content error:", err)
    }
  }, [])

  const handleSubmit = useCallback(async (data) => {
    if (generating || abortRef.current) return

    setGenerating(true)
    setContent("")
    setNewsCount(null)
    setWasPartial(false)
    setErrorMessage(null)
    setGenId(null)
    setActiveDossierId(null)

    const controller = new AbortController()
    abortRef.current = controller

    let stallTimer = null
    let lastChunkTime = Date.now()

    const resetStallTimer = () => {
      lastChunkTime = Date.now()
      if (stallTimer) clearTimeout(stallTimer)
      stallTimer = setTimeout(() => {
        const elapsed = Math.round((Date.now() - lastChunkTime) / 1000)
        toast("No new content for " + elapsed + "s — still generating...", { icon: "\u23F3", duration: 5000 })
      }, 45000)
    }

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, dossierType }),
        signal: controller.signal,
      })

      if (!res.ok) {
        let errMsg = "Failed to generate dossier"
        try { const err = await res.json(); errMsg = err.error || errMsg } catch {}
        throw new Error(errMsg)
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ""
      let receivedDone = false
      let contentAccumulated = ""
      let currentGenId = null

      while (true) {
        let readResult
        try { readResult = await reader.read() } catch (readerErr) {
          if (contentAccumulated.length > 0) {
            setWasPartial(true)
            toast("Stream interrupted, but partial dossier was saved.", { icon: "\u26A0\uFE0F" })
            break
          }
          throw readerErr
        }

        const { done, value } = readResult
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const parts = buffer.split("\n\n")
        buffer = parts.pop() || ""

        for (const part of parts) {
          const lines = part.split("\n")
          let eventType = "message"
          let data = ""

          for (const line of lines) {
            if (line.startsWith("event: ")) eventType = line.slice(7).trim()
            else if (line.startsWith("data: ")) data = line.slice(6)
          }

          if (!data) continue

          try {
            const parsed = JSON.parse(data)

            if (eventType === "gen-id") {
              currentGenId = parsed.id
              setGenId(parsed.id)
            } else if (eventType === "chunk") {
              contentAccumulated += parsed.content
              setContent((prev) => prev + parsed.content)
              resetStallTimer()
            } else if (eventType === "news-status") {
              setNewsCount(parsed.count)
            } else if (eventType === "sources") {
              setSourceMetadata(parsed.sources)
            } else if (eventType === "done") {
              receivedDone = true
            } else if (eventType === "error") {
              if (contentAccumulated.length > 0) {
                setWasPartial(true)
                receivedDone = true
              } else {
                setErrorMessage(parsed.message || "LLM API error — check your API key")
                setGenerating(false)
                return
              }
            }
          } catch { /* skip */ }
        }
      }

      if (receivedDone && contentAccumulated.length > 0) {
        setActiveDossierId(currentGenId)
        if (currentGenId) {
            saveContent(currentGenId, contentAccumulated)
            setSidebarVersion((v) => v + 1)
            setUsageVersion((v) => v + 1)
          }
        if (wasPartial) toast("Partial dossier saved.", { icon: "\u26A0\uFE0F" })
        else toast.success("Dossier generated successfully!")
      } else if (contentAccumulated.length > 0) {
        setWasPartial(true)
        if (currentGenId) {
            saveContent(currentGenId, contentAccumulated)
            setActiveDossierId(currentGenId)
            setSidebarVersion((v) => v + 1)
            setUsageVersion((v) => v + 1)
          }
        toast("Partial output saved.", { icon: "\u26A0\uFE0F" })
      } else {
        setErrorMessage("No content was generated. Please try again.")
      }
    } catch (err) {
      if (err.name === "AbortError") {
        toast("Generation cancelled")
      } else if (content.length > 0) {
        setWasPartial(true)
        toast("Connection lost, but partial dossier was saved.", { icon: "\u26A0\uFE0F" })
      } else {
        setErrorMessage(err.message || "Something went wrong")
      }
    } finally {
      if (stallTimer) clearTimeout(stallTimer)
      setGenerating(false)
      abortRef.current = null
    }
  }, [dossierType, content.length, generating, saveContent])

  const handleCancel = () => { if (abortRef.current) abortRef.current.abort() }

  const handleReset = () => {
    setContent("")
    setGenerating(false)
    setNewsCount(null)
    setWasPartial(false)
    setErrorMessage(null)
    setGenId(null)
    setActiveDossierId(null)
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <MobileNavbar usageVersion={usageVersion} />

      {/* ── Desktop Header ── */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-100 hidden lg:flex">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex items-center justify-between h-16 w-full">
          <Link href="/" className="flex items-center">
            <Image src="/logo.png" alt="CareerDeck" height={32} width={48} className="h-8 w-auto" />
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/dashboard" className="text-sm font-medium text-[#0F172A]">Dashboard</Link>
            <Link href="/pricing" className="text-sm text-[#64748B] hover:text-[#0F172A]">Pricing</Link>
            <span data-tour="user-menu">
              <UserMenu refreshTrigger={usageVersion} />
            </span>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-6 sm:py-12 pb-20 lg:pb-12">
        {/* ── Mobile: History button ── */}
        <div className="lg:hidden flex items-center justify-between mb-4">
          <h1 className="text-lg font-extrabold text-[#0F172A]">{DOSSIER_LABELS[dossierType]}</h1>
          <HistoryButton onSelect={loadDossier} activeId={activeDossierId} onDelete={handleDeleteDossier} sidebarVersion={sidebarVersion} />
        </div>
        {/* ── Full-width toolbar ── */}
        {content && !generating && (
          <div className="sticky top-16 z-30 bg-white/80 backdrop-blur-sm border-b border-gray-200 mb-6 -mx-4 sm:-mx-8 px-4 sm:px-8 py-3 no-print">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <span className="text-xs text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full font-medium">
                {wordCount.toLocaleString()} words &middot; ~{minRead} min read
              </span>
              <div className="flex items-center gap-1.5">
                <button onClick={handleReset} className="px-3 py-1.5 text-xs font-medium rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200">
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
          </div>
        )}

        {/* Mobile: Section Nav (horizontal scroll below toolbar) */}
        {content && !generating && (
          <div className="lg:hidden mb-4">
            <SectionNav content={content} />
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* ── Left: History Sidebar (desktop only) ── */}
          <aside className="hidden lg:block w-72 shrink-0" data-tour="history">
            <div className="lg:sticky lg:top-24">
              <HistorySidebar
                key={sidebarVersion}
                onSelect={loadDossier}
                activeId={activeDossierId}
                onDelete={handleDeleteDossier}
              />
            </div>
          </aside>

          {/* ── Center: Main content ── */}
          <div className="flex-1 min-w-0 max-w-2xl">
            {loadingDossier && (
              <div className="text-center py-16">
                <div className="w-14 h-14 rounded-full border-[3px] border-gray-200 border-t-brand-500 animate-spin mx-auto mb-6 bg-transparent" />
                <p className="text-sm text-gray-400 animate-pulse">Loading dossier...</p>
              </div>
            )}

            {!loadingDossier && !content && !generating && (
              <>
                {errorMessage && (
                  <div className="bg-red-50 border border-red-300 rounded-lg p-4 mb-4 animate-shake">
                    <div className="flex items-start gap-3">
                      <span className="text-red-500 shrink-0 mt-0.5">&#x26A0;&#xFE0F;</span>
                      <div className="flex-1">
                        <p className="text-sm text-red-800">{errorMessage}</p>
                        <button onClick={() => setErrorMessage(null)} className="text-xs text-red-600 underline mt-1 hover:text-red-800">Dismiss</button>
                      </div>
                    </div>
                    {(errorMessage.includes("used all generations") || errorMessage.includes("Upgrade")) && (
                      <div className="mt-3 pt-3 border-t border-red-200">
                        <Link href="/checkout?plan=pro" className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-[#0F172A] text-xs font-bold rounded-lg transition-all duration-200">
                          Upgrade to Pro ₹499/mo
                        </Link>
                      </div>
                    )}
                  </div>
                )}

                <span data-tour="form">
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
                  <DossierTabs selected={dossierType} onChange={(t) => { setDossierType(t); setErrorMessage(null) }} disabled={generating} />
                  <div className="mt-6">
                    <DossierForm onSubmit={handleSubmit} generating={generating} dossierType={dossierType} />
                  </div>
                </NonReversingReveal>
                </span>

                <NonReversingReveal id="generate-stats" className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {INFO_CARDS.map((card) => (
                    <div key={card.label} className="bg-white rounded-xl border border-gray-100 p-4 text-center hover:shadow-sm hover:-translate-y-0.5 transition-all duration-200">
                      <p className="text-2xl font-extrabold text-brand-500">{card.stat}</p>
                      <p className="text-sm font-semibold text-[#0F172A] mt-0.5">{card.label}</p>
                      <p className="text-xs text-[#94A3B8] mt-0.5">{card.desc}</p>
                    </div>
                  ))}
                </NonReversingReveal>
              </>
            )}

            {generating && (
              <div className="max-w-2xl">
                <div className="text-center">
                  <div className="w-14 h-14 rounded-full border-[3px] border-gray-200 border-t-brand-500 animate-spin mx-auto mb-5 bg-transparent" />
                  <h2 className="text-xl font-bold text-[#0F172A] mb-1">Building Your {DOSSIER_LABELS[dossierType]}</h2>
                  <p className="text-sm text-[#64748B] mb-8">Gathering intelligence, analyzing data, and structuring your dossier</p>

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

                {content && (
                  <div className="mt-8 transition-all duration-300">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-10 opacity-90 hover:opacity-100 transition-opacity">
                      <div className="dossier-markdown" dangerouslySetInnerHTML={{ __html: renderMarkdownPreview(content) }} />
                    </div>
                  </div>
                )}
              </div>
            )}

            {content && !generating && (
              <>
                {errorMessage && (
                  <div className="mb-4 bg-red-50 border border-red-300 rounded-lg p-4 flex items-start gap-3 animate-shake">
                    <span className="text-red-500 shrink-0 mt-0.5">&#x26A0;&#xFE0F;</span>
                    <div className="flex-1">
                      <p className="text-sm text-red-800">{errorMessage}</p>
                      <button onClick={() => setErrorMessage(null)} className="text-xs text-red-600 underline mt-1 hover:text-red-800">Dismiss</button>
                    </div>
                  </div>
                )}
                <DossierResult content={content} onReset={handleReset} isPartial={wasPartial} hideToolbar hideShortBanner genId={genId} sourceMetadata={sourceMetadata} />
              </>
            )}
          </div>

          {/* ── Right: Amber banner + TOC ── */}
          {content && !generating && (
            <aside className="hidden lg:block w-56 shrink-0">
              <div className="space-y-4">
                {wasPartial && (
                  <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4 no-print">
                    <p className="text-sm text-yellow-800"><strong>&#x26A0;&#xFE0F; Partial output:</strong> Generation was cut short — some later sections may be incomplete. What was generated is fully usable.</p>
                  </div>
                )}
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 no-print">
                  <p className="text-sm text-amber-800"><strong>&#x23F0; Short on time?</strong> Jump to the Interview Intelligence and Smart Questions sections for quick prep.</p>
                </div>
                <SectionNav content={content} className="sticky top-24" />
              </div>
            </aside>
          )}
        </div>
      </main>

      <footer className="bg-white border-t border-gray-100 mt-16 no-print hidden lg:block">
        <div className="max-w-7xl mx-auto px-8 py-6 text-center text-xs text-gray-400">
          <p><strong className="text-gray-500">CareerDeck</strong> — Verify critical facts before your interview. Good luck!</p>
        </div>
      </footer>

      <BottomNav />

      {tourVisible && (
        <OnboardingTour onComplete={() => setTourVisible(false)} />
      )}
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

export default DashboardContent;
