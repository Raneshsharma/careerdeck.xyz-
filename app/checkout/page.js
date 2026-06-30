"use client";

import { useAuth } from "@/components/SessionProvider";
import { useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { executePayment } from "@/lib/razorpay-checkout";
import Image from "next/image";
import Link from "next/link";

const PLANS = {
  pro: { name: "Pro Monthly", price: "₹149", amount: 14900, period: "/month", desc: "20 dossiers/month, all 4 types, full research depth, PDF export, priority speed, email support" },
  "pro-annual": { name: "Pro Annual", price: "₹1,199", amount: 119900, period: "/year", desc: "Everything in Pro Monthly, 20 dossiers/month, 2 months free, cancel anytime" },
};

function CheckoutContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const planKey = searchParams.get("plan") || "pro";
  const plan = PLANS[planKey] || PLANS.pro;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handlePay() {
    setError(null);
    setLoading(true);
    try {
      await executePayment(planKey);
    } catch (e) {
      if (e.message === "CANCELLED") return;
      setError(e.message || "Payment failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#030712] relative overflow-hidden text-slate-200">
      {/* 3D Perspective Grid Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(124,58,237,0.06),transparent_50%)] pointer-events-none z-0" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none z-0" />

      <div className="max-w-lg mx-auto px-4 py-20 relative z-10 animate-slide-up">
        <div className="text-center mb-10">
          <Link href="/dashboard" className="inline-block">
            <Image src="/logo.png" alt="CareerDeck" height={32} width={48} className="h-8 w-auto mx-auto mb-4 filter brightness-110" />
          </Link>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Complete your upgrade</h1>
          <p className="mt-2 text-slate-400 text-sm">You are upgrading to the {plan.name} plan.</p>
        </div>

        <div className="bg-[#0B0F19]/60 border border-white/[0.08] backdrop-blur-md rounded-2xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.4)] mb-6">
          <h2 className="text-xl font-bold text-white">{plan.name} Plan</h2>
          <div className="flex items-baseline gap-1 mt-2 mb-4">
            <span className="text-4xl font-extrabold text-white">{plan.price}</span>
            <span className="text-sm text-slate-400">{plan.period}</span>
          </div>
          <p className="text-sm text-slate-400 leading-relaxed">{plan.desc}</p>

          <button
            onClick={handlePay}
            disabled={loading || !user}
            className="w-full mt-8 min-h-[48px] py-3.5 rounded-xl text-base font-bold bg-[#F28C28] hover:bg-[#E07E1F] text-[#030712] shadow-[0_4px_14px_rgba(242,140,40,0.3)] transition-all duration-200 disabled:opacity-50"
          >
            {loading ? "Processing..." : !user ? "Redirecting to login..." : `Pay ${plan.price}`}
          </button>
          {error && (
            <p className="mt-3 text-xs text-red-400 text-center">{error}</p>
          )}
        </div>

        <p className="text-xs text-center text-slate-500">
          Secured by Razorpay. You will not be charged until you confirm.
        </p>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#030712] flex items-center justify-center">
        <div className="w-8 h-8 border-[3px] border-white/10 border-t-[#F28C28] rounded-full animate-spin bg-transparent" />
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}
