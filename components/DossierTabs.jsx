"use client";

const TABS = [
  { id: "company", label: "Company", emoji: "\uD83C\uDFE2" },
  { id: "role", label: "Role", emoji: "\uD83D\uDC64" },
  { id: "jd", label: "JD", emoji: "\uD83D\uDCCB" },
  { id: "news", label: "News", emoji: "\uD83D\uDCF0" },
];

export default function DossierTabs({ selected, onChange, disabled }) {
  return (
    <div className="flex rounded-lg bg-gray-100 p-1 gap-1" role="tablist">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          role="tab"
          aria-selected={selected === tab.id}
          onClick={() => onChange(tab.id)}
          disabled={disabled}
          className={`flex-1 py-2.5 px-3 rounded-md text-sm font-medium transition-all ${
            selected === tab.id
              ? "bg-white text-brand-700 shadow-sm"
              : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          <span className="mr-1.5">{tab.emoji}</span>
          {tab.label}
        </button>
      ))}
    </div>
  );
}
