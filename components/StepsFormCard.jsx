"use client";

import Link from "next/link";

export default function StepsFormCard() {
  return (
    <div className="w-full max-w-[340px] h-[480px] rounded-[28px] border border-white/[0.08] bg-[#0B0F19]/60 backdrop-blur-md shadow-[0_20px_50px_-15px_rgba(0,0,0,0.5)] p-6 flex flex-col justify-between mx-auto">
      <div>
        {/* Badge */}
        <div className="inline-flex items-center px-3 py-1 rounded-full border border-[#F28C28]/40 text-[11px] font-bold text-[#F28C28] w-fit mb-4">
          01
        </div>

        {/* Headline */}
        <h3 className="text-lg font-extrabold text-white leading-snug">
          Configure Placement Target
        </h3>
        <p className="text-sm text-slate-400 mt-1.5 mb-5 leading-relaxed">
          Select the target company, target role, and optional job details to tailor the briefing.
        </p>

        {/* Form inputs */}
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
            <span className="text-sm font-medium text-white">Apple Inc.</span>
            <svg className="w-4 h-4 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <div className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
            <span className="text-sm font-medium text-white">Product Manager</span>
            <svg className="w-4 h-4 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <div className="flex items-center justify-between rounded-xl border border-dashed border-white/[0.1] bg-transparent px-4 py-3 cursor-pointer hover:border-[#F28C28]/40 transition-colors">
            <span className="text-sm text-slate-500">Upload JD (optional)</span>
            <svg className="w-4 h-4 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          </div>
        </div>
      </div>

      {/* CTA */}
      <Link
        href="/auth"
        className="w-full h-12 rounded-2xl bg-white hover:bg-slate-200 text-[#030712] font-bold text-sm transition-all duration-200 shadow-[0_4px_14px_rgba(255,255,255,0.08)] flex items-center justify-center mt-6"
      >
        Generate Dossier &rarr;
      </Link>
    </div>
  );
}
