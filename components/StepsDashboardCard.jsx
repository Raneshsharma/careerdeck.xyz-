"use client";

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
    <div className="w-[340px] h-[480px] shrink-0 rounded-[28px] border border-gray-200/80 bg-white shadow-[0_20px_60px_-15px_rgba(0,0,0,0.06)] p-6 flex flex-col">
      {/* Badge */}
      <div className="inline-flex items-center px-3 py-1 rounded-full border border-[#F28C28]/40 text-[11px] font-bold text-[#F28C28] w-fit mb-4">
        03
      </div>

      {/* Headline */}
      <h3 className="text-lg font-extrabold text-[#0F172A] leading-snug">
        Walk into the interview prepared
      </h3>
      <p className="text-sm text-[#64748B] mt-1.5 mb-4 leading-relaxed">
        Get a 15+ page interview prep dossier with everything you need to stand out.
      </p>

      {/* Mini dashboard preview */}
      <div className="flex-1 rounded-2xl border border-gray-200/60 bg-gray-50/50 overflow-hidden flex">
        {/* Sidebar */}
        <div className="w-[110px] shrink-0 border-r border-gray-200/60 p-2.5 space-y-1">
          {sidebarItems.map((item, i) => (
            <div
              key={item}
              className={`text-[8px] px-2 py-1 rounded ${
                i === 0
                  ? "bg-white text-[#0F172A] font-semibold shadow-sm border border-gray-100"
                  : "text-[#94A3B8] hover:text-[#64748B]"
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
              <p className="text-xs font-bold text-[#0F172A]">Apple Inc.</p>
              <p className="text-[8px] text-[#94A3B8]">Technology &bull; Consumer Electronics</p>
            </div>
            <span className="text-[7px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
              Report Generated
            </span>
          </div>

          {/* Executive summary */}
          <div className="mb-3">
            <p className="text-[7px] font-semibold text-[#94A3B8] uppercase tracking-wider mb-1">Executive Summary</p>
            <p className="text-[9px] text-[#64748B] leading-relaxed">
              Apple maintains a dominant position in premium consumer electronics with expanding services revenue. Key focus areas include AI integration and wearables growth.
            </p>
          </div>

          {/* Bottom widgets */}
          <div className="grid grid-cols-2 gap-1.5">
            <div className="rounded-lg bg-white border border-gray-100/80 p-2">
              <p className="text-[7px] font-semibold text-[#F28C28] uppercase tracking-wider">SWOT</p>
              <p className="text-[7px] text-[#64748B] mt-0.5">Strengths: Brand loyalty, ecosystem lock-in</p>
            </div>
            <div className="rounded-lg bg-white border border-gray-100/80 p-2">
              <p className="text-[7px] font-semibold text-[#F28C28] uppercase tracking-wider">Questions</p>
              <p className="text-[7px] text-[#64748B] mt-0.5">7 smart questions curated for you</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
