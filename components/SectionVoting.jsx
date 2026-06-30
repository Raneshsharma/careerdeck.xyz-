"use client";

import { useState, useEffect } from "react";

export default function SectionVoting({ dossierId, sectionKey }) {
  const [likes, setLikes] = useState(0);
  const [dislikes, setDislikes] = useState(0);
  const [userVote, setUserVote] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!dossierId || !sectionKey) return;
    fetch(`/api/feedback/tally?dossierId=${dossierId}&sectionKey=${encodeURIComponent(sectionKey)}`)
      .then((r) => r.json())
      .then((d) => { setLikes(d.likes || 0); setDislikes(d.dislikes || 0); })
      .catch(() => {});
  }, [dossierId, sectionKey]);

  async function handleVote(vote) {
    if (loading || !dossierId || !sectionKey) return;
    setLoading(true);

    const prevVote = userVote;
    const newVote = prevVote === vote ? null : vote;
    setUserVote(newVote);

    const voteValue = newVote !== null ? newVote : 0;
    const { likes: l, dislikes: d } = await fetch("/api/feedback/vote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dossierId, sectionKey, vote: voteValue }),
    }).then((r) => r.json()).catch(() => ({ likes, dislikes }));

    setLikes(l ?? likes);
    setDislikes(d ?? dislikes);
    setLoading(false);
  }

  if (!dossierId || !sectionKey) return null;

  return (
    <div className="mt-3 no-print">
      <div className="flex items-center gap-3">
        <span className="text-xs text-slate-500 font-medium">Was this helpful?</span>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => handleVote(1)}
            disabled={loading}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 border ${
              userVote === 1
                ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/25 shadow-[0_0_8px_rgba(16,185,129,0.15)]"
                : "bg-white/[0.04] border-white/[0.08] text-slate-400 hover:bg-emerald-500/10 hover:text-emerald-400 hover:border-emerald-500/20"
            } disabled:opacity-50`}
            aria-label="Like"
          >
            <span className={`transition-transform duration-150 ${userVote === 1 ? "scale-110" : ""}`}>👍</span>
            <span className={`tabular-nums transition-all duration-200 ${userVote === 1 ? "text-emerald-300" : ""}`}>{likes}</span>
          </button>
          <button
            onClick={() => handleVote(-1)}
            disabled={loading}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 border ${
              userVote === -1
                ? "bg-red-500/15 text-red-400 border-red-500/25 shadow-[0_0_8px_rgba(239,68,68,0.15)]"
                : "bg-white/[0.04] border-white/[0.08] text-slate-400 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20"
            } disabled:opacity-50`}
            aria-label="Dislike"
          >
            <span className={`transition-transform duration-150 ${userVote === -1 ? "scale-110" : ""}`}>👎</span>
            <span className={`tabular-nums transition-all duration-200 ${userVote === -1 ? "text-red-300" : ""}`}>{dislikes}</span>
          </button>
        </div>
        {userVote !== null && (
          <span className={`text-xs font-medium transition-all duration-300 ${userVote === 1 ? "text-emerald-400" : "text-slate-400"}`}>
            {userVote === 1 ? "Thanks! 🙌" : "Got it, we'll improve this."}
          </span>
        )}
      </div>
    </div>
  );
}
