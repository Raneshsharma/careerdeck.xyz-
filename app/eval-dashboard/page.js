"use client";

import { useState, useEffect } from "react";

function ScoreBar({ label, value, max = 10 }) {
  const pct = Math.min((value / max) * 100, 100);
  const color = value >= 8 ? "bg-green-500" : value >= 6 ? "bg-amber-500" : "bg-red-500";
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="w-36 shrink-0 text-gray-600">{label}</span>
      <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="w-10 text-right font-mono text-gray-700">{value.toFixed(1)}</span>
    </div>
  );
}

export default function EvalDashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("/api/eval-dashboard")
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch((e) => { setError(e.message); setLoading(false); });
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
      <div className="w-10 h-10 rounded-full border-[3px] border-gray-200 border-t-brand-500 animate-spin bg-transparent" />
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
      <p className="text-red-600">{error}</p>
    </div>
  );

  if (!data) return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
      <p className="text-gray-500">No data yet. Run a benchmark to see results.</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FAFAFA] p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-extrabold text-[#0F172A] mb-6">Prompt Performance Dashboard</h1>

        {/* Overview Cards */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Evaluations</p>
            <p className="text-3xl font-bold text-[#0F172A]">{data.overview.totalEvaluations}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Avg Score</p>
            <p className="text-3xl font-bold text-[#0F172A]">{data.overview.averageScore.toFixed(1)}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Pass Rate</p>
            <p className="text-3xl font-bold text-[#0F172A]">{(data.overview.passRate * 100).toFixed(0)}%</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Dataset</p>
            <p className="text-3xl font-bold text-[#0F172A]">{data.datasetSize}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* By Section */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-sm font-bold text-[#0F172A] mb-4">Per-Section Scores</h2>
            {data.bySection.length === 0 && <p className="text-xs text-gray-400">No section data yet</p>}
            <div className="space-y-3">
              {data.bySection.map((s) => (
                <div key={s.sectionId}>
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span className="font-medium">{s.sectionId}</span>
                    <span>{s.averageScore.toFixed(1)} &middot; {(s.passRate * 100).toFixed(0)}% pass</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-brand-500 rounded-full"
                      style={{ width: `${(s.averageScore / 10) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Prompts */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-sm font-bold text-[#0F172A] mb-4">Top Performing Prompts</h2>
            {data.topPrompts.length === 0 && <p className="text-xs text-gray-400">No evaluations run yet</p>}
            <div className="space-y-2">
              {data.topPrompts.map((p, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-gray-600">{p.sectionId} <span className="text-xs text-gray-400">v{p.version}</span></span>
                  <span className="font-mono font-bold text-green-600">{p.score.toFixed(1)}</span>
                </div>
              ))}
            </div>

            <h2 className="text-sm font-bold text-[#0F172A] mt-6 mb-3">Lowest Scoring Sections</h2>
            {data.lowestSections.length === 0 && <p className="text-xs text-gray-400">No evaluations run yet</p>}
            <div className="space-y-2">
              {data.lowestSections.map((s, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-gray-600">{s.sectionId} <span className="text-xs text-gray-400">{s.company}</span></span>
                  <span className="font-mono font-bold text-red-600">{s.score.toFixed(1)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Common Flags */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 col-span-2">
            <h2 className="text-sm font-bold text-[#0F172A] mb-4">Most Common Issues</h2>
            {data.commonFlags.length === 0 && <p className="text-xs text-gray-400">No issues flagged yet</p>}
            <div className="grid grid-cols-2 gap-3">
              {data.commonFlags.map((f, i) => (
                <div key={i} className="flex justify-between text-sm bg-red-50 rounded-lg px-3 py-2">
                  <span className="text-red-700 truncate">{f.flag}</span>
                  <span className="text-red-500 font-mono shrink-0 ml-2">x{f.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
