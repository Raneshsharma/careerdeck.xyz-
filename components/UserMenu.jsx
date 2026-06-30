"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/components/SessionProvider";
import { createClient } from "@/lib/supabase-client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function UserMenu({ refreshTrigger }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!!user) {
      fetch("/api/profile")
        .then((r) => r.json())
        .then((data) => setProfileData(data))
        .catch(() => {});
    }
  }, [user, loading, refreshTrigger]);

  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  if (!user) return null;

  const initial = (user?.user_metadata?.full_name || user?.email || "U")[0].toUpperCase();
  const planTier = profileData?.profile?.plan_tier || "free";
  const isPro = planTier !== "free";
  const planDisplay = planTier === "pro" ? "Pro" : planTier === "pro-annual" ? "Pro Annual" : "Free";
  const used = profileData?.usage?.used ?? 0;
  const limit = profileData?.usage?.limit ?? 3;
  const remaining = Math.max(limit - used, 0);
  const usagePercent = limit > 0 ? Math.min((used / limit) * 100, 100) : 0;

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className={`w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-white text-xs font-bold hover:ring-2 hover:ring-amber-300 transition-all ${isPro ? "ring-2 ring-amber-400 shadow-[0_0_8px_rgba(242,140,40,0.4)]" : ""}`}
      >
        {initial}
      </button>

      {open && (
        <div className="absolute right-0 top-10 w-64 bg-[#0B0F19] rounded-xl shadow-2xl border border-white/[0.08] p-4 z-50 text-slate-200">
          {/* User info */}
          <div className="flex items-center gap-3 pb-3 border-b border-white/[0.05]">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 ${isPro ? "bg-gradient-to-br from-amber-400 to-yellow-500 shadow-[0_0_10px_rgba(242,140,40,0.3)]" : "bg-[#F28C28]/20 border border-[#F28C28]/40"}`}>
              {initial}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate flex items-center gap-1">
                {profileData?.profile?.name || user?.user_metadata?.full_name || user?.email}
                {isPro && <span title="Premium">👑</span>}
              </p>
              <p className="text-xs text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>

          {/* Usage bar */}
          <div className="py-3 border-b border-white/[0.05]">
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-slate-400">{used} of {limit} used this month</span>
              <span className="font-semibold text-white">{remaining} remaining</span>
            </div>
            <div className="w-full h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#F28C28] rounded-full transition-all duration-500"
                style={{ width: `${usagePercent}%` }}
              />
            </div>
            <div className="text-xs mt-2 flex items-center gap-1">
              <span className={isPro ? "text-[#F28C28] font-semibold" : "text-slate-400"}>
                {isPro ? "👑 " : ""}Plan: {planDisplay}
              </span>
              {isPro && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-gradient-to-r from-amber-400 to-yellow-500 text-[#0f172a]">PRO</span>
              )}
            </div>
            {planTier === "free" && remaining <= 1 && remaining > 0 && (
              <p className="text-xs text-[#F28C28] mt-1.5 font-medium">
                ⚡ Only {remaining} generation left —{" "}
                <Link href="/checkout?plan=pro" className="underline hover:text-[#E07E1F]">Upgrade</Link>
              </p>
            )}
            {planTier === "free" && remaining === 0 && (
              <Link href="/checkout?plan=pro" className="mt-2.5 block w-full text-center text-xs font-bold py-1.5 rounded-lg bg-[#F28C28] hover:bg-[#E07E1F] text-[#030712] transition-colors">
                Upgrade to Pro
              </Link>
            )}
          </div>

          {/* Profile link */}
          <button
            onClick={() => { router.push("/profile"); setOpen(false); }}
            className="w-full text-left text-sm text-slate-300 hover:text-white hover:bg-white/[0.02] py-1.5 px-2 rounded-lg transition-colors mt-1"
          >
            Profile
          </button>

          {/* Sign out */}
          <button
            onClick={() => { createClient().auth.signOut().then(() => router.push("/")).catch(() => router.push("/")); }}
            className="w-full text-left text-sm text-slate-400 hover:text-white hover:bg-white/[0.02] py-1.5 px-2 rounded-lg transition-colors mt-0.5"
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
