"use client";

const tabs = [
  {
    title: "10-K Report - FY23_Apple.pdf (345 pages)",
    lines: [85, 95, 75, 45],
    status: "🚨 Too long to read",
    rotate: -4,
    x: 10,
    y: 15,
    glow: "shadow-[0_0_15px_rgba(239,68,68,0.07)]",
    borderColor: "border-red-500/30",
    accentBg: "bg-red-500/10",
    accentText: "text-red-400",
  },
  {
    title: "Google Search: 'Apple margin growth drivers'",
    lines: [70, 80, 50],
    status: "🌐 15 tabs open",
    rotate: 5,
    x: 45,
    y: 95,
    glow: "shadow-[0_0_15px_rgba(239,68,68,0.05)]",
    borderColor: "border-white/[0.08]",
    accentBg: "bg-white/[0.04]",
    accentText: "text-slate-400",
  },
  {
    title: "MessyNotes_draft_final_v2.txt",
    lines: [90, 60, 45],
    status: "📝 Disorganized",
    rotate: -6,
    x: 95,
    y: 40,
    glow: "shadow-[0_0_15px_rgba(239,68,68,0.06)]",
    borderColor: "border-red-500/20",
    accentBg: "bg-red-500/5",
    accentText: "text-red-400/80",
  },
  {
    title: "Blind Forum: 'Is Apple culture toxic?'",
    lines: [80, 70],
    status: "💬 Unverified reviews",
    rotate: 8,
    x: 135,
    y: 120,
    glow: "shadow-[0_0_15px_rgba(239,68,68,0.05)]",
    borderColor: "border-white/[0.08]",
    accentBg: "bg-white/[0.04]",
    accentText: "text-slate-400",
  },
];

export default function ProblemVisualMockup() {
  return (
    <div className="relative w-full max-w-[380px] h-[340px] mx-auto select-none">
      {/* Red ambient glow behind the stack */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-red-500/5 blur-3xl pointer-events-none" />

      {/* Floating browser tabs stack */}
      {tabs.map((tab, i) => (
        <div
          key={i}
          className={`absolute rounded-xl border bg-[#0B0F19]/80 backdrop-blur-md p-4 transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 ${tab.borderColor} ${tab.glow}`}
          style={{
            width: 240,
            left: tab.x,
            top: tab.y,
            transform: `rotate(${tab.rotate}deg)`,
            zIndex: tabs.length - i,
          }}
        >
          {/* Tab header */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-1.5 min-w-0">
              <div className="flex gap-1 shrink-0">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500/40" />
                <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
                <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
              </div>
              <span className="text-[10px] text-slate-400 truncate font-mono">{tab.title}</span>
            </div>
            <span className="text-[8px] text-red-400 shrink-0 font-bold">✕</span>
          </div>

          {/* Lines representing unstructured content */}
          <div className="space-y-2">
            {tab.lines.map((w, li) => (
              <div key={li} className="h-1.5 rounded bg-white/[0.04]" style={{ width: `${w}%` }} />
            ))}
          </div>

          {/* Status Badge */}
          <div className="mt-3 pt-2.5 border-t border-white/[0.05] flex items-center justify-between">
            <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full ${tab.accentBg} ${tab.accentText}`}>
              {tab.status}
            </span>
            <span className="text-[8px] text-slate-600">Modified 1h ago</span>
          </div>
        </div>
      ))}

      {/* Warning icon overlay */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 bg-red-950/80 border border-red-500/40 rounded-2xl p-3 shadow-lg shadow-black/40 flex items-center gap-2 backdrop-blur-md animate-bounce">
        <span className="text-lg">⚠️</span>
        <span className="text-xs font-bold text-red-400 tracking-tight">Information Overload</span>
      </div>
    </div>
  );
}
