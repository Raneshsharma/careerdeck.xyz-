import { supabase } from "./supabase"

export const FREE_MONTHLY_LIMIT = 3

export async function getGenerationsThisMonth(userId) {
  try {
    const { data } = await supabase.rpc("get_generations_this_month", {
      user_uuid: userId,
    })
    return data || 0
  } catch {
    return 0
  }
}

export async function getProfile(userId) {
  try {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single()
    return data || null
  } catch {
    return null
  }
}

export async function createProfile(profile) {
  try {
    await supabase.from("profiles").upsert(profile)
  } catch {}
}

export async function recordGeneration(userId, dossierType, companyName, role) {
  try {
    await supabase.from("generations").insert({
      user_id: userId,
      dossier_type: dossierType,
      company_name: companyName || null,
      role: role || null,
    })
  } catch {}
}
