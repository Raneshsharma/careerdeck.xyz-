"use client";

import { useState } from "react";

export default function SectionFeedback({ dossierId, sectionKey }) {
  const [open, setOpen] = useState(false);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);

  if (!dossierId || !sectionKey) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!comment.trim()) return;
    setSaving(true);
    await fetch("/api/feedback/comment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dossierId, sectionKey, comment: comment.trim() }),
    });
    setSubmitted(true);
    setSaving(false);
  }

  return (
    <div className="mt-2 no-print">
      {!open && !submitted ? (
        <button
          onClick={() => setOpen(true)}
          className="text-xs text-slate-500 hover:text-slate-300 transition-colors duration-200 flex items-center gap-1"
        >
          <span>💬</span>
          <span>Leave feedback</span>
        </button>
      ) : submitted ? (
        <p className="text-xs text-emerald-400 flex items-center gap-1">
          <span>✓</span> Thank you for your feedback!
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="mt-2 space-y-2">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="How can we improve this section?"
            maxLength={2000}
            rows={2}
            className="w-full px-3 py-2 text-xs rounded-lg bg-white/[0.03] border border-white/[0.08] text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-[#F28C28]/40 focus:border-[#F28C28]/40 resize-none transition-all duration-200"
          />
          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={saving || !comment.trim()}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#F28C28] hover:bg-[#E07E1F] text-[#030712] disabled:opacity-40 transition-all duration-200"
            >
              {saving ? "Sending…" : "Send"}
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-xs text-slate-500 hover:text-slate-300 transition-colors duration-200"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
