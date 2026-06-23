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
  const used = profileData?.usage?.used ?? 0;
  const limit = profileData?.usage?.limit ?? 3;
  const remaining = Math.max(limit - used, 0);
  const usagePercent = limit > 0 ? Math.min((used / limit) * 100, 100) : 0;

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-white text-xs font-bold hover:ring-2 hover:ring-amber-300 transition-all"
      >
        {initial}
      </button>

      {open && (
        <div className="absolute right-0 top-10 w-64 bg-white rounded-xl shadow-lg border border-gray-200 p-4 z-50">
          {/* User info */}
          <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
            <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
              {initial}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[#0F172A] truncate">
                {profileData?.profile?.name || user?.user_metadata?.full_name || user?.email}
              </p>
              <p className="text-xs text-[#64748B] truncate">{user?.email}</p>
            </div>
          </div>

          {/* Usage bar */}
          <div className="py-3 border-b border-gray-100">
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-[#64748B]">{used} of {limit} used this month</span>
              <span className="font-semibold text-[#0F172A]">{remaining} remaining</span>
            </div>
            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-500 rounded-full transition-all duration-500"
                style={{ width: `${usagePercent}%` }}
              />
            </div>
            <p className="text-xs text-[#94A3B8] mt-1">
              Plan: {planTier === "pro" ? "Pro" : planTier === "enterprise" ? "Enterprise" : "Free"}
            </p>
            {planTier === "free" && remaining <= 1 && remaining > 0 && (
              <p className="text-xs text-amber-600 mt-0.5 font-medium">
                ⚡ Only {remaining} generation left —{" "}
                <Link href="/checkout?plan=pro" className="underline hover:text-amber-800">Upgrade</Link>
              </p>
            )}
            {planTier === "free" && remaining === 0 && (
              <Link href="/checkout?plan=pro" className="mt-1.5 block w-full text-center text-xs font-bold py-1.5 rounded-lg bg-amber-500 text-[#0F172A] hover:bg-amber-400 transition-colors">
                Upgrade to Pro
              </Link>
            )}
          </div>

          {/* Profile link */}
          <button
            onClick={() => { router.push("/profile"); setOpen(false); }}
            className="w-full text-left text-sm text-[#0F172A] hover:bg-gray-50 py-1.5 px-2 rounded-lg transition-colors mt-1"
          >
            Profile
          </button>

          {/* Sign out */}
          <button
            onClick={() => { createClient().auth.signOut().then(() => router.push("/")); }}
            className="w-full text-left text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-50 py-1.5 px-2 rounded-lg transition-colors mt-0.5"
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
