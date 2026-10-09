# Batas Server – Client

Aturan ini menjaga dua hal: **secret tidak pernah masuk bundle klien** dan
**modul server tidak pernah ter-impport dari client component**.

## Penanda `server-only`

`import "server-only"` membuat build gagal bila modul masuk ke bundle klien (dengan
pesan yang jelas), bukan error runtime yang baru ketahuan setelah deploy.

Dipasang di:

| Modul | Alasan |
| --- | --- |
| `src/lib/supabase/server.ts` | klien Supabase berbasis cookie + `next/headers` |
| `src/lib/imagekit.ts` | membaca `IMAGEKIT_PRIVATE_KEY` |

Modul berikut **wajib** server tanpa perlu penanda eksplisit karena sudah mengimpornya
secara transitif atau memang route handler:

- `src/lib/api-helpers.ts` → `supabase/server` (dipakai semua `/api/**`)
- `src/lib/invitations-query.ts` → `supabase/server` (dipakai Server Component
  `src/app/[slug]/page.tsx` dan `src/app/preview/invitation/[slug]/page.tsx`)
- `src/app/api/**/route.ts`
- `src/app/sitemap.ts`, `src/app/robots.ts`

Kalau menambah modul baru yang memakai `createClient()` dari `@/lib/supabase/server`
atau secret, tambahkan `import "server-only"` di baris pertamanya.

## Sisi klien

| Modul | Catatan |
| --- | --- |
| `src/lib/supabase/client.ts` | `createBrowserClient` — kini belum dipakai; hanya membaca `NEXT_PUBLIC_*` |
| `src/lib/site-config.ts` | hanya `NEXT_PUBLIC_SITE_URL` + teks statis; aman di client |
| `src/components/providers/query-provider.tsx` | `QueryClient` dibuat sekali di `useState` (client-only) |

57 dari ±150 file TSX memakai `"use client"`. Tambahkan flag tersebut **hanya** bila
komponen benar-benar butuh state/handler/event — Server Component adalah default.

## Variabel lingkungan

| Variabel | Sisi | Dipakai di |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | klien + server | `supabase/client.ts`, `supabase/server.ts`, `proxy.ts` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | klien + server | idem |
| `NEXT_PUBLIC_SITE_URL` | klien + server | `site-config.ts`, `layout.tsx`, `app/[slug]/page.tsx` |
| `IMAGEKIT_PRIVATE_KEY` | **server saja** | `lib/imagekit.ts`, `api/upload/sign/route.ts` |

Jangan pernah memakai `NEXT_PUBLIC_` untuk secret. `IMAGEKIT_PRIVATE_KEY` sudah dijaga
oleh `server-only`.

## Auth

- `src/proxy.ts` (Next 16 — nama baru untuk middleware) membangun `createServerClient`
  di atas cookie request, lalu mengalihkan `/dashboard/*` bila belum login dan
  memblokir metode mutasi (`POST/PATCH/PUT/DELETE`) pada route yang butuh auth.
- Route handler tetap memanggil `requireAuth()` (`src/lib/api-helpers.ts`) —
  `proxy` adalah lapisan pertama, bukan satu-satunya pertahanan.
- Cookie sesi di-set `httpOnly: true` (lihat catatan di `src/lib/supabase/server.ts`
  dan `src/proxy.ts`). Tidak ada client-side Supabase yang membaca token dari JS.
