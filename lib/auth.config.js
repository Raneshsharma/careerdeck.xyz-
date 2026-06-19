import GoogleProvider from "next-auth/providers/google"
import { supabase } from "./supabase"

export const authConfig = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider !== "google") return true
      try {
        const { data } = await supabase
          .from("profiles")
          .select("id")
          .eq("id", user.id)
          .single()

        if (!data) {
          await supabase.from("profiles").upsert({
            id: user.id,
            email: user.email,
            name: user.name,
            avatar_url: user.image,
            plan_tier: "free",
            onboarded: false,
          })
        }
      } catch {
        // Profile table may not exist yet; proceed anyway
      }
      return true
    },
    async session({ session, token }) {
      session.user.id = token.sub
      return session
    },
  },
  pages: {
    signIn: "/auth",
  },
  secret: process.env.NEXTAUTH_SECRET,
}
