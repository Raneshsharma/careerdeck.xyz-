import { getServerSession } from "next-auth"
import { authConfig } from "@/lib/auth.config"
import { supabase } from "@/lib/supabase"

export async function POST(request) {
  const session = await getServerSession(authConfig)
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { name, industry, experienceLevel } = await request.json()

  if (!name?.trim() || !industry || !experienceLevel) {
    return Response.json({ error: "All fields are required" }, { status: 400 })
  }

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

  if (error) {
    console.error("Onboard save error:", error)
    return Response.json({ error: "Failed to save profile" }, { status: 500 })
  }

  return Response.json({ ok: true })
}
