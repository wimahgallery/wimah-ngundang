# Arsitektur

Wimah Ngundang adalah aplikasi undangan digital: satu aplikasi Next.js (App Router) dengan
panel admin, editor undangan, dan halaman undangan publik yang dirender dari data Supabase.

## Stack

| Lapisan | Pilihan | Catatan |
| --- | --- | --- |
| Framework | Next.js 16.3.8 (App Router) | Server Components untuk halaman publik, Route Handlers untuk API |
| UI | React 19.2.8 | `"use client"` hanya di komponen yang butuh interaksi |
| Bahasa | TypeScript strict (`tsconfig.json`) | Path alias `@/* → ./src/*` |
| Styling | Tailwind CSS v4 (`@theme` di `src/app/globals.css`) | Token warna/font di `@theme inline` |
| Data | Supabase (`@supabase/ssr`) | Sesi via cookie `httpOnly` |
| Server state | TanStack Query v5 | Client-side only (lihat `docs/tanstack-conventions.md`) |
| Validasi | Zod v3 (`src/lib/schemas.ts`) | Dipakai di API dan form |
| Editor konten | TipTap 3 (`rich-text-editor.tsx`) | Menyimpan **Markdown**, bukan HTML |
| Renderer konten | `react-markdown` (`rich-text.tsx`) | `rehype-raw` → whitelist style font → `rehype-sanitize` — konten pengguna tidak pernah jadi skrip |

## Struktur direktori

```
src/
  app/                  # route App Router (page/route/layout)
    [slug]/             # undangan publik (server component)
    admin/(auth)/login  # login admin
    dashboard/          # panel admin (client)
    api/                # route handlers (server-only)
    preview/            # pratinjau undangan
  components/
    features/           # komponen dashboard: admin, invitations, music
    invitation/         # renderer undangan: shared, rich-text, templates/
    providers/          # QueryProvider
    ui/                 # primitive UI (button, dialog, table, ...)
  features/             # logika data per domain
    invitations/{hooks,services}
    music/{hooks,services}
  lib/                  # modul lintas-fitur
    invitation.ts       # tipe data undangan + helper kelas CSS
    schemas.ts          # schema Zod
    query-keys.ts       # query key factory
    supabase/{client,server}.ts
  proxy.ts              # auth guard (Next 16: pengganti middleware)
```

## Alur data

1. **Halaman publik** (`src/app/[slug]/page.tsx`) memanggil `getInvitationBySlug()` dari
   `src/lib/invitations-query.ts` (Server Component, data dari Supabase langsung).
2. **Dashboard** memakai TanStack Query: `useInvitations`, `useInvitation`,
   `useInvitationStats`, `useMusicTracks`. Semua kunci lewat `src/lib/query-keys.ts`.
3. **Penyimpanan perubahan editor** tidak lewat submit form: `InvitationEditor` menjaga
   state lokal, menandai dirty, lalu `PATCH /api/invitations/[slug]` dengan debounce 1,5 detik
   (di-flush saat unmount).
4. **API** selalu membungkus respons dalam `{ data: ... }` atau `{ error: ... }`.

## Model data undangan

Kolom utama bersifat scalar (`event_title`, `story_content`, `venue_address`, ...).
Preferensi tampilan disimpan di kolom jsonb **`custom_settings`** (tipe `CustomSettings` di
`src/lib/invitation.ts`) supaya tidak perlu migrasi schema:

- 17 kunci section (`hero`, `story`, `schedule`, ...) berisi `SectionSettings`
  (`visible`, `align`, `headingSize`, `paragraphSize`, `sectionSpacing`, ...).
- `preamble.text` — teks kata pembuka.
- `gallery` — layout, kolom per breakpoint, rasio.
- `font` — pasangan font heading/body/accent.
- `textAlign` — perataan konten Markdown **per field** (`TextAlignMap`).
- `textGap` — jarak antar blok Markdown seluruh dokumen (px, 0–32, default 16).
- `textGapFields` — override jarak **per field** (`TextGapMap`); `textGapFor()`
  menggabungkan keduanya (override → `textGap` → `undefined` = ikut bawaan wadah).

## Pipeline konten Markdown

```
RichTextEditor (TipTap + @tiptap/markdown + StrictOrderedList)
      │  string Markdown
      ▼
PATCH /api/invitations/[slug]  →  kolom teks / jsonb
      │
      ▼
<RichText text align gap>  →  react-markdown + remarkLineBreaks()
      │                        (rehype-raw → whitelist `span[style]` font → rehype-sanitize)
      ▼
DOM halaman undangan (lume.tsx dkk.)
```

Jarak antar blok diwujudkan sebagai class `.md-gap` + custom property `--md-gap`
pada elemen wadah (`src/app/globals.css`); aturannya memakai `var(--md-gap, 1rem)`
sehingga tanpa setelan pun tampilan tetap sama seperti sebelum fitur ini ada.
Toolbar `RichTextEditor` membuka panel slider per field, dan step **Font** di editor
mengatur jarak dokumen.

Skema editor mencakup: paragraf, tebal, miring, <u>underline</u>, <s>coret</s>, font
per-teks (`<span style="font-family:…;font-size:…">` — hanya CSS var bawaan),
heading 1–3, tautan (`https`/`mailto`/`tel`), garis pemisah, daftar berbutir/bernomor
(dengan perdalam/keluarkan), kutipan, baris baru, perataan, jarak antar blok, dan
penghitung kata/karakter. Serialisasi memakai HTML inline (`UnderlineHtml`, `StrikeHtml`,
`FontStyle` di `inline-marks.ts`) yang diparse-balik oleh `rehype-raw`; tempelan dari
Word/Google Docs disaring lebih dulu oleh `paste-sanitizer.ts`. Code block/inline code
sengaja dimatikan — tidak didukung renderer.

`StrictOrderedList` (`src/components/features/invitations/strict-order-list.ts`) adalah
workaround untuk bug upstream TipTap: marker longgar seperti `Jl.` / `Dr.` di awal baris
diubah jadi daftar bernomor dan merusak teks.

## Template

`src/components/invitation/template-registry.ts` mendaftarkan template
(`lume`, ...) beserta meta (nama, warna). Editor memilih `template_id`, halaman publik
merender komponen yang sesuai.
