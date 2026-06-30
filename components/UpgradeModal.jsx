"use client";

import { useEffect, useState } from "react";
import { executePayment } from "@/lib/razorpay-checkout";

const PLANS = [
  {
    key: "pro",
    name: "Pro Monthly",
    price: "₹149",
    period: "/month",
    badge: null,
    features: ["20 dossiers/month", "All 4 dossier types", "Full research depth", "Word & Markdown export", "Priority generation speed", "Email support"],
  },
  {
    key: "pro-annual",
    name: "Pro Annual",
    price: "₹1,199",
    period: "/year",
    badge: "2 months free",
    features: ["Everything in Pro Monthly", "20 dossiers/month", "Best value — save ₹589/yr", "Cancel anytime"],
  },
];

export default function UpgradeModal({ isOpen, onClose, onSuccess }) {
  const [selectedPlan, setSelectedPlan] = useState("pro");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Close on ESC
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen) return null;

  async function handlePay() {
    setError(null);
    setLoading(true);
    try {
      await executePayment(selectedPlan);
      onSuccess?.();
      onClose();
    } catch (e) {
      if (e.message === "CANCELLED") { setLoading(false); return; }
      setError(e.message || "Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Upgrade to Pro"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal panel */}
      <div className="relative z-10 w-full max-w-lg bg-[#0B0F19] border border-white/[0.10] rounded-2xl shadow-[0_40px_80px_rgba(0,0,0,0.6)] overflow-hidden animate-slide-up">

        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-white/[0.07]">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">👑</span>
                <h2 className="text-xl font-extrabold text-white tracking-tight">Unlock Full Intelligence</h2>
              </div>
              <p className="text-sm text-slate-400">You've used all free generations this month. Upgrade to keep going.</p>
            </div>
            <button
              onClick={onClose}
              className="shrink-0 ml-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/[0.05] hover:bg-white/10 text-slate-400 hover:text-white transition-all duration-200"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Plan selector */}
        <div className="px-6 py-5 space-y-3">
          {PLANS.map((plan) => {
            const isSelected = selectedPlan === plan.key;
            return (
              <button
                key={plan.key}
                onClick={() => setSelectedPlan(plan.key)}
                className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${
                  isSelected
                    ? "bg-[#F28C28]/10 border-[#F28C28]/50 shadow-[0_0_16px_rgba(242,140,40,0.1)]"
                    : "bg-white/[0.03] border-white/[0.07] hover:bg-white/[0.06]"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                      isSelected ? "border-[#F28C28] bg-[#F28C28]" : "border-white/20"
                    }`}>
                      {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-[#030712]" />}
                    </div>
                    <span className="text-sm font-bold text-white">{plan.name}</span>
                    {plan.badge && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/25">
                        {plan.badge}
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-extrabold text-white">{plan.price}</span>
                    <span className="text-xs text-slate-400">{plan.period}</span>
                  </div>
                </div>
                <ul className="space-y-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-1.5 text-xs text-slate-400">
                      <span className="text-emerald-400 shrink-0">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
              </button>
            );
          })}
        </div>

        {/* CTA */}
        <div className="px-6 pb-6 space-y-3">
          <button
            onClick={handlePay}
            disabled={loading}
            className="w-full min-h-[48px] py-3.5 rounded-xl text-base font-bold bg-[#F28C28] hover:bg-[#E07E1F] text-[#030712] shadow-[0_4px_20px_rgba(242,140,40,0.35)] transition-all duration-200 disabled:opacity-50"
          >
            {loading
              ? "Processing…"
              : `Pay ${PLANS.find((p) => p.key === selectedPlan)?.price} — Upgrade Now`}
          </button>
          {error && <p className="text-xs text-red-400 text-center">{error}</p>}
          <p className="text-xs text-center text-slate-500">
            Secured by Razorpay · Cancel anytime · No hidden fees
          </p>
        </div>
      </div>
    </div>
  );
}
