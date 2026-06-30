import { createClient } from "@/lib/supabase-server";
import Razorpay from "razorpay";

const PLANS = {
  medium: { amount: 9900, name: "Medium – ₹99/mo" },
  "medium-annual": { amount: 79900, name: "Medium Annual – ₹799/yr" },
  pro: { amount: 19900, name: "Pro – ₹199/mo" },
  "pro-annual": { amount: 149900, name: "Pro Annual – ₹1,499/yr" },
};

export async function POST(request) {
  try {
    const supabaseAuth = await createClient();
    const { data: { user } } = await supabaseAuth.auth.getUser();
    if (!user) {
      return Response.json({ error: "Sign in required" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { plan } = body;
    const selectedPlan = PLANS[plan];

    if (!selectedPlan) {
      return Response.json({ error: "Invalid plan. Use 'medium', 'medium-annual', 'pro' or 'pro-annual'." }, { status: 400 });
    }

    const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      console.error("Razorpay env vars missing:", { hasKeyId: !!keyId, hasKeySecret: !!keySecret });
      return Response.json({ error: "Payment gateway not configured. Contact support." }, { status: 500 });
    }

    const rzp = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
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
    return Response.json({ error: "Failed to create order" }, { status: 500 });
  }
}
