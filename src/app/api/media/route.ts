import { NextResponse } from "next/server";

/** Satu-satunya host yang boleh dilayani — cegah jadi proxy terbuka. */
const ALLOWED_HOSTS = new Set(["ik.imagekit.io"]);

/** Header yang diteruskan apa adanya ke/klien dari upstream. */
const PASSTHROUGH_HEADERS = [
  "content-type",
  "content-length",
  "content-range",
  "accept-ranges",
  "etag",
  "last-modified",
  "location",
] as const;

/**
 * Proxy berkas media (audio undangan, poster video).
 *
 * `<audio>` memuat URL secara langsung — tidak bisa lewat optimizer `next/image`.
 * Bila jaringan klien memblokir host CDN (pembajakan DNS `ik.imagekit.io`),
 * pemutaran mati. Rute ini mengambil berkas dari origin Vercel, meneruskan
 * `Range` agar seek tetap jalan, dan menyimpannya lama karena nama file unik.
 *
 * Dipakai sebagai fallback: klien mencoba URL asli lebih dulu.
 */
export async function GET(request: Request) {
  const raw = new URL(request.url).searchParams.get("url");
  if (!raw) {
    return NextResponse.json({ error: "Parameter url wajib diisi" }, { status: 400 });
  }

  let target: URL;
  try {
    target = new URL(raw);
  } catch {
    return NextResponse.json({ error: "URL tidak valid" }, { status: 400 });
  }

  if (target.protocol !== "https:" || !ALLOWED_HOSTS.has(target.hostname)) {
    return NextResponse.json({ error: "Host tidak diizinkan" }, { status: 400 });
  }

  const upstreamHeaders = new Headers();
  for (const key of ["range", "if-none-match", "if-modified-since"]) {
    const value = request.headers.get(key);
    if (value) upstreamHeaders.set(key, value);
  }

  let upstream: Response;
  try {
    upstream = await fetch(target, { headers: upstreamHeaders, cache: "no-store" });
  } catch {
    return NextResponse.json({ error: "Gagal mengambil berkas" }, { status: 502 });
  }

  const headers = new Headers();
  for (const key of PASSTHROUGH_HEADERS) {
    const value = upstream.headers.get(key);
    if (value) headers.set(key, value);
  }
  headers.set("Access-Control-Allow-Origin", "*");
  headers.set(
    "Cache-Control",
    upstream.status === 200 ? "public, max-age=31536000, immutable" : "public, max-age=3600",
  );

  return new Response(upstream.body, { status: upstream.status, headers });
}
