# Rencana Migrasi TanStack

Migrasi bertahap (bukan rewrite) ke ekosistem TanStack + Zod. Prinsip yang dipakai:
**correctness → security → type safety → maintainability → performance → convenience**,
setiap fase diverifikasi dengan `npx tsc --noEmit`, `npx eslint .`, `npm run build`.

## Status ringkas

| Area | Status | Bukti |
| --- | --- | --- |
| TanStack Query v5 | ✅ sudah ada, kunci dirapikan | `src/lib/query-keys.ts`, 0 query key inline tersisa |
| TanStack Form + Zod | ✅ diadopsi | `LoginForm`, dialog buat undangan di `InvitationDashboard` |
| Zod di API | ✅ PATCH tervalidasi penuh | `invitationPatchSchema` + `INVITATION_PATCH_KEYS` |
| `server-only` | ✅ | `src/lib/supabase/server.ts` |
| Cleanup | ✅ | `react-hook-form`, `@hookform/resolvers`, `InvitationList.tsx` (dead code) dihapus |
| TanStack Table | ⏸️ ditunda, berdasarkan evaluasi | lihat "Penilaian paket" di bawah |
| TanStack Hotkeys | ⏸️ ditunda | pre-1.0 |
| TanStack Store | ⏸️ belum perlu | state lintas-fitur sudah di Query/form |
| TanStack Markdown | ⏸️ ditunda, di balik adapter | `rich-text.tsx` |

## Fase yang sudah dijalankan

### Fase 1 — Fondasi

1. **Query key factory** (`src/lib/query-keys.ts`). Sebelumnya kunci ditulis literal di
   banyak file (`["invitation", slug]`, `["invitations", {page,...}]`, `["music-tracks"]`,
   `["wishes", slug]`, `["invitation-stats", key]`). Sekarang semuanya lewat satu objek;
   root `invitation` (detail) dan `invitations` (daftar) sengaja dipisah supaya invalidasi
   daftar tidak menghapus cache detail.
2. **Validasi Zod untuk PATCH** (`src/lib/schemas.ts`). Route sebelumnya memakai allow-list
   manual tanpa memvalidasi tipe nilai. Sekarang `invitationPatchSchema.partial()` menjadi
   **satu-satunya** sumber daftar field (`INVITATION_PATCH_KEYS`), key tak dikenal dibuang,
   nilai salah tipe menghasilkan `400`.
3. **`server-only`** di `src/lib/supabase/server.ts` — impor yang salah tempat (client
   component) langsung gagal di build, bukan di runtime.

### Fase 2 — Form

`LoginForm` dan dialog "Buat Undangan" dipindah dari `react-hook-form` + `zodResolver`
ke `@tanstack/react-form`:

- Schema Zod dipakai sebagai validator per field (`validators={{ onSubmit: ... }}`),
  sumber `onSubmit` supaya pesan muncul saat dikirim, bukan saat diketik.
- Nilai non-tekst (`event_type`, `template_id`) dibaca dengan
  `useSelector(form.store, ...)` dan ditulis dengan `form.setFieldValue(...)`.
- Anak komponen ditulis sebagai JSX children (`<form.Field ...>{fn}</form.Field>`) —
  bukan prop `children={fn}` — supaya lolos aturan `react/no-children-prop`.
- Efek koreksi halaman kosong di `InvitationDashboard` dipindah ke `handleDelete`
  (koreksi saat event), sehingga lolos `react-hooks/set-state-in-effect`.

Hasil sampingan: warning pre-existing `react-hooks/incompatible-library` menghilang dan
`npx eslint .` kini **0 error 0 warning**.

### Fase 3 — Fitur (bukan migrasi, ikut dikerjakan)

Perataan konten Markdown per field dari dashboard: tombol perataan di toolbar
`RichTextEditor`, nilai disimpan di `custom_settings.textAlign`, diterapkan oleh
`<RichText align>`. Lihat `docs/architecture.md`.

