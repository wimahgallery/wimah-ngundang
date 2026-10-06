type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();
const MAX_BUCKETS = 5000;

function prune(now: number) {
  for (const [key, bucket] of buckets) {
    if (now > bucket.resetAt) buckets.delete(key);
  }
}

/**
 * Saat map penuh, buang entry paling lama (urutan insert) sampai ada ruang —
 * bukan menolak semua request. Menolak semua berarti satu penyerang bisa
 * mengunci endpoint login untuk semua orang hanya dengan membanjiri key unik.
 */
function evictOldest() {
  for (const key of buckets.keys()) {
    if (buckets.size < MAX_BUCKETS) break;
    buckets.delete(key);
  }
}

/** Rate limit sederhana in-memory per key (mis. per IP). true = diizinkan. */
export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  prune(now);
  if (buckets.size >= MAX_BUCKETS) evictOldest();

  const entry = buckets.get(key);
  if (!entry || now > entry.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (entry.count >= limit) return false;
  entry.count += 1;
  return true;
}

/**
 * IP klien asli.
 *
 * `X-Forwarded-For` berbentuk `klien, proxy1, proxy2` — daftar pertama bisa
 * ditulis oleh klien sendiri sehingga rate limit bisa dibobol seenaknya.
 * Proxy tepercaya (Vercel/Cloudflare/nginx) selalu MENAMBAHKAN IP asli di
 * akhir daftar, jadi yang dipakai adalah entri terakhir.
 */
export function clientIp(request: Request): string {
  const real = request.headers.get("x-real-ip")?.trim();
  if (real) return real;

  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const entries = forwarded
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean);
    const last = entries.at(-1);
    if (last) return last;
  }

  const vercel = request.headers.get("x-vercel-forwarded-for");
  if (vercel) {
    const entries = vercel.split(",").map((part) => part.trim()).filter(Boolean);
    const last = entries.at(-1);
    if (last) return last;
  }

  return request.headers.get("cf-connecting-ip")?.trim() || "unknown";
}
