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
  const planColor = isPro ? "bg-gradient-to-r from-amber-400 to-yellow-500 text-[#0F172A]" : "bg-gray-100 text-gray-700"
  const used = usage?.used ?? 0
  const limit = usage?.limit ?? 3
  const remaining = Math.max(limit - used, 0)

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <header className="flex items-center justify-between px-8 py-5 max-w-4xl mx-auto">
        <Link href="/" className="flex items-center">
          <Image src="/logo.png" alt="CareerDeck" height={40} width={60} className="h-10 w-auto" />
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-xs font-semibold px-4 py-2 rounded-lg bg-gray-900 text-white hover:bg-gray-800 transition-all duration-200">
            Generate
          </Link>
          <UserMenu />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-8 py-12">
        {loading ? (
          <div className="text-center text-gray-400 py-20">Loading...</div>
        ) : (
          <div className="space-y-8">
            {/* User Info Card */}
            <div className="bg-white rounded-2xl border border-gray-200/80 p-8 shadow-sm">
              <div className="flex items-center gap-5">
                {user?.user_metadata?.avatar_url ? (
                  <Image src={user.user_metadata.avatar_url} alt="" height={64} width={64} className="rounded-full" />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-amber-500 flex items-center justify-center text-white text-xl font-bold">
                    {(user?.user_metadata?.full_name || user?.email || "U")[0]}
                  </div>
                )}
                <div>
                  <h1 className="text-2xl font-extrabold text-[#0F172A]">{profile?.name || user?.user_metadata?.full_name || user?.email}</h1>
                  <p className="text-sm text-[#64748B]">{user?.email}</p>
                  {profile?.industry && (
                    <p className="text-xs text-[#94A3B8] mt-1">{profile.industry} &middot; {profile.experience_level}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Plan & Usage Card */}
            <div className={`bg-white rounded-2xl border p-8 shadow-sm ${isPro ? "border-amber-400/50 shadow-[0_0_20px_rgba(242,140,40,0.1)]" : "border-gray-200/80"}`}>
              <h2 className="text-lg font-bold text-[#0F172A] mb-6 flex items-center gap-2">
                Plan & Usage
                {isPro && <span className="text-lg">👑</span>}
              </h2>

              <div className="flex items-center gap-3 mb-6">
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${planColor}`}>{planName}</span>
                <span className="text-xs text-[#94A3B8]">
                  {used} of {limit} generations used this month
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-6">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((used / limit) * 100, 100)}%` }}
                />
              </div>

              <div className="flex items-center justify-between">
                <p className="text-sm text-[#64748B]">
                  {remaining > 0
                    ? `You have ${remaining} generation${remaining === 1 ? "" : "s"} remaining this month`
                    : "You've used all generations for this month"}
                </p>
                {remaining === 0 && (
                  <span className="text-xs text-amber-600 font-semibold">Upgrade coming soon</span>
                )}
              </div>
            </div>

            {/* Recent Generations Card */}
            {usage?.recent?.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-200/80 p-8 shadow-sm">
                <h2 className="text-lg font-bold text-[#0F172A] mb-4">Recent Generations</h2>
                <div className="space-y-3">
                  {usage.recent.map((gen) => (
                    <div key={gen.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                      <div>
                        <p className="text-sm font-medium text-[#0F172A]">{gen.dossier_type} dossier</p>
                        <p className="text-xs text-[#94A3B8]">
                          {gen.company_name}{gen.company_name && gen.role ? " — " : ""}{gen.role}
                        </p>
                      </div>
                      <p className="text-xs text-[#94A3B8]">
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
        <div className="text-center pb-12">
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
                className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              className="text-xs text-gray-300 hover:text-red-400 transition-colors"
            >
              Delete account
            </button>
          )}
        </div>
      </main>
    </div>
  )
}
