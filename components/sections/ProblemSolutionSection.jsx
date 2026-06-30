"use client";

import NonReversingReveal from "@/components/NonReversingReveal";
import ProblemVisualMockup from "@/components/ProblemVisualMockup";
import SolutionVisualMockup from "@/components/SolutionVisualMockup";
import Link from "next/link";

const pains = [
  "Pulling financials from 5 different sources manually",
  "Reading 30+ pages of annual reports for 3 key numbers",
  "Walking in with generic prep that sounds like everyone else",
];

const metrics = [
  { value: "15+", label: "Financial & strategic factors", dossier: "Company" },
  { value: "12+", label: "Role-specific insights & signals", dossier: "Role" },
  { value: "20+", label: "JD signals & STAR blueprints", dossier: "JD" },
  { value: "30+", label: "Recent news stories analyzed", dossier: "News" },
];

export default function ProblemSolutionSection() {
  return (
    <section id="section-problem-solution" className="relative bg-transparent py-24 overflow-hidden border-t border-white/[0.05]">
      {/* Background radial highlight */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-violet-500/[0.02] blur-3xl pointer-events-none z-0" />

      <div className="max-w-7xl mx-auto px-8 relative z-10">
        {/* ---- PROBLEM ---- */}
        <div className="grid lg:grid-cols-2 gap-16 items-center mb-24">
          <NonReversingReveal id="problem-text">
            <p className="text-[11px] font-semibold text-[#F28C28] tracking-[0.18em] mb-4 uppercase">
              The Old Way
            </p>
            <h2 className="text-[32px] sm:text-[40px] font-extrabold text-white leading-[1.08] tracking-tight">
              6&ndash;8 hours of research per company.
              <br />
              <span className="bg-gradient-to-r from-red-400 to-amber-300 bg-clip-text text-transparent">Still walking into placements blind.</span>
            </h2>
            <p className="mt-4 text-base text-slate-400 leading-relaxed max-w-md">
              Most MBA students juggle Crunchbase, annual reports, news, and LinkedIn&mdash;ending up with
              15 browser tabs, outdated notes, and no solid strategy.
            </p>
            <ul className="mt-6 space-y-3">
              {pains.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-slate-400">
                  <svg className="w-4 h-4 text-red-500 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>

            <div className="mt-8">
              <Link
                href="#section-steps"
                className="inline-flex items-center justify-center gap-2 h-11 px-6 bg-white/[0.02] text-slate-300 font-semibold rounded-xl border border-white/[0.1] hover:border-white/[0.2] hover:bg-white/[0.06] transition-all duration-200 text-sm shadow-sm"
              >
                See how CareerDeck fixes this &darr;
              </Link>
            </div>
          </NonReversingReveal>

          <NonReversingReveal id="problem-visual" className="flex justify-center">
            <ProblemVisualMockup />
          </NonReversingReveal>
        </div>

        {/* ---- SOLUTION ---- */}
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <NonReversingReveal id="solution-visual" className="hidden lg:flex justify-center order-2">
            <SolutionVisualMockup />
          </NonReversingReveal>

          <NonReversingReveal id="solution-text" className="order-1">
            <p className="text-[11px] font-semibold text-[#F28C28] tracking-[0.18em] mb-4 uppercase">
              The CareerDeck Way
            </p>
            <h2 className="text-[32px] sm:text-[40px] font-extrabold text-white leading-[1.08] tracking-tight">
              90 seconds.
              <br />
              <span className="bg-gradient-to-r from-[#F28C28] to-amber-300 bg-clip-text text-transparent">Every angle covered.</span>
            </h2>
            <p className="mt-4 text-base text-slate-400 leading-relaxed max-w-md">
              CareerDeck researches across 50+ real-time data points per company&mdash;then structures everything
              into a placement-ready, McKinsey-style briefing.
            </p>

            {/* Metrics grid — creative number-heavy layout */}
            <div className="mt-8 grid grid-cols-2 gap-x-8 gap-y-6 max-w-md">
              {metrics.map((m) => (
                <div key={m.dossier} className="relative">
                  <p className="text-[36px] font-extrabold text-white leading-none tracking-tight">
                    {m.value}
                  </p>
                  <div className="w-8 h-0.5 bg-[#F28C28]/40 rounded-full mt-1.5 mb-1.5" />
                  <p className="text-[11px] text-slate-400 leading-snug">{m.label}</p>
                  <span className="text-[9px] font-semibold text-[#F28C28] tracking-wider uppercase mt-1 block">
                    {m.dossier} Dossier
                  </span>
                </div>
              ))}
            </div>

            <p className="mt-6 text-xs text-slate-500">
              All generated in real time with Wikipedia research, Google Finance, and GPT-4o-mini.
            </p>

            <div className="mt-6">
              <Link
                href="/auth"
                className="inline-flex items-center justify-center gap-2 h-12 px-6 bg-white hover:bg-slate-200 text-[#030712] font-bold rounded-xl transition-all duration-200 text-sm shadow-[0_4px_14px_rgba(255,255,255,0.08)] hover:-translate-y-0.5"
              >
                Generate Your First Dossier &rarr;
              </Link>
            </div>
          </NonReversingReveal>
        </div>
      </div>
    </section>
  );
}
