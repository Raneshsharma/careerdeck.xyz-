"use client";

import NonReversingReveal from "@/components/NonReversingReveal";
import Link from "next/link";

const gridCards = [
  { title: "Company Dossier", desc: "Research the company inside out", bg: "rgba(249,115,22,0.1)", border: "rgba(249,115,22,0.2)", color: "#F97316", icon: "briefcase" },
  { title: "Role Dossier", desc: "Understand the role and expectations", bg: "rgba(16,185,129,0.1)", border: "rgba(16,185,129,0.2)", color: "#10B981", icon: "user" },
  { title: "JD Dossier", desc: "Decode the job description like a pro", bg: "rgba(139,92,246,0.1)", border: "rgba(139,92,246,0.2)", color: "#8B5CF6", icon: "document" },
  { title: "News Dossier", desc: "Stay updated with recent developments", bg: "rgba(59,130,246,0.1)", border: "rgba(59,130,246,0.2)", color: "#3B82F6", icon: "news" },
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
    bg: "rgba(249,115,22,0.1)", border: "rgba(249,115,22,0.2)", color: "#F97316",
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
    bg: "rgba(16,185,129,0.1)", border: "rgba(16,185,129,0.2)", color: "#10B981",
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
    bg: "rgba(139,92,246,0.1)", border: "rgba(139,92,246,0.2)", color: "#8B5CF6",
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
    bg: "rgba(59,130,246,0.1)", border: "rgba(59,130,246,0.2)", color: "#3B82F6",
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
      className="w-16 h-16 rounded-[20px] flex items-center justify-center shrink-0 border"
      style={{ backgroundColor: bg, borderColor: color, color: color }}
    >
      {icons[type]}
    </div>
  );
}

export default function DossiersSection() {
  return (
    <section id="section-dossiers" className="relative bg-transparent py-24 overflow-hidden border-t border-white/[0.05]">
      {/* Background glow */}
      <div className="absolute right-0 top-1/3 w-96 h-96 rounded-full bg-violet-500/[0.02] blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-8 relative z-10">
        <div className="grid lg:grid-cols-[40%_60%] gap-12 lg:gap-20 items-center">
          {/* ===== LEFT COLUMN ===== */}
          <div>
            <NonReversingReveal id="dos-headline">
              <div className="w-12 h-1 bg-[#F28C28] rounded-full mb-8" />
              <h2 className="text-4xl sm:text-5xl font-extrabold text-white leading-[1.08] tracking-tight">
                Four ways to prepare
              </h2>
              <p className="mt-6 text-lg text-slate-400 max-w-[520px] leading-relaxed">
                Each dossier type is a complete research and prep package — tailored to the format you need.
              </p>
            </NonReversingReveal>

            {/* 2x2 Grid */}
            <NonReversingReveal id="dos-grid" className="mt-10">
              <div className="grid grid-cols-2 gap-4">
                {gridCards.map((card) => (
                  <div
                    key={card.title}
                    className="rounded-[28px] border border-white/[0.08] bg-[#0B0F19]/40 hover:bg-[#0B0F19]/70 shadow-[0_20px_50px_rgba(0,0,0,0.3)] p-5 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between"
                    style={{ minHeight: 240 }}
                  >
                    <div>
                      <div className="mb-4">
                        <DossierIcon type={card.icon} color={card.color} bg={card.bg} />
                      </div>
                      <h3 className="text-sm font-bold text-white">{card.title}</h3>
                      <p className="text-xs text-slate-400 mt-1 leading-snug">{card.desc}</p>
                    </div>
                    <Link
                      href="/auth"
                      className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-[#F28C28] hover:text-[#E07E1F] transition-colors"
                    >
                      Generate &rarr;
                    </Link>
                  </div>
                ))}
              </div>
            </NonReversingReveal>
          </div>

          {/* ===== RIGHT COLUMN ===== */}
          <div className="space-y-4">
            {dossiers.map((d, i) => (
              <NonReversingReveal key={d.title} id={`dos-card-${i}`}>
                <div
                  className="rounded-[28px] border border-white/[0.08] bg-[#0B0F19]/40 hover:bg-[#0B0F19]/70 shadow-[0_20px_50px_rgba(0,0,0,0.3)] p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center gap-6 hover:-translate-y-0.5 transition-all duration-300"
                  style={{ minHeight: 180 }}
                >
                  {/* Icon block */}
                  <DossierIcon type={d.icon} color={d.color} bg={d.bg} />

                  {/* Center content */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-white">{d.title}</h3>
                    <p className="text-sm text-slate-400 mt-1">{d.desc}</p>
                    <ul className="mt-3 space-y-1">
                      {d.features.map((f) => (
                        <li key={f} className="flex items-start gap-2 text-xs text-slate-300">
                          <svg className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                          </svg>
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Generate button */}
                  <Link
                    href="/auth"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-slate-200 text-[#030712] font-bold text-xs transition-all duration-200 shrink-0 w-full sm:w-auto justify-center"
                  >
                    Generate
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </NonReversingReveal>
            ))}
          </div>
        </div>

        {/* ---- BOTTOM CTA ---- */}
        <NonReversingReveal id="dos-cta" className="text-center mt-16">
          <Link
            href="/auth"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white hover:bg-slate-200 text-[#030712] font-bold rounded-2xl transition-all duration-200 text-sm shadow-[0_4px_14px_rgba(255,255,255,0.08)] hover:-translate-y-0.5"
          >
            Generate Your First Dossier &rarr;
          </Link>
          <p className="mt-3 text-sm text-slate-500">Takes 90 seconds. Free account includes 3 dossiers/month.</p>
        </NonReversingReveal>
      </div>
    </section>
  );
}
