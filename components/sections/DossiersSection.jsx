"use client";

import NonReversingReveal from "@/components/NonReversingReveal";

const gridCards = [
  { title: "Company Dossier", desc: "Research the company inside out", bg: "#FFF7ED", color: "#F97316", icon: "briefcase" },
  { title: "Role Dossier", desc: "Understand the role and expectations", bg: "#ECFDF5", color: "#10B981", icon: "user" },
  { title: "JD Dossier", desc: "Decode the job description like a pro", bg: "#F5F3FF", color: "#8B5CF6", icon: "document" },
  { title: "News Dossier", desc: "Stay updated with the latest developments", bg: "#EFF6FF", color: "#2563EB", icon: "news" },
];

const dossiers = [
  {
    title: "Company Dossier",
    desc: "Deep dive into a target company for case and fit interviews.",
    features: [
      "Business model & revenue breakdown",
      "Competitor landscape & market position",
      "Cultural signals & recent strategic moves",
    ],
    bg: "#FFF7ED", color: "#F97316",
    icon: "briefcase",
  },
  {
    title: "Role Dossier",
    desc: "Understand exactly what the role demands and how to pitch yourself.",
    features: [
      "Day-to-day responsibilities & KPIs",
      "Required vs nice-to-have skills",
      "Career trajectory & interview expectations",
    ],
    bg: "#ECFDF5", color: "#10B981",
    icon: "user",
  },
  {
    title: "JD Dossier",
    desc: "Decode the job description — what the hiring manager actually means.",
    features: [
      "Hidden signals between the lines",
      "STAR blueprints for likely questions",
      "Red flags to address before they ask",
    ],
    bg: "#F5F3FF", color: "#8B5CF6",
    icon: "document",
  },
  {
    title: "News Dossier",
    desc: "Last 30 days of high-signal developments, analyzed for interviews.",
    features: [
      "Earnings & product launch analysis",
      "Regulatory moves & industry shifts",
      "Interview relevance for each story",
    ],
    bg: "#EFF6FF", color: "#2563EB",
    icon: "news",
  },
];

function DossierIcon({ type, color, bg }) {
  const icons = {
    briefcase: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-7 h-7">
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
        <path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" />
      </svg>
    ),
    user: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-7 h-7">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
    document: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-7 h-7">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
    news: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-7 h-7">
        <path d="M4 22h16a2 2 0 002-2V4a2 2 0 00-2-2H8a2 2 0 00-2 2v16a2 2 0 01-4 0V8" />
        <line x1="10" y1="12" x2="18" y2="12" />
        <line x1="10" y1="16" x2="14" y2="16" />
      </svg>
    ),
  };

  return (
    <div
      className="w-20 h-20 rounded-[24px] flex items-center justify-center shrink-0"
      style={{ backgroundColor: bg, color: color }}
    >
      {icons[type]}
    </div>
  );
}

export default function DossiersSection() {
  return (
    <section id="section-dossiers" className="relative bg-[#FAFAFA] py-24 overflow-hidden border-t border-gray-100/60">
      <div className="max-w-7xl mx-auto px-8">
        <div className="grid lg:grid-cols-[40%_60%] gap-20 items-center">
          {/* ===== LEFT COLUMN ===== */}
          <div>
            <NonReversingReveal id="dos-headline">
              <div className="w-12 h-[5px] bg-[#F28C28] rounded-full mb-8" />
              <h2 className="text-5xl sm:text-6xl font-extrabold text-[#0F172A] leading-[1.05] tracking-tight">
                Four ways to prepare
              </h2>
              <p className="mt-6 text-xl sm:text-2xl text-[#64748B] max-w-[520px] leading-relaxed">
                Each dossier type is a complete research and prep package — tailored to the format you need.
              </p>
            </NonReversingReveal>

            {/* 2x2 Grid */}
            <NonReversingReveal id="dos-grid" className="mt-10">
              <div className="grid grid-cols-2 gap-6">
                {gridCards.map((card) => (
                  <div
                    key={card.title}
                    className="rounded-[28px] border border-[rgba(15,23,42,0.08)] bg-white/80 shadow-[0_20px_60px_rgba(0,0,0,0.04)] p-6 hover:-translate-y-2 transition-all duration-300"
                    style={{ minHeight: 250 }}
                  >
                    <div
                      className="w-20 h-20 rounded-[24px] flex items-center justify-center mb-4"
                      style={{ backgroundColor: card.bg, color: card.color }}
                    >
                      <DossierIcon type={card.icon} color={card.color} bg={card.bg} />
                    </div>
                    <h3 className="text-base font-bold text-[#0F172A]">{card.title}</h3>
                    <p className="text-sm text-[#64748B] mt-1 leading-snug">{card.desc}</p>
                  </div>
                ))}
              </div>
            </NonReversingReveal>
          </div>

          {/* ===== RIGHT COLUMN ===== */}
          <div className="space-y-6">
            {dossiers.map((d, i) => (
              <NonReversingReveal key={d.title} id={`dos-card-${i}`}>
                <div
                  className="rounded-[28px] border border-[rgba(15,23,42,0.06)] bg-white shadow-[0_20px_50px_rgba(0,0,0,0.04)] p-8 flex items-center gap-6 hover:-translate-y-1 transition-all duration-300"
                  style={{ minHeight: 190 }}
                >
                  {/* Icon block */}
                  <DossierIcon type={d.icon} color={d.color} bg={d.bg} />

                  {/* Center content */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-[#0F172A]">{d.title}</h3>
                    <p className="text-sm text-[#64748B] mt-1">{d.desc}</p>
                    <ul className="mt-3 space-y-1">
                      {d.features.map((f) => (
                        <li key={f} className="flex items-start gap-2 text-sm text-[#475569]">
                          <svg className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                          </svg>
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Arrow button */}
                  <div className="w-14 h-14 rounded-full border border-[rgba(15,23,42,0.08)] flex items-center justify-center shrink-0 hover:bg-[#F28C28]/10 hover:border-[#F28C28]/30 transition-all duration-200 cursor-pointer group">
                    <svg className="w-5 h-5 text-[#64748B] group-hover:text-[#F28C28] transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </NonReversingReveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
