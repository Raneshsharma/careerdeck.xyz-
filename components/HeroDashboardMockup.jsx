"use client";

const sidebarItems = [
  { label: "Overview", active: true },
  { label: "Financials", active: false },
  { label: "Competitors", active: false },
  { label: "Role Insights", active: false },
  { label: "Interview Q&A", active: false },
  { label: "Talking Points", active: false },
  { label: "SWOT", active: false },
  { label: "Strategic Insights", active: false },
];

const questions = [
  "How does Apple plan to sustain services revenue growth?",
  "What is Apple's strategy for AI integration across products?",
  "How is Apple addressing regulatory challenges in the EU?",
];

const talkingPoints = [
  "Strong brand loyalty & ecosystem lock-in",
  "Services revenue growing 15% YoY",
  "AI integration opportunities across devices",
  "Expanding wearables & health portfolio",
];

export default function HeroDashboardMockup() {
  return (
    <div className="relative w-full max-w-[740px] mx-auto" style={{ minHeight: 520 }}>
      {/* Dotted grid background */}
      <div
        className="absolute inset-0 rounded-3xl opacity-40"
        style={{
          backgroundImage: "radial-gradient(circle, #d4d4d8 0.8px, transparent 0.8px)",
          backgroundSize: "20px 20px",
        }}
      />

      {/* Amber/Indigo glow behind dashboard */}
      <div
        className="absolute -top-10 -right-10 w-96 h-96 rounded-full opacity-10 blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle, #F28C28 0%, #8B5CF6 50%, transparent 100%)" }}
      />

      {/* ---- MAIN DASHBOARD CARD ---- */}
      <div
        className="relative z-10 flex rounded-2xl border border-white/[0.08] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.6)] bg-[#0B0F19]/80 backdrop-blur-xl overflow-hidden text-slate-200"
        style={{ height: 460 }}
      >
        {/* Sidebar */}
        <div className="w-[180px] shrink-0 bg-white/[0.01] border-r border-white/[0.05] p-4 pt-6 flex flex-col gap-1">
          <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-[0.12em] px-3 pb-3">
            Dossier
          </div>
          {sidebarItems.map((item) => (
            <div
              key={item.label}
              className={`px-3 py-2 rounded-lg text-sm transition-all duration-150 ${
                item.active
                  ? "bg-white/[0.05] text-[#F28C28] font-semibold border border-white/[0.08]"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.02]"
              }`}
            >
              {item.label}
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6 overflow-hidden">
          {/* Header row */}
          <div className="flex items-start justify-between mb-5">
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <h2 className="text-lg font-bold text-white">Apple Inc.</h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-semibold border border-emerald-500/20">
                  Technology
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-emerald-400">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                Company Report Generated
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400 bg-white/[0.02] rounded-lg px-3 py-1.5 border border-white/[0.06]">
              <svg className="w-3.5 h-3.5 text-[#F28C28]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              90s ago
            </div>
          </div>

          {/* Executive Summary */}
          <div className="mb-5">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Executive Summary</p>
            <p className="text-sm text-slate-300 leading-relaxed">
              Apple maintains a dominant position in premium consumer electronics with
              expanding services revenue. Key focus areas include AI integration, wearables
              growth, and emerging market expansion.
            </p>
          </div>

          {/* Financial Snapshot */}
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Financial Snapshot</p>
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[
              { label: "Revenue", value: "$383.3B", change: "+8% YoY" },
              { label: "Net Income", value: "$96.9B", change: "+11% YoY" },
              { label: "Market Cap", value: "$2.85T", change: "+15% YTD" },
            ].map((metric) => (
              <div key={metric.label} className="bg-white/[0.02] rounded-xl p-3 border border-white/[0.06]">
                <p className="text-[10px] text-slate-500 font-medium mb-1">{metric.label}</p>
                <p className="text-base font-bold text-white">{metric.value}</p>
                <span className="text-[10px] text-emerald-400 font-semibold">{metric.change}</span>
              </div>
            ))}
          </div>

          {/* Mini footer row */}
          <div className="flex items-center gap-4 text-[10px] text-slate-500 border-t border-white/[0.05] pt-3 mt-1">
            <span>Data sources: SEC filings, Apple IR, Market data</span>
            <span className="text-slate-700">|</span>
            <span>Last updated: 24h ago</span>
          </div>
        </div>
      </div>

      {/* ---- FLOATING CARD 1: Competitor Landscape (Top Right) ---- */}
      <div
        className="absolute -top-3 -right-3 z-20 w-56 rounded-xl border border-white/[0.08] bg-[#0F172A]/90 backdrop-blur-md shadow-[0_12px_40px_rgba(0,0,0,0.5)] p-4 animate-float-1 text-slate-200"
      >
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Competitor Landscape</p>
        <div className="space-y-2.5">
          {[
            { name: "Samsung", share: "22%" },
            { name: "Apple", share: "28%", highlight: true },
            { name: "Google", share: "16%" },
            { name: "Microsoft", share: "12%" },
          ].map((c) => (
            <div key={c.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className={`w-6 h-6 rounded-md flex items-center justify-center text-[9px] font-bold ${
                    c.highlight ? "bg-[#F28C28]/20 text-[#F28C28]" : "bg-white/[0.05] text-slate-400"
                  }`}
                >
                  {c.name[0]}
                </div>
                <span className={`text-sm ${c.highlight ? "font-semibold text-white" : "text-slate-400"}`}>
                  {c.name}
                </span>
              </div>
              <span className={`text-xs ${c.highlight ? "font-semibold text-[#F28C28]" : "text-slate-500"}`}>
                {c.share}
              </span>
            </div>
          ))}
        </div>
        {/* Mini scatter dots */}
        <div className="flex gap-0.5 mt-3 pt-3 border-t border-white/[0.05]">
          {[28, 22, 16, 12, 8, 6, 5, 3].map((v, i) => (
            <div
              key={i}
              className="rounded-full bg-[#F28C28]/55"
              style={{ width: 4, height: 4 + v * 0.3 }}
            />
          ))}
        </div>
      </div>

      {/* ---- FLOATING CARD 2: Top Interview Questions (Right) ---- */}
      <div
        className="absolute top-28 -right-2 z-20 w-60 rounded-xl border border-white/[0.08] bg-[#0F172A]/90 backdrop-blur-md shadow-[0_12px_40px_rgba(0,0,0,0.5)] p-4 animate-float-2 text-slate-200"
      >
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Top Interview Questions</p>
        <div className="space-y-2.5">
          {questions.map((q, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="text-[10px] font-bold text-[#F28C28] mt-0.5 shrink-0">Q{i + 1}</span>
              <p className="text-[11px] text-slate-300 leading-snug">{q}</p>
            </div>
          ))}
        </div>
        <button className="mt-3 w-full text-center text-[11px] text-[#F28C28] font-semibold hover:text-[#E07E1F] transition-colors">
          View all questions →
        </button>
      </div>

      {/* ---- FLOATING CARD 3: Talking Points (Bottom) ---- */}
      <div
        className="absolute -bottom-3 right-8 z-20 w-64 rounded-xl border border-white/[0.08] bg-[#0F172A]/90 backdrop-blur-md shadow-[0_12px_40px_rgba(0,0,0,0.5)] p-4 animate-float-3 text-slate-200"
      >
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Talking Points</p>
        <div className="flex flex-wrap gap-1.5">
          {talkingPoints.map((tp) => (
            <span
              key={tp}
              className="px-2.5 py-1 rounded-full bg-[#F28C28]/10 text-[#F28C28] text-[10px] font-medium border border-[#F28C28]/20"
            >
              {tp}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
