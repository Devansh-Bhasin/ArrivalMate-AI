type RateEntry = {
  count: number;
  resetAt: number;
};

const store = new Map<string, RateEntry>();

export function guardRateLimit(key: string, limit = 20, windowMs = 60_000) {
  const now = Date.now();
  const current = store.get(key);

  if (!current || current.resetAt < now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true };
  }

  if (current.count >= limit) {
    return { allowed: false, retryAfterMs: current.resetAt - now };
  }

  current.count += 1;
  return { allowed: true };
}