Jarak antar blok Markdown: slider 0–32 px di step **Font** (jarak dokumen,
`custom_settings.textGap`) plus override per field di toolbar `RichTextEditor`
(`custom_settings.textGapFields`). Nilai efektif dikirim sebagai prop `gap` ke
`<RichText gap>` dan dirender lewat custom property `--md-gap`.

### Fase 4 — `@tanstack/react-table` (selesai)

Dua tabel kini memakai `@tanstack/react-table` 9.2.8 (bukan `react-table`):

- **Tabel undangan** — sorting dipegang server: `manualSorting: true`,
  `sortDescFirst: false` (klik pertama selalu naik), state `sorting` masuk ke
  query key `invitations.list`, dan API memakai allow-list `SORTABLE` +
  `parseSort` (tiebreaker `id` supaya urutan stabil).
- **Tabel musik** — sorting di klien: `tableFeatures({ rowSortingFeature,
  sortedRowModel: createSortedRowModel() })` dengan `sortFn` per kolom
  (`text`, `alphanumeric`, `datetime`).
- API v9 berbeda dari v8: `useTable` (bukan `useReactTable`), `table.FlexRender`,
  `createColumnHelper<typeof features, TData>()`. Detail di
  `docs/tanstack-conventions.md`.

## Penilaian paket (dipertimbangkan, belum diadopsi)

| Paket | Versi terverifikasi (npm) | Keputusan |
| --- | --- | --- |
| `@tanstack/react-table` | 9.2.8 | **Dipakai (Fase 4).** Undangan: sorting server-side + allow-list kolom; musik: sorting klien. |
| `@tanstack/react-hotkeys` | 0.13.0 (pre-1.0) | **Ditunda.** Tiga listener keyboard manual (`preview-modal.tsx`, `lume.tsx`, `glyph-portal.tsx`); API masih bisa berubah sebelum 1.0. |
| `@tanstack/react-store` | 0.11.2 | **Belum perlu.** Sudah jadi dep transitif form/table; state lintas-fitur saat ini seluruhnya server state (Query) atau state form. |
| `@tanstack/markdown` | 1.0.0 (terbit 2026-10-01) | **Ditunda, di balik adapter.** Sudah terverifikasi nyata (`./react` mengekspor `<Markdown>`, zero deps, mendukung block kita + `allowHtml`/`urlTransform`). Renderer `react-markdown` baru dibangun dan lulus E2E; perilaku soft line break (`\n` → `<br>`) belum tentu sama. |

## Langkah berikutnya (belum dikerjakan)

1. **SSR prefetch + `HydrationBoundary`** untuk halaman dashboard yang sudah client-side
   (opsional — saat ini `QueryProvider` client-only tanpa hydrasi).
2. **`@tanstack/react-hotkeys`** setelah rilis 1.0, dengan adapter kecil yang mengisolasi
   API-nya.
3. **Pertimbangkan `@tanstack/markdown`** dengan membandingkan output pada konten nyata
   (khususnya baris baru di dalam paragraf) sebelum menukar renderer.

## Verifikasi

```bash
npx tsc --noEmit      # tipe
npx eslint .          # lint (0 error, 0 warning)
npm run build         # build produksi
```

Uji manual end-to-end (Chrome headless via CDP) yang dijalankan untuk perubahan ini:

| Skrip | Hasil |
| --- | --- |
| `align-e2e.js` | `ALIGN_E2E_OK` — perataan tersimpan, ter-render di halaman publik |
| `gap-e2e.js` | `GAP_E2E_OK` — slider dokumen & override per field, `--md-gap` + `margin-top` terverifikasi |
| `sort-e2e.js` | `SORT_E2E_OK` — klik header menghasilkan `sort=…&dir=asc/desc` dan urutan baris sesuai |
| `music-sort-e2e.js` | `MUSIC_E2E_OK` — sorting klien nama & durasi |
| `form-e2e.js` | `FORM_E2E_OK` — validasi Zod TanStack Form tanpa `[object Object]` |

Catatan: `main` → push memicu deploy Vercel.
