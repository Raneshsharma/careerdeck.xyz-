"use client";

import { useState, useEffect } from "react";

const REACTIONS = [
  { value: 1,  emoji: "👍", label: "Helpful",    activeClass: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30 shadow-[0_0_8px_rgba(16,185,129,0.15)]" },
  { value: -1, emoji: "⚡", label: "Needs Work",  activeClass: "bg-amber-500/15 text-amber-400 border-amber-500/30 shadow-[0_0_8px_rgba(245,158,11,0.15)]" },
  { value: -2, emoji: "💡", label: "Wrong Info",  activeClass: "bg-red-500/15 text-red-400 border-red-500/30 shadow-[0_0_8px_rgba(239,68,68,0.15)]" },
];

export default function FeedbackPanel({ dossierId, sectionKey, dossierType }) {
  const [vote, setVote]         = useState(null);
  const [tally, setTally]       = useState({ helpful: 0, needsWork: 0, wrongInfo: 0 });
  const [noteOpen, setNoteOpen] = useState(false);
  const [note, setNote]         = useState("");
  const [noteSent, setNoteSent] = useState(false);
  const [saving, setSaving]     = useState(false);
  const [loading, setLoading]   = useState(false);

  useEffect(() => {
    if (!dossierId || !sectionKey) return;
    fetch(`/api/feedback/tally?dossierId=${dossierId}&sectionKey=${encodeURIComponent(sectionKey)}`)
      .then(r => r.json())
      .then(d => setTally({
        helpful:   d.helpful   ?? d.likes    ?? 0,
        needsWork: d.needsWork ?? d.dislikes ?? 0,
        wrongInfo: d.wrongInfo ?? 0,
      }))
      .catch(() => {});
  }, [dossierId, sectionKey]);

  async function handleReaction(value) {
    if (loading || !dossierId || !sectionKey) return;
    setLoading(true);
    const newVote = vote === value ? null : value;
    setVote(newVote);
    try {
      const res = await fetch("/api/feedback/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dossierId, sectionKey, vote: newVote ?? 0, dossierType }),
      });
      const data = await res.json();
      if (data.helpful !== undefined || data.needsWork !== undefined) {
        setTally({
          helpful:   data.helpful   ?? 0,
          needsWork: data.needsWork ?? 0,
          wrongInfo: data.wrongInfo ?? 0,
        });
      }
      if (newVote === -1 || newVote === -2) setNoteOpen(true);
    } catch {
      setVote(vote);
    } finally {
      setLoading(false);
    }
  }

  async function handleNoteSubmit(e) {
    e.preventDefault();
    if (!note.trim() || saving) return;
    setSaving(true);
    try {
      await fetch("/api/feedback/comment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dossierId, sectionKey, comment: note.trim(), dossierType }),
      });
      setNoteSent(true);
      setNote("");
      setNoteOpen(false);
    } catch { /* silent fail */ }
    finally { setSaving(false); }
  }

  if (!dossierId || !sectionKey) return null;

  const tallyFor = (v) => v === 1 ? tally.helpful : v === -1 ? tally.needsWork : tally.wrongInfo;

  return (
    <div className="mt-4 pt-4 border-t border-white/[0.04] no-print">
      {/* Reaction row */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-[11px] text-slate-500 font-medium shrink-0">Was this helpful?</span>
        <div className="flex items-center gap-1.5">
          {REACTIONS.map(r => {
            const count = tallyFor(r.value);
            const isActive = vote === r.value;
            return (
              <button
                key={r.value}
                onClick={() => handleReaction(r.value)}
                disabled={loading}
                title={r.label}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[11px] font-semibold border transition-all duration-200 disabled:opacity-50 cursor-pointer ${
                  isActive ? r.activeClass : "bg-white/[0.03] border-white/[0.08] text-slate-400 hover:bg-white/[0.06] hover:text-slate-200"
                }`}
              >
                <span className={`transition-transform duration-150 ${isActive ? "scale-110" : ""}`}>{r.emoji}</span>
                <span>{r.label}</span>
                {count > 0 && <span className={`tabular-nums text-[10px] ${isActive ? "opacity-90" : "opacity-50"}`}>{count}</span>}
              </button>
            );
          })}
        </div>

        {/* Add note toggle */}
        {vote !== null && !noteSent && (
          <button
            onClick={() => setNoteOpen(o => !o)}
            className="ml-auto text-[11px] text-slate-500 hover:text-slate-300 transition-colors duration-200 flex items-center gap-1 shrink-0 cursor-pointer"
          >
            <span>💬</span>
            <span>{noteOpen ? "Hide" : "Add note"}</span>
          </button>
        )}

        {/* Confirmations */}
        {vote === 1 && !noteOpen && !noteSent && (
          <span className="ml-auto text-[11px] text-emerald-400 font-medium">Thanks! 🙌</span>
        )}
        {noteSent && (
          <span className="ml-auto text-[11px] text-emerald-400 font-medium">✓ Note received — thanks!</span>
        )}
      </div>

      {/* Note form */}
      {noteOpen && !noteSent && (
        <form onSubmit={handleNoteSubmit} className="mt-3 space-y-2">
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder={vote === -2 ? "What information is incorrect? (optional but helpful)" : "What could we improve here? (optional)"}
            maxLength={2000}
            rows={2}
            className="w-full px-3 py-2 text-xs rounded-lg bg-white/[0.03] border border-white/[0.08] text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-[#F28C28]/40 focus:border-[#F28C28]/40 resize-none transition-all duration-200"
          />
          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={saving || !note.trim()}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#F28C28] hover:bg-[#E07E1F] text-[#030712] disabled:opacity-40 transition-all duration-200 cursor-pointer"
            >
              {saving ? "Sending…" : "Send note"}
            </button>
            <button
              type="button"
              onClick={() => setNoteOpen(false)}
              className="text-xs text-slate-500 hover:text-slate-300 transition-colors duration-200 cursor-pointer"
            >
              Skip
            </button>
            <span className="ml-auto text-[10px] text-slate-600">{note.length}/2000</span>
          </div>
        </form>
      )}
    </div>
  );
}
