import { supabase } from "@/lib/supabase"

export async function POST(request) {
  try {
    const { email } = await request.json();
    if (!email || !email.includes("@") || email.length > 254) {
      return Response.json({ error: "Valid email required" }, { status: 400 })
    }
    const { error } = await supabase.from("newsletter_subscribers").upsert(
      { email: email.trim().toLowerCase() },
      { onConflict: "email" }
    )
    if (error) throw error
    return Response.json({ ok: true })
  } catch (e) {
    console.error("Newsletter error:", e.message)
    return Response.json({ error: "Failed to subscribe" }, { status: 500 })
  }
}
