"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { executePayment } from "@/lib/razorpay-checkout";

export default function RazorpayButton({ plan, label, className }) {
  const { status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleClick() {
    setError(null);

    if (status === "authenticated") {
      setLoading(true);
      try {
        await executePayment(plan);
      } catch (e) {
        if (e.message === "CANCELLED") {
          setLoading(false);
          return;
        }
        setError(e.message || "Something went wrong");
      }
      setLoading(false);
      return;
    }

    sessionStorage.setItem("upgradePlan", plan);
    router.push("/auth");
  }

  return (
    <div className="w-full">
      <button
        onClick={handleClick}
        disabled={loading}
        className={className}
      >
        {loading ? "Processing..." : status === "loading" ? "Loading..." : label}
      </button>
      {error && (
        <p className="mt-2 text-xs text-red-600 text-center">{error}</p>
      )}
    </div>
  );
}
