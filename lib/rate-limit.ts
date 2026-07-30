type RateLimitResult = {
  ok: boolean;
  retryAfterSeconds?: number;
};

type RateLimitOptions = {
  limit: number;
  windowMs: number;
};

type BucketStore = Map<string, number[]>;

const globalStore = globalThis as typeof globalThis & {
  __portfolioContactRateLimit?: BucketStore;
};

function getStore(): BucketStore {
  if (!globalStore.__portfolioContactRateLimit) {
    globalStore.__portfolioContactRateLimit = new Map();
  }
  return globalStore.__portfolioContactRateLimit;
}

function prune(timestamps: number[], windowStart: number) {
  return timestamps.filter((time) => time > windowStart);
}

export function checkRateLimit(
  key: string,
  { limit, windowMs }: RateLimitOptions,
): RateLimitResult {
  const store = getStore();
  const now = Date.now();
  const windowStart = now - windowMs;
  const recent = prune(store.get(key) ?? [], windowStart);

  if (recent.length >= limit) {
    const oldest = recent[0] ?? now;
    const retryAfterSeconds = Math.max(1, Math.ceil((oldest + windowMs - now) / 1000));
    store.set(key, recent);
    return { ok: false, retryAfterSeconds };
  }

  recent.push(now);
  store.set(key, recent);
  return { ok: true };
}

export function getClientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }

  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;

  return "unknown";
}
