"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/SessionProvider";
import { createClient } from "@/lib/supabase-client";

export default function LandingHeader() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [hovering, setHovering] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const headerBg = hovering || scrolled ? "bg-[#0B0F19]/80 border-white/[0.08]" : "bg-transparent border-transparent";

  return (
    <header
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-7xl flex items-center justify-between px-6 py-3 rounded-2xl backdrop-blur-md transition-all duration-300 border ${headerBg}`}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      <Link href="/" className="flex items-center">
        <Image
          src="/logo.png"
          alt="CareerDeck"
          height={32}
          width={48}
          className="h-8 w-auto filter brightness-110"
          priority
        />
      </Link>
      <nav className="flex items-center gap-3 sm:gap-6">
        <Link href="#section-steps" className="hidden sm:inline text-xs text-[#94A3B8] hover:text-[#F28C28] transition-colors">
          How It Works
        </Link>
        <Link href="#section-dossiers" className="hidden sm:inline text-xs text-[#94A3B8] hover:text-[#F28C28] transition-colors">
          Dossiers
        </Link>
        <Link href="#section-pricing" className="hidden sm:inline text-xs text-[#94A3B8] hover:text-[#F28C28] transition-colors">
          Pricing
        </Link>
        <Link
          href="/auth"
          className="text-xs font-semibold px-3 sm:px-4 py-2 rounded-lg bg-white hover:bg-gray-200 text-[#030712] transition-all duration-200 shadow-[0_4px_12px_rgba(255,255,255,0.08)]"
        >
          Generate
        </Link>
        {!!user ? (
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => { createClient().auth.signOut().then(() => router.push("/")).catch(() => router.push("/")); }}
              className="text-xs text-[#94A3B8] hover:text-[#F28C28] transition-colors"
            >
              Sign Out
            </button>
            {user?.user_metadata?.avatar_url ? (
              <Image
                src={user.user_metadata.avatar_url}
                alt={user.user_metadata?.full_name || user.email || ""}
                height={28}
                width={28}
                className="rounded-full border border-white/20"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-amber-500 flex items-center justify-center text-white text-[10px] font-bold">
                {(user?.user_metadata?.full_name || user?.email || "U")[0]}
              </div>
            )}
          </div>
        ) : (
          <Link
            href="/auth"
            className="text-xs font-semibold px-4 py-2 rounded-lg bg-[#F28C28] hover:bg-[#E07E1F] text-[#030712] transition-all duration-200 shadow-[0_4px_12px_rgba(242,140,40,0.2)]"
          >
            Sign In
          </Link>
        )}
      </nav>
    </header>
  );
}
