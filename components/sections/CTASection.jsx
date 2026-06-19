"use client";

import NonReversingReveal from "@/components/NonReversingReveal";
import Link from "next/link";

export default function CTASection() {
  return (
    <section id="section-cta" className="relative bg-[#FAFAFA] py-16 border-t border-gray-100/60">
      <div className="max-w-3xl mx-auto px-8 text-center">
        <NonReversingReveal id="cta-content">
          <div className="w-12 h-[5px] bg-[#F28C28] rounded-full mx-auto mb-8" />
          <h2 className="text-4xl sm:text-5xl font-extrabold text-[#0F172A] tracking-tight leading-tight">
            Your next interview deserves more than a Wikipedia rabbit hole
          </h2>
          <p className="mt-5 text-lg text-[#64748B] max-w-md mx-auto">
            Join 500+ MBA students and early-career professionals who prep with CareerDeck.
          </p>
          <div className="mt-10">
            <Link
              href="/generate"
              className="inline-flex items-center gap-2 px-8 py-4 bg-[#F28C28] hover:bg-[#E07E1F] text-[#0F172A] font-bold rounded-2xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-[0_4px_14px_rgba(242,140,40,0.3)]"
            >
              Generate Your First Dossier
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <p className="mt-4 text-sm text-[#94A3B8]">No account needed. Takes 90 seconds.</p>
          </div>
        </NonReversingReveal>

        <NonReversingReveal id="cta-newsletter" className="mt-16">
          <div className="max-w-sm mx-auto">
            <p className="text-sm text-[#64748B] mb-3">Get interview tips and early access to new features.</p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="your@email.com"
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200/80 bg-white text-[#0F172A] text-sm placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#F28C28]/30 focus:border-[#F28C28]/50 transition-all"
              />
              <button
                type="button"
                className="px-5 py-2.5 rounded-xl bg-[#F28C28] hover:bg-[#E07E1F] text-[#0F172A] text-sm font-bold transition-all duration-200 shrink-0"
              >
                Subscribe
              </button>
            </div>
          </div>
        </NonReversingReveal>

        <div className="mt-12 flex items-center justify-center gap-8 text-xs text-[#94A3B8]">
          <Link href="/" className="hover:text-[#64748B] transition-colors">Home</Link>
          <Link href="/generate" className="hover:text-[#64748B] transition-colors">Generate</Link>
        </div>
        <p className="mt-4 text-xs text-[#94A3B8]">
          &copy; {new Date().getFullYear()} CareerDeck. Verify critical facts before your interview.
        </p>
      </div>
    </section>
  );
}
