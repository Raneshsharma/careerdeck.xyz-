import { createHmac, timingSafeEqual } from "crypto";
import { createClient } from "@/lib/supabase-server";
import { supabase } from "@/lib/supabase";
import Razorpay from "razorpay";

export async function POST(request) {
  try {
    const supabaseAuth = await createClient();
    const { data: { user } } = await supabaseAuth.auth.getUser();
    if (!user) {
      return Response.json({ error: "Sign in required" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return Response.json({ error: "Missing required payment fields" }, { status: 400 });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      console.error("RAZORPAY_KEY_SECRET not configured");
      return Response.json({ error: "Payment gateway not configured" }, { status: 500 });
    }
    const payload = `${razorpay_order_id}|${razorpay_payment_id}`;
    const generated = createHmac("sha256", secret).update(payload).digest();

    const expected = Buffer.from(razorpay_signature, "hex");
    if (generated.length !== expected.length || !timingSafeEqual(generated, expected)) {
      return Response.json({ error: "Signature verification failed" }, { status: 400 });
    }

    const rzp = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      key_secret: secret,
    });
    const order = await rzp.orders.fetch(razorpay_order_id);
    const plan = order.notes?.plan;

    if (plan && ["medium", "medium-annual", "pro", "pro-annual"].includes(plan)) {
      const { error: dbErr } = await supabase
        .from("profiles")
        .upsert({ id: user.id, plan_tier: plan })
        .select("id")
        .single();

      if (dbErr) {
        console.error("Failed to update plan_tier:", dbErr.message);
        return Response.json({ error: "Failed to upgrade account" }, { status: 500 });
      }
    }

    return Response.json({ verified: true, message: "Payment verified successfully" });
  } catch (e) {
    console.error("Verify payment error:", e);
    return Response.json({ error: "Failed to verify payment" }, { status: 500 });
  }
}
