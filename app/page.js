"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-client";
import LandingPage from "@/components/LandingPage";

export default function Home() {
  const [checking, setChecking] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        router.replace("/dashboard");
      } else {
        setChecking(false);
      }
    }).catch(() => {
      setChecking(false);
    });
  }, [router]);

  if (checking) return null;

  return <LandingPage />;
}
