"use client";

import { useState } from "react";
import NonReversingReveal from "@/components/NonReversingReveal";
import Link from "next/link";

const TIERS_MONTHLY = [
  {
    name: "Free",
    price: "₹0",
    period: "forever",
    desc: "Test the waters. Ideal for preparing for a single interview.",
    features: [
      "3 dossiers per month",
      "All 4 dossier types",
      "Wikipedia & DuckDuckGo lookup",
      "Standard generation speed",
    ],
    cta: "Get started free",
    href: "/auth",
    badge: null,
    highlight: false,
  },
  {
    name: "Medium",
    price: "₹99",
    period: "per month",
    subtext: "₹9.90/dossier — less than a cup of coffee",
    desc: "Perfect for active job seekers applying to multiple roles.",
    features: [
      "10 dossiers per month",
      "All 4 dossier types",
      "Google & Yahoo Finance research",
      "PDF export enabled",
      "Priority queue speed",
    ],
    cta: "Get Medium",
    href: "/checkout?plan=medium",
    badge: null,
    highlight: false,
  },
  {
    name: "Pro",
    price: "₹199",
    period: "per month",
    subtext: "₹6.60/dossier — best for placement prep",
    desc: "For candidates applying widely to maximize placement chances.",
    features: [
      "30 dossiers per month",
      "Everything in Medium",
      "Domain competitor segmentation",
      "Priority email & chat support",
    ],
    cta: "Get Pro Monthly",
    href: "/checkout?plan=pro",
    badge: "Most Popular",
    highlight: true,
  },
  {
    name: "Business",
    price: "Custom",
    period: "cohort",
    subtext: "For universities & teams",
    desc: "Provide placement prep dossiers for your entire cohort or cell.",
    features: [
      "Unlimited dossiers / student",
      "Custom university PDF branding",
      "Bulk generation portal",
      "Placement officer dashboard",
      "Dedicated support SLA",
    ],
    cta: "Contact Sales",
    href: "mailto:sales@careerdeck.xyz?subject=Business%20Tier%20Inquiry",
    badge: null,
    highlight: false,
  },
];

const TIERS_ANNUAL = [
  {
    name: "Free",
    price: "₹0",
    period: "forever",
    desc: "Test the waters. Ideal for preparing for a single interview.",
    features: [
      "3 dossiers per month",
      "All 4 dossier types",
      "Wikipedia & DuckDuckGo lookup",
      "Standard generation speed",
    ],
    cta: "Get started free",
    href: "/auth",
    badge: null,
    highlight: false,
  },
  {
    name: "Medium Annual",
    price: "₹79",
    period: "per month",
    subtext: "Billed annually (₹799/yr) — save 33%",
    desc: "Perfect for active job seekers applying to multiple roles.",
    features: [
      "10 dossiers per month",
      "All 4 dossier types",
      "Google & Yahoo Finance research",
      "PDF export enabled",
      "Priority queue speed",
    ],
    cta: "Get Medium Annual",
    href: "/checkout?plan=medium-annual",
    badge: null,
    highlight: false,
  },
  {
    name: "Pro Annual",
    price: "₹125",
    period: "per month",
    subtext: "Billed annually (₹1,499/yr) — save 37%",
    desc: "For candidates applying widely to maximize placement chances.",
    features: [
      "30 dossiers per month",
      "Everything in Medium",
      "Domain competitor segmentation",
      "Priority email & chat support",
    ],
    cta: "Get Pro Annual",
    href: "/checkout?plan=pro-annual",
    badge: "Best Value",
    highlight: true,
  },
  {
    name: "Business",
    price: "Custom",
    period: "cohort",
    subtext: "For universities & teams",
    desc: "Provide placement prep dossiers for your entire cohort or cell.",
    features: [
      "Unlimited dossiers / student",
      "Custom university PDF branding",
      "Bulk generation portal",
      "Placement officer dashboard",
      "Dedicated support SLA",
    ],
    cta: "Contact Sales",
    href: "mailto:sales@careerdeck.xyz?subject=Business%20Tier%20Inquiry",
    badge: null,
    highlight: false,
  },
];

