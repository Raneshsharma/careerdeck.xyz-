import { createClient } from "@/lib/supabase-server";
import { supabase } from "@/lib/supabase"

const ALLOWED_INDUSTRIES = [
  "Technology & IT", "Finance & Banking", "Consulting & Strategy", "Marketing & Digital",
  "Healthcare & Pharma", "E-commerce & Retail", "Manufacturing & Operations",
  "Education & EdTech", "Startups & Entrepreneurship", "Other",
]

const ALLOWED_EXPERIENCE_LEVELS = [
  "Entry Level (0–2 yrs)", "Mid Level (3–5 yrs)", "Senior Level (6–10 yrs)", "Executive (10+ yrs)",
]

export async function POST(request) {
  let user
  try {
    const supabaseAuth = await createClient();
    const { data } = await supabaseAuth.auth.getUser();
    user = data.user;
  } catch (err) {
    console.error("Onboard session error:", err)
  }
  if (!user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { name, industry, experienceLevel } = await request.json()

  if (!name?.trim() || !industry || !experienceLevel) {
    return Response.json({ error: "All fields are required" }, { status: 400 })
  }

  if (name.length > 100) {
    return Response.json({ error: "Name must be ≤100 characters" }, { status: 400 })
  }

  if (!ALLOWED_INDUSTRIES.includes(industry)) {
    return Response.json({ error: "Invalid industry" }, { status: 400 })
  }

  if (!ALLOWED_EXPERIENCE_LEVELS.includes(experienceLevel)) {
    return Response.json({ error: "Invalid experience level" }, { status: 400 })
  }

  try {
    const { error } = await supabase.from("profiles").upsert({
      id:     user.id,
      email: user.email,
      name: name.trim(),
      avatar_url: user.user_metadata?.avatar_url,
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
