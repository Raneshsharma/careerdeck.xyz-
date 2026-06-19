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

      {/* Orange glow behind dashboard */}
      <div
        className="absolute -top-10 -right-10 w-96 h-96 rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle, #f59e0b 0%, transparent 70%)" }}
      />

      {/* ---- MAIN DASHBOARD CARD ---- */}
      <div
        className="relative z-10 flex rounded-2xl border border-gray-200/80 shadow-[0_20px_70px_-15px_rgba(0,0,0,0.12),0_0_0_1px_rgba(0,0,0,0.02)] bg-white/95 backdrop-blur-sm overflow-hidden"
        style={{ height: 460 }}
      >
        {/* Sidebar */}
        <div className="w-[180px] shrink-0 bg-gray-50/60 border-r border-gray-100 p-4 pt-6 flex flex-col gap-1">
          <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-[0.12em] px-3 pb-3">
            Dossier
          </div>
          {sidebarItems.map((item) => (
            <div
              key={item.label}
              className={`px-3 py-2 rounded-lg text-sm transition-all duration-150 ${
                item.active
                  ? "bg-white text-gray-900 font-semibold shadow-sm border border-gray-100"
                  : "text-gray-400 hover:text-gray-600 hover:bg-gray-100/50"
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
                <h2 className="text-lg font-bold text-gray-900">Apple Inc.</h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-semibold border border-emerald-200/60">
                  Technology
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-emerald-600">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                Company Report Generated
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-400 bg-gray-50 rounded-lg px-3 py-1.5 border border-gray-100">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              90s ago
            </div>
          </div>

          {/* Executive Summary */}
          <div className="mb-5">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Executive Summary</p>
            <p className="text-sm text-gray-600 leading-relaxed">
              Apple maintains a dominant position in premium consumer electronics with
              expanding services revenue. Key focus areas include AI integration, wearables
              growth, and emerging market expansion.
            </p>
          </div>

          {/* Financial Snapshot */}
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Financial Snapshot</p>
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[
              { label: "Revenue", value: "$383.3B", change: "+8% YoY" },
              { label: "Net Income", value: "$96.9B", change: "+11% YoY" },
              { label: "Market Cap", value: "$2.85T", change: "+15% YTD" },
            ].map((metric) => (
              <div key={metric.label} className="bg-gray-50/80 rounded-xl p-3 border border-gray-100/80">
                <p className="text-[10px] text-gray-400 font-medium mb-1">{metric.label}</p>
                <p className="text-base font-bold text-gray-900">{metric.value}</p>
                <span className="text-[10px] text-emerald-600 font-semibold">{metric.change}</span>
              </div>
            ))}
          </div>

          {/* Mini footer row */}
          <div className="flex items-center gap-4 text-[10px] text-gray-400 border-t border-gray-100 pt-3 mt-1">
            <span>Data sources: SEC filings, Apple IR, Market data</span>
            <span className="text-gray-300">|</span>
            <span>Last updated: 24h ago</span>
          </div>
        </div>
      </div>

      {/* ---- FLOATING CARD 1: Competitor Landscape (Top Right) ---- */}
      <div
        className="absolute -top-3 -right-3 z-20 w-56 rounded-xl border border-gray-200/80 bg-white/95 backdrop-blur-sm shadow-[0_12px_35px_-8px_rgba(0,0,0,0.1)] p-4 animate-float-1"
      >
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Competitor Landscape</p>
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
                    c.highlight ? "bg-amber-100 text-amber-800" : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {c.name[0]}
                </div>
                <span className={`text-sm ${c.highlight ? "font-semibold text-gray-900" : "text-gray-500"}`}>
                  {c.name}
                </span>
              </div>
              <span className={`text-xs ${c.highlight ? "font-semibold text-amber-600" : "text-gray-400"}`}>
                {c.share}
              </span>
            </div>
          ))}
        </div>
        {/* Mini scatter dots */}
        <div className="flex gap-0.5 mt-3 pt-3 border-t border-gray-100">
          {[28, 22, 16, 12, 8, 6, 5, 3].map((v, i) => (
            <div
              key={i}
              className="rounded-full bg-amber-500/40"
              style={{ width: 4, height: 4 + v * 0.3 }}
            />
          ))}
        </div>
      </div>

      {/* ---- FLOATING CARD 2: Top Interview Questions (Right) ---- */}
      <div
        className="absolute top-28 -right-2 z-20 w-60 rounded-xl border border-gray-200/80 bg-white/95 backdrop-blur-sm shadow-[0_12px_35px_-8px_rgba(0,0,0,0.1)] p-4 animate-float-2"
      >
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Top Interview Questions</p>
        <div className="space-y-2.5">
          {questions.map((q, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="text-[10px] font-bold text-amber-500 mt-0.5 shrink-0">Q{i + 1}</span>
              <p className="text-[11px] text-gray-600 leading-snug">{q}</p>
            </div>
          ))}
        </div>
        <button className="mt-3 w-full text-center text-[11px] text-amber-600 font-semibold hover:text-amber-700 transition-colors">
          View all questions →
        </button>
      </div>

      {/* ---- FLOATING CARD 3: Talking Points (Bottom) ---- */}
      <div
        className="absolute -bottom-3 right-8 z-20 w-64 rounded-xl border border-gray-200/80 bg-white/95 backdrop-blur-sm shadow-[0_12px_35px_-8px_rgba(0,0,0,0.1)] p-4 animate-float-3"
      >
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Talking Points</p>
        <div className="flex flex-wrap gap-1.5">
          {talkingPoints.map((tp) => (
            <span
              key={tp}
              className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 text-[10px] font-medium border border-amber-200/60"
            >
              {tp}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
