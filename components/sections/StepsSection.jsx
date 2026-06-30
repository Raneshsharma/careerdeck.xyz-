"use client";

import NonReversingReveal from "@/components/NonReversingReveal";
import StepsFormCard from "@/components/StepsFormCard";
import StepsResearchCard from "@/components/StepsResearchCard";
import StepsDashboardCard from "@/components/StepsDashboardCard";
import Link from "next/link";

export default function StepsSection() {
  return (
    <section id="section-steps" className="relative bg-transparent py-24 overflow-hidden border-t border-white/[0.05]">
      <div className="max-w-7xl mx-auto px-8">
        {/* ---- SECTION HEADER ---- */}
        <NonReversingReveal id="steps-headline" className="text-center">
          <div className="w-12 h-1 bg-[#F28C28] rounded-full mx-auto mb-8" />
          <h2 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight leading-[1.08]">
            Three steps to interview-ready
          </h2>
          <p className="mt-4 text-lg text-slate-400 max-w-[600px] mx-auto leading-relaxed">
            Quick, reliable AI interview prep for MBA, engineering, and undergraduate campus placements.
          </p>
        </NonReversingReveal>

        {/* ---- PROCESS INDICATOR (Hidden on mobile for cleaner look, beautiful on larger screens) ---- */}
        <NonReversingReveal id="steps-indicator" className="hidden md:block mt-14 mb-16">
          <div className="flex items-center justify-center">
            {/* Step 1 */}
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 rounded-full border-2 border-[#F28C28]/80 flex items-center justify-center bg-white/[0.03] backdrop-blur-md">
                <span className="text-lg font-bold text-[#F28C28]">1</span>
              </div>
              <p className="text-[10px] font-bold text-[#F28C28] tracking-[0.15em] mt-2 uppercase">Configure</p>
              <p className="text-[10px] text-slate-500 mt-0.5 max-w-[100px] text-center">Tell us what you&apos;re interviewing for</p>
            </div>

            {/* Connector 1 */}
            <div className="relative w-24 h-px mx-4 overflow-hidden">
              <div className="absolute inset-0 border-t border-dashed border-[#F28C28]/20" />
              <div className="absolute top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[#F28C28] animate-travel-dot" />
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 rounded-full border-2 border-[#F28C28]/80 flex items-center justify-center bg-white/[0.03] backdrop-blur-md">
                <span className="text-lg font-bold text-[#F28C28]">2</span>
              </div>
              <p className="text-[10px] font-bold text-[#F28C28] tracking-[0.15em] mt-2 uppercase">Analyze</p>
              <p className="text-[10px] text-slate-500 mt-0.5 max-w-[100px] text-center">AI researches news &amp; financials in real-time</p>
            </div>

            {/* Connector 2 */}
            <div className="relative w-24 h-px mx-4 overflow-hidden">
              <div className="absolute inset-0 border-t border-dashed border-[#F28C28]/20" />
              <div className="absolute top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[#F28C28] animate-travel-dot" style={{ animationDelay: "-1.5s" }} />
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 rounded-full border-2 border-[#F28C28]/80 flex items-center justify-center bg-white/[0.03] backdrop-blur-md">
                <span className="text-lg font-bold text-[#F28C28]">3</span>
              </div>
              <p className="text-[10px] font-bold text-[#F28C28] tracking-[0.15em] mt-2 uppercase">Excel</p>
              <p className="text-[10px] text-slate-500 mt-0.5 max-w-[100px] text-center">Get your placement brief dossier</p>
            </div>
          </div>
        </NonReversingReveal>

        {/* ---- THREE CARDS GRID (Responsive layout) ---- */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto w-full mt-12">
          <NonReversingReveal id="steps-card-1">
            <div className="animate-float-ambient h-full">
              <StepsFormCard />
            </div>
          </NonReversingReveal>

          <NonReversingReveal id="steps-card-2">
            <div className="animate-float-ambient h-full" style={{ animationDelay: "0.3s" }}>
              <StepsResearchCard />
            </div>
          </NonReversingReveal>

          <NonReversingReveal id="steps-card-3">
            <div className="animate-float-ambient h-full" style={{ animationDelay: "0.6s" }}>
              <StepsDashboardCard />
            </div>
          </NonReversingReveal>
        </div>

        {/* ---- BOTTOM CTA ---- */}
        <NonReversingReveal id="steps-cta" className="text-center mt-16">
          <Link
            href="/auth"
            className="inline-flex items-center justify-center w-[280px] h-[64px] rounded-2xl bg-[#F28C28] hover:bg-[#E07E1F] text-[#0F172A] font-bold text-base transition-all duration-200 shadow-[0_8px_30px_rgba(242,140,40,0.35)] hover:shadow-[0_12px_40px_rgba(242,140,40,0.55)] hover:-translate-y-0.5"
          >
            Start Preparing Free &rarr;
          </Link>
          <div className="flex items-center justify-center gap-2 mt-4 text-sm text-slate-500">
            <svg className="w-4 h-4 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
            </svg>
            No Credit Card Required. Start Instantly.
          </div>
        </NonReversingReveal>
      </div>
    </section>
  );
}
