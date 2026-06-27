import "server-only"

if (typeof window !== "undefined") {
  throw new Error("supabase.js is a server-only module — do not import it in client components")
}

import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error("WARNING: NEXT_PUBLIC_SUPABASE_URL and/or SUPABASE_SERVICE_ROLE_KEY missing — DB operations will fail")
}

export const supabase = createClient(supabaseUrl, supabaseServiceKey)
