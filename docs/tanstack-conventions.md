# Konvensi TanStack & Zod

Panduan praktis untuk kode baru. Prinsipnya: pakai API resmi yang sudah diverifikasi dari
`.d.ts`/dokumentasi paket, jangan menebak.

## TanStack Query

### Kunci query

Semua kunci dibangun dari **satu** factory: `src/lib/query-keys.ts`.

```ts
import { queryKeys } from "@/lib/query-keys";

useQuery({ queryKey: queryKeys.invitation.detail(slug), queryFn: ... });
queryClient.invalidateQueries({ queryKey: queryKeys.invitations.all }); // berprefix
```

Jangan menulis string literal kunci di komponen. Dua root dibedakan dengan sengaja:

- `invitations.*` → daftar (halaman, pencarian) — saat di-invalidate, detail ikut?
  **Tidak.** Root `invitation.*` adalah kunci terpisah.
- `invitation.detail(slug)` → satu undangan.

### Penempatan

- Query hook ada di `src/features/<domain>/hooks/`.
- Fetch function ada di `src/features/<domain>/services/`.
- Komponen hanya memanggil hook — tidak ada `fetch` + `useEffect` (lihat
  `InvitationList.tsx` yang dihapus karena melanggar aturan ini).

### Default

`QueryProvider` (`src/components/providers/query-provider.tsx`) sudah menyetel
`staleTime` 5 menit, `gcTime` 10 menit, `retry` 1, `refetchOnWindowFocus` false.
Tambahkan `staleTime` lokal hanya bila ada alasan (mis. pustaka musik: 60 detik).

Belum ada SSR prefetch/`HydrationBoundary` — semua data diambil di sisi klien.

## TanStack Form

### Kapan dipakai

Pakai untuk **form yang di-submit** (login, dialog "Buat Undangan").

**Jangan** dipakai untuk editor undangan: `InvitationEditor` adalah dokumen yang
disimpan otomatis (debounce 1,5 detik) melalui PATCH, bukan form submit — state
terkendali biasa + `dirty`/`saveStatus` lebih jujur daripada memaksa-nya ke dalam
`onSubmit`.

### Pola dasar

```tsx
import { useForm, useSelector } from "@tanstack/react-form";

const form = useForm({
  defaultValues: { slug: "", event_title: "" } satisfies InvitationCreateInput,
  onSubmit: async ({ value, formApi }) => {
    await save(value);
    formApi.reset();
  },
});

<form onSubmit={(e) => { e.preventDefault(); e.stopPropagation(); void form.handleSubmit(); }}>
  {/* Anak sebagai JSX children — BUKAN prop children={fn} (lint: react/no-children-prop) */}
  <form.Field name="event_title" validators={{ onSubmit: invitationCreateSchema.shape.event_title }}>
    {(field) => (
      <input
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
      />
    )}
  </form.Field>

  <form.Subscribe selector={(state) => state.isSubmitting}>
    {(isSubmitting) => <button disabled={isSubmitting}>Kirim</button>}
  </form.Subscribe>
</form>
```

Catatan penting:

- **Validator sumber `onSubmit`** — pesan muncul saat user menekan Kirim, bukan tiap
  ketikan. `onBlur` boleh ditambahkan bila ingin validasi setelah fokus berpindah.
- **Nilai bukan teks** (Select, picker) dibaca dengan
  `useSelector(form.store, (s) => s.values.<field>)` dan ditulis dengan
  `form.setFieldValue("<field>", v)`.
- `useForm<T>(...)` dengan eksplisit satu argumen tipe akan error — generic-nya 12.
  Biarkan inferensi bekerja, dan kunci bentuknya dengan `satisfies`.
- `form.state.meta.errors` per field berisi **objek `ZodIssue[]`** (Standard Schema,
  bukan `string[]`) — `.join(", ")` akan merender `[object Object]`. Selalu tampilkan
  lewat `fieldErrorMessages()` dari `src/lib/form-errors.ts`.

### Zod

Schema hidup di `src/lib/schemas.ts`:

