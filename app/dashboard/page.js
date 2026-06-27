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
  const tourLoaded = useRef(true);

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
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
      <h1 className="text-3xl font-bold text-[#0F172A]">Dashboard OK</h1>
      <p className="text-sm text-[#64748B] mt-2">{user ? "Authenticated" : "Loading..."}</p>
    </div>
  );
}

export default DashboardContent;
