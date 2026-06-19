"use client";

const tabs = [
  {
    title: "Crunchbase · Apple Inc.",
    lines: [70, 90, 55],
    x: 0, y: 0, rotate: -4,
    color: "border-red-200/40",
  },
  {
    title: "SEC Filing · 10-K",
    lines: [85, 60, 75, 50],
    x: 50, y: 40, rotate: 9,
    color: "border-red-300/30",
  },
  {
    title: "LinkedIn · Company",
    lines: [65, 80],
    x: 100, y: 20, rotate: -7,
    color: "border-orange-200/30",
  },
  {
    title: "News · 15 tabs open",
    lines: [50, 70, 60],
    x: 25, y: 80, rotate: 5,
    color: "border-red-200/25",
  },
  {
    title: "Blind · Employee reviews",
    lines: [75, 55],
    x: 130, y: 75, rotate: -10,
    color: "border-orange-300/25",
  },
];

export default function ProblemVisualMockup() {
  return (
    <div className="relative w-full max-w-[380px] h-[340px] mx-auto">
      {/* red glow behind */}
      <div className="absolute -top-6 -right-6 w-48 h-48 rounded-full bg-red-400/10 blur-3xl pointer-events-none" />

      {/* floating tab cards */}
      {tabs.map((tab, i) => (
        <div
          key={i}
          className={`absolute rounded-xl border bg-white/90 backdrop-blur-sm shadow-[0_8px_30px_-6px_rgba(0,0,0,0.08)] ${tab.color} p-3`}
          style={{
            width: 200 - i * 8,
            left: tab.x,
            top: tab.y,
            transform: `rotate(${tab.rotate}deg)`,
            zIndex: tabs.length - i,
          }}
        >
          {/* tab header */}
          <div className="flex items-center gap-1.5 mb-2.5">
            <div className="flex gap-1">
              <div className="w-2 h-2 rounded-full bg-red-400/40" />
              <div className="w-2 h-2 rounded-full bg-amber-400/40" />
              <div className="w-2 h-2 rounded-full bg-emerald-400/40" />
            </div>
            <span className="text-[8px] text-gray-400 truncate flex-1">{tab.title}</span>
          </div>

          {/* content lines */}
          <div className="space-y-1.5">
            {tab.lines.map((w, li) => (
              <div key={li} className="flex gap-2 items-center">
                <div
                  className="h-2 rounded-sm bg-gray-200/60"
                  style={{ width: `${w}%` }}
                />
                {li === 0 && i < 2 && (
                  <svg className="w-3 h-3 text-red-400/50 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* scattered dots */}
      <div className="absolute bottom-6 right-8 flex gap-1">
        <div className="w-1.5 h-1.5 rounded-full bg-red-400/30" />
        <div className="w-2 h-2 rounded-full bg-red-400/20" />
        <div className="w-1 h-1 rounded-full bg-red-400/25" />
      </div>
      <div className="absolute top-8 right-4 w-2 h-2 rounded-full bg-red-400/15" />
      <div className="absolute bottom-16 left-4 w-1.5 h-1.5 rounded-full bg-red-400/20" />
    </div>
  );
}