- `loginSchema`, `invitationCreateSchema` → validator form **dan** body API.
- `invitationPatchSchema.partial()` → body `PATCH /api/invitations/[slug]`.
  `INVITATION_PATCH_KEYS = invitationPatchSchema.keyof().options` adalah **satu-satunya**
  daftar field yang boleh ditimpa; jangan buat daftar paralel.

Untuk objek jsonb yang isinya bebas (`custom_settings`, `groom_social`) gunakan
`z.record(z.unknown())` / `.passthrough()`, lalu validasi hanya bagiannya (mis. enum
`textAlign`).

## TanStack Table

Dipakai di `InvitationDashboard` (undangan) dan `MusicDashboard` (musik).
Versi terpasang **9.2.8** — API-nya berbeda dari v8 yang dipakai kebanyakan tutorial:

| v8 | v9 (yang dipakai) |
| --- | --- |
| `useReactTable(...)` | `useTable(...)` |
| `flexRender(header.getContext())` | `table.FlexRender header={header}` / `cell={cell}` |
| `createColumnHelper<TData>()` | `createColumnHelper<typeof features, TData>()` |
| fitur lewat opsi table | fitur lewat `tableFeatures({...})` + `sortedRowModel` |

### Pola dasar

```tsx
const listFeatures = tableFeatures({ rowSortingFeature });
const columnHelper = createColumnHelper<typeof listFeatures, InvitationRow>();
const columns = useMemo<ColumnDef<typeof listFeatures, InvitationRow, any>[]>(() => [...], [deps]);

const table = useTable({
  features: listFeatures,
  columns,
  data: rows,             // referensi stabil (konstanta module-scope, bukan `?? []`)
  state: { sorting },
  onSortingChange: setSorting,
  manualSorting: true,    // data diurutkan server
  sortDescFirst: false,   // klik pertama selalu naik
  enableSortingRemoval: false, // siklus dua arah saja
});
```

Aturan yang gampang salah:

- **`manual*` tidak memanggil backend** — ia hanya melewati pengurutan klien. State
  `sorting` **wajib** ikut di query key dan dikirim ke API (lihat
  `queryKeys.invitations.list` + `parseSort`).
- **`sortDescFirst` harus eksplisit.** Kalau tidak, arah klik pertama ditebak dari
  sampel baris; dengan `manualSorting` sampel bisa kosong sehingga urutan awal jadi
  turun dulu.
- **`data` dan `columns` harus referensi stabil.** Array baru tiap render akan
  memicu render ulang tak berujung.
- **Campuran kolom accessor + display** membuat `TValue` gagal diinferensikan
  (invarian) → tulis `ColumnDef<F, D, any>[]` lengkap dengan
  `// eslint-disable-next-line @typescript-eslint/no-explicit-any`.
- **Allow-list kolom di server**: `SORTABLE` di `src/app/api/invitations/route.ts`
  bersama `parseSort()` di `src/lib/api-helpers.ts`; jangan teruskan `sort` dari
  query string langsung ke `.order()`. Selalu tambahkan tiebreaker `id` supaya
  urutan stabil.
- Sorting klien (musik) butuh `sortedRowModel: createSortedRowModel()` dan `sortFn`
  per kolom (`"text" | "alphanumeric" | "datetime"`).

## Keputusan paket lain

| Paket | Keputusan | Alasan |
| --- | --- | --- |
| `@tanstack/react-table` | **dipakai** (9.2.8) | sorting server-side di tabel undangan, sorting klien di tabel musik |
| `@tanstack/react-hotkeys` | ditunda | masih 0.13.0 (pre-1.0) |
| `@tanstack/react-store` | belum perlu | sudah dep transitif; state lintas-fitur ada di Query/form |
| `@tanstack/markdown` | ditunda | renderer `react-markdown` sudah lulus E2E; bandingkan soft-break dulu |

Detail penilaian ada di `docs/migration-plan.md`.

## Checklist sebelum mengirim perubahan

```bash
npx tsc --noEmit
npx eslint .
npm run build
```
