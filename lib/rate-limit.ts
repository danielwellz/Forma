type Hit = {
  count: number;
  resetAt: number;
};

const store = new Map<string, Hit>();

export function checkRateLimit(key: string, max = 10, windowMs = 60_000) {
  const now = Date.now();
  const hit = store.get(key);

  if (!hit || now > hit.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: max - 1 };
  }

  if (hit.count >= max) {
    return { ok: false, remaining: 0, retryAfterMs: hit.resetAt - now };
  }

  hit.count += 1;
  store.set(key, hit);
  return { ok: true, remaining: max - hit.count };
}

export function getRequestIp(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}

export function shouldEnforceRateLimit() {
  if (process.env.RATE_LIMIT_DISABLED === "true") {
    return false;
  }

  if (process.env.NODE_ENV !== "production" && process.env.RATE_LIMIT_ENFORCE_DEV !== "true") {
    return false;
  }

  return true;
}
