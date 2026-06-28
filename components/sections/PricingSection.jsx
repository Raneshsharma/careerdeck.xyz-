"use client";

import { useState } from "react";
import NonReversingReveal from "@/components/NonReversingReveal";
import Link from "next/link";

const TIERS = [
  {
    name: "Free",
    price: "₹0",
    period: "forever",
    desc: "Get started with 3 free dossiers every month. No credit card, no catch.",
    features: [
      "3 dossiers per month",
      "All 4 dossier types",
      "Wikipedia + DuckDuckGo research",
      "Section source citations",
      "Standard generation speed",
    ],
    cta: "Get started free",
    href: "/auth",
    badge: null,
    highlight: false,
  },
  {
    name: "Pro Monthly",
    price: "₹149",
    period: "per month",
    subtext: "₹7.45/dossier — less than a chai",
    desc: "Everything you need to crush every interview. Cancel anytime.",
    features: [
      "20 dossiers per month",
      "All 4 dossier types",
      "6 research sources",
      "PDF export",
      "Priority generation speed",
      "Email support",
    ],
    cta: "Get Pro Monthly",
    href: "/checkout?plan=pro",
    badge: "Most Popular",
    highlight: true,
  },
  {
    name: "Pro Annual",
    price: "₹1,199",
    period: "per year",
    subtext: "₹99/mo — save ₹600/year",
    desc: "Best value. Lock in your price for a full year of unlimited preparation.",
    features: [
      "Everything in Pro Monthly",
      "20 dossiers per month",
      "Save ₹600 vs monthly",
      "One payment, full year access",
      "Price lock guarantee",
    ],
    cta: "Get Pro Annual",
    href: "/checkout?plan=pro-annual",
    badge: "Best Value",
    highlight: false,
  },
];

export default function PricingSection() {
  const [annual, setAnnual] = useState(false);

  const tiers = annual
    ? TIERS.map((t) => {
        if (t.name === "Pro Monthly") return { ...t, highlight: false, badge: null };
        if (t.name === "Pro Annual") return { ...t, highlight: true, badge: "Best Value" };
        return t;
      })
    : TIERS.map((t) => {
        if (t.name === "Pro Monthly") return { ...t, highlight: true, badge: "Most Popular" };
        if (t.name === "Pro Annual") return { ...t, highlight: false };
        return t;
      });

  return (
    <section id="section-pricing" className="relative bg-[#FAFAFA] py-16 border-t border-gray-100/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <NonReversingReveal id="pricing-headline" className="text-center">
          <div className="w-12 h-[5px] bg-[#F28C28] rounded-full mx-auto mb-8" />
          <h2 className="text-4xl sm:text-5xl font-extrabold text-[#0F172A] tracking-tight leading-[1.05]">
            Simple, student-friendly pricing
          </h2>
          <p className="mt-4 text-lg sm:text-xl text-[#64748B] max-w-[600px] mx-auto">
            Start free, upgrade when you're ready. No hidden fees, cancel anytime.
          </p>
        </NonReversingReveal>

        {/* Annual toggle */}
        <NonReversingReveal id="pricing-toggle" className="flex items-center justify-center mt-8 gap-3">
          <span className={`text-sm font-medium transition-colors ${!annual ? "text-[#0F172A]" : "text-[#94A3B8]"}`}>Monthly</span>
          <button
            onClick={() => setAnnual(!annual)}
            className={`relative w-12 h-7 rounded-full transition-colors duration-200 flex-shrink-0 ${annual ? "bg-[#F28C28]" : "bg-gray-300"}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform duration-200 ${annual ? "translate-x-5" : "translate-x-0"}`} />
          </button>
          <span className={`text-sm font-medium transition-colors ${annual ? "text-[#0F172A]" : "text-[#94A3B8]"}`}>
            Annual <span className="text-xs text-emerald-600 font-semibold ml-1">Save ₹600</span>
          </span>
        </NonReversingReveal>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-6 mt-10 max-w-sm md:max-w-none mx-auto">
          {tiers.map((tier) => (
            <NonReversingReveal key={tier.name} id={`pricing-${tier.name}`}>
              <div
                className={`rounded-[28px] p-6 sm:p-8 border relative transition-all duration-200 ${
                  tier.highlight
                    ? "bg-white border-[#F28C28]/40 shadow-[0_20px_50px_rgba(242,140,40,0.12)] lg:scale-105 lg:z-10"
                    : "bg-white/80 border-gray-200/70 shadow-[0_20px_50px_rgba(0,0,0,0.04)]"
                }`}
              >
                {tier.badge && (
                  <span className={`absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 text-xs font-bold text-[#0F172A] rounded-full whitespace-nowrap ${
                    tier.badge === "Most Popular" ? "bg-[#F28C28]" : "bg-emerald-500 text-white"
                  }`}>
                    {tier.badge}
                  </span>
                )}

                <div className="mb-5">
                  <h3 className="text-xl font-bold text-[#0F172A]">{tier.name}</h3>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className="text-4xl font-extrabold text-[#0F172A]">{tier.price}</span>
                    <span className="text-sm text-[#64748B]">/{tier.period}</span>
                  </div>
                  {tier.subtext && (
                    <p className="text-sm text-emerald-600 font-medium mt-1">{tier.subtext}</p>
                  )}
                </div>

                <p className="text-sm text-[#64748B] mb-6">{tier.desc}</p>

                <ul className="space-y-3 mb-8">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-[#475569]">
                      <svg className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>

                <Link
                  href={tier.href}
                  className={`block text-center py-3.5 rounded-2xl text-sm font-bold transition-all duration-200 ${
                    tier.highlight
                      ? "bg-[#F28C28] hover:bg-[#E07E1F] text-[#0F172A] shadow-[0_4px_14px_rgba(242,140,40,0.3)]"
                      : "bg-gray-100 hover:bg-gray-200 text-[#64748B]"
                  }`}
                >
                  {tier.cta}
                </Link>
              </div>
            </NonReversingReveal>
          ))}
        </div>

        {/* Trust signals */}
        <NonReversingReveal id="pricing-trust" className="mt-12 text-center">
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-[#94A3B8]">
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              Secured by Razorpay
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              3-day money-back guarantee
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              500+ students trust CareerDeck
            </span>
          </div>
        </NonReversingReveal>
      </div>
    </section>
  );
}
