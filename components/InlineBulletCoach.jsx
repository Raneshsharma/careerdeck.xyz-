"use client";

import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function InlineBulletCoach({ bulletText, dossierContent, onClose, onApply }) {
  const [response, setResponse] = useState("");
  const [streaming, setStreaming] = useState(true);
  const [editedText, setEditedText] = useState(bulletText);
  const [showApply, setShowApply] = useState(false);
  const [error, setError] = useState(null);
  const abortRef = useRef(null);

  useEffect(() => {
    const controller = new AbortController();
    abortRef.current = controller;
    runCoaching(controller);
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function runCoaching(controller) {
    try {
      const res = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: `Coach me on this specific bullet from my resume:\n\n"${bulletText}"\n\nUsing my Candidate Intelligence:\n1. Identify exactly what makes this bullet weak.\n2. What specific evidence already exists in my profile to strengthen it?\n3. Write one stronger rewrite.\n4. End with exactly one next action.`,
            },
          ],
          dossierContent,
          contextItem: { type: "bullet", data: bulletText },
        }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP ${res.status}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let text = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        for (const line of chunk.split("\n")) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6).trim();
          if (data === "[DONE]") continue;
          try {
            const parsed = JSON.parse(data);
            const token =
              parsed.choices?.[0]?.delta?.content ??
              parsed.delta?.text ??
              parsed.candidates?.[0]?.content?.parts?.[0]?.text ??
              "";
            if (token) {
              text += token;
              setResponse(text);
            }
          } catch {
            // skip malformed SSE
          }
        }
      }

      setShowApply(true);
    } catch (err) {
      if (err.name !== "AbortError") {
        setError(err.message || "Failed to load coaching advice.");
      }
    } finally {
      setStreaming(false);
    }
  }

  const handleApply = () => {
    onApply(bulletText, editedText.trim());
  };

  return (
    <div className="mt-1 mb-3 rounded-xl border border-violet-500/20 bg-[#0D1020]/95 backdrop-blur-sm shadow-[0_8px_30px_rgba(0,0,0,0.4)] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.06] bg-violet-500/5">
        <div className="flex items-center gap-2">
          <span className="text-sm">🎯</span>
          <span className="text-xs font-bold text-violet-300">Resume Coach</span>
          {streaming && (
            <span className="flex gap-1 ml-1">
              <span className="w-1 h-1 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-1 h-1 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-1 h-1 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: "300ms" }} />
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          className="w-5 h-5 flex items-center justify-center rounded text-slate-500 hover:text-white hover:bg-white/[0.06] transition-all"
          aria-label="Close"
        >
          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="px-4 py-3">
        {/* Coaching response */}
        {error ? (
          <p className="text-xs text-red-400">⚠️ {error}</p>
        ) : (
          <div className="text-xs leading-relaxed text-slate-300 prose prose-invert prose-xs max-w-none
            [&_strong]:text-white [&_strong]:font-semibold
            [&_ul]:list-disc [&_ul]:list-inside [&_ul]:space-y-0.5 [&_ul]:mt-1
            [&_ol]:list-decimal [&_ol]:list-inside [&_ol]:space-y-0.5 [&_ol]:mt-1
            [&_li]:text-slate-300
            [&_p]:mb-1.5 [&_p:last-child]:mb-0
            [&_code]:bg-white/[0.06] [&_code]:text-amber-300 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-[11px]
            [&_pre]:bg-[#0B0F19] [&_pre]:border [&_pre]:border-white/[0.06] [&_pre]:rounded-lg [&_pre]:p-3 [&_pre]:my-2 [&_pre]:overflow-x-auto
            [&_blockquote]:border-l-2 [&_blockquote]:border-violet-500/40 [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:text-slate-400
          ">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{response}</ReactMarkdown>
            {streaming && (
              <span className="inline-block w-1.5 h-3.5 bg-violet-400 rounded-sm animate-pulse ml-0.5 align-middle" />
            )}
          </div>
        )}

        {/* Edit & Apply section */}
        {showApply && !error && (
          <div className="mt-3 pt-3 border-t border-white/[0.06]">
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Edit &amp; Apply Rewrite
            </p>
            <textarea
              value={editedText}
              onChange={(e) => setEditedText(e.target.value)}
              rows={3}
              className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-slate-200 resize-none focus:outline-none focus:border-violet-500/40 focus:ring-1 focus:ring-violet-500/10 transition-colors leading-relaxed font-mono"
              placeholder="Paste or edit the rewrite here..."
            />
            <div className="flex gap-2 mt-2">
              <button
                onClick={handleApply}
                disabled={!editedText.trim() || editedText.trim() === bulletText.trim()}
                className="flex-1 px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-30 disabled:cursor-not-allowed text-white text-xs font-semibold transition-colors"
              >
                ✅ Apply Rewrite
              </button>
              <button
                onClick={onClose}
                className="px-3 py-1.5 rounded-lg border border-white/[0.08] text-slate-400 text-xs hover:text-white hover:border-white/20 transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
