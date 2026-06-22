import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default async function CheckoutLayout({ children }) {
  const supabaseAuth = await createClient();
  const { data: { user } } = await supabaseAuth.auth.getUser();
  if (!user) redirect("/auth");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, onboarded")
    .eq("id", user.id)
    .single();

  if (!profile || !profile.onboarded) redirect("/onboarding");

  return <>{children}</>;
}
