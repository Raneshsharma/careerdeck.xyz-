"use client";

import { useState, useRef, useCallback, useMemo, useEffect } from "react";
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
import HistoryButton from "@/components/HistoryButton";
import OnboardingTour, { shouldShowTour } from "@/components/OnboardingTour";

const DOSSIER_LABELS = {
  company: "Company Dossier",
  role: "Role Dossier",
  jd: "JD Dossier",
  news: "News Dossier",
};

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

  const wordCount = useMemo(() => (content||"").split(/\s+/).filter(Boolean).length, [content]);
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

  const handlePrint = () => { window.print(); };

  const loadDossier = useCallback(async (id) => {
    setLoadingDossier(true);
    setContent("");
    prevStateRef.current = { activeDossierId, content };
    try {
      const res = await fetch(`/api/generations/${id}`);
      if (!res.ok) throw new Error("Failed to load");
      const data = await res.json();
      setContent(data.generation.content || "");
      setActiveDossierId(id);
    } catch {
      toast.error("Failed to load dossier");
      setContent(prevStateRef.current.content);
      setActiveDossierId(prevStateRef.current.activeDossierId);
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
    setSourceMetadata(null)

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
      let contentAccumulated = ""
      let currentGenId = null

      while (true) {
        let readResult
        try { readResult = await reader.read() } catch {
          if (contentAccumulated.length > 0) {
            setWasPartial(true)
            toast("Stream interrupted, but partial dossier was saved.", { icon: "\u26A0\uFE0F" })
            break
          }
          throw new Error()
        }

        const { done, value } = readResult
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const parts = buffer.split("\n\n")
        buffer = parts.pop() || ""

        for (const part of parts) {
          const lines = part.split("\n")
          let eventType = "message"
          let dataLine = ""

          for (const line of lines) {
            if (line.startsWith("event: ")) eventType = line.slice(7).trim()
            else if (line.startsWith("data: ")) dataLine = line.slice(6)
          }

          if (!dataLine) continue

          try {
            const parsed = JSON.parse(dataLine)

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
              // handled below
            } else if (eventType === "error") {
              if (contentAccumulated.length > 0) {
                setWasPartial(true)
              } else {
                setErrorMessage(parsed.message || "LLM API error — check your API key")
                setGenerating(false)
                return
              }
            }
          } catch { /* skip */ }
        }
      }

      if (contentAccumulated.length > 0) {
        setActiveDossierId(currentGenId)
        if (currentGenId) {
          saveContent(currentGenId, contentAccumulated)
          setSidebarVersion((v) => v + 1)
          setUsageVersion((v) => v + 1)
        }
        if (wasPartial) toast("Partial dossier saved.", { icon: "\u26A0\uFE0F" })
        else toast.success("Dossier generated successfully!")
      } else {
        setErrorMessage("No content was generated. Please try again.")
      }
    } catch (err) {
      if (err.name === "AbortError") {
        toast("Generation cancelled")
      } else if (content.length > 0) {
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

  const handleDeleteDossier = useCallback((deletedId) => {
    if (activeDossierId === deletedId) setActiveDossierId(null);
  }, [activeDossierId]);

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

      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-100 hidden lg:flex">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex items-center justify-between h-16 w-full">
          <Link href="/" className="flex items-center">
            <Image src="/logo.png" alt="CareerDeck" height={32} width={48} className="h-8 w-auto" />
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/dashboard" className="text-sm font-medium text-[#0F172A]">Dashboard</Link>
            <Link href="/pricing" className="text-sm text-[#64748B] hover:text-[#0F172A]">Pricing</Link>
            <span data-tour="user-menu"><UserMenu refreshTrigger={usageVersion} /></span>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-6 sm:py-12 pb-20 lg:pb-12">
        <div className="lg:hidden flex items-center justify-between mb-4">
          <h1 className="text-lg font-extrabold text-[#0F172A]">{DOSSIER_LABELS[dossierType]}</h1>
          <HistoryButton onSelect={loadDossier} activeId={activeDossierId} onDelete={handleDeleteDossier} sidebarVersion={sidebarVersion} />
        </div>
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          <aside className="hidden lg:block w-72 shrink-0" data-tour="history">
            <div className="lg:sticky lg:top-24"><HistorySidebar key={sidebarVersion} onSelect={loadDossier} activeId={activeDossierId} onDelete={handleDeleteDossier} /></div>
          </aside>
          <div className="flex-1 min-w-0 max-w-2xl">
        {loadingDossier && <div className="text-center py-16"><div className="w-14 h-14 rounded-full border-[3px] border-gray-200 border-t-brand-500 animate-spin mx-auto mb-6 bg-transparent" /><p className="text-sm text-gray-400 animate-pulse">Loading...</p></div>}

        {!loadingDossier && !content && !generating && (
          <>
            {errorMessage && (
              <div className="bg-red-50 border border-red-300 rounded-lg p-4 mb-4 animate-shake">
                <div className="flex items-start gap-3">
                  <span className="text-red-500 shrink-0 mt-0.5">&#x26A0;&#xFE0F;</span>
                  <div className="flex-1"><p className="text-sm text-red-800">{errorMessage}</p><button onClick={() => setErrorMessage(null)} className="text-xs text-red-600 underline mt-1 hover:text-red-800">Dismiss</button></div>
                </div>
                {(errorMessage.includes("used all generations") || errorMessage.includes("Upgrade")) && (
                  <div className="mt-3 pt-3 border-t border-red-200"><Link href="/checkout?plan=pro" className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 text-[#0F172A] text-xs font-bold rounded-lg">Upgrade to Pro ₹149/mo</Link></div>
                )}
              </div>
            )}
            <span data-tour="form">
            <NonReversingReveal id="form-card" className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
              <div className="mb-6"><h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">{DOSSIER_LABELS[dossierType]}</h1>
              <p className="text-sm text-[#64748B] mt-1">{dossierType === "company" && "Deep dive into a company's business model, strategy, culture, and interview prep."}{dossierType === "role" && "Understand a role's responsibilities, skills, career path, and interview expectations."}{dossierType === "jd" && "Decode a specific job description — hidden expectations, STAR blueprints, and hiring manager perspective."}{dossierType === "news" && "Last 30 days of high-signal developments, analyzed for business and interview relevance."}</p></div>
              <DossierTabs selected={dossierType} onChange={(t) => { setDossierType(t); setErrorMessage(null) }} disabled={generating} />
              <div className="mt-6"><DossierForm onSubmit={handleSubmit} generating={generating} dossierType={dossierType} /></div>
            </NonReversingReveal>
            </span>
          </>
        )}

        {content && !generating && (
          <DossierResult content={content} onReset={handleReset} isPartial={wasPartial} hideToolbar hideShortBanner genId={genId} sourceMetadata={sourceMetadata} />
        )}

        {generating && (
          <div className="max-w-2xl"><div className="text-center">
            <div className="w-14 h-14 rounded-full border-[3px] border-gray-200 border-t-brand-500 animate-spin mx-auto mb-5 bg-transparent" />
            <h2 className="text-xl font-bold text-[#0F172A] mb-1">Building Your {DOSSIER_LABELS[dossierType]}</h2>
            <p className="text-sm text-[#64748B] mb-8">Gathering intelligence, analyzing data, and structuring your dossier</p>
            <button onClick={handleCancel} className="mt-8 text-xs text-gray-400 hover:text-red-500 transition-colors">Cancel generation</button>
          </div></div>
        )}
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-gray-100 mt-16 no-print hidden lg:block">
        <div className="max-w-7xl mx-auto px-8 py-6 text-center text-xs text-gray-400">
          <p><strong className="text-gray-500">CareerDeck</strong> — Verify critical facts before your interview. Good luck!</p>
        </div>
      </footer>
      <BottomNav />
    </div>
  );
}

export default DashboardContent;
