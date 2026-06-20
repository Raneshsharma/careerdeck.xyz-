"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";

export default function LandingHeader() {
  const { data: session, status } = useSession();
  const [scrolled, setScrolled] = useState(false);
  const [hovering, setHovering] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const headerBg = hovering || !scrolled ? "bg-white/80" : "bg-white/10";

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-5 max-w-7xl mx-auto backdrop-blur-sm transition-all duration-300 ${headerBg}`}
      style={{ left: "50%", transform: "translateX(-50%)" }}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      <Link href="/" className="flex items-center">
        <Image
          src="/logo.png"
          alt="CareerDeck"
          height={40}
          width={60}
          className="h-10 w-auto"
          priority
        />
      </Link>
      <nav className="flex items-center gap-6">
        <Link href="#section-steps" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
          How It Works
        </Link>
        <Link href="#section-dossiers" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
          Dossiers
        </Link>
        <Link href="#section-pricing" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
          Pricing
        </Link>
        <Link
          href="/auth"
          className="text-xs font-semibold px-4 py-2 rounded-lg bg-gray-900 hover:bg-gray-800 text-white transition-all duration-200"
        >
          Generate
        </Link>
        {status === "authenticated" ? (
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => signOut()}
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              Sign Out
            </button>
            {session.user?.image ? (
              <Image
                src={session.user.image}
                alt={session.user.name || ""}
                height={28}
                width={28}
                className="rounded-full"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-amber-500 flex items-center justify-center text-white text-[10px] font-bold">
                {(session.user?.name || "U")[0]}
              </div>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => signIn("google", { callbackUrl: "/generate" })}
            className="text-xs font-semibold px-4 py-2 rounded-lg border border-gray-200/80 hover:border-gray-300 hover:bg-gray-50 text-gray-700 transition-all duration-200"
          >
            Sign In
          </button>
        )}
      </nav>
    </header>
  );
}
