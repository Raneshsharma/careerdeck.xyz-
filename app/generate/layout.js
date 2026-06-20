import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authConfig } from "@/lib/auth.config"
import { supabase } from "@/lib/supabase"
import { FREE_MONTHLY_LIMIT } from "@/lib/generation-limits"

export const metadata = {
  title: "Generate Dossier — CareerDeck",
  description:
    "Paste a company name, role, and job description → get a 15+ page interview prep dossier in minutes. Built for MBA students and early-career professionals.",
}

export default async function GenerateLayout({ children }) {
  let session
  try {
    session = await getServerSession(authConfig)
  } catch {}
  if (!session?.user?.id) redirect("/auth")

  // Check / create profile
  try {
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .single()

    if (!profile) {
      await supabase.from("profiles").upsert({
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        avatar_url: session.user.image,
        plan_tier: "free",
        onboarded: false,
      })
      redirect("/onboard")
    }

    if (!profile.onboarded) redirect("/onboard")
  } catch {
    // If anything fails (Supabase down, etc.), let users proceed anyway
  }

  return <>{children}</>
}
