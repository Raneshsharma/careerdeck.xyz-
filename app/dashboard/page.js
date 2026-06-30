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
  const [profileData, setProfileData] = useState(null);
  const [copied, setCopied] = useState(false);
  const [sourceMetadata, setSourceMetadata] = useState(null);
  const [tourVisible, setTourVisible] = useState(false);
  const [loadingDossier, setLoadingDossier] = useState(false);
  const abortRef = useRef(null);
  const prevStateRef = useRef({ activeDossierId: null, content: "" });

  const { user, loading } = useAuth();
  useEffect(() => {
    if (user) { fetch("/api/profile").then(r => r.json()).then(d => setProfileData(d)).catch(() => {}); }
  }, [user, usageVersion]);
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
    <div className="min-h-screen bg-[#030712] relative overflow-hidden text-slate-200">
      {/* 3D Perspective Grid Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(124,58,237,0.06),transparent_50%)] pointer-events-none z-0" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none z-0" />

      <MobileNavbar usageVersion={usageVersion} />

      <header className="sticky top-0 z-50 bg-[#0B0F19]/80 border-b border-white/[0.08] backdrop-blur-md hidden lg:flex text-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex items-center justify-between h-16 w-full">
          <Link href="/" className="flex items-center">
            <Image src="/logo.png" alt="CareerDeck" height={32} width={48} className="h-8 w-auto filter brightness-110" />
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/dashboard" className="text-sm font-semibold text-[#F28C28]">Dashboard</Link>
            <Link href="/pricing" className="text-sm text-slate-400 hover:text-white">Pricing</Link>
            <span data-tour="user-menu"><UserMenu refreshTrigger={usageVersion} /></span>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-6 sm:py-12 pb-20 lg:pb-12 relative z-10">
        <div className="lg:hidden flex items-center justify-between mb-4">
          <h1 className="text-lg font-extrabold text-white">{DOSSIER_LABELS[dossierType]}</h1>
          <HistoryButton onSelect={loadDossier} activeId={activeDossierId} onDelete={handleDeleteDossier} sidebarVersion={sidebarVersion} />
        </div>
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          <aside className="hidden lg:block w-72 shrink-0" data-tour="history">
            <div className="lg:sticky lg:top-24"><HistorySidebar key={sidebarVersion} onSelect={loadDossier} activeId={activeDossierId} onDelete={handleDeleteDossier} /></div>
          </aside>
          <div className="flex-1 min-w-0 max-w-2xl">
        {loadingDossier && <div className="text-center py-16"><div className="w-14 h-14 rounded-full border-[3px] border-white/10 border-t-[#F28C28] animate-spin mx-auto mb-6 bg-transparent" /><p className="text-sm text-slate-500 animate-pulse">Loading...</p></div>}

        {!loadingDossier && !content && !generating && (
          <>
            {errorMessage && (
              <div className="bg-red-500/10 border border-red-500/25 rounded-lg p-4 mb-4 animate-shake">
                <div className="flex items-start gap-3">
                  <span className="text-red-400 shrink-0 mt-0.5">&#x26A0;&#xFE0F;</span>
                  <div className="flex-1"><p className="text-sm text-red-400">{errorMessage}</p><button onClick={() => setErrorMessage(null)} className="text-xs text-red-400 underline mt-1 hover:text-red-300">Dismiss</button></div>
                </div>
                {(errorMessage.includes("used all generations") || errorMessage.includes("Upgrade")) && (
                  <div className="mt-3 pt-3 border-t border-white/[0.08]"><Link href="/checkout?plan=pro" className="inline-flex items-center gap-2 px-4 py-2 bg-[#F28C28] hover:bg-[#E07E1F] text-[#030712] text-xs font-bold rounded-lg shadow-md">Upgrade to Pro</Link></div>
                )}
              </div>
            )}
            <span data-tour="form">
            <NonReversingReveal id="form-card" className="bg-[#0B0F19]/60 border border-white/[0.08] backdrop-blur-md rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.4)] p-6 sm:p-8">
              <div className="mb-6"><h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{DOSSIER_LABELS[dossierType]}</h1>
              <p className="text-sm text-slate-400 mt-1">{dossierType === "company" && "Deep dive into a company's business model, strategy, culture, and interview prep."}{dossierType === "role" && "Understand a role's responsibilities, skills, career path, and interview expectations."}{dossierType === "jd" && "Decode a specific job description — hidden expectations, STAR blueprints, and hiring manager perspective."}{dossierType === "news" && "Last 30 days of high-signal developments, analyzed for business and interview relevance."}</p></div>
              <DossierTabs selected={dossierType} onChange={(t) => { setDossierType(t); setErrorMessage(null) }} disabled={generating} />
              <div className="mt-6"><DossierForm onSubmit={handleSubmit} generating={generating} dossierType={dossierType} /></div>
            </NonReversingReveal>
            </span>
          </>
        )}

        {content && !generating && (
          <DossierResult content={content} onReset={handleReset} isPartial={wasPartial} hideToolbar hideShortBanner genId={genId} sourceMetadata={sourceMetadata} isFreeUser={!profileData?.profile?.plan_tier || profileData?.profile?.plan_tier === "free"} />
        )}

        {generating && (
          <div className="max-w-2xl"><div className="text-center">
            <div className="w-14 h-14 rounded-full border-[3px] border-white/10 border-t-[#F28C28] animate-spin mx-auto mb-5 bg-transparent" />
            <h2 className="text-xl font-bold text-white mb-1">Building Your {DOSSIER_LABELS[dossierType]}</h2>
            <p className="text-sm text-slate-400 mb-8">Gathering intelligence, analyzing data, and structuring your dossier</p>
            <button onClick={handleCancel} className="mt-8 text-xs text-slate-500 hover:text-red-400 transition-colors">Cancel generation</button>
          </div></div>
        )}
          </div>
        </div>
      </main>

      <footer className="bg-transparent border-t border-white/[0.05] mt-16 no-print hidden lg:block">
        <div className="max-w-7xl mx-auto px-8 py-6 text-center text-xs text-slate-500">
          <p><strong className="text-slate-400">CareerDeck</strong> — Verify critical facts before your interview. Good luck!</p>
        </div>
      </footer>
      <BottomNav />

      {tourVisible && (
        <OnboardingTour onComplete={() => setTourVisible(false)} />
      )}
    </div>
  );
}

export default DashboardContent;
