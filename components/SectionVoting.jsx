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

    if (newVote !== null) {
      const { likes: l, dislikes: d } = await fetch("/api/feedback/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dossierId, sectionKey, vote: newVote }),
      }).then((r) => r.json()).catch(() => ({ likes, dislikes }));
      setLikes(l ?? likes);
      setDislikes(d ?? dislikes);
    } else {
      const { likes: l, dislikes: d } = await fetch("/api/feedback/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dossierId, sectionKey, vote: 0 }),
      }).then((r) => r.json()).catch(() => ({ likes, dislikes }));
      setLikes(l ?? likes);
      setDislikes(d ?? dislikes);
    }
    setLoading(false);
  }

  if (!dossierId || !sectionKey) return null;

  return (
    <div className="flex items-center gap-2 mt-2 no-print">
      <button
        onClick={() => handleVote(1)}
        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
          userVote === 1 ? "bg-green-100 text-green-700" : "bg-gray-100 text-[#64748B] hover:bg-gray-200"
        }`}
        aria-label="Like"
      >
        👍 {likes}
      </button>
      <button
        onClick={() => handleVote(-1)}
        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
          userVote === -1 ? "bg-red-100 text-red-700" : "bg-gray-100 text-[#64748B] hover:bg-gray-200"
        }`}
        aria-label="Dislike"
      >
        👎 {dislikes}
      </button>
    </div>
  );
}
