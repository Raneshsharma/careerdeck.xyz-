"use client";

import NonReversingReveal from "@/components/NonReversingReveal";
import RazorpayButton from "@/components/RazorpayButton";
import Link from "next/link";

const TIERS = [
  {
    name: "Free",
    price: "₹0",
    period: "forever",
    desc: "Try before you upgrade. See what a CareerDeck dossier looks like.",
    features: [
      "3 dossiers per month",
      "Company + Role types",
      "Basic research depth",
      "Standard generation speed",
    ],
    cta: "Get started",
    href: "/auth",
    badge: null,
    highlight: false,
  },
  {
    name: "Pro",
    price: "₹499",
    period: "per month",
    desc: "For active job seekers who want every interview to count.",
    features: [
      "20 dossiers per month",
      "All 4 dossier types",
      "Full research depth",
      "PDF export",
      "High priority generation",
    ],
    cta: "Upgrade to Pro",
    href: "/auth",
    badge: "Popular",
    highlight: true,
  },
  {
    name: "Enterprise",
    price: "₹1,499",
    period: "per month",
    desc: "For career centers, accelerators, and power users.",
    features: [
      "Unlimited dossiers",
      "All types + custom templates",
      "Full research + API access",
      "PDF export + API integration",
      "Instant generation priority",
    ],
    cta: "Contact sales",
    href: "/auth",
    badge: null,
    highlight: false,
  },
];

export default function PricingSection() {
  return (
    <section id="section-pricing" className="relative bg-[#FAFAFA] py-16 border-t border-gray-100/60">
      <div className="max-w-7xl mx-auto px-8">
        <NonReversingReveal id="pricing-headline" className="text-center">
          <div className="w-12 h-[5px] bg-[#F28C28] rounded-full mx-auto mb-8" />
          <h2 className="text-5xl sm:text-6xl font-extrabold text-[#0F172A] tracking-tight leading-[1.05]">
            Simple pricing
          </h2>
          <p className="mt-4 text-xl sm:text-2xl text-[#64748B] max-w-[600px] mx-auto">
            All tiers include real-time SerpAPI research and GPT-4o-mini generation.
            No hidden fees, no surprise charges.
          </p>
        </NonReversingReveal>

        <div className="grid md:grid-cols-3 gap-6 mt-14">
          {TIERS.map((tier) => (
            <NonReversingReveal key={tier.name} id={`pricing-${tier.name}`}>
              <div
                className={`rounded-[28px] p-8 border relative ${
                  tier.highlight
                    ? "bg-white border-[#F28C28]/40 shadow-[0_20px_50px_rgba(242,140,40,0.08)]"
                    : "bg-white/80 border-gray-200/70 shadow-[0_20px_50px_rgba(0,0,0,0.04)]"
                }`}
              >
                {tier.badge && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 text-xs font-bold text-white bg-[#F28C28] rounded-full">
                    {tier.badge}
                  </span>
                )}

                <div className="mb-5">
                  <h3 className="text-xl font-bold text-[#0F172A]">{tier.name}</h3>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className="text-4xl font-extrabold text-[#0F172A]">{tier.price}</span>
                    <span className="text-sm text-[#64748B]">/{tier.period}</span>
                  </div>
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

                {tier.name === "Free" ? (
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
                ) : (
                  <RazorpayButton
                    plan={tier.name.toLowerCase()}
                    label={tier.cta}
                    className={`block w-full text-center py-3.5 rounded-2xl text-sm font-bold transition-all duration-200 ${
                      tier.highlight
                        ? "bg-[#F28C28] hover:bg-[#E07E1F] text-[#0F172A] shadow-[0_4px_14px_rgba(242,140,40,0.3)]"
                        : "bg-gray-100 hover:bg-gray-200 text-[#64748B]"
                    }`}
                  />
                )}
              </div>
            </NonReversingReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
