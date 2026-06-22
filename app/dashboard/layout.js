import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import { supabase } from "@/lib/supabase"

export const metadata = {
  title: "Generate Dossier — CareerDeck",
  description:
    "Paste a company name, role, and job description → get a 15+ page interview prep dossier in minutes. Built for MBA students and early-career professionals.",
}

export default async function GenerateLayout({ children }) {
  let user
  try {
    const supabaseAuth = await createClient();
    const { data } = await supabaseAuth.auth.getUser();
    user = data.user;
  } catch (err) {
    console.error("Generate layout session error:", err)
  }
  if (!user?.id) redirect("/auth")

  // Check / create profile
  try {
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()

    if (!profile) {
      await supabase.from("profiles").upsert({
        id: user.id,
        email: user.email,
        name: user.user_metadata?.full_name,
        avatar_url: user.user_metadata?.avatar_url,
        plan_tier: "free",
        onboarded: false,
      })
      redirect("/onboarding")
    }

    if (!profile.onboarded) redirect("/onboarding")
  } catch (err) {
    console.error("Generate layout error:", err)
    // If anything fails (Supabase down, etc.), let users proceed anyway
  }

  return <>{children}</>
}
