"use client";

import Link from "next/link";

export default function StepsFormCard() {
  return (
    <div className="w-[340px] h-[480px] shrink-0 rounded-[28px] border border-gray-200/80 bg-white shadow-[0_20px_60px_-15px_rgba(0,0,0,0.06)] p-6 flex flex-col">
      {/* Badge */}
      <div className="inline-flex items-center px-3 py-1 rounded-full border border-[#F28C28]/40 text-[11px] font-bold text-[#F28C28] w-fit mb-4">
        01
      </div>

      {/* Headline */}
      <h3 className="text-lg font-extrabold text-[#0F172A] leading-snug">
        Tell us what you&apos;re interviewing for
      </h3>
      <p className="text-sm text-[#64748B] mt-1.5 mb-5 leading-relaxed">
        Pick the company, role, and any job description or news to tailor your dossier.
      </p>

      {/* Form inputs */}
      <div className="space-y-3 flex-1">
        <div className="flex items-center justify-between rounded-xl border border-gray-200/80 bg-gray-50/50 px-4 py-3">
          <span className="text-sm font-medium text-[#0F172A]">Apple Inc.</span>
          <svg className="w-4 h-4 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
        <div className="flex items-center justify-between rounded-xl border border-gray-200/80 bg-gray-50/50 px-4 py-3">
          <span className="text-sm font-medium text-[#0F172A]">Product Manager</span>
          <svg className="w-4 h-4 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
        <div className="flex items-center justify-between rounded-xl border border-dashed border-gray-300/60 bg-white px-4 py-3 cursor-pointer hover:border-[#F28C28]/40 transition-colors">
          <span className="text-sm text-[#94A3B8]">Upload JD (optional)</span>
          <svg className="w-4 h-4 text-[#94A3B8]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
        </div>
      </div>

      {/* CTA */}
      <Link
        href="/generate"
        className="w-full h-14 rounded-2xl bg-[#F28C28] hover:bg-[#E07E1F] text-[#0F172A] font-bold text-sm transition-all duration-200 shadow-[0_4px_14px_rgba(242,140,40,0.3)] hover:shadow-[0_8px_25px_rgba(242,140,40,0.4)] mt-auto flex items-center justify-center"
      >
        Generate Dossier &rarr;
      </Link>
    </div>
  );
}
