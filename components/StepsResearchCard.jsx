"use client";

import Link from "next/link";

const pills = [
  "Financials", "News & Updates", "Competitors",
  "Earnings Calls", "Salaries", "Leadership",
];

export default function StepsResearchCard() {
  return (
    <div className="w-full max-w-[340px] h-[480px] rounded-[28px] border border-white/[0.08] bg-[#0B0F19]/60 backdrop-blur-md shadow-[0_20px_50px_-15px_rgba(0,0,0,0.5)] p-6 flex flex-col justify-between mx-auto">
      <div>
        {/* Badge */}
        <div className="inline-flex items-center px-3 py-1 rounded-full border border-[#F28C28]/40 text-[11px] font-bold text-[#F28C28] w-fit mb-4">
          02
        </div>

        {/* Headline */}
        <h3 className="text-lg font-extrabold text-white leading-snug">
          Real-Time Data Mining
        </h3>
        <p className="text-sm text-slate-400 mt-1.5 mb-5 leading-relaxed">
          CareerDeck searches financial disclosures, latest news, and industry signals instantly.
        </p>

        {/* Center visual */}
        <div className="flex flex-col items-center justify-center">
          {/* Glowing cube */}
          <div className="relative mb-6">
            <div className="w-16 h-16 rounded-2xl bg-[#F28C28]/10 border border-[#F28C28]/30 flex items-center justify-center animate-pulse">
              <svg className="w-8 h-8 text-[#F28C28]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
          </div>

          {/* Floating pills */}
          <div className="flex flex-wrap justify-center gap-2 max-w-[280px] mb-5">
            {pills.map((pill) => (
              <span
                key={pill}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.08] text-[11px] font-medium text-slate-300"
              >
                <svg className="w-2.5 h-2.5 text-emerald-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                {pill}
              </span>
            ))}
          </div>

          {/* Animated status bar */}
          <div className="w-full max-w-[260px]">
            <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-[#F28C28] to-[#F5A524] animate-pulse w-3/4" />
            </div>
            <p className="text-[11px] text-slate-500 mt-2 text-center">Researching in real time...</p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <Link
        href="/auth"
        className="w-full h-12 rounded-2xl bg-white hover:bg-slate-200 text-[#030712] font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 mt-6"
      >
        Start your research &rarr;
      </Link>
    </div>
  );
}
