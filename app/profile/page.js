"use client"

import { useAuth } from "@/components/SessionProvider"
import { createClient } from "@/lib/supabase-client"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import UserMenu from "@/components/UserMenu"
import toast from "react-hot-toast"

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [profile, setProfile] = useState(null)
  const [usage, setUsage] = useState(null)
  const [loading, setLoading] = useState(true)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!user && !authLoading) router.replace("/auth")
  }, [user, authLoading, router])

  useEffect(() => {
    if (!user) return
    fetch("/api/profile")
      .then((r) => r.json())
      .then((data) => {
        setProfile(data.profile)
        setUsage(data.usage)
      })
      .catch((err) => console.error("Profile fetch error:", err))
      .finally(() => setLoading(false))
  }, [user, authLoading])

  if (!user) return null

  const planName = profile?.plan_tier === "free" ? "Free" : profile?.plan_tier === "pro" ? "Pro" : profile?.plan_tier === "pro-annual" ? "Pro Annual" : "Free"
  const isPro = profile?.plan_tier && profile?.plan_tier !== "free"
  const planColor = isPro ? "bg-gradient-to-r from-amber-400 to-yellow-500 text-[#0F172A]" : "bg-white/[0.06] border border-white/[0.08] text-slate-300"
  const used = usage?.used ?? 0
  const limit = usage?.limit ?? 3
  const remaining = Math.max(limit - used, 0)

  return (
    <div className="min-h-screen bg-[#030712] relative overflow-hidden text-slate-200">
      {/* 3D Perspective Grid Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(124,58,237,0.06),transparent_50%)] pointer-events-none z-0" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none z-0" />

      <header className="sticky top-0 z-50 bg-[#0B0F19]/80 border-b border-white/[0.08] backdrop-blur-md text-slate-200 relative z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-8 flex items-center justify-between h-16 w-full">
          <Link href="/" className="flex items-center">
            <Image src="/logo.png" alt="CareerDeck" height={32} width={48} className="h-8 w-auto filter brightness-110" />
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-sm font-semibold text-[#F28C28] hover:text-[#E07E1F] transition-colors duration-200">
              Dashboard
            </Link>
            <UserMenu />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-8 py-12 relative z-10">
        {loading ? (
          <div className="text-center text-slate-400 py-20">Loading...</div>
        ) : (
          <div className="space-y-8">
            {/* User Info Card */}
            <div className="bg-[#0B0F19]/60 border border-white/[0.08] backdrop-blur-md rounded-2xl p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
              <div className="flex items-center gap-5">
                {user?.user_metadata?.avatar_url ? (
                  <Image src={user.user_metadata.avatar_url} alt="" height={64} width={64} className="rounded-full" />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-amber-500 flex items-center justify-center text-white text-xl font-bold">
                    {(user?.user_metadata?.full_name || user?.email || "U")[0]}
                  </div>
                )}
                <div>
                  <h1 className="text-2xl font-extrabold text-white tracking-tight">{profile?.name || user?.user_metadata?.full_name || user?.email}</h1>
                  <p className="text-sm text-slate-400">{user?.email}</p>
                  {profile?.industry && (
                    <p className="text-xs text-slate-500 mt-1">{profile.industry} &middot; {profile.experience_level}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Plan & Usage Card */}
            <div className={`bg-[#0B0F19]/60 border backdrop-blur-md rounded-2xl p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.3)] ${isPro ? "border-amber-400/50 shadow-[0_0_20px_rgba(242,140,40,0.1)]" : "border-white/[0.08]"}`}>
              <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                Plan & Usage
                {isPro && <span className="text-lg">👑</span>}
              </h2>

              <div className="flex items-center gap-3 mb-6">
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${planColor}`}>{planName}</span>
                <span className="text-xs text-slate-400">
                  {used} of {limit} generations used this month
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2 bg-white/[0.06] rounded-full overflow-hidden mb-6">
                <div
                  className="h-full bg-[#F28C28] rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((used / limit) * 100, 100)}%` }}
                />
              </div>

              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-400">
                  {remaining > 0
                    ? `You have ${remaining} generation${remaining === 1 ? "" : "s"} remaining this month`
                    : "You've used all generations for this month"}
                </p>
                {remaining === 0 && (
                  <Link href="/checkout?plan=pro" className="text-xs text-[#F28C28] font-bold hover:underline">
                    Upgrade to Pro →
                  </Link>
                )}
              </div>
            </div>

            {/* Recent Generations Card */}
            {usage?.recent?.length > 0 && (
              <div className="bg-[#0B0F19]/60 border border-white/[0.08] backdrop-blur-md rounded-2xl p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
                <h2 className="text-lg font-bold text-white mb-4">Recent Generations</h2>
                <div className="space-y-3">
                  {usage.recent.map((gen) => (
                    <div key={gen.id} className="flex items-center justify-between py-2 border-b border-white/[0.06] last:border-0">
                      <div>
                        <p className="text-sm font-medium text-white">{gen.dossier_type} dossier</p>
                        <p className="text-xs text-slate-400">
                          {gen.company_name}{gen.company_name && gen.role ? " — " : ""}{gen.role}
                        </p>
                      </div>
                      <p className="text-xs text-slate-500">
                        {new Date(gen.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Delete account */}
        <div className="text-center pb-12 mt-8">
          {confirmDelete ? (
            <div className="inline-flex items-center gap-2">
              <span className="text-xs text-red-400">Delete all data?</span>
              <button
                onClick={async () => {
                  setDeleting(true)
                  try {
                    const res = await fetch("/api/delete-account", { method: "DELETE" })
                    if (!res.ok) throw new Error()
                    toast.success("Account deleted")
                    await createClient().auth.signOut()
                    router.push("/")
                  } catch {
                    toast.error("Failed to delete account")
                    setDeleting(false)
                    setConfirmDelete(false)
                  }
                }}
                disabled={deleting}
                className="text-xs text-red-500 font-medium hover:text-red-700 transition-colors"
              >
                {deleting ? "Deleting..." : "Confirm"}
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              className="text-xs text-slate-600 hover:text-red-400 transition-colors"
            >
              Delete account
            </button>
          )}
        </div>
      </main>
    </div>
  )
}
