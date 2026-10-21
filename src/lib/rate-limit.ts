/**
 * In-memory sliding window rate limiter for API endpoints (Auth, AI Processing, Search Suggestions).
 * Suitable for MVP serverless & standalone Next.js deployments.
 */

interface RateLimitRecord {
  timestamps: number[];
}

const store = new Map<string, RateLimitRecord>();

// Clean up stale records periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of store.entries()) {
    record.timestamps = record.timestamps.filter((ts) => now - ts < 300000); // 5 min
    if (record.timestamps.length === 0) {
      store.delete(key);
    }
  }
}, 60000);

export interface RateLimitOptions {
  intervalMs: number; // Window size in milliseconds
  maxRequests: number; // Maximum allowed hits per window
}

export function checkRateLimit(
  identifier: string,
  options: RateLimitOptions = { intervalMs: 60000, maxRequests: 20 }
): { success: boolean; remaining: number; resetMs: number } {
  const now = Date.now();
  const record = store.get(identifier) || { timestamps: [] };

  // Retain only timestamps within the current window
  const windowStart = now - options.intervalMs;
  record.timestamps = record.timestamps.filter((ts) => ts > windowStart);

  if (record.timestamps.length >= options.maxRequests) {
    const oldestTimestamp = record.timestamps[0];
    const resetMs = oldestTimestamp + options.intervalMs - now;
    return {
      success: false,
      remaining: 0,
      resetMs: Math.max(0, resetMs),
    };
  }

  record.timestamps.push(now);
  store.set(identifier, record);

  return {
    success: true,
    remaining: options.maxRequests - record.timestamps.length,
    resetMs: options.intervalMs,
  };
}
