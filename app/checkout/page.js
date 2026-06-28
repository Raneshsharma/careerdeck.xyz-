"use client";

import { useAuth } from "@/components/SessionProvider";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, Suspense } from "react";
import { executePayment } from "@/lib/razorpay-checkout";
import Image from "next/image";

const PLANS = {
  pro: { name: "Pro Monthly", price: "₹149", amount: 14900, period: "/month", desc: "20 dossiers/month, all 4 types, full research depth, PDF export, priority speed, email support" },
  "pro-annual": { name: "Pro Annual", price: "₹1,199", amount: 119900, period: "/year", desc: "Everything in Pro Monthly, 20 dossiers/month, 2 months free, cancel anytime" },
};

function CheckoutContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
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
    <div className="min-h-screen bg-[#FAFAFA]">
      <div className="max-w-lg mx-auto px-4 py-20">
        <div className="text-center mb-10">
          <Image src="/logo.png" alt="CareerDeck" height={32} width={48} className="h-8 w-auto mx-auto mb-4" />
          <h1 className="text-3xl font-extrabold text-[#0F172A] tracking-tight">Complete your upgrade</h1>
          <p className="mt-2 text-[#64748B] text-sm">You are upgrading to the {plan.name} plan.</p>
        </div>

        <div className="bg-white rounded-[28px] p-8 border border-gray-200/70 shadow-[0_20px_50px_rgba(0,0,0,0.04)] mb-6">
          <h2 className="text-xl font-bold text-[#0F172A]">{plan.name} Plan</h2>
          <div className="flex items-baseline gap-1 mt-2 mb-4">
            <span className="text-4xl font-extrabold text-[#0F172A]">{plan.price}</span>
            <span className="text-sm text-[#64748B]">{plan.period}</span>
          </div>
          <p className="text-sm text-[#64748B]">{plan.desc}</p>

          <button
            onClick={handlePay}
            disabled={loading || !user}
            className="w-full mt-8 min-h-[48px] py-3.5 rounded-2xl text-base font-bold bg-[#F28C28] hover:bg-[#E07E1F] text-[#0F172A] shadow-[0_4px_14px_rgba(242,140,40,0.3)] transition-all duration-200 disabled:opacity-50"
          >
            {loading ? "Processing..." : !user ? "Redirecting to login..." : `Pay ${plan.price}`}
          </button>
          {error && (
            <p className="mt-3 text-xs text-red-600 text-center">{error}</p>
          )}
        </div>

        <p className="text-xs text-center text-[#94A3B8]">
          Secured by Razorpay. You will not be charged until you confirm.
        </p>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="w-8 h-8 border-[3px] border-gray-200 border-t-brand-500 rounded-full animate-spin" />
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}
