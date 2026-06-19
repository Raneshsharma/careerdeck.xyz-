"use client";

export default function SolutionVisualMockup() {
  return (
    <div className="relative w-full max-w-[380px] h-[340px] mx-auto">
      {/* warm glow behind */}
      <div className="absolute -bottom-6 -left-6 w-48 h-48 rounded-full bg-[#F28C28]/10 blur-3xl pointer-events-none" />

      {/* main dossier card */}
      <div className="relative z-10 rounded-xl border border-gray-200/70 bg-white/95 backdrop-blur-sm shadow-[0_12px_40px_-12px_rgba(0,0,0,0.1)] overflow-hidden">
        {/* top accent bar */}
        <div className="h-1 bg-gradient-to-r from-[#F28C28] to-[#F5A524]" />

        <div className="p-5">
          {/* header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded bg-[#F28C28]/10 flex items-center justify-center text-[10px] font-bold text-[#F28C28]">C</div>
              <span className="text-[11px] font-semibold text-gray-900">CareerDeck Dossier</span>
            </div>
            <span className="text-[8px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-medium border border-emerald-200/50">
              Generated
            </span>
          </div>

          {/* company line */}
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 rounded bg-gray-100 flex items-center justify-center text-[9px] font-bold text-gray-400">A</div>
            <div>
              <p className="text-sm font-bold text-gray-900 leading-none">Apple Inc.</p>
              <p className="text-[9px] text-gray-400">Technology · $2.85T market cap</p>
            </div>
          </div>

          {/* section cards */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="rounded-lg bg-gray-50/80 border border-gray-100/80 p-2.5">
              <p className="text-[8px] font-semibold text-gray-400 uppercase tracking-wider">Financials</p>
              <p className="text-sm font-bold text-gray-900 mt-0.5">$383.3B</p>
              <span className="text-[8px] text-emerald-600 font-medium">Revenue</span>
            </div>
            <div className="rounded-lg bg-gray-50/80 border border-gray-100/80 p-2.5">
              <p className="text-[8px] font-semibold text-gray-400 uppercase tracking-wider">Competitors</p>
              <p className="text-sm font-bold text-gray-900 mt-0.5">4 tracked</p>
              <span className="text-[8px] text-gray-400 font-medium">Samsung, Google +2</span>
            </div>
          </div>

          {/* talking points preview */}
          <div className="mb-3">
            <p className="text-[8px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Talking Points</p>
            <div className="flex flex-wrap gap-1">
              {["Services growth", "AI strategy", "Wearables", "EU regulations"].map((tp) => (
                <span key={tp} className="px-2 py-0.5 rounded-full bg-[#F28C28]/8 text-[#F28C28] text-[8px] font-medium border border-[#F28C28]/15">
                  {tp}
                </span>
              ))}
            </div>
          </div>

          {/* bottom badges */}
          <div className="flex items-center gap-2 text-[8px] text-gray-400 border-t border-gray-100 pt-2.5">
            <span className="flex items-center gap-1">
              <svg className="w-2.5 h-2.5 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              15+ data points
            </span>
            <span className="text-gray-200">|</span>
            <span>90s generation</span>
          </div>
        </div>
      </div>

      {/* small floating stats card — top right */}
      <div className="absolute -top-2 -right-2 z-20 rounded-lg border border-gray-200/60 bg-white/90 backdrop-blur-sm shadow-[0_4px_15px_-6px_rgba(0,0,0,0.08)] p-2.5 w-28">
        <p className="text-[7px] font-semibold text-gray-400 uppercase tracking-wider">Smart Q's</p>
        <p className="text-lg font-extrabold text-gray-900 leading-none mt-0.5">7</p>
        <span className="text-[7px] text-gray-400">curated questions</span>
      </div>
    </div>
  );
}
