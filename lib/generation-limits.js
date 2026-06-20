import { supabase } from "./supabase"

export const FREE_MONTHLY_LIMIT = 3

export async function getGenerationsThisMonth(userId) {
  try {
    const { data } = await supabase.rpc("get_generations_this_month", {
      user_uuid: userId,
    })
    return data || 0
  } catch (err) {
    console.error("getGenerationsThisMonth error:", err)
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
  } catch (err) {
    console.error("getProfile error:", err)
    return null
  }
}

export async function createProfile(profile) {
  try {
    await supabase.from("profiles").upsert(profile)
  } catch (err) {
    console.error("createProfile error:", err)
  }
}

export async function recordGeneration(userId, dossierType, companyName, role) {
  try {
    const { data } = await supabase.from("generations").insert({
      user_id: userId,
      dossier_type: dossierType,
      company_name: companyName || null,
      role: role || null,
    }).select("id")
    return data?.[0]?.id || null
  } catch (err) {
    console.error("recordGeneration error:", err)
    return null
  }
}
