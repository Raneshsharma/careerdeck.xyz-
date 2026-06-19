import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authConfig } from "@/lib/auth.config"
import { getProfile, createProfile } from "@/lib/generation-limits"

export const metadata = {
  title: "Generate Dossier — CareerDeck",
  description:
    "Paste a company name, role, and job description → get a 15+ page interview prep dossier in minutes. Built for MBA students and early-career professionals.",
}

export default async function GenerateLayout({ children }) {
  const session = await getServerSession(authConfig)
  if (!session?.user?.id) redirect("/auth")

  let profile = await getProfile(session.user.id).catch(() => null)

  if (!profile) {
    await createProfile({
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

  return <>{children}</>
}
