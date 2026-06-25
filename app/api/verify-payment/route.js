import { createHmac } from "crypto";
import { createClient } from "@/lib/supabase-server";
import { supabase } from "@/lib/supabase";

export async function POST(request) {
  try {
    const supabaseAuth = await createClient();
    const { data: { user } } = await supabaseAuth.auth.getUser();
    if (!user) {
      return Response.json({ error: "Sign in required" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return Response.json(
        { error: "Missing required fields: razorpay_order_id, razorpay_payment_id, razorpay_signature" },
        { status: 400 }
      );
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;
    const payload = `${razorpay_order_id}|${razorpay_payment_id}`;
    const generated = createHmac("sha256", secret).update(payload).digest("hex");

    if (generated !== razorpay_signature) {
      return Response.json({ error: "Signature verification failed" }, { status: 400 });
    }

    if (plan && ["pro", "pro-annual", "enterprise"].includes(plan)) {
      const { error: dbErr } = await supabase
        .from("profiles")
        .upsert({ id: user.id, plan_tier: plan })
        .select("id")
        .single();

      if (dbErr) {
        console.error("Failed to update plan_tier:", dbErr.message);
      }
    }

    return Response.json({ verified: true, message: "Payment verified successfully" });
  } catch (e) {
    console.error("Verify payment error:", e);
    return Response.json({ error: "Failed to verify payment" }, { status: 500 });
  }
}
