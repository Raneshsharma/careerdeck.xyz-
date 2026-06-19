import { supabase } from "./supabase"

export const FREE_MONTHLY_LIMIT = 3

export async function getGenerationsThisMonth(userId) {
  const { data, error } = await supabase.rpc("get_generations_this_month", {
    user_uuid: userId,
  })
  if (error) throw new Error("Failed to check generation count")
  return data || 0
}

export async function getProfile(userId) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single()
  if (error && error.code !== "PGRST116") throw error
  return data
}

export async function createProfile(profile) {
  const { error } = await supabase.from("profiles").upsert(profile, {
    onConflict: "id",
  })
  if (error) throw error
}

export async function recordGeneration(userId, dossierType, companyName, role) {
  const { error } = await supabase.from("generations").insert({
    user_id: userId,
    dossier_type: dossierType,
    company_name: companyName || null,
    role: role || null,
  })
  if (error) throw new Error("Failed to record generation")
}
