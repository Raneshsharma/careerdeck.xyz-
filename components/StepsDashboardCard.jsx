"use client";

import Link from "next/link";

const sidebarItems = [
  "Executive Summary",
  "Company Overview",
  "Financial Analysis",
  "Competitor Analysis",
  "Role Insights",
  "Interview Questions",
  "Talking Points",
  "SWOT Analysis",
];

export default function StepsDashboardCard() {
  return (
    <div className="w-full max-w-[340px] h-[480px] rounded-[28px] border border-white/[0.08] bg-[#0B0F19]/60 backdrop-blur-md shadow-[0_20px_50px_-15px_rgba(0,0,0,0.5)] p-6 flex flex-col justify-between mx-auto">
      <div>
        {/* Badge */}
        <div className="inline-flex items-center px-3 py-1 rounded-full border border-[#F28C28]/40 text-[11px] font-bold text-[#F28C28] w-fit mb-4">
          03
        </div>

        {/* Headline */}
        <h3 className="text-lg font-extrabold text-white leading-snug">
          Interview-Ready Briefing
        </h3>
        <p className="text-sm text-slate-400 mt-1.5 mb-4 leading-relaxed">
          Unlock a comprehensive, highly-structured interview dossier to review.
        </p>

        {/* Mini dashboard preview */}
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.01] overflow-hidden flex">
          {/* Sidebar */}
          <div className="w-[110px] shrink-0 border-r border-white/[0.05] p-2.5 space-y-1 bg-white/[0.01]">
            {sidebarItems.map((item, i) => (
              <div
                key={item}
                className={`text-[8px] px-2 py-1 rounded ${
                  i === 0
                    ? "bg-white/[0.05] text-[#F28C28] font-semibold border border-white/[0.08]"
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                {item}
              </div>
            ))}
          </div>

          {/* Content area */}
          <div className="flex-1 p-3">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs font-bold text-white">Apple Inc.</p>
                <p className="text-[8px] text-slate-500">Technology &bull; Electronics</p>
              </div>
              <span className="text-[7px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                Generated
              </span>
            </div>

            {/* Executive summary */}
            <div className="mb-3">
              <p className="text-[7px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Executive Summary</p>
              <p className="text-[8px] text-slate-400 leading-normal">
                Apple maintains a dominant premium position with expanding services revenue. Focus areas include AI integration and global expansion.
              </p>
            </div>

            {/* Bottom widgets */}
            <div className="grid grid-cols-2 gap-1.5">
              <div className="rounded-lg bg-white/[0.02] border border-white/[0.06] p-1.5">
                <p className="text-[7px] font-semibold text-[#F28C28] uppercase tracking-wider">SWOT</p>
                <p className="text-[6px] text-slate-500 mt-0.5">Strengths: Ecosystem lock-in, global brand loyalty</p>
              </div>
              <div className="rounded-lg bg-white/[0.02] border border-white/[0.06] p-1.5">
                <p className="text-[7px] font-semibold text-[#F28C28] uppercase tracking-wider">Questions</p>
                <p className="text-[6px] text-slate-500 mt-0.5">Curation of smart queries for interviewers</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <Link
        href="/auth"
        className="w-full h-12 rounded-2xl bg-[#F28C28] hover:bg-[#E07E1F] text-[#0F172A] font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-[0_4px_14px_rgba(242,140,40,0.25)] mt-6"
      >
        View sample dossier &rarr;
      </Link>
    </div>
  );
}
