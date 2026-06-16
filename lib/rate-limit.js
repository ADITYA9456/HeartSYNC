// Lightweight in-memory IP rate limiter (sliding window).
// Suitable for a single long-lived Node server. For multi-instance deploys,
// swap the Map for Redis/Upstash — the interface stays the same.
const buckets = new Map();

/**
 * @param {string} key      unique key, e.g. `${ip}:auth`
 * @param {number} limit    max requests per window
 * @param {number} windowMs window length in ms
 * @returns {{ ok: boolean, remaining: number, retryAfter: number }}
 */
export function rateLimit(key, limit = 10, windowMs = 60_000) {
  const now = Date.now();
  let hits = buckets.get(key);
  if (!hits) {
    hits = [];
    buckets.set(key, hits);
  }
  // drop expired
  while (hits.length && hits[0] <= now - windowMs) hits.shift();

  if (hits.length >= limit) {
    const retryAfter = Math.ceil((hits[0] + windowMs - now) / 1000);
    return { ok: false, remaining: 0, retryAfter };
  }
  hits.push(now);
  return { ok: true, remaining: limit - hits.length, retryAfter: 0 };
}

/** Best-effort client IP from common proxy headers. */
export function clientIp(req) {
  const xff = req.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0].trim();
  return req.headers.get('x-real-ip') || '127.0.0.1';
}

// Periodically evict empty buckets to bound memory.
if (typeof setInterval !== 'undefined' && !globalThis.__cs_rl_sweeper) {
  globalThis.__cs_rl_sweeper = setInterval(() => {
    const now = Date.now();
    for (const [k, v] of buckets) {
      while (v.length && v[0] <= now - 60_000) v.shift();
      if (!v.length) buckets.delete(k);
    }
  }, 60_000).unref?.();
}
