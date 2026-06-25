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
          className="text-xs text-[#94A3B8] hover:text-[#64748B] transition-colors"
        >
          💬 Feedback
        </button>
      ) : submitted ? (
        <p className="text-xs text-green-600">Thank you for your feedback!</p>
      ) : (
        <form onSubmit={handleSubmit} className="mt-1">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="How can we improve this section?"
            maxLength={2000}
            rows={2}
            className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 resize-none"
          />
          <div className="flex items-center gap-2 mt-1.5">
            <button
              type="submit"
              disabled={saving || !comment.trim()}
              className="px-3 py-1 text-xs font-medium rounded-lg bg-brand-500 text-white hover:bg-brand-600 disabled:opacity-50 transition-all"
            >
              {saving ? "Sending..." : "Send"}
            </button>
            <button type="button" onClick={() => setOpen(false)} className="text-xs text-[#94A3B8] hover:text-[#64748B]">
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
