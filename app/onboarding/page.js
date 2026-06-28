"use client"

import { useAuth } from "@/components/SessionProvider"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState, Suspense } from "react"
import Image from "next/image"
import toast from "react-hot-toast"

const INDUSTRIES = [
  "Technology & IT",
  "Finance & Banking",
  "Consulting & Strategy",
  "Marketing & Digital",
  "Healthcare & Pharma",
  "E-commerce & Retail",
  "Manufacturing & Operations",
  "Education & EdTech",
  "Startups & Entrepreneurship",
  "Other",
]

const EXPERIENCE_LEVELS = [
  "Entry Level (0–2 yrs)",
  "Mid Level (3–5 yrs)",
  "Senior Level (6–10 yrs)",
  "Executive (10+ yrs)",
]

function isValidRedirect(url) {
  if (!url || typeof url !== "string") return false;
  if (!url.startsWith("/")) return false;
  if (url.includes("@") || url.includes("//") || url.includes("\\")) return false;
  return true;
}

function OnboardContent() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [name, setName] = useState("")
  const [industry, setIndustry] = useState("")
  const [experienceLevel, setExperienceLevel] = useState("")
  const [saving, setSaving] = useState(false)

  const [checkingOnboarded, setCheckingOnboarded] = useState(true)

  useEffect(() => {
    if (!user && !loading) router.replace("/auth")
  }, [user, loading, router])

  useEffect(() => {
    const displayName = user?.user_metadata?.full_name || user?.email
    if (displayName) setName(displayName)
  }, [user])

  useEffect(() => {
    if (!user) return
    fetch("/api/profile")
      .then((r) => r.json())
      .then((data) => {
        if (data?.profile?.onboarded) {
          const rawDest = searchParams.get("redirectTo") || "/dashboard"
          const destination = isValidRedirect(rawDest) ? rawDest : "/dashboard"
          router.replace(destination)
        }
      })
      .catch((err) => console.error("Onboard check error:", err))
      .finally(() => setCheckingOnboarded(false))
  }, [user, loading, router])

  if (!user || checkingOnboarded) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim() || !industry || !experienceLevel) {
      toast.error("Please fill in all fields")
      return
    }

    setSaving(true)
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          industry,
          experienceLevel,
        }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Failed to save")
      }
      toast.success("Profile saved!")
      const rawDest = searchParams.get("redirectTo") || "/dashboard"
      const destination = isValidRedirect(rawDest) ? rawDest : "/dashboard"
      router.replace(destination)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center px-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Image
              src="/logo.png"
              alt="CareerDeck"
              height={40}
              width={60}
              className="h-10 w-auto"
            />
          </div>
          <h1 className="text-3xl font-extrabold text-[#0F172A] tracking-tight">
            Welcome to CareerDeck
          </h1>
          <p className="mt-2 text-[#64748B] text-sm">
            Tell us a bit about yourself so we can tailor your experience
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-[#0F172A] mb-1.5">
              Your Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="w-full h-12 px-4 rounded-xl border border-gray-200/80 bg-white text-sm text-[#0F172A] placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#0F172A] mb-1.5">
              Target Industry
            </label>
            <select
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="w-full h-12 px-4 rounded-xl border border-gray-200/80 bg-white text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 appearance-none"
            >
              <option value="">Select your industry</option>
              {INDUSTRIES.map((ind) => (
                <option key={ind} value={ind}>
                  {ind}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#0F172A] mb-1.5">
              Experience Level
            </label>
            <select
              value={experienceLevel}
              onChange={(e) => setExperienceLevel(e.target.value)}
              className="w-full h-12 px-4 rounded-xl border border-gray-200/80 bg-white text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 appearance-none"
            >
              <option value="">Select your level</option>
              {EXPERIENCE_LEVELS.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full h-12 rounded-xl bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 text-white font-semibold text-sm transition-all duration-200 shadow-sm"
          >
            {saving ? "Saving..." : "Get Started"}
          </button>
        </form>
      </div>
    </div>
  )
}

export default function OnboardPage() {
  return (
    <Suspense fallback={null}>
      <OnboardContent />
    </Suspense>
  )
}
