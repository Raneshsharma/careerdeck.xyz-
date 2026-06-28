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
    <section id="section-problem-solution" className="relative bg-[#FAFAFA] py-16 overflow-hidden border-t border-gray-100/60">
      <div className="max-w-7xl mx-auto px-8">
        {/* ---- PROBLEM ---- */}
        <div className="grid lg:grid-cols-2 gap-16 items-center mb-16">
          <NonReversingReveal id="problem-text">
            <p className="text-[11px] font-semibold text-[#F28C28] tracking-[0.15em] mb-4 uppercase">
              The Old Way
            </p>
            <h2 className="text-[32px] sm:text-[40px] font-extrabold text-[#0F172A] leading-[1.05] tracking-tight">
              6&ndash;8 hours of research per company.
              <br />
              <span className="text-[#64748B]">Still walking into placements blind.</span>
            </h2>
            <p className="mt-4 text-base text-[#64748B] leading-relaxed max-w-md">
              Most MBA students juggle Crunchbase, annual reports, news, and LinkedIn&mdash;ending up with
              15 browser tabs and no structured interview prep.
            </p>
            <ul className="mt-6 space-y-3">
              {pains.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-[#64748B]">
                  <svg className="w-4 h-4 text-red-400/70 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>

            <div className="mt-8">
              <Link
                href="/auth"
                className="inline-flex items-center justify-center gap-2 h-11 px-6 bg-white text-gray-700 font-semibold rounded-xl border border-gray-200/80 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 text-sm shadow-sm"
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
            <p className="text-[11px] font-semibold text-[#F28C28] tracking-[0.15em] mb-4 uppercase">
              The CareerDeck Way
            </p>
            <h2 className="text-[32px] sm:text-[40px] font-extrabold text-[#0F172A] leading-[1.05] tracking-tight">
              90 seconds.
              <br />
              <span className="text-[#F28C28]">Every angle covered.</span>
            </h2>
            <p className="mt-4 text-base text-[#64748B] leading-relaxed max-w-md">
              CareerDeck researches across 50+ data points per company&mdash;then assembles everything
              into a structured, placement-ready dossier.
            </p>

            {/* Metrics grid — creative number-heavy layout */}
            <div className="mt-8 grid grid-cols-2 gap-x-8 gap-y-6 max-w-md">
              {metrics.map((m) => (
                <div key={m.dossier} className="relative">
                  <p className="text-[36px] font-extrabold text-[#0F172A] leading-none tracking-tight">
                    {m.value}
                  </p>
                  <div className="w-8 h-0.5 bg-[#F28C28]/40 rounded-full mt-1.5 mb-1.5" />
                  <p className="text-[11px] text-[#64748B] leading-snug">{m.label}</p>
                  <span className="text-[9px] font-semibold text-[#F28C28] tracking-wider uppercase mt-1 block">
                    {m.dossier} Dossier
                  </span>
                </div>
              ))}
            </div>

            <p className="mt-6 text-xs text-[#94A3B8]">
              All generated in real time with Wikipedia research &amp; GPT-4o-mini.
            </p>

            <div className="mt-6">
              <Link
                href="/auth"
                className="inline-flex items-center justify-center gap-2 h-12 px-6 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-xl transition-all duration-200 text-sm shadow-[0_4px_14px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_25px_rgba(0,0,0,0.15)] hover:-translate-y-0.5"
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
