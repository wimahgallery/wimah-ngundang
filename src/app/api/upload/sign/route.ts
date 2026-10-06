import { NextResponse } from "next/server";
import { createHmac, randomUUID } from "node:crypto";
import { requireAuth } from "@/lib/api-helpers";
import { allowedUploadFolders, defaultUploadFolder } from "@/lib/upload-folders";
import { clientIp, rateLimit } from "@/lib/rate-limit";

/** Masa berlaku tanda tangan unggahan (detik). */
const EXPIRE_SECONDS = 10 * 60;

/**
 * Menerbitkan tanda tangan untuk unggahan langsung dari browser ke ImageKit.
 *
 * File besar tidak bisa lewat server — Vercel menolak body di atas ±4,5 MB —
 * jadi file dikirim langsung ke ImageKit dan server hanya menandatangani
 * permintaannya (token dipakai sekali, berlaku 10 menit).
 */
export async function POST(request: Request) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  if (!rateLimit(`upload-sign:${clientIp(request)}`, 60, 60 * 1000)) {
    return NextResponse.json(
      { error: "Terlalu banyak permintaan. Coba lagi sebentar lagi." },
      { status: 429 },
    );
  }

  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
  const publicKey = process.env.IMAGEKIT_PUBLIC_KEY;
  if (!privateKey || !publicKey) {
    return NextResponse.json({ error: "Konfigurasi unggahan belum lengkap" }, { status: 500 });
  }

  const body = (await request.json().catch(() => null)) as { folder?: unknown } | null;
  const rawFolder = body?.folder;
  const folder =
    typeof rawFolder === "string" && allowedUploadFolders.includes(rawFolder)
      ? rawFolder
      : defaultUploadFolder;

  const token = randomUUID();
  const expire = Math.floor(Date.now() / 1000) + EXPIRE_SECONDS;
  const signature = createHmac("sha1", privateKey).update(`${token}${expire}`).digest("hex");

  return NextResponse.json({
    data: { token, expire, signature, publicKey, folder },
  });
}