export default function PricingSection() {
  const [annual, setAnnual] = useState(false);
  const tiers = annual ? TIERS_ANNUAL : TIERS_MONTHLY;

  return (
    <section id="section-pricing" className="relative bg-[#030712] py-20 border-t border-white/[0.08]">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10">
        <NonReversingReveal id="pricing-headline" className="text-center">
          <div className="w-12 h-[5px] bg-[#F28C28] rounded-full mx-auto mb-8 animate-pulse" />
          <h2 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight leading-[1.05]">
            Simple, student-friendly pricing
          </h2>
          <p className="mt-4 text-lg sm:text-xl text-slate-400 max-w-[600px] mx-auto leading-relaxed">
            Start free, upgrade when you're ready. No hidden fees, cancel anytime.
          </p>
        </NonReversingReveal>

        {/* Annual toggle */}
        <NonReversingReveal id="pricing-toggle" className="flex items-center justify-center mt-8 gap-3">
          <span className={`text-sm font-semibold transition-colors duration-200 ${!annual ? "text-white" : "text-slate-500"}`}>Monthly</span>
          <button
            onClick={() => setAnnual(!annual)}
            className={`relative w-12 h-7 rounded-full transition-colors duration-200 flex-shrink-0 bg-white/[0.08] border border-white/[0.08]`}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full shadow transition-transform duration-200 ${annual ? "translate-x-5 bg-[#F28C28]" : "translate-x-0 bg-slate-400"}`} />
          </button>
          <span className={`text-sm font-semibold transition-colors duration-200 ${annual ? "text-white" : "text-slate-500"}`}>
            Annual <span className="text-xs text-emerald-400 font-bold ml-1 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">Save up to 37%</span>
          </span>
        </NonReversingReveal>

        {/* Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-12 max-w-sm sm:max-w-none mx-auto items-stretch">
          {tiers.map((tier) => (
            <NonReversingReveal key={tier.name} id={`pricing-${tier.name}`} className="flex">
              <div
                className={`w-full rounded-3xl p-6 sm:p-8 border relative transition-all duration-300 hover:scale-[1.01] flex flex-col justify-between ${
                  tier.highlight
                    ? "bg-[#0B0F19]/90 border-[#F28C28]/45 shadow-[0_20px_50px_rgba(242,140,40,0.12)] lg:scale-105 lg:z-10"
                    : "bg-[#0B0F19]/60 border-white/[0.08] shadow-[0_20px_50px_rgba(0,0,0,0.4)]"
                }`}
              >
                {tier.badge && (
                  <span className={`absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 text-xs font-bold text-[#030712] rounded-full whitespace-nowrap ${
                    tier.badge === "Most Popular" ? "bg-[#F28C28]" : "bg-emerald-400 text-[#030712]"
                  }`}>
                    {tier.badge}
                  </span>
                )}

                <div>
                  <div className="mb-5">
                    <h3 className="text-xl font-bold text-white">{tier.name}</h3>
                    <div className="flex items-baseline gap-1 mt-2">
                      <span className="text-4xl font-extrabold text-white">{tier.price}</span>
                      <span className="text-sm text-slate-400">/{tier.period}</span>
                    </div>
                    {tier.subtext && (
                      <p className="text-xs text-emerald-400 font-semibold mt-1.5 bg-emerald-500/10 px-2.5 py-0.5 rounded-md inline-block border border-emerald-500/15">{tier.subtext}</p>
                    )}
                  </div>

                  <p className="text-sm text-slate-400 mb-6 leading-relaxed">{tier.desc}</p>

                  <ul className="space-y-3 mb-8">
                    {tier.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-slate-300 leading-snug">
                        <svg className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>

                <Link
                  href={tier.href}
                  className={`block text-center py-3.5 rounded-2xl text-sm font-bold transition-all duration-200 ${
                    tier.highlight
                      ? "bg-[#F28C28] hover:bg-[#E07E1F] text-[#030712] shadow-[0_4px_14px_rgba(242,140,40,0.3)]"
                      : "bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.06] text-slate-300 hover:text-white"
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
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              Secured by Razorpay
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              500+ students trust CareerDeck
            </span>
          </div>
        </NonReversingReveal>
      </div>
    </section>
  );
}
