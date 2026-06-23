import "server-only"

if (typeof window !== "undefined") {
  throw new Error("supabase.js is a server-only module — do not import it in client components")
}

import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set")
}

export const supabase = createClient(supabaseUrl, supabaseServiceKey)
