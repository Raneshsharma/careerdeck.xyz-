"use client";

export function ReportPreviewDossier() {
  return (
    <svg viewBox="0 0 420 340" fill="none" className="w-full max-w-md">
      <defs>
        <filter id="rp-shadow" x="-10%" y="-10%" width="130%" height="130%">
          <feDropShadow dx="0" dy="4" stdDeviation="12" floodColor="#18181b" floodOpacity="0.08" />
        </filter>
        <linearGradient id="rp-accent" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#d97706" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
      </defs>

      {/* desk shadow */}
      <rect x="30" y="20" width="360" height="300" rx="12" fill="#18181b" opacity="0.04" />

      {/* page 3 — deepest */}
      <rect x="60" y="15" width="310" height="270" rx="6" fill="#f4f4f5" stroke="#d4d4d8" strokeWidth="0.5" />

      {/* page 2 — middle */}
      <rect x="50" y="22" width="320" height="275" rx="6" fill="#fafafa" stroke="#d4d4d8" strokeWidth="0.5" />

      {/* page 1 — top (main) */}
      <rect x="40" y="30" width="340" height="285" rx="8" fill="#fefefe" stroke="#e4e4e7" strokeWidth="1" filter="url(#rp-shadow)" />

      {/* top accent stripe */}
      <rect x="40" y="30" width="340" height="5" rx="2.5" fill="url(#rp-accent)" />

      {/* ——— HEADER ——— */}
      <text x="210" y="60" textAnchor="middle" fill="#18181b" fontSize="10" fontWeight="800" fontFamily="system-ui, sans-serif" letterSpacing="2.5">CAREERDECK DOSSIER</text>
      <text x="210" y="76" textAnchor="middle" fill="#a1a1aa" fontSize="11" fontFamily="system-ui, sans-serif">Target Company</text>
      <line x1="60" y1="88" x2="360" y2="88" stroke="#f4f4f5" strokeWidth="1" />

      {/* ——— SECTION 1: Financial Overview ——— */}
      <circle cx="62" cy="108" r="4" fill="#d97706" opacity="0.5" />
      <text x="74" y="112" fill="#18181b" fontSize="11" fontWeight="600" fontFamily="system-ui, sans-serif">Financial Overview</text>
      <rect x="270" y="100" width="24" height="14" rx="3" fill="#d97706" opacity="0.1" />
      <text x="275" y="110" fill="#d97706" fontSize="7" fontWeight="700" fontFamily="system-ui, sans-serif">LIVE</text>
      {/* mini bar chart */}
      <rect x="74" y="122" width="40" height="10" rx="2" fill="#d97706" opacity="0.45" />
      <rect x="118" y="120" width="30" height="12" rx="2" fill="#d97706" opacity="0.3" />
      <rect x="152" y="118" width="50" height="14" rx="2" fill="#d97706" opacity="0.15" />
      <text x="74" y="148" fill="#a1a1aa" fontSize="8" fontFamily="system-ui, sans-serif">Revenue · Market share · Growth trend</text>

      {/* ——— SECTION 2: Competitor Landscape ——— */}
      <circle cx="62" cy="170" r="4" fill="#d97706" opacity="0.5" />
      <text x="74" y="174" fill="#18181b" fontSize="11" fontWeight="600" fontFamily="system-ui, sans-serif">Competitor Landscape</text>
      <rect x="74" y="184" width="50" height="22" rx="4" fill="#f4f4f5" stroke="#e4e4e7" strokeWidth="0.5" />
      <text x="99" y="197" textAnchor="middle" fill="#71717a" fontSize="7" fontFamily="system-ui, sans-serif">Comp A</text>
      <rect x="130" y="184" width="50" height="22" rx="4" fill="#f4f4f5" stroke="#e4e4e7" strokeWidth="0.5" />
      <text x="155" y="197" textAnchor="middle" fill="#71717a" fontSize="7" fontFamily="system-ui, sans-serif">Comp B</text>
      <rect x="186" y="184" width="50" height="22" rx="4" fill="#f4f4f5" stroke="#e4e4e7" strokeWidth="0.5" />
      <text x="211" y="197" textAnchor="middle" fill="#71717a" fontSize="7" fontFamily="system-ui, sans-serif">Comp C</text>

      {/* ——— SECTION 3: Talking Points ——— */}
      <circle cx="62" cy="222" r="4" fill="#14b8a6" opacity="0.5" />
      <text x="74" y="226" fill="#18181b" fontSize="11" fontWeight="600" fontFamily="system-ui, sans-serif">Talking Points</text>
      <circle cx="78" cy="238" r="2" fill="#14b8a6" opacity="0.6" />
      <text x="86" y="241" fill="#71717a" fontSize="9" fontFamily="system-ui, sans-serif">Recent strategic shift to AI-powered services</text>
      <circle cx="78" cy="250" r="2" fill="#14b8a6" opacity="0.6" />
      <text x="86" y="253" fill="#71717a" fontSize="9" fontFamily="system-ui, sans-serif">Q3 earnings beat analyst expectations by 12%</text>
      <circle cx="78" cy="262" r="2" fill="#14b8a6" opacity="0.6" />
      <text x="86" y="265" fill="#71717a" fontSize="9" fontFamily="system-ui, sans-serif">Key acquisition expanding into European market</text>

      {/* ——— SECTION 4: Smart Questions & STAR blueprint badges ——— */}
      <rect x="60" y="279" width="135" height="22" rx="5" fill="#f4f4f5" stroke="#e4e4e7" strokeWidth="0.5" />
      <text x="75" y="293" fill="#d97706" fontSize="8" fontWeight="700" fontFamily="system-ui, sans-serif">?</text>
      <text x="87" y="293" fill="#71717a" fontSize="9" fontFamily="system-ui, sans-serif">Smart Questions (7)</text>

      <rect x="205" y="279" width="110" height="22" rx="5" fill="#f4f4f5" stroke="#e4e4e7" strokeWidth="0.5" />
      <text x="220" y="293" fill="#d97706" fontSize="8" fontWeight="700" fontFamily="system-ui, sans-serif">★</text>
      <text x="232" y="293" fill="#71717a" fontSize="9" fontFamily="system-ui, sans-serif">STAR Blueprint</text>

      {/* page corners fold */}
      <path d="M380 315 L380 295 Q380 315 360 315 Z" fill="#f4f4f5" stroke="#e4e4e7" strokeWidth="0.5" />
      <path d="M380 315 L380 300 L365 315 Z" fill="#e4e4e7" opacity="0.3" />
    </svg>
  );
}

