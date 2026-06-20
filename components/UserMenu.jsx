"use client";

import { useState, useEffect, useRef } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function UserMenu() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/profile")
        .then((r) => r.json())
        .then((data) => setProfileData(data))
        .catch(() => {});
    }
  }, [status]);

  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
        setConfirmDelete(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      const res = await fetch("/api/delete-account", { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete account");
      toast.success("Account deleted");
      signOut({ callbackUrl: "/" });
    } catch (err) {
      toast.error(err.message);
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  if (status !== "authenticated") return null;

  const initial = (session.user?.name || "U")[0].toUpperCase();
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
                {profileData?.profile?.name || session.user?.name}
              </p>
              <p className="text-xs text-[#64748B] truncate">{session.user?.email}</p>
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
            <p className="text-xs text-[#94A3B8] mt-1">Plan: Free</p>
          </div>

          {/* Profile link */}
          <button
            onClick={() => { router.push("/profile"); setOpen(false); }}
            className="w-full text-left text-sm text-[#0F172A] hover:bg-gray-50 py-1.5 px-2 rounded-lg transition-colors mt-1"
          >
            Profile
          </button>

          {/* Delete account */}
          {confirmDelete ? (
            <div className="mt-1 pt-2 border-t border-red-100">
              <p className="text-xs text-red-600 mb-2 px-2">Delete your account and all data?</p>
              <div className="flex gap-2 px-2">
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleting}
                  className="flex-1 text-xs font-medium bg-red-500 text-white py-1.5 rounded-lg hover:bg-red-600 disabled:opacity-50 transition-colors"
                >
                  {deleting ? "Deleting..." : "Confirm"}
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="flex-1 text-xs font-medium bg-gray-100 text-gray-600 py-1.5 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              className="w-full text-left text-sm text-red-500 hover:text-red-700 hover:bg-red-50 py-1.5 px-2 rounded-lg transition-colors mt-1"
            >
              Delete Account
            </button>
          )}

          {/* Sign out */}
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full text-left text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-50 py-1.5 px-2 rounded-lg transition-colors mt-0.5"
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
