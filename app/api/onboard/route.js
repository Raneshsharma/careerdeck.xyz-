import { getServerSession } from "next-auth"
import { authConfig } from "@/lib/auth.config"
import { supabase } from "@/lib/supabase"

const ALLOWED_INDUSTRIES = [
  "Technology / SaaS", "Finance & Banking", "Consulting", "Healthcare & Pharma",
  "Consumer Goods & Retail", "Media & Entertainment", "Energy & Utilities",
  "Manufacturing", "Real Estate", "Education", "Other",
]

const ALLOWED_EXPERIENCE_LEVELS = [
  "Entry Level (0–2 yrs)", "Mid Level (3–5 yrs)", "Senior Level (6–10 yrs)", "Executive (10+ yrs)",
]

export async function POST(request) {
  let session
  try {
    session = await getServerSession(authConfig)
  } catch (err) {
    console.error("Onboard session error:", err)
  }
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { name, industry, experienceLevel } = await request.json()

  if (!name?.trim() || !industry || !experienceLevel) {
    return Response.json({ error: "All fields are required" }, { status: 400 })
  }

  if (!ALLOWED_INDUSTRIES.includes(industry)) {
    return Response.json({ error: "Invalid industry" }, { status: 400 })
  }

  if (!ALLOWED_EXPERIENCE_LEVELS.includes(experienceLevel)) {
    return Response.json({ error: "Invalid experience level" }, { status: 400 })
  }

  try {
    const { error } = await supabase.from("profiles").upsert({
      id: session.user.id,
      email: session.user.email,
      name: name.trim(),
      avatar_url: session.user.image,
      industry,
      experience_level: experienceLevel,
      plan_tier: "free",
      onboarded: true,
    })
    if (error) throw error
  } catch (err) {
    console.error("Onboard save error:", err)
    return Response.json({ error: "Failed to save profile" }, { status: 500 })
  }

  return Response.json({ ok: true })
}
