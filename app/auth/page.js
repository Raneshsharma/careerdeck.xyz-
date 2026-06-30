"use client";

import { createClient } from "@/lib/supabase-client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";

function AuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawRedirect = searchParams.get("redirectTo") || "/dashboard";
  const redirectTo = isValidRedirect(rawRedirect) ? rawRedirect : "/dashboard";
  const isReset = searchParams.get("reset") === "true";
  const [tab, setTab] = useState(isReset ? "signin" : "signin");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetEmail, setResetEmail] = useState("");
  const [showReset, setShowReset] = useState(false);

  useEffect(() => {
    if (isReset) return;
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) router.replace(redirectTo);
    }).catch(() => {});
  }, [router, redirectTo, isReset]);

  // ── Set new password (after reset) ──
  async function handleSetNewPassword(e) {
    e.preventDefault();
    setError(null);
    if (!password || password.length < 6) { setError("Password must be at least 6 characters"); return; }
    if (password !== confirmPassword) { setError("Passwords do not match"); return; }
    setLoading(true);
    try {
      const supabase = createClient();
      const { error: err } = await supabase.auth.updateUser({ password });
    if (err) { setError(err.message); setLoading(false); return; }
    setSuccess("Password updated! Redirecting...");
    setTimeout(() => router.replace("/dashboard"), 1500);
    } catch { setError("Update failed. Try again."); setLoading(false); }
  }

  // ── Email/Password Sign In ──
  async function handleEmailSignIn(e) {
    e.preventDefault();
    setError(null);
    if (!email || !password) { setError("Please fill in all fields"); return; }
    setLoading(true);
    try {
      const supabase = createClient();
      const { error: err } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (err) { setError(err.message); setLoading(false); return; }
      router.replace(redirectTo);
    } catch { setError("Connection failed. Try again."); setLoading(false); }
  }

  // ── Email/Password Sign Up ──
  async function handleEmailSignUp(e) {
    e.preventDefault();
    setError(null);
    if (!name.trim() || !email || !password || !confirmPassword) {
      setError("Please fill in all fields"); return;
    }
    if (name.length > 100) { setError("Name must be ≤100 characters"); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters"); return; }
    if (password !== confirmPassword) { setError("Passwords do not match"); return; }
    setLoading(true);
    try {
      const supabase = createClient();
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
      const { error: err } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { full_name: name.trim() },
        emailRedirectTo: `${siteUrl}/auth/confirm`,
      },
    });
    if (err) { setError(err.message); setLoading(false); return; }
    setSuccess("Account created! Check your email for a confirmation link.");
    setLoading(false);
    } catch { setError("Connection failed. Try again."); setLoading(false); }
  }

  // ── Password Reset ──
  async function handleReset(e) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!resetEmail.trim() || !resetEmail.includes("@")) { setError("Enter a valid email address"); return; }
    setLoading(true);
    try {
      const supabase = createClient();
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
      const { error: err } = await supabase.auth.resetPasswordForEmail(resetEmail.trim(), {
        redirectTo: `${siteUrl}/auth?reset=true`,
      });
      if (err) throw err;
      setSuccess("Reset link sent! Check your email (and spam folder).");
    } catch (e) {
      setError(e?.message || "Unable to send reset link. Try again.");
    } finally {
      setLoading(false);
    }
  }

  // ── Google OAuth ──
  async function handleGoogleSignIn() {
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
      const { error: err } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${siteUrl}/auth/callback?next=${encodeURIComponent(redirectTo)}` },
      });
      if (err) { setError(err.message); setLoading(false); }
    } catch { setError("Connection failed. Try again."); setLoading(false); }
  }

  function switchTab(t) { setTab(t); setError(null); setSuccess(null); }

  return (
    <div className="min-h-screen bg-[#030712] relative overflow-hidden flex items-center justify-center px-4 py-10 text-slate-200">
      {/* 3D Perspective Grid Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(124,58,237,0.08),transparent_50%)] pointer-events-none z-0" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none z-0" />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center justify-center gap-2 mb-4">
            <Image src="/logo.png" alt="CareerDeck" height={40} width={60} className="h-10 w-auto filter brightness-110" />
          </Link>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            {tab === "signin" ? "Welcome back" : "Create your account"}
          </h1>
          <p className="mt-2 text-slate-400 text-sm">
            {tab === "signin" ? "Sign in to access your dossiers" : "Start generating interview prep dossiers"}
          </p>
          <div className="mt-6 bg-white/[0.01] border border-white/[0.05] rounded-xl p-4 text-left">
            <p className="text-sm text-slate-300 italic leading-relaxed">
              &ldquo;CareerDeck helped me prep for my Amazon interview in 30 minutes instead of 3 hours. Got the offer.&rdquo;
            </p>
            <p className="text-xs text-slate-500 mt-2 font-medium">— Riya M., IIM Bangalore · MBA 2025</p>
          </div>
          <p className="mt-4 text-xs text-slate-500">Trusted by 500+ MBA students</p>
        </div>

        <div className="bg-[#0B0F19]/60 border border-white/[0.08] backdrop-blur-md shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] p-6 rounded-3xl">
          {isReset && !success ? (
            <form onSubmit={handleSetNewPassword} className="space-y-4">
              <h3 className="text-lg font-bold text-white">Set new password</h3>
              <p className="text-sm text-slate-400">Enter a new password for your account.</p>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">New Password</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" className="w-full px-4 py-3 rounded-xl border border-white/[0.08] bg-[#0B0F19]/40 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#F28C28]/20 focus:border-[#F28C28]/40 transition-all" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Confirm Password</label>
                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Repeat your password" className="w-full px-4 py-3 rounded-xl border border-white/[0.08] bg-[#0B0F19]/40 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#F28C28]/20 focus:border-[#F28C28]/40 transition-all" />
              </div>
              <button type="submit" disabled={loading} className="w-full h-12 rounded-xl bg-[#F28C28] hover:bg-[#E07E1F] disabled:bg-slate-700 text-[#030712] font-bold text-sm transition-all duration-200 shadow-sm">
                {loading ? "Updating..." : "Set password"}
              </button>
            </form>
          ) : success ? (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-6 text-center">
              <svg className="w-10 h-10 text-emerald-400 mx-auto mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <p className="text-sm font-semibold text-emerald-300 mb-1">{success}</p>
              <p className="text-xs text-emerald-500">You can close this page.</p>
            </div>
          ) : (
            <>
              {/* Tabs */}
              <div className="flex rounded-xl bg-white/[0.03] border border-white/[0.05] p-1 mb-6">
                <button
                  onClick={() => switchTab("signin")}
                  className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${tab === "signin" ? "bg-[#0B0F19] text-[#F28C28] border border-white/[0.08] shadow-sm" : "text-slate-400 hover:text-slate-200"}`}
                >Sign In</button>
                <button
                  onClick={() => switchTab("signup")}
                  className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${tab === "signup" ? "bg-[#0B0F19] text-[#F28C28] border border-white/[0.08] shadow-sm" : "text-slate-400 hover:text-slate-200"}`}
                >Create Account</button>
              </div>

              {/* Error */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4 text-sm text-red-400 flex items-center gap-2">
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                  {error}
                </div>
              )}

              {/* Sign In Form */}
              {tab === "signin" && !showReset && (
                <form onSubmit={handleEmailSignIn} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Email</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" className="w-full px-4 py-3 rounded-xl border border-white/[0.08] bg-[#0B0F19]/40 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#F28C28]/20 focus:border-[#F28C28]/40 transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Password</label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Your password" className="w-full px-4 py-3 rounded-xl border border-white/[0.08] bg-[#0B0F19]/40 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#F28C28]/20 focus:border-[#F28C28]/40 transition-all" />
                  </div>
                  <button type="button" onClick={() => { setShowReset(true); setError(null); setSuccess(null); }} className="text-xs text-[#F28C28] hover:text-[#E07E1F] transition-colors">Forgot password?</button>
                  <button type="submit" disabled={loading} className="w-full h-12 rounded-xl bg-[#F28C28] hover:bg-[#E07E1F] disabled:bg-slate-700 text-[#030712] font-bold text-sm transition-all duration-200 shadow-sm">
                    {loading ? "Signing in..." : "Sign in"}
                  </button>
                </form>
              )}

              {/* Reset Password Form */}
              {tab === "signin" && showReset && (
                <form onSubmit={handleReset} className="space-y-4">
                  <p className="text-sm text-slate-400">Enter your email and we'll send you a reset link.</p>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Email</label>
                    <input type="email" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} placeholder="you@email.com" className="w-full px-4 py-3 rounded-xl border border-white/[0.08] bg-[#0B0F19]/40 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#F28C28]/20 focus:border-[#F28C28]/40 transition-all" />
                  </div>
                  <button type="submit" disabled={loading} className="w-full h-12 rounded-xl bg-[#F28C28] hover:bg-[#E07E1F] disabled:bg-slate-700 text-[#030712] font-bold text-sm transition-all duration-200 shadow-sm">
                    {loading ? "Sending..." : "Send reset link"}
                  </button>
                  <button type="button" onClick={() => setShowReset(false)} className="w-full text-xs text-slate-500 hover:text-slate-400 transition-colors">Back to sign in</button>
                </form>
              )}

              {/* Sign Up Form */}
              {tab === "signup" && (
                <form onSubmit={handleEmailSignUp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Full Name</label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Riya Mehra" maxLength={100} className="w-full px-4 py-3 rounded-xl border border-white/[0.08] bg-[#0B0F19]/40 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#F28C28]/20 focus:border-[#F28C28]/40 transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Email</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" className="w-full px-4 py-3 rounded-xl border border-white/[0.08] bg-[#0B0F19]/40 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#F28C28]/20 focus:border-[#F28C28]/40 transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Password</label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" className="w-full px-4 py-3 rounded-xl border border-white/[0.08] bg-[#0B0F19]/40 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#F28C28]/20 focus:border-[#F28C28]/40 transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Confirm Password</label>
                    <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Repeat your password" className="w-full px-4 py-3 rounded-xl border border-white/[0.08] bg-[#0B0F19]/40 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#F28C28]/20 focus:border-[#F28C28]/40 transition-all" />
                  </div>
                  <button type="submit" disabled={loading} className="w-full h-12 rounded-xl bg-[#F28C28] hover:bg-[#E07E1F] disabled:bg-slate-700 text-[#030712] font-bold text-sm transition-all duration-200 shadow-sm">
                    {loading ? "Creating account..." : "Create account"}
                  </button>
                </form>
              )}

              {/* Google divider */}
              {!showReset && (
                <>
                  <div className="flex items-center gap-3 my-5">
                    <div className="flex-1 h-px bg-white/[0.08]" />
                    <span className="text-xs text-slate-500">or continue with</span>
                    <div className="flex-1 h-px bg-white/[0.08]" />
                  </div>
                  <button type="button" onClick={handleGoogleSignIn} disabled={loading} className="w-full flex items-center justify-center gap-3 h-12 rounded-xl bg-white hover:bg-slate-200 text-[#030712] font-bold text-sm transition-all duration-200 shadow-sm disabled:opacity-50">
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    Google
                  </button>
                </>
              )}

              <p className="mt-6 text-xs text-center text-slate-500">
                By continuing, you agree to our Terms of Service and Privacy Policy.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#030712] flex items-center justify-center"><div className="w-8 h-8 border-[3px] border-white/10 border-t-[#F28C28] rounded-full animate-spin" /></div>}>
      <AuthContent />
    </Suspense>
  );
}

function isValidRedirect(url) {
  if (!url || typeof url !== "string") return false;
  if (!url.startsWith("/")) return false;
  if (url.includes("@") || url.includes("//") || url.includes("\\")) return false;
  return true;
}
