"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/components/SessionProvider";
import { createClient } from "@/lib/supabase-client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function MobileNavbar({ usageVersion }) {
  const { user } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const drawerRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target)) setOpen(false);
    };
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  useEffect(() => { setOpen(false); }, [router]);

  return (
    <>
      <header className="sticky top-0 z-50 bg-[#0B0F19]/80 border-b border-white/[0.08] backdrop-blur-md lg:hidden text-slate-200">
        <div className="flex items-center justify-between h-14 px-4">
          <Link href="/" className="flex items-center">
            <Image src="/logo.png" alt="CareerDeck" height={28} width={42} className="h-7 w-auto filter brightness-110" />
          </Link>
          <button
            onClick={() => setOpen(!open)}
            aria-label="Open menu"
            className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white/[0.04] transition-colors"
          >
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              {open ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </header>

      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div ref={drawerRef} className="absolute right-0 top-0 h-full w-64 bg-[#0B0F19] border-l border-white/[0.08] shadow-2xl animate-slide-in text-slate-200">
            <div className="p-4 border-b border-white/[0.08] flex items-center justify-between">
              <span className="font-bold text-white">Menu</span>
              <button onClick={() => setOpen(false)} aria-label="Close menu" className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/[0.04]">
                <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <nav className="p-2 space-y-1">
              {user && (
                <div className="px-3 py-2 text-xs text-slate-400 truncate border-b border-white/[0.05] mb-2 font-medium">
                  {user.email}
                </div>
              )}
              <Link href="/dashboard" className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-white/[0.03] text-sm font-semibold text-slate-300 hover:text-white" onClick={() => setOpen(false)}>
                <svg className="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1h-2z" /></svg>
                Dashboard
              </Link>
              <Link href="/profile" className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-white/[0.03] text-sm font-semibold text-slate-300 hover:text-white" onClick={() => setOpen(false)}>
                <svg className="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                Profile
              </Link>

              {user ? (
                <button
                  onClick={() => { createClient().auth.signOut().then(() => router.push("/")).catch(() => router.push("/")); setOpen(false); }}
                  className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-white/[0.03] text-sm text-slate-400 hover:text-white w-full text-left"
                >
                  <svg className="w-4 h-4 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                  Sign Out
                </button>
              ) : (
                <Link
                  href="/auth"
                  className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-white/[0.03] text-sm font-semibold text-[#F28C28] hover:text-[#E07E1F] w-full"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>
                  Sign In
                </Link>
              )}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
