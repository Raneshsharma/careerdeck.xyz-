import { supabase } from "./supabase"

export const FREE_MONTHLY_LIMIT = 3
export const MEDIUM_MONTHLY_LIMIT = 10
export const PRO_MONTHLY_LIMIT = 30

export function getLimitForTier(tier) {
  const cleanTier = (tier || "free").toLowerCase();
  if (cleanTier.startsWith("pro")) {
    return PRO_MONTHLY_LIMIT;
  }
  if (cleanTier.startsWith("medium")) {
    return MEDIUM_MONTHLY_LIMIT;
  }
  return FREE_MONTHLY_LIMIT;
}

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
    const safe = {
      id: profile.id,
      email: profile.email,
      name: profile.name,
      avatar_url: profile.avatar_url,
      industry: profile.industry,
      experience_level: profile.experience_level,
      plan_tier: profile.plan_tier || "free",
      onboarded: profile.onboarded ?? false,
    };
    await supabase.from("profiles").upsert(safe)
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
