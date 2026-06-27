// ─── In-memory rate limiter (per-IP) ────────────────────────────────────
//
// Design: Prevent token abuse by limiting concurrent requests per IP.
// No fixed "N users" threshold — instead:
//   - 1 concurrent generation per IP (one dossier at a time)
//   - Cooldown after completion: 3s (prevents rapid-fire bursts)
//   - Exponential backoff on errors: 5s → 10s → 20s → 30s max
//   - Global cap: 5 simultaneous LLM calls across ALL IPs
//
// This prevents a single attacker from burning API credits via:
//   - Concurrent requests flooding
//   - Cancel-and-resubmit loops
//   - Error-amplified retry storms
//
// All state is in-memory (resets on server restart).
// For production, replace with Redis or similar.

const GLOBAL_MAX_CONCURRENT = 5;
const COOLDOWN_MS = 3_000;
const ERROR_COOLDOWNS = [5_000, 10_000, 20_000, 30_000];

const ipMap = new Map();
let globalActive = 0;

function now() {
  return Date.now();
}

function getIP(request) {
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const ips = forwarded.split(",").map((s) => s.trim()).filter(Boolean);
    if (ips.length > 0) return ips[0];
  }
  return "127.0.0.1";
}

function getEntry(ip) {
  if (!ipMap.has(ip)) {
    ipMap.set(ip, { active: 0, lastEnd: 0, errorStreak: 0, blockedUntil: 0 });
  }
  return ipMap.get(ip);
}

let cleanupTimer = null;
function ensureCleanup() {
  if (cleanupTimer) return;
  cleanupTimer = setInterval(() => {
    const cutoff = now() - 600_000; // 10 minutes
    for (const [ip, entry] of ipMap) {
      if (entry.active === 0 && entry.lastEnd < cutoff) {
        ipMap.delete(ip);
      }
    }
    if (ipMap.size === 0) {
      clearInterval(cleanupTimer);
      cleanupTimer = null;
    }
  }, 300_000);
}

export function tryAcquire(request) {
  const ip = getIP(request);
  const entry = getEntry(ip);
  ensureCleanup();

  // Blocked (cooldown from recent error or completion)
  if (entry.blockedUntil > now()) {
    const retryIn = Math.ceil((entry.blockedUntil - now()) / 1000);
    return { allowed: false, reason: `Rate limited. Retry in ${retryIn}s.` };
  }

  // Per-IP concurrent limit
  if (entry.active >= 1) {
    return { allowed: false, reason: "You already have a dossier generation in progress." };
  }

  if (globalActive >= GLOBAL_MAX_CONCURRENT) {
    return { allowed: false, reason: "Server busy. Please wait a moment and try again." };
  }

  entry.active = 1;
  globalActive += 1;
  return { allowed: true };
}

export function release(request, hadError = false) {
  const ip = getIP(request);
  const entry = ipMap.get(ip);
  if (!entry) return;

  if (entry.active > 0) globalActive = Math.max(0, globalActive - 1);
  entry.active = Math.max(0, entry.active - 1);
  entry.lastEnd = now();

  if (hadError) {
    entry.errorStreak = Math.min(entry.errorStreak + 1, ERROR_COOLDOWNS.length - 1);
    entry.blockedUntil = now() + ERROR_COOLDOWNS[entry.errorStreak];
  } else {
    entry.errorStreak = 0;
    entry.blockedUntil = now() + COOLDOWN_MS;
  }
}

export function cancel(request) {
  const ip = getIP(request);
  const entry = ipMap.get(ip);
  if (!entry) return;
  entry.active = Math.max(0, entry.active - 1);
  // No cooldown for manual cancel — user should be able to retry immediately
}
