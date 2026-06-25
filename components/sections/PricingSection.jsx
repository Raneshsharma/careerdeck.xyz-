"use client";

import { useState } from "react";
import NonReversingReveal from "@/components/NonReversingReveal";
import Link from "next/link";

const MONTHLY_TIERS = [
  {
    name: "Free",
    price: "₹0",
    period: "forever",
    desc: "Try before you upgrade. See what a CareerDeck dossier looks like.",
    features: [
      "3 dossiers per month",
      "All 4 dossier types",
      "Wikipedia research",
      "Standard generation speed",
      "Section source citations",
    ],
    cta: "Get started",
    href: "/auth",
    badge: null,
    highlight: false,
    plan: null,
  },
  {
    name: "Pro",
    price: "₹149",
    period: "per month",
    desc: "For active job seekers who want every interview to count.",
    features: [
      "20 dossiers per month",
      "All 4 dossier types",
      "Full research depth",
      "PDF export",
      "Priority generation speed",
      "Email support",
    ],
    cta: "Upgrade to Pro",
    href: "/checkout?plan=pro",
    badge: "Most Popular",
    highlight: true,
    plan: "pro",
  },
  {
    name: "Pro Annual",
    price: "₹1,199",
    period: "per year",
    subtext: "₹99/mo — save 33%",
    desc: "Best value for serious interview prep. One payment, full year of access.",
    features: [
      "Everything in Pro",
      "20 dossiers per month",
      "2 months free vs monthly",
      "Cancel anytime",
    ],
    cta: "Get Pro Annual",
    href: "/checkout?plan=pro-annual",
    badge: "Best Value",
    highlight: false,
    plan: null,
  },
];

export default function PricingSection() {
  const [annual, setAnnual] = useState(false);

  const tiers = annual
    ? MONTHLY_TIERS.filter((t) => t.name !== "Pro")
    : MONTHLY_TIERS.filter((t) => t.name !== "Pro Annual");

  return (
    <section id="section-pricing" className="relative bg-[#FAFAFA] py-16 border-t border-gray-100/60">
      <div className="max-w-7xl mx-auto px-8">
        <NonReversingReveal id="pricing-headline" className="text-center">
          <div className="w-12 h-[5px] bg-[#F28C28] rounded-full mx-auto mb-8" />
          <h2 className="text-5xl sm:text-6xl font-extrabold text-[#0F172A] tracking-tight leading-[1.05]">
            Made for students
          </h2>
          <p className="mt-4 text-xl sm:text-2xl text-[#64748B] max-w-[600px] mx-auto">
            Less than a Zomato order. Unlimited interview confidence.
          </p>
        </NonReversingReveal>

        {/* Annual toggle */}
        <NonReversingReveal id="pricing-toggle" className="flex items-center justify-center mt-8 gap-3">
          <span className={`text-sm font-medium ${!annual ? "text-[#0F172A]" : "text-[#94A3B8]"}`}>Monthly</span>
          <button
            onClick={() => setAnnual(!annual)}
            className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${annual ? "bg-[#F28C28]" : "bg-gray-300"}`}
          >
            <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${annual ? "translate-x-[22px]" : "translate-x-0.5"}`} />
          </button>
          <span className={`text-sm font-medium ${annual ? "text-[#0F172A]" : "text-[#94A3B8]"}`}>
            Annual <span className="text-xs text-emerald-600 font-semibold ml-1">Save 33%</span>
          </span>
        </NonReversingReveal>

        <div className="grid md:grid-cols-3 gap-6 mt-10 max-w-md md:max-w-none mx-auto">
          {tiers.map((tier) => (
            <NonReversingReveal key={tier.name} id={`pricing-${tier.name}`}>
              <div
                className={`rounded-[28px] p-8 border relative transition-all duration-200 ${
                  tier.highlight
                    ? "bg-white border-[#F28C28]/40 shadow-[0_20px_50px_rgba(242,140,40,0.12)] scale-105 z-10"
                    : "bg-white/80 border-gray-200/70 shadow-[0_20px_50px_rgba(0,0,0,0.04)]"
                }`}
              >
                {tier.badge && (
                  <span className={`absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 text-xs font-bold text-[#0F172A] rounded-full ${
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
          <div className="flex items-center justify-center gap-6 text-xs text-[#94A3B8]">
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              Secured by Razorpay
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              3‑day money‑back guarantee
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