export function ChaosIllustration() {
  return (
    <svg viewBox="0 0 300 260" fill="none" className="w-full max-w-xs">
      {/* scattered debris dots */}
      <circle cx="20" cy="20" r="3" fill="#ef4444" opacity="0.25" />
      <circle cx="270" cy="30" r="2" fill="#ef4444" opacity="0.15" />
      <circle cx="50" cy="230" r="4" fill="#ef4444" opacity="0.2" />
      <circle cx="240" cy="210" r="2.5" fill="#ef4444" opacity="0.15" />
      <circle cx="150" cy="15" r="3" fill="#ef4444" opacity="0.2" />
      <circle cx="280" cy="240" r="2" fill="#ef4444" opacity="0.15" />
      <circle cx="100" cy="240" r="2" fill="#ef4444" opacity="0.2" />
      <circle cx="30" cy="140" r="2" fill="#ef4444" opacity="0.15" />

      {/* page 1 — main, skewed */}
      <rect x="50" y="30" width="130" height="160" rx="6" fill="#fefefe" stroke="#d97706" strokeWidth="1" opacity="0.3" transform="rotate(-3 115 110)" />
      <rect x="58" y="52" width="80" height="4" rx="2" stroke="#d97706" strokeWidth="0.5" opacity="0.5" transform="rotate(-3 98 54)" />
      <rect x="58" y="64" width="100" height="4" rx="2" stroke="#d97706" strokeWidth="0.5" opacity="0.35" transform="rotate(-3 108 66)" />
      <rect x="58" y="76" width="65" height="4" rx="2" stroke="#d97706" strokeWidth="0.5" opacity="0.35" transform="rotate(-3 90 78)" />
      <rect x="58" y="96" width="90" height="4" rx="2" stroke="#d97706" strokeWidth="0.5" opacity="0.3" transform="rotate(-3 103 98)" />
      <rect x="58" y="108" width="70" height="4" rx="2" stroke="#d97706" strokeWidth="0.5" opacity="0.3" transform="rotate(-3 93 110)" />

      {/* page 2 — more skewed, overlapping */}
      <rect x="100" y="45" width="120" height="155" rx="6" fill="#fefefe" stroke="#d97706" strokeWidth="1" opacity="0.25" transform="rotate(12 160 122)" />
      <rect x="108" y="65" width="75" height="4" rx="2" stroke="#d97706" strokeWidth="0.5" opacity="0.4" transform="rotate(12 145 67)" />
      <rect x="108" y="77" width="95" height="4" rx="2" stroke="#d97706" strokeWidth="0.5" opacity="0.3" transform="rotate(12 155 79)" />
      <circle cx="230" cy="60" r="12" fill="#ef4444" opacity="0.12" />
      <path d="M226 60l4-4 4 4-4 4z" stroke="#ef4444" strokeWidth="1" opacity="0.3" />

      {/* page 3 — small, torn out */}
      <rect x="30" y="80" width="90" height="120" rx="6" fill="#fefefe" stroke="#d97706" strokeWidth="1" opacity="0.2" transform="rotate(-12 75 140)" />
      <rect x="38" y="100" width="50" height="4" rx="2" stroke="#d97706" strokeWidth="0.5" opacity="0.35" transform="rotate(-12 63 102)" />
      <rect x="38" y="112" width="65" height="4" rx="2" stroke="#d97706" strokeWidth="0.5" opacity="0.25" transform="rotate(-12 70 114)" />

      {/* page 4 — upside down corner */}
      <rect x="180" y="100" width="80" height="100" rx="6" fill="#fefefe" stroke="#d97706" strokeWidth="1" opacity="0.15" transform="rotate(170 220 150)" />
      <rect x="188" y="120" width="45" height="4" rx="2" stroke="#d97706" strokeWidth="0.5" opacity="0.25" transform="rotate(170 210 122)" />
      <rect x="188" y="132" width="55" height="4" rx="2" stroke="#d97706" strokeWidth="0.5" opacity="0.2" transform="rotate(170 215 134)" />

      {/* warning exclamation */}
      <circle cx="75" cy="175" r="14" fill="#fef2f2" stroke="#ef4444" strokeWidth="1.5" opacity="0.5" />
      <path d="M75 168v5" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
      <circle cx="75" cy="180" r="1.5" fill="#ef4444" opacity="0.6" />
    </svg>
  );
}

