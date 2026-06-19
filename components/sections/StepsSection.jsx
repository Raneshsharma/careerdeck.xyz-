"use client";

import NonReversingReveal from "@/components/NonReversingReveal";
import StepsFormCard from "@/components/StepsFormCard";
import StepsResearchCard from "@/components/StepsResearchCard";
import StepsDashboardCard from "@/components/StepsDashboardCard";
import Link from "next/link";

export default function StepsSection() {
  return (
    <section id="section-steps" className="relative bg-[#FAFAFA] py-24 overflow-hidden border-t border-gray-100/60">
      <div className="max-w-7xl mx-auto px-8">
        {/* ---- SECTION HEADER ---- */}
        <NonReversingReveal id="steps-headline" className="text-center">
          <div className="w-12 h-1 bg-[#F28C28] rounded-full mx-auto mb-8" />
          <h2 className="text-5xl sm:text-6xl font-extrabold text-[#0F172A] tracking-tight leading-[1.05]">
            Three steps to interview-ready
          </h2>
          <p className="mt-4 text-xl sm:text-2xl text-[#64748B] max-w-[600px] mx-auto leading-relaxed">
            From zero to prepared in under two minutes.
          </p>
        </NonReversingReveal>

        {/* ---- TOP PROCESS INDICATOR ---- */}
        <NonReversingReveal id="steps-indicator" className="mt-14 mb-16">
          <div className="flex items-center justify-center">
            {/* Step 1 */}
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 rounded-full border-2 border-[#F28C28]/60 flex items-center justify-center bg-white">
                <span className="text-lg font-bold text-[#F28C28]">1</span>
              </div>
              <p className="text-[10px] font-bold text-[#F28C28] tracking-[0.12em] mt-2">CHOOSE</p>
              <p className="text-[10px] text-[#94A3B8] mt-0.5 max-w-[100px] text-center">Tell us what you&apos;re interviewing for</p>
            </div>

            {/* Connector 1 */}
            <div className="relative w-20 h-px mx-3 overflow-hidden">
              <div className="absolute inset-0 border-t border-dashed border-[#F28C28]/30" />
              <div className="absolute top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[#F28C28] animate-travel-dot" />
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 rounded-full border-2 border-[#F28C28]/60 flex items-center justify-center bg-white">
                <span className="text-lg font-bold text-[#F28C28]">2</span>
              </div>
              <p className="text-[10px] font-bold text-[#F28C28] tracking-[0.12em] mt-2">GENERATE</p>
              <p className="text-[10px] text-[#94A3B8] mt-0.5 max-w-[100px] text-center">Our AI researches in real time</p>
            </div>

            {/* Connector 2 */}
            <div className="relative w-20 h-px mx-3 overflow-hidden">
              <div className="absolute inset-0 border-t border-dashed border-[#F28C28]/30" />
              <div className="absolute top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[#F28C28] animate-travel-dot" style={{ animationDelay: "-1.5s" }} />
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 rounded-full border-2 border-[#F28C28]/60 flex items-center justify-center bg-white">
                <span className="text-lg font-bold text-[#F28C28]">3</span>
              </div>
              <p className="text-[10px] font-bold text-[#F28C28] tracking-[0.12em] mt-2">PREP</p>
              <p className="text-[10px] text-[#94A3B8] mt-0.5 max-w-[100px] text-center">Get your interview prep dossier</p>
            </div>
          </div>
        </NonReversingReveal>

        {/* ---- THREE CARDS ---- */}
        <div className="flex flex-nowrap justify-center items-start gap-3">
          <NonReversingReveal id="steps-card-1">
            <div className="animate-float-ambient">
              <StepsFormCard />
            </div>
          </NonReversingReveal>

          <NonReversingReveal id="steps-card-2">
            <div className="animate-float-ambient" style={{ animationDelay: "0.3s" }}>
              <StepsResearchCard />
            </div>
          </NonReversingReveal>

          <NonReversingReveal id="steps-card-3">
            <div className="animate-float-ambient" style={{ animationDelay: "0.6s" }}>
              <StepsDashboardCard />
            </div>
          </NonReversingReveal>
        </div>

        {/* ---- BOTTOM CTA ---- */}
        <NonReversingReveal id="steps-cta" className="text-center mt-16">
          <Link
            href="/generate"
            className="inline-flex items-center justify-center w-[280px] h-[72px] rounded-2xl bg-[#F28C28] hover:bg-[#E07E1F] text-[#0F172A] font-bold text-base transition-all duration-200 shadow-[0_8px_30px_rgba(242,140,40,0.35)] hover:shadow-[0_12px_40px_rgba(242,140,40,0.45)] hover:-translate-y-0.5"
          >
            Try it now &rarr;
          </Link>
          <div className="flex items-center justify-center gap-2 mt-4 text-sm text-[#94A3B8]">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            No signup. No credit card. Just results.
          </div>
        </NonReversingReveal>
      </div>
    </section>
  );
}
