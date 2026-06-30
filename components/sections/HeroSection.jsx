"use client";

import { useState } from "react";
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
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 12; // tilt max 12 degrees
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -12;
    setTilt({ x, y });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  return (
    <section id="section-hero" className="relative pt-32 pb-16 overflow-hidden min-h-screen flex items-center bg-transparent">
      {/* 3D Perspective Grid Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(124,58,237,0.08),transparent_50%)] pointer-events-none z-0" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none z-0" />

      {/* Background glowing blobs */}
      <div className="absolute top-1/4 left-1/10 w-72 h-72 rounded-full bg-indigo-500/5 blur-3xl pointer-events-none z-0" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 rounded-full bg-amber-500/5 blur-3xl pointer-events-none z-0" />

      {/* ---- MAIN HERO CONTENT ---- */}
      <div className="max-w-7xl mx-auto px-8 relative z-10 w-full">
        <div className="grid lg:grid-cols-[45%_55%] gap-12 items-center">
          {/* ===== LEFT COLUMN ===== */}
          <NonReversingReveal id="hero-content" className="min-w-0">
            {/* Eyebrow */}
            <p className="text-[11px] font-semibold text-[#F28C28] tracking-[0.18em] mb-4 uppercase">
              🚀 AI Interview Prep Dossier
            </p>

            {/* Headline */}
            <h1 className="font-extrabold text-white leading-[1.05] tracking-tight text-4xl sm:text-5xl md:text-6xl lg:text-[54px]">
              From chaos to clarity:
              <br />
              <span className="bg-gradient-to-r from-[#F28C28] via-[#a855f7] to-[#3b82f6] bg-clip-text text-transparent">
                90-Sec AI Placement Prep
              </span>
            </h1>

            {/* Supporting copy */}
            <p className="mt-5 text-base sm:text-lg leading-relaxed text-slate-400 max-w-[540px]">
              Prepare for your dream interview in under 90 seconds. CareerDeck researches the company, runs real-time financial audits, and compiles your complete McKinsey-style briefing.
            </p>

            {/* Feature chips */}
            <div className="mt-6 flex flex-wrap gap-2">
              {chips.map((chip) => (
                <span
                  key={chip}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium text-slate-300 bg-white/[0.03] border border-white/[0.08] shadow-[0_4px_12px_rgba(0,0,0,0.1)] hover:border-white/[0.15] transition-all"
                >
                  <svg className="w-3 h-3 text-emerald-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  {chip}
                </span>
              ))}
            </div>

            {/* CTA Row */}
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link
                href="/auth"
                className="inline-flex items-center justify-center gap-2 h-12 px-6 bg-gradient-to-r from-[#F28C28] to-[#ea580c] hover:from-[#E07E1F] hover:to-[#d97706] text-[#030712] font-bold rounded-xl transition-all duration-200 text-sm shadow-[0_4px_20px_rgba(242,140,40,0.25)] hover:shadow-[0_4px_30px_rgba(242,140,40,0.45)] hover:-translate-y-0.5"
              >
                Start Preparing Free →
              </Link>
              <Link
                href="#section-dossiers"
                className="inline-flex items-center justify-center h-12 px-6 bg-white/[0.02] hover:bg-white/[0.06] text-white font-semibold rounded-xl border border-white/[0.1] hover:border-white/[0.2] transition-all duration-200 text-sm shadow-sm"
              >
                See Sample Dossier
              </Link>
            </div>

            {/* Social Proof */}
            <div className="mt-8 flex items-center gap-3">
              <div className="flex items-center">
                {avatars.map((a, i) => (
                  <div
                    key={a.initial}
                    className="w-8 h-8 rounded-full border-2 border-[#030712] flex items-center justify-center text-[10px] font-bold text-white shadow-sm"
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
                <p className="text-xs text-slate-400 font-medium">
                  Loved by 1,200+ MBA students &amp; professionals in India
                </p>
              </div>
            </div>
          </NonReversingReveal>

          {/* ===== RIGHT COLUMN (3D TILTING GRAPH) ===== */}
          <NonReversingReveal id="hero-visual" className="hidden lg:flex items-start justify-center pt-4">
            <div 
              className="scale-[0.82] origin-top transition-transform duration-150 ease-out cursor-pointer"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              style={{
                transform: `perspective(1000px) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg) scale3d(1.02, 1.02, 1.02)`,
              }}
            >
              <HeroDashboardMockup />
            </div>
          </NonReversingReveal>
        </div>

        {/* ---- SCROLL INDICATOR ---- */}
        <div className="mt-16 flex flex-col items-center gap-1.5">
          <span className="text-[9px] text-slate-500 tracking-[0.2em] font-semibold">SCROLL TO EXPLORE</span>
          <svg className="w-3.5 h-3.5 text-[#F28C28] animate-bounce" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </div>
    </section>
  );
}
