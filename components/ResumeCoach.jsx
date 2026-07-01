"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// ── Suggested Starter Prompts ───────────────────────────────────────────────
const STARTER_PROMPTS = [
  "Why is my Hiring Readiness score what it is?",
  "Which bullet in my resume has the biggest impact if improved?",
  "Rewrite my weakest experience bullet.",
  "What's the #1 keyword I'm missing for this role?",
  "How do I explain my career gap in an interview?",
  "What's missing from my resume that's hurting my score?",
];

// ── Message Bubble ──────────────────────────────────────────────────────────
function MessageBubble({ msg, isStreaming }) {
  const isUser = msg.role === "user";

  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"} mb-5`}>
      {/* Avatar */}
      <div
        className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold ${
          isUser
            ? "bg-[#F28C28] text-[#030712]"
            : "bg-gradient-to-br from-violet-500 to-indigo-600 text-white"
        }`}
      >
        {isUser ? "U" : "🎯"}
      </div>

      {/* Bubble */}
      <div
        className={`relative max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
          isUser
            ? "bg-[#F28C28]/15 border border-[#F28C28]/20 text-slate-200 rounded-tr-sm"
            : "bg-white/[0.04] border border-white/[0.08] text-slate-200 rounded-tl-sm"
        }`}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap">{msg.content}</p>
        ) : (
          <div className="coach-response prose prose-invert prose-sm max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                p: ({ children }) => <p className="mb-2 last:mb-0 text-slate-200">{children}</p>,
                ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1 text-slate-300">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1 text-slate-300">{children}</ol>,
                li: ({ children }) => <li className="text-sm">{children}</li>,
                strong: ({ children }) => <strong className="text-white font-semibold">{children}</strong>,
                code: ({ inline, children }) =>
                  inline ? (
                    <code className="bg-white/[0.08] text-amber-300 px-1.5 py-0.5 rounded text-xs font-mono">
                      {children}
                    </code>
                  ) : (
                    <pre className="bg-[#0B0F19] border border-white/[0.08] rounded-lg p-3 my-2 overflow-x-auto">
                      <code className="text-xs text-emerald-300 font-mono">{children}</code>
                    </pre>
                  ),
                blockquote: ({ children }) => (
                  <blockquote className="border-l-2 border-[#F28C28]/50 pl-3 my-2 text-slate-400 italic text-sm">
                    {children}
                  </blockquote>
                ),
              }}
            >
              {msg.content}
            </ReactMarkdown>
            {isStreaming && (
              <span className="inline-block w-1.5 h-4 bg-[#F28C28] rounded-sm ml-0.5 animate-pulse" />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main ResumeCoach Component ──────────────────────────────────────────────
export default function ResumeCoach({ dossierContent, onClose, contextItem }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState(null);
  const [panelVisible, setPanelVisible] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const abortRef = useRef(null);

  // Animate in on mount
  useEffect(() => {
    requestAnimationFrame(() => setPanelVisible(true));
    inputRef.current?.focus();
  }, []);

  // Auto-scroll on new content
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = useCallback(
    async (text) => {
      if (!text.trim() || streaming) return;
      setError(null);

      const userMsg = { role: "user", content: text.trim() };
      const newMessages = [...messages, userMsg];
      setMessages(newMessages);
      setInput("");
      setStreaming(true);

      // Placeholder for streaming response
      const placeholderMsg = { role: "assistant", content: "" };
      setMessages((prev) => [...prev, placeholderMsg]);

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const res = await fetch("/api/coach", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: newMessages,
            dossierContent: dossierContent || "",
            contextItem: contextItem || null,
          }),
          signal: controller.signal,
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({ error: "Unknown error" }));
          throw new Error(errData.error || `HTTP ${res.status}`);
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let assistantText = "";
        const provider = process.env.NEXT_PUBLIC_LLM_PROVIDER || "openai";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const data = line.slice(6).trim();
            if (data === "[DONE]") break;

            try {
              const parsed = JSON.parse(data);
              // OpenAI / OpenRouter format
              const delta = parsed.choices?.[0]?.delta?.content;
              // Anthropic format
              const anthropicDelta = parsed.delta?.text;
              // Gemini format
              const geminiText = parsed.candidates?.[0]?.content?.parts?.[0]?.text;

              const token = delta ?? anthropicDelta ?? geminiText ?? "";
              if (token) {
                assistantText += token;
                setMessages((prev) => {
                  const updated = [...prev];
                  updated[updated.length - 1] = {
                    role: "assistant",
                    content: assistantText,
                  };
                  return updated;
                });
              }
            } catch {
              // Skip malformed SSE lines
            }
          }
        }
      } catch (err) {
        if (err.name === "AbortError") {
          // User cancelled
        } else {
          setError(err.message || "Something went wrong. Please try again.");
          // Remove the empty placeholder on error
          setMessages((prev) => {
            const updated = [...prev];
            if (updated.at(-1)?.role === "assistant" && !updated.at(-1)?.content) {
              updated.pop();
            }
            return updated;
          });
        }
      } finally {
        setStreaming(false);
        abortRef.current = null;
        inputRef.current?.focus();
      }
    },
    [messages, streaming, dossierContent, contextItem]
  );

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const handleClose = () => {
    if (abortRef.current) abortRef.current.abort();
    setPanelVisible(false);
    setTimeout(onClose, 300);
  };

  const hasMessages = messages.length > 0;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          panelVisible ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={handleClose}
      />

      {/* Panel */}
      <div
        className={`fixed right-0 top-0 bottom-0 z-50 w-full sm:w-[480px] flex flex-col
          bg-[#0B0F19] border-l border-white/[0.08] shadow-[−20px_0_60px_rgba(0,0,0,0.6)]
          transition-transform duration-300 ease-out
          ${panelVisible ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* ── Header ─────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.08] shrink-0 bg-[#0B0F19]/95 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-lg shadow-lg shadow-violet-900/30">
              🎯
            </div>
            <div>
              <h2 className="text-sm font-bold text-white leading-tight">AI Resume Coach</h2>
              <p className="text-[10px] text-slate-400 leading-tight mt-0.5">
                {dossierContent ? "Context loaded · Your hiring probability is the mission" : "Generate Candidate Intelligence first"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {dossierContent && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                ● Context Active
              </span>
            )}
            <button
              onClick={handleClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/[0.06] transition-all duration-200"
              aria-label="Close coach"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* ── Messages / Empty State ──────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-0 min-h-0 scroll-smooth">
          {!hasMessages && (
            <div className="h-full flex flex-col justify-center">
              {/* Welcome message */}
              <div className="text-center mb-8 px-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500/20 to-indigo-600/20 border border-violet-500/20 flex items-center justify-center text-3xl mx-auto mb-4">
                  🎯
                </div>
                <h3 className="text-base font-bold text-white mb-2">
                  Your Personal Resume Coach
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
                  I have your full Candidate Intelligence loaded. Ask me anything about improving your resume, fixing weak bullets, or preparing for your interview.
                </p>
              </div>

              {/* Starter prompts */}
              <div className="space-y-2">
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider px-1 mb-3">
                  Suggested questions
                </p>
                {STARTER_PROMPTS.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(prompt)}
                    disabled={streaming}
                    className="w-full text-left text-xs text-slate-300 px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] hover:border-violet-500/20 hover:text-white transition-all duration-200 group"
                  >
                    <span className="text-slate-500 group-hover:text-violet-400 mr-2">→</span>
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {hasMessages && (
            <div className="pt-2">
              {messages.map((msg, idx) => (
                <MessageBubble
                  key={idx}
                  msg={msg}
                  isStreaming={streaming && idx === messages.length - 1 && msg.role === "assistant"}
                />
              ))}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mx-2 mt-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400">
              ⚠️ {error}
              <button
                onClick={() => setError(null)}
                className="ml-2 underline opacity-70 hover:opacity-100"
              >
                Dismiss
              </button>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* ── Input Area ──────────────────────────────────────────── */}
        <div className="shrink-0 px-4 py-4 border-t border-white/[0.08] bg-[#0B0F19]/80 backdrop-blur-md">
          {/* Context indicator */}
          {contextItem && (
            <div className="flex items-center gap-2 mb-3 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <span className="text-amber-400 text-xs">📌</span>
              <span className="text-xs text-amber-300 truncate">
                Focused on: {contextItem.type} — {typeof contextItem.data === "string" ? contextItem.data.slice(0, 50) : JSON.stringify(contextItem.data).slice(0, 50)}...
              </span>
            </div>
          )}

          <div className="flex gap-2 items-end">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={streaming}
              placeholder={streaming ? "Coach is thinking..." : "Ask your coach anything about your resume..."}
              rows={1}
              className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-500/40 focus:ring-1 focus:ring-violet-500/20 resize-none leading-relaxed transition-all duration-200 disabled:opacity-50"
              style={{ maxHeight: "120px", overflowY: "auto" }}
              onInput={(e) => {
                e.target.style.height = "auto";
                e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
              }}
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || streaming}
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white hover:from-violet-400 hover:to-indigo-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 shrink-0 shadow-lg shadow-violet-900/30"
              aria-label="Send message"
            >
              {streaming ? (
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeLinecap="round" />
                </svg>
              ) : (
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 19V5M5 12l7-7 7 7" />
                </svg>
              )}
            </button>
          </div>
          <p className="text-[10px] text-slate-600 mt-2 text-center">
            Enter to send · Shift+Enter for new line · All advice is based on your Candidate Intelligence
          </p>
        </div>
      </div>
    </>
  );
}
