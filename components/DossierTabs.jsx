"use client";

import { useRef, useState } from "react";

const TABS = [
  { id: "company", label: "Company", desc: "Deep dive into a company's business model, strategy, and culture." },
  { id: "role", label: "Role", desc: "Understand a role's responsibilities, skills, and career path." },
  { id: "jd", label: "Job Description", desc: "Decode a specific JD — hidden expectations and STAR blueprints." },
  { id: "news", label: "News", desc: "30 days of high-signal developments analyzed for interviews." },
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
          className={`relative px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
            selected === tab.id
              ? "bg-brand-500 text-white shadow-sm scale-105"
              : "bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700"
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