export function DossierIllustration() {
  return (
    <svg viewBox="0 0 300 240" fill="none" className="w-full max-w-xs">
      <defs>
        <linearGradient id="dos-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#d97706" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#d97706" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <rect x="60" y="20" width="180" height="200" rx="12" fill="url(#dos-grad)" stroke="#d97706" strokeWidth="1" opacity="0.4" />

      <rect x="80" y="45" width="140" height="4" rx="2" stroke="#d97706" strokeWidth="0.5" opacity="0.6" />
      <rect x="80" y="58" width="100" height="4" rx="2" stroke="#d97706" strokeWidth="0.5" opacity="0.4" />
      <rect x="80" y="71" width="120" height="4" rx="2" stroke="#d97706" strokeWidth="0.5" opacity="0.4" />

      <rect x="80" y="95" width="60" height="4" rx="2" stroke="#14b8a6" strokeWidth="0.5" opacity="0.6" />
      <rect x="80" y="108" width="110" height="4" rx="2" stroke="#14b8a6" strokeWidth="0.5" opacity="0.4" />
      <rect x="80" y="121" width="90" height="4" rx="2" stroke="#14b8a6" strokeWidth="0.5" opacity="0.4" />

      <rect x="80" y="145" width="80" height="4" rx="2" stroke="#d97706" strokeWidth="0.5" opacity="0.6" />
      <rect x="80" y="158" width="105" height="4" rx="2" stroke="#d97706" strokeWidth="0.5" opacity="0.4" />
      <rect x="80" y="171" width="70" height="4" rx="2" stroke="#d97706" strokeWidth="0.5" opacity="0.4" />

      <circle cx="240" cy="40" r="16" fill="#059669" opacity="0.15" />
      <path d="M234 40l4 4 8-8" stroke="#059669" strokeWidth="2" opacity="0.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function FlowIllustration() {
  return (
    <svg viewBox="0 0 400 100" fill="none" className="w-full max-w-lg">
      <circle cx="50" cy="50" r="16" stroke="#F28C28" strokeWidth="1.5" opacity="0.5" />
      <text x="50" y="55" textAnchor="middle" fill="#F28C28" fontSize="14" opacity="0.8" fontFamily="Inter, sans-serif" fontWeight="700">1</text>
      <text x="50" y="82" textAnchor="middle" fill="#F28C28" fontSize="10" opacity="0.5" fontFamily="Inter, sans-serif" fontWeight="600">Choose</text>

      <line x1="70" y1="50" x2="160" y2="50" stroke="#F28C28" strokeWidth="1" opacity="0.25" strokeDasharray="4 3" />
      <polygon points="160,46 170,50 160,54" fill="#F28C28" opacity="0.35" />

      <circle cx="200" cy="50" r="16" stroke="#F28C28" strokeWidth="1.5" opacity="0.5" />
      <text x="200" y="55" textAnchor="middle" fill="#F28C28" fontSize="14" opacity="0.8" fontFamily="Inter, sans-serif" fontWeight="700">2</text>
      <text x="200" y="82" textAnchor="middle" fill="#F28C28" fontSize="10" opacity="0.5" fontFamily="Inter, sans-serif" fontWeight="600">Generate</text>

      <line x1="220" y1="50" x2="310" y2="50" stroke="#F28C28" strokeWidth="1" opacity="0.25" strokeDasharray="4 3" />
      <polygon points="310,46 320,50 310,54" fill="#F28C28" opacity="0.35" />

      <circle cx="350" cy="50" r="16" stroke="#F28C28" strokeWidth="1.5" opacity="0.5" />
      <text x="350" y="55" textAnchor="middle" fill="#F28C28" fontSize="14" opacity="0.8" fontFamily="Inter, sans-serif" fontWeight="700">3</text>
      <text x="350" y="82" textAnchor="middle" fill="#F28C28" fontSize="10" opacity="0.5" fontFamily="Inter, sans-serif" fontWeight="600">Prep</text>
    </svg>
  );
}

export function GridIllustration() {
  return (
    <svg viewBox="0 0 240 180" fill="none" className="w-full max-w-xs">
      <rect x="10" y="10" width="100" height="60" rx="6" stroke="#d97706" strokeWidth="1" opacity="0.25" />
      <rect x="20" y="22" width="50" height="3" rx="1.5" stroke="#d97706" strokeWidth="0.5" opacity="0.4" />
      <rect x="20" y="32" width="70" height="3" rx="1.5" stroke="#d97706" strokeWidth="0.5" opacity="0.3" />

      <rect x="130" y="10" width="100" height="60" rx="6" stroke="#14b8a6" strokeWidth="1" opacity="0.25" />
      <rect x="140" y="22" width="50" height="3" rx="1.5" stroke="#14b8a6" strokeWidth="0.5" opacity="0.4" />
      <rect x="140" y="32" width="70" height="3" rx="1.5" stroke="#14b8a6" strokeWidth="0.5" opacity="0.3" />

      <rect x="10" y="90" width="100" height="60" rx="6" stroke="#14b8a6" strokeWidth="1" opacity="0.25" />
      <rect x="20" y="102" width="50" height="3" rx="1.5" stroke="#14b8a6" strokeWidth="0.5" opacity="0.4" />
      <rect x="20" y="112" width="70" height="3" rx="1.5" stroke="#14b8a6" strokeWidth="0.5" opacity="0.3" />

      <rect x="130" y="90" width="100" height="60" rx="6" stroke="#d97706" strokeWidth="1" opacity="0.25" />
      <rect x="140" y="102" width="50" height="3" rx="1.5" stroke="#d97706" strokeWidth="0.5" opacity="0.4" />
      <rect x="140" y="112" width="70" height="3" rx="1.5" stroke="#d97706" strokeWidth="0.5" opacity="0.3" />
    </svg>
  );
}

export function TierIllustration({ tier }) {
  if (tier === "free") {
    return (
      <svg viewBox="0 0 40 40" fill="none" className="w-10 h-10">
        <circle cx="20" cy="20" r="18" stroke="#a1a1aa" strokeWidth="1" opacity="0.5" />
        <text x="20" y="25" textAnchor="middle" fill="#a1a1aa" fontSize="14" opacity="0.6" fontFamily="Inter, sans-serif">○</text>
      </svg>
    );
  }
  if (tier === "pro") {
    return (
      <svg viewBox="0 0 40 40" fill="none" className="w-10 h-10">
        <rect x="6" y="6" width="28" height="28" rx="4" stroke="#d97706" strokeWidth="1.5" opacity="0.6" />
        <path d="M16 22l4-6 4 6" stroke="#d97706" strokeWidth="1.5" opacity="0.6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M14 25h12" stroke="#d97706" strokeWidth="1" opacity="0.4" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 40 40" fill="none" className="w-10 h-10">
      <polygon points="20,4 26,16 38,16 28,24 32,36 20,28 8,36 12,24 2,16 14,16" stroke="#d97706" strokeWidth="1" opacity="0.6" />
      <circle cx="20" cy="20" r="4" fill="#d97706" opacity="0.3" />
    </svg>
  );
}
