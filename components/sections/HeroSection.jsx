"use client";

import Image from "next/image";
import Link from "next/link";
import NonReversingReveal from "@/components/NonReversingReveal";
import HeroDashboardMockup from "@/components/HeroDashboardMockup";
import TypewriterText from "@/components/TypewriterText";

const chips = [
  "Company Research", "Financials", "Competitors",
  "Role Insights", "Interview Questions", "Talking Points",
  "Industry Trends", "SWOT Analysis",
];

const avatars = [
  { initial: "A", color: "#6366f1" },
  { initial: "S", color: "#f59e0b" },
  { initial: "M", color: "#10b981" },
  { initial: "K", color: "#ec4899" },
];

export default function HeroSection() {
  return (
    <section id="section-hero" className="relative bg-[#FAFAFA] pt-24">
      {/* ---- MAIN HERO ---- */}
      <div className="max-w-7xl mx-auto px-8 pb-8">
        <div className="grid lg:grid-cols-[45%_55%] gap-8 items-center">
          {/* ===== LEFT COLUMN ===== */}
          <NonReversingReveal id="hero-content" className="min-w-0">
            {/* Eyebrow */}
            <p className="text-[11px] font-semibold text-[#F28C28] tracking-[0.15em] mb-4 uppercase">
              AI Interview Prep Dossier
            </p>

            {/* Headline */}
            <h1 className="font-extrabold text-[#0F172A] leading-[1.0] tracking-tight text-4xl sm:text-5xl md:text-6xl lg:text-[56px]">
              From chaos to clarity
              <br />
              <TypewriterText />
            </h1>

            {/* Supporting copy */}
            <p className="mt-4 text-base sm:text-lg lg:text-[17px] leading-relaxed text-[#64748B] max-w-[540px]">
              CareerDeck researches the company, analyzes the data, and builds your complete
              interview dossier so you can walk in prepared and stand out.
            </p>

            {/* Feature chips */}
            <div className="mt-6 flex flex-wrap gap-2">
              {chips.map((chip) => (
                <span
                  key={chip}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium text-gray-700 bg-white border border-[#EAEAEA] shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
                >
                  <svg className="w-3 h-3 text-emerald-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  {chip}
                </span>
              ))}
            </div>

            {/* CTA Row */}
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <Link
                href="/auth"
                className="inline-flex items-center justify-center gap-2 h-12 px-6 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-xl transition-all duration-200 text-sm shadow-[0_4px_14px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_25px_rgba(0,0,0,0.15)] hover:-translate-y-0.5"
              >
                Start Preparing Free →
              </Link>
              <Link
                href="/auth"
                className="inline-flex items-center justify-center h-12 px-6 bg-white text-gray-700 font-semibold rounded-xl border border-gray-200/80 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 text-sm shadow-sm"
              >
                See Sample Dossier
              </Link>
            </div>

            {/* Social Proof */}
            <div className="mt-6 flex items-center gap-3">
              <div className="flex items-center">
                {avatars.map((a, i) => (
                  <div
                    key={a.initial}
                    className={`w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold text-white shadow-sm`}
                    style={{
                      backgroundColor: a.color,
                      marginLeft: i === 0 ? 0 : -10,
                      zIndex: avatars.length - i,
                    }}
                  >
                    {a.initial}
                  </div>
                ))}
              </div>
              <div>
                <div className="flex items-center gap-1 text-amber-400 text-[10px]">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  ))}
                </div>
                <p className="text-xs text-gray-500 font-medium">
                  Loved by 1,200+ MBA students &amp; professionals
                </p>
              </div>
            </div>

          </NonReversingReveal>

          {/* ===== RIGHT COLUMN ===== */}
          <NonReversingReveal id="hero-visual" className="hidden lg:flex items-start justify-center pt-4">
            <div className="scale-[0.82] origin-top">
              <HeroDashboardMockup />
            </div>
          </NonReversingReveal>
        </div>


        {/* ---- SCROLL INDICATOR ---- */}
        <div className="mt-8 flex flex-col items-center gap-1.5">
          <span className="text-[9px] text-gray-400 tracking-[0.15em] font-semibold">SCROLL TO EXPLORE</span>
          <svg className="w-3 h-3 text-gray-300 animate-bounce" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </div>
    </section>
  );
}
