"use client";

import { useState } from "react";
import NonReversingReveal from "@/components/NonReversingReveal";
import Link from "next/link";

export default function CTASection() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState(null);

  async function handleSubscribe(e) {
    e.preventDefault();
    if (!email || !email.includes("@")) { setStatus("error"); return; }
    setStatus("sending");
    try {
      const res = await fetch("/api/newsletter", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
      setStatus(res.ok ? "success" : "error");
    } catch { setStatus("error"); }
  }
  return (
    <section id="section-cta" className="relative bg-[#FAFAFA] py-16 border-t border-gray-100/60">
      <div className="max-w-3xl mx-auto px-8 text-center">
        <NonReversingReveal id="cta-content">
          <div className="w-12 h-[5px] bg-[#F28C28] rounded-full mx-auto mb-8" />
          <h2 className="text-4xl sm:text-5xl font-extrabold text-[#0F172A] tracking-tight leading-tight">
            Your placement interview deserves better than a last-minute Google search
          </h2>
          <p className="mt-5 text-lg text-[#64748B] max-w-md mx-auto">
            Join 500+ MBA students and graduates across India who prep with CareerDeck.
          </p>
          <div className="mt-10">
            <Link
              href="/auth"
              className="inline-flex items-center gap-2 px-8 py-4 bg-[#F28C28] hover:bg-[#E07E1F] text-[#0F172A] font-bold rounded-2xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-[0_4px_14px_rgba(242,140,40,0.3)]"
            >
              Start Preparing Free
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <p className="mt-4 text-sm text-[#94A3B8]">No credit card. Free forever. Takes 90 seconds.</p>
          </div>
        </NonReversingReveal>

        <NonReversingReveal id="cta-newsletter" className="mt-16">
          <div className="max-w-sm mx-auto">
            <p className="text-sm text-[#64748B] mb-3">Get interview tips and early access to new features.</p>
            <div className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200/80 bg-white text-[#0F172A] text-sm placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#F28C28]/30 focus:border-[#F28C28]/50 transition-all"
              />
              <button
                type="button"
                onClick={handleSubscribe}
                disabled={status === "sending"}
                className="inline-flex items-center px-5 py-2.5 rounded-xl bg-[#F28C28] hover:bg-[#E07E1F] text-[#0F172A] text-sm font-bold transition-all duration-200 shrink-0 disabled:opacity-50"
              >
                {status === "sending" ? "..." : status === "success" ? "✓ Done" : "Subscribe"}
              </button>
            </div>
            {status === "success" && <p className="text-xs text-emerald-600 mt-2">Welcome aboard! Check your inbox.</p>}
            {status === "error" && <p className="text-xs text-red-500 mt-2">Please enter a valid email.</p>}
          </div>
        </NonReversingReveal>

        <div className="mt-12 flex items-center justify-center gap-8 text-xs text-[#94A3B8]">
          <Link href="/" className="hover:text-[#64748B] transition-colors">Home</Link>
          <Link href="/auth" className="hover:text-[#64748B] transition-colors">Generate</Link>
          <Link href="/auth" className="hover:text-[#64748B] transition-colors">Sign In</Link>
        </div>
        <p className="mt-4 text-xs text-[#94A3B8]">
          © {new Date().getFullYear()} CareerDeck. Verify critical facts before your interview.<br />
          <span className="text-[#B0B7C3]">Updated: June 2026</span>
        </p>
      </div>
    </section>
  );
}
