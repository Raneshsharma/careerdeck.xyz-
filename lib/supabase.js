if (typeof window !== "undefined") {
  throw new Error("supabase.js is a server-only module — do not import it in client components")
}

import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn("Supabase env vars missing — profiles/generations features disabled")
}

export const supabase = createClient(
  supabaseUrl || "",
  supabaseServiceKey || "",
)
