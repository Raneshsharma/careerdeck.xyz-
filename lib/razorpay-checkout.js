"use client";

const RAZORPAY_KEY_ID = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

async function loadRazorpayScript() {
  if (typeof window !== "undefined" && window.Razorpay) return;
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Razorpay SDK"));
    document.body.appendChild(script);
  });
}

export function executePayment(plan) {
  if (typeof window === "undefined") return Promise.reject(new Error("Client-only"));

  return new Promise(async (resolve, reject) => {
    try {
      await loadRazorpayScript();

      const orderRes = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });

      if (!orderRes.ok) {
        const errData = await orderRes.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to create order");
      }

      const order = await orderRes.json();

      const rzp = new window.Razorpay({
        key: RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "CareerDeck",
        description: plan === "pro" ? "Pro - ₹499/mo" : "Enterprise - ₹1,499/mo",
        order_id: order.order_id,
        image: "/favicon.ico",
        prefill: { name: "", email: "" },
        theme: { color: "#F28C28" },
        handler: async function (response) {
          try {
            const verifyRes = await fetch("/api/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                plan,
              }),
            });

            const verifyData = await verifyRes.json();

            if (verifyData.verified) {
              window.location.href = "/dashboard";
            } else {
              reject(new Error(verifyData.error || "Payment verification failed"));
            }
          } catch (e) {
            reject(e);
          }
        },
        modal: {
          ondismiss: () => reject(new Error("CANCELLED")),
          escape: true,
        },
      });

      rzp.on("payment.failed", function (response) {
        reject(new Error(response.error?.description || "Payment failed"));
      });

      rzp.open();
    } catch (e) {
      reject(e);
    }
  });
}
