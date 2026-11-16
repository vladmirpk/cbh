const hits = new Map<string, number[]>();

export function rateLimit(key: string, limit = 10, windowMs = 60_000) {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((time) => now - time < windowMs);
  if (recent.length >= limit) return false;
  recent.push(now);
  hits.set(key, recent);
  return true;
}
