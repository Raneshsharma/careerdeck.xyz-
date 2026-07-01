"use client";

const TABS = [
  { id: "company", label: "Company", desc: "Deep dive into a company's business model, strategy, and culture." },
  { id: "role", label: "Role", desc: "Understand a role's responsibilities, skills, and career path." },
  { id: "jd", label: "Job Description", desc: "Decode a specific JD — hidden expectations and STAR blueprints." },
  { id: "news", label: "News", desc: "30 days of high-signal developments analyzed for interviews." },
  { id: "resume", label: "Candidate", desc: "Optimize your resume, simulate interviews, and map alignment." },
];

export default function DossierTabs({ selected, onChange, disabled }) {
  return (
    <div className="flex flex-wrap gap-2" role="tablist">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          role="tab"
          aria-selected={selected === tab.id}
          onClick={() => onChange(tab.id)}
          disabled={disabled}
          className={`relative px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
            selected === tab.id
              ? "bg-[#F28C28] text-[#030712] shadow-[0_4px_12px_rgba(242,140,40,0.3)] scale-105"
              : "bg-white/[0.03] text-slate-400 border border-white/[0.06] hover:bg-white/[0.08] hover:text-white"
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
