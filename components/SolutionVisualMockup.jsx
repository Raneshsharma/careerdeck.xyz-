"use client";

export default function SolutionVisualMockup() {
  return (
    <div className="relative w-full max-w-[380px] h-[340px] mx-auto select-none">
      {/* Warm glow behind the dossier card */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-[#F28C28]/5 blur-3xl pointer-events-none" />

      {/* Main Dossier Mockup Card */}
      <div className="relative z-10 rounded-2xl border border-white/[0.08] bg-[#0B0F19]/80 backdrop-blur-md shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden">
        {/* Top color indicator bar */}
        <div className="h-1 bg-gradient-to-r from-[#F28C28] to-[#E07E1F]" />

        <div className="p-5">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded bg-[#F28C28]/10 flex items-center justify-center text-[10px] font-bold text-[#F28C28]">
                D
              </div>
              <span className="text-[11px] font-bold text-white tracking-tight">CareerDeck Dossier</span>
            </div>
            <span className="text-[9px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full font-bold border border-emerald-500/20">
              Verified
            </span>
          </div>

          {/* Target Company info */}
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-6 h-6 rounded-lg bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-[10px] font-bold text-[#F28C28]">
              A
            </div>
            <div>
              <p className="text-sm font-extrabold text-white leading-none">Apple Inc.</p>
              <p className="text-[9px] text-slate-400 mt-1">Technology · $2.85T market cap</p>
            </div>
          </div>

          {/* Section preview boxes */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="rounded-xl bg-white/[0.02] border border-white/[0.06] p-2.5">
              <p className="text-[8px] font-semibold text-slate-500 uppercase tracking-wider">Financials</p>
              <p className="text-sm font-bold text-white mt-0.5">$383.3B</p>
              <span className="text-[8px] text-emerald-400 font-semibold">Revenue</span>
            </div>
            <div className="rounded-xl bg-white/[0.02] border border-white/[0.06] p-2.5">
              <p className="text-[8px] font-semibold text-slate-500 uppercase tracking-wider">Moat analysis</p>
              <p className="text-sm font-bold text-white mt-0.5">High Moat</p>
              <span className="text-[8px] text-slate-400">Ecosystem lock-in</span>
            </div>
          </div>

          {/* Key Talking Points */}
          <div className="mb-4">
            <p className="text-[8px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Talking Points</p>
            <div className="flex flex-wrap gap-1">
              {["Services growth", "AI strategy", "Hardware cycle"].map((tp) => (
                <span
                  key={tp}
                  className="px-2 py-0.5 rounded-full bg-[#F28C28]/10 text-[#F28C28] text-[8px] font-bold border border-[#F28C28]/25"
                >
                  {tp}
                </span>
              ))}
            </div>
          </div>

          {/* Bottom details */}
          <div className="flex items-center gap-2 text-[9px] text-slate-500 border-t border-white/[0.05] pt-3">
            <span className="flex items-center gap-1 font-medium text-slate-400">
              <svg className="w-3 h-3 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              McKinsey reasoning
            </span>
            <span className="text-white/10">•</span>
            <span>90s generation</span>
          </div>
        </div>
      </div>

      {/* Floating curations badge — overlay top right */}
      <div className="absolute -top-2 -right-2 z-20 rounded-xl border border-[#F28C28]/30 bg-[#0B0F19] shadow-[0_8px_25px_rgba(242,140,40,0.15)] p-2.5 w-28 text-center animate-float-ambient">
        <p className="text-[8px] font-semibold text-slate-400 uppercase tracking-wider">Smart Q's</p>
        <p className="text-xl font-black text-white leading-none mt-0.5">15+</p>
        <span className="text-[8px] text-slate-500 font-medium">curated questions</span>
      </div>
    </div>
  );
}
