import Razorpay from "razorpay";

const PLANS = {
  pro: { amount: 49900, name: "Pro – ₹499/mo" },
  enterprise: { amount: 149900, name: "Enterprise – ₹1,499/mo" },
};

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { plan } = body;
    const selectedPlan = PLANS[plan];

    if (!selectedPlan) {
      return Response.json({ error: "Invalid plan. Use 'pro' or 'enterprise'." }, { status: 400 });
    }

    const rzp = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const receipt = `rcpt_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    const order = await rzp.orders.create({
      amount: selectedPlan.amount,
      currency: "INR",
      receipt,
      notes: { plan, plan_name: selectedPlan.name },
    });

    return Response.json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (e) {
    console.error("Create order error:", e);
    if (e.statusCode === 401) {
      return Response.json({ error: "Payment gateway auth failed. Check API keys." }, { status: 401 });
    }
    return Response.json({ error: e.message || "Failed to create order" }, { status: 500 });
  }
}
