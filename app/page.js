import LandingPage from "@/components/LandingPage";

export const dynamic = "force-dynamic";

async function getSession() {
  try {
    const { createClient } = await import("@/lib/supabase-server");
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  } catch (e) {
    console.error("Home page session error:", e.message);
    return null;
  }
}

export default async function Home() {
  const user = await getSession();

  if (user) {
    const { redirect } = await import("next/navigation");
    redirect("/dashboard");
  }

  return <LandingPage />;
}
