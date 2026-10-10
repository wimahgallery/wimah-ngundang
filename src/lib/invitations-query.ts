import { createClient } from "@/lib/supabase/server";
import { normalizeInvitation, type Invitation } from "@/lib/invitation";

type Supabase = Awaited<ReturnType<typeof createClient>>;
type Row = Record<string, unknown>;

/* Koneksi ke Supabase kadang gagal sesaat (jaringan, server sibuk). Satu
   gangguan kecil sudah cukup untuk membuat halaman undangan membalas 404,
   jadi setiap pencobaan diulang dulu sebelum menyerah. */
const MAX_ATTEMPTS = 3;
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function selectOnce(
  supabase: Supabase,
  slug: string,
  publishedOnly: boolean,
): Promise<{ row: Row | null; error: string | null }> {
  let query = supabase.from("invitations").select("*").eq("slug", slug);
  if (publishedOnly) query = query.eq("is_published", true);
  const { data, error } = await query.maybeSingle();
  if (error) return { row: null, error: error.message };
  return { row: (data as Row | null) ?? null, error: null };
}

async function selectWithRetry(
  supabase: Supabase,
  slug: string,
  publishedOnly: boolean,
): Promise<Row | null> {
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const { row, error } = await selectOnce(supabase, slug, publishedOnly);
    if (!error) return row;
    if (attempt < MAX_ATTEMPTS) await sleep(200 * attempt);
    else console.error(`[invitations] gagal ambil slug "${slug}": ${error}`);
  }
  return null;
}

/* Slug di DB huruf kecil semua (divalidasi saat simpan), tapi URL sering diketik
   beda kapitalisasi di browser — ilike menutup celah itu. Wildcard % dan _ di-
   escape supaya tamu tidak bisa menembak undangan lain. */
async function selectCaseInsensitive(
  supabase: Supabase,
  slug: string,
  publishedOnly: boolean,
): Promise<Row | null> {
  let query = supabase
    .from("invitations")
    .select("*")
    .ilike("slug", slug.replace(/([\\%_])/g, "\\$1"));
  if (publishedOnly) query = query.eq("is_published", true);
  const { data, error } = await query.maybeSingle();
  if (error) {
    console.error(`[invitations] gagal cari slug "${slug}" (ilike): ${error}`);
    return null;
  }
  return (data as Row | null) ?? null;
}

export async function getInvitationBySlug(slug: string, { publishedOnly = false } = {}) {
  const supabase = await createClient();
  const key = slug.trim();
  if (!key) return null;

  // 1. Cocok persis — jalur yang paling sering dipakai.
  let row = await selectWithRetry(supabase, key, publishedOnly);

  // 2. Fallback kapitalisasi: /Dika-Rina tetap menemukan "dika-rina".
  if (!row) row = await selectCaseInsensitive(supabase, key, publishedOnly);

  // 3. Fallback publikasi: URL tetap terbuka untuk pemiliknya sendiri saat
  //    undangan belum dipublikasikan (RLS sudah membatasi baris draft hanya
  //    boleh dibaca pemiliknya — tamu tetap mendapat 404). Pencarian ulang
  //    sekali lagi tanpa filter is_published, lengkap dengan varian huruf.
  if (!row && publishedOnly) {
    row = await selectWithRetry(supabase, key, false);
    if (!row) row = await selectCaseInsensitive(supabase, key, false);
  }

  if (!row) return null;
  return normalizeInvitation(row as Record<string, unknown>);
}

export type { Invitation };
