"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, Eye, LogOut, Search, ChevronLeft, ChevronRight, Share2, ArrowUp, ArrowDown, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { invitationCreateSchema, type InvitationCreateInput } from "@/lib/schemas";
import { fieldErrorMessages } from "@/lib/form-errors";
import { useForm, useSelector } from "@tanstack/react-form";
import {
  createColumnHelper,
  rowSortingFeature,
  tableFeatures,
  useTable,
  type ColumnDef,
  type OnChangeFn,
  type SortingState,
} from "@tanstack/react-table";
import { EVENT_TYPES } from "@/lib/invitation";
import { cn, previewImageSrc } from "@/lib/utils";
import { isTemplateId, templateMetaById } from "@/components/invitation/template-registry";
import { TemplatePicker } from "./TemplatePicker";
import ShareInvitationDialog from "./ShareInvitationDialog";
import { useInvitations, useCreateInvitation, useDeleteInvitation, useInvitationStats } from "@/features/invitations/hooks";
import type { InvitationRow, GuestStats } from "@/features/invitations/services/invitationApi";

/**
 * TanStack Table v9: urutkan dipegang server (`manualSorting: true`), jadi
 * cukup `rowSortingFeature` — model baris terurut datang dari API lewat
 * `sortedRowModel` klien yang sengaja tidak didaftarkan.
 */
const listFeatures = tableFeatures({ rowSortingFeature });
const columnHelper = createColumnHelper<typeof listFeatures, InvitationRow>();

/** Referensi data kosong yang stabil — `?? []` baru tiap render membatalkan
 *  model baris TanStack Table setiap render. */
const EMPTY_ROWS: InvitationRow[] = [];

function SortIcon({ sorted }: { sorted: false | "asc" | "desc" }) {
  if (sorted === "asc") return <ArrowUp className="h-3.5 w-3.5" aria-hidden />;
  if (sorted === "desc") return <ArrowDown className="h-3.5 w-3.5" aria-hidden />;
  return <ChevronsUpDown className="h-3.5 w-3.5 opacity-40" aria-hidden />;
}


function TemplateBadge({ id }: { id: string }) {
  if (!isTemplateId(id)) {
    return <span className="text-muted-foreground">{id}</span>;
  }
  const meta = templateMetaById[id];
  return (
    <Badge variant="outline" className="gap-1.5 font-normal text-foreground">
      <span
        aria-hidden
        className="h-2.5 w-2.5 rounded-full ring-1 ring-black/10"
        style={{ background: meta.colors.hero }}
      />
      {meta.name}
    </Badge>
  );
}

/** Tanggal pendek ("14 Feb 2026"). Tanggal `YYYY-MM-DD` sengaja diparse lokal. */
function shortDate(value?: string | null): string | null {
  if (!value) return null;
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  const d = dateOnly
    ? new Date(Number(dateOnly[1]), Number(dateOnly[2]) - 1, Number(dateOnly[3]))
    : new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

/** "14 Feb 2026, 14.30" — untuk baris "Diperbarui". */
function updatedLabel(value?: string | null): string {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const date = d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
  const time = d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  return `${date}, ${time}`;
}

function coupleOf(item: InvitationRow): string | null {
  const parts = [item.bride_name?.trim(), item.groom_name?.trim()].filter((p): p is string => Boolean(p));
  return parts.length > 0 ? parts.join(" & ") : null;
}

/** Isi undangan yang sudah terisi — dipakai sebagai chip "Kelengkapan". */
function contentChips(item: InvitationRow): string[] {
  const chips: string[] = [];
  const photos = Array.isArray(item.gallery_images) ? item.gallery_images.length : 0;
  if (photos > 0) chips.push(`${photos} foto`);
  if (item.music_url) chips.push("Musik");
  if (item.rsvp_enabled) chips.push("RSVP");
  if (item.video_url) chips.push("Video");
  if ((item.gift_accounts?.length ?? 0) > 0 || item.qris_image) chips.push("Hadiah");
  return chips;
}

/** Statistik tamu per baris — "—" selama data belum tersedia. */
function GuestStatsCell({ stats }: { stats?: GuestStats }) {
  if (!stats) {
    return <span className="text-xs text-muted-foreground">—</span>;
  }
  if (stats.wishes === 0) {
    return <span className="text-xs text-muted-foreground">Belum ada tamu</span>;
  }
  return (
    <div className="min-w-0">
      <p className="text-foreground">
        <span className="font-medium">{stats.guests}</span> tamu
      </p>
      <p className="text-[11px] text-muted-foreground">
        {stats.wishes} ucapan · {stats.attending} hadir
      </p>
    </div>
  );
}

export default function InvitationDashboard() {
  const router = useRouter();
  const createMutation = useCreateInvitation();
  const deleteMutation = useDeleteInvitation();

  // Tipe disimpulkan dari `defaultValues`; `satisfies` menjaga bentuknya
  // tetap sama dengan `invitationCreateSchema` (validasi ada di field).
  const form = useForm({
    defaultValues: {
      slug: "",
      event_title: "",
      event_type: "Wedding",
      template_id: "lume",
      bride_name: "",
      groom_name: "",
    } satisfies InvitationCreateInput,
    onSubmit: async ({ value, formApi }) => {
      try {
        const row = await createMutation.mutateAsync(value);
        setOpen(false);
        formApi.reset();
        router.push(`/dashboard/invitations/${row.slug}`);
      } catch {
        // error displayed via mutation state
      }
    },
  });

  const templateId = useSelector(form.store, (state) => state.values.template_id);
  const eventType = useSelector(form.store, (state) => state.values.event_type);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [sharing, setSharing] = useState<InvitationRow | null>(null);

  // Pencarian & paginasi dilakukan di server (API mendukung `search` + `range`)
  // supaya undangan ke-21 ke atas tetap terjangkau.
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Urutkan dipegang server: state ini hanya judul (id kolom + arah) dan ikut
  // masuk ke query key, sehingga tidak pernah menyortir satu halaman saja.
  const [sorting, setSorting] = useState<SortingState>([{ id: "updated_at", desc: true }]);
  const activeSort = sorting[0];

  const { data, isLoading, error } = useInvitations({
    page,
    search: debouncedSearch,
    sort: activeSort?.id ?? "updated_at",
    dir: activeSort?.desc ? "desc" : "asc",
  });
  const items: InvitationRow[] = data?.items ?? EMPTY_ROWS;
  const totalPages = data?.totalPages ?? 1;

  /** Ganti urutkan → mundur ke halaman 1. Dilakukan di handler (bukan effect)
   *  supaya halaman lama tidak sempat memuat baris dengan urutan baru. */
  const handleSortingChange: OnChangeFn<SortingState> = (updater) => {
    setSorting((prev) => (typeof updater === "function" ? updater(prev) : updater));
    setPage(1);
  };

  // Statistik tamu diambil terpisah supaya daftar tetap tampil cepat walau
  // endpoint statistik lambat atau gagal.
  const { stats } = useInvitationStats(items.map((item) => item.slug));

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      router.push("/admin/login");
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    const slug = confirmDelete;
    // Baris terakhir di halaman ini? Kalau ya, halaman perlu mundur setelahnya.
    const isLastOnPage = items.length === 1;
    setDeleting(slug);
    try {
      await deleteMutation.mutateAsync(slug);
      // Item terakhir di halaman terakhir terhapus → mundur satu halaman supaya
      // daftar tidak berhenti di halaman kosong. Dikoreksi di sini (bukan di
      // effect) karena hanya penghapusan yang bisa membuat halaman jadi kosong.
      if (isLastOnPage && page > 1) setPage((p) => Math.max(1, p - 1));
    } catch {
      // error displayed via mutation state
    } finally {
      setDeleting(null);
      setConfirmDelete(null);
    }
  };

  /**
   * Kolom urutkan (`event_title`, `event_date`, `template_id`, `is_published`)
   * harus sama dengan kunci `SORTABLE` di route API. Kolom sisanya display dan
   * `enableSorting: false` supaya kepalanya tidak jadi tombol urutkan.
   *
   * Memo bergantung pada `stats` dan status hapus karena isi selnya ikut
   * berubah; selain itu referensi kolom tetap stabil antar render.
   */
  // `any` pada TValue: antarmuka kolom memakai accessor (string, boolean) dan
  // display (unknown) sekaligus, sedangkan `TValue` bersifat invarian.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const columns = useMemo<ColumnDef<typeof listFeatures, InvitationRow, any>[]>(
    () => [
      columnHelper.accessor("event_title", {
        header: "Undangan",
        cell: ({ row }) => {
          const item = row.original;
          const cover = item.cover_image || item.bride_photo || item.groom_photo || null;
          return (
            <div className="flex items-start gap-2.5">
              {cover && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={previewImageSrc(cover, 128)}
                  alt=""
                  width={44}
                  height={44}
                  loading="lazy"
                  className="h-11 w-11 shrink-0 rounded-lg border border-border bg-background object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              )}
              <div className="min-w-0">
                <p className="break-words font-medium text-foreground">{item.event_title || item.slug}</p>
                <p className="break-words text-[11px] text-muted-foreground">/{item.slug}</p>
                <p className="text-[11px] text-muted-foreground">
                  Diperbarui {updatedLabel(item.updated_at)}
                </p>
              </div>
            </div>
          );
        },
      }),
      columnHelper.display({
        id: "couple",
        header: "Mempelai",
        enableSorting: false,
        cell: ({ row }) => {
          const item = row.original;
          const couple = coupleOf(item);
          return (
            <>
              <p className="max-w-[13rem] text-foreground">{couple || "—"}</p>
              <p className="text-[11px] text-muted-foreground">
                {item.event_type || "Tipe acara belum diisi"}
              </p>
            </>
          );
        },
      }),
      columnHelper.accessor("event_date", {
        header: "Jadwal & Lokasi",
        cell: ({ row }) => {
          const item = row.original;
          const eventDate = shortDate(item.event_date);
          const eventTime = item.event_time?.trim() || "";
          const venue = item.venue_name?.trim() || item.venue_address?.trim() || "";
          return (
            <>
              <p className="text-foreground">
                {eventDate
                  ? `${eventDate}${eventTime ? ` · ${eventTime}` : ""}`
                  : "Tanggal belum diatur"}
              </p>
              <p className="line-clamp-2 max-w-[13rem] text-[11px] text-muted-foreground">
                {venue || "Lokasi belum diatur"}
              </p>
            </>
          );
        },
      }),
      columnHelper.display({
        id: "completeness",
        header: "Kelengkapan",
        enableSorting: false,
        cell: ({ row }) => {
          const chips = contentChips(row.original);
          if (chips.length === 0) {
            return <span className="text-xs text-muted-foreground">Belum ada isi</span>;
          }
          return (
            <div className="flex max-w-[14rem] flex-wrap gap-1">
              {chips.map((chip) => (
                <Badge key={chip} variant="outline" className="bg-background font-normal text-muted-foreground">
                  {chip}
                </Badge>
              ))}
            </div>
          );
        },
      }),
      columnHelper.display({
        id: "guests",
        header: "Tamu",
        enableSorting: false,
        cell: ({ row }) => <GuestStatsCell stats={stats?.[row.original.slug]} />,
      }),
      columnHelper.accessor("template_id", {
        header: "Template",
        cell: ({ row }) => <TemplateBadge id={row.original.template_id} />,
      }),
      columnHelper.accessor("is_published", {
        header: "Status",
        cell: ({ row }) => (
          <Badge
            variant="outline"
            className={cn(
              "border-transparent font-normal",
              row.original.is_published
                ? "bg-primary/15 text-accent-dark"
                : "bg-background text-muted-foreground",
            )}
          >
            {row.original.is_published ? "Published" : "Draft"}
          </Badge>
        ),
      }),
      columnHelper.display({
        id: "actions",
        header: "Aksi",
        enableSorting: false,
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div className="flex justify-end gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-11 w-11"
                onClick={() => router.push(`/dashboard/invitations/${item.slug}`)}
                aria-label={`Edit ${item.event_title || item.slug}`}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-11 w-11"
                onClick={() => router.push(`/preview/invitation/${item.slug}`)}
                aria-label={`Preview ${item.event_title || item.slug}`}
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-11 w-11"
                onClick={() => setSharing(item)}
                aria-label={`Bagikan ${item.event_title || item.slug}`}
              >
                <Share2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-11 w-11 text-red-500 hover:bg-red-50 hover:text-red-600"
                onClick={() => setConfirmDelete(item.slug)}
                disabled={deleting === item.slug || deleteMutation.isPending}
                aria-label={`Hapus ${item.event_title || item.slug}`}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          );
        },
      }),
    ],
    [stats, deleting, deleteMutation.isPending, router, setSharing, setConfirmDelete],
  );

  const table = useTable({
    features: listFeatures,
    columns,
    data: items,
    state: { sorting },
    onSortingChange: handleSortingChange,
    // Data masuk sudah terurut dari server; menyortir ulang di klien hanya akan
    // mengacak satu halaman yang muat.
    manualSorting: true,
    // Klik pertama selalu naik (A→Z, tanggal terlama dulu). Tanpa ini arah awal
    // ikut tebak-an dari isi halaman, yang bisa menghasilkan turun lebih dulu.
    sortDescFirst: false,
    // Siklus dua arah saja (naik ↔ turun) — pengurutan bawaan tetap terkirim
    // walau state tidak pernah kosong.
    enableSortingRemoval: false,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20" role="status">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <span className="sr-only">Memuat…</span>
      </div>
    );
  }

  return (
    <div className="space-y-4 py-1">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0">
          <h1 className="font-heading text-[clamp(1.25rem,1rem+1vw,1.75rem)] text-foreground">Undangan Saya</h1>
          <p className="text-xs text-muted-foreground">Kelola semua undangan digital Anda</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" className="min-h-11 px-4" onClick={handleLogout}>
            <LogOut className="mr-1.5 h-4 w-4" /> Keluar
          </Button>
        <Dialog open={open} onOpenChange={setOpen}>
            <Button size="sm" className="min-h-11 px-4" onClick={() => { createMutation.reset(); setOpen(true); }}>
              <Plus className="mr-1.5 h-4 w-4" /> Buat Baru
            </Button>
          <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Buat Undangan Baru</DialogTitle>
            </DialogHeader>
            <form
              onSubmit={(event) => {
                event.preventDefault();
                event.stopPropagation();
                void form.handleSubmit();
              }}
              className="space-y-3"
            >
              <form.Field name="event_title" validators={{ onSubmit: invitationCreateSchema.shape.event_title }}>
                {(field) => (
                  <div>
                    <Label className="text-xs">Judul Acara</Label>
                    <Input
                      className={cn(field.state.meta.errors.length > 0 && "border-red-500")}
                      placeholder="Pernikahan Rina & Pradipta"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) => field.handleChange(event.target.value)}
                    />
                    {field.state.meta.errors.length > 0 && (
                      <p className="mt-0.5 text-xs text-red-500">{fieldErrorMessages(field.state.meta.errors)}</p>
                    )}
                  </div>
                )}
              </form.Field>
              <form.Field name="slug" validators={{ onSubmit: invitationCreateSchema.shape.slug }}>
                {(field) => (
                  <div>
                    <Label className="text-xs">Slug</Label>
                    <Input
                      className={cn(field.state.meta.errors.length > 0 && "border-red-500")}
                      placeholder="rina-pradipta"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) => field.handleChange(event.target.value)}
                    />
                    {field.state.meta.errors.length > 0 && (
                      <p className="mt-0.5 text-xs text-red-500">{fieldErrorMessages(field.state.meta.errors)}</p>
                    )}
                  </div>
                )}
              </form.Field>
              <div className="grid grid-cols-[repeat(auto-fit,minmax(9rem,1fr))] gap-3">
                <form.Field name="groom_name">
                  {(field) => (
                    <div className="min-w-0">
                      <Label className="text-xs">Mempelai Pria</Label>
                      <Input
                        placeholder="I Wayan Pradipta Wibawa"
                        value={field.state.value ?? ""}
                        onBlur={field.handleBlur}
                        onChange={(event) => field.handleChange(event.target.value)}
                      />
                    </div>
                  )}
                </form.Field>
                <form.Field name="bride_name">
                  {(field) => (
                    <div className="min-w-0">
                      <Label className="text-xs">Mempelai Wanita</Label>
                      <Input
                        placeholder="Rina Maharani"
                        value={field.state.value ?? ""}
                        onBlur={field.handleBlur}
                        onChange={(event) => field.handleChange(event.target.value)}
                      />
                    </div>
                  )}
                </form.Field>
              </div>
              <div className="grid max-w-[24rem] grid-cols-[repeat(auto-fit,minmax(9rem,1fr))] gap-3">
                <div className="min-w-0">
                  <Label className="text-xs">Jenis Acara</Label>
                  <Select
                    value={eventType || "Wedding"}
                    onValueChange={(v) => { if (v) form.setFieldValue("event_type", v); }}
                  >
                    <SelectTrigger className="w-full min-w-0">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {EVENT_TYPES.map((t) => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <form.Field name="template_id" validators={{ onSubmit: invitationCreateSchema.shape.template_id }}>
                {(field) => (
                  <div>
                    <Label className="text-xs">Template</Label>
                    <TemplatePicker
                      className="mt-1.5"
                      value={templateId}
                      onChange={(id) => form.setFieldValue("template_id", id)}
                    />
                    {field.state.meta.errors.length > 0 && (
                      <p className="mt-0.5 text-xs text-red-500">{fieldErrorMessages(field.state.meta.errors)}</p>
                    )}
                  </div>
                )}
              </form.Field>
              {createMutation.error && (
                <p className="text-xs text-red-500">{(createMutation.error as Error).message}</p>
              )}
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setOpen(false);
                    form.reset();
                  }}
                >
                  Batal
                </Button>
                <form.Subscribe selector={(state) => state.isSubmitting}>
                  {(isSubmitting) => (
                    <Button type="submit" disabled={isSubmitting || createMutation.isPending}>
                      {createMutation.isPending ? "Membuat..." : "Buat Undangan"}
                    </Button>
                  )}
                </form.Subscribe>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari slug, judul, atau nama..."
          aria-label="Cari undangan"
          className="h-11 w-full rounded-lg bg-white pl-10 pr-3 text-base md:h-10 md:text-sm"
        />
      </div>

      {error && <p className="text-sm text-red-500">{(error as Error).message}</p>}

      <div className="overflow-x-auto rounded-lg border border-border bg-white">
        <Table className="min-w-[72rem]">
          <TableHeader className="bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground">
            <TableRow className="border-b border-border/60 hover:bg-transparent">
              {table.getHeaderGroups()[0].headers.map((header) => {
                const sorted = header.column.getIsSorted();
                const canSort = header.column.getCanSort();
                return (
                  <TableHead
                    key={header.id}
                    className={cn(
                      "text-muted-foreground",
                      header.id === "actions" && "text-right",
                      canSort && "whitespace-nowrap",
                    )}
                  >
                    {header.isPlaceholder ? null : canSort ? (
                      <button
                        type="button"
                        onClick={() => header.column.toggleSorting()}
                        className="group -mx-1 inline-flex items-center gap-1 rounded px-1 py-0.5 transition-colors hover:text-foreground"
                        aria-label={
                          sorted === false
                            ? `Urutkan berdasarkan ${String(header.column.columnDef.header)}`
                            : `Urutkan ${sorted === "asc" ? "menurun" : "naik"} — ${String(header.column.columnDef.header)}`
                        }
                      >
                        <table.FlexRender header={header} />
                        <SortIcon sorted={sorted} />
                      </button>
                    ) : (
                      <table.FlexRender header={header} />
                    )}
                  </TableHead>
                );
              })}
            </TableRow>
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                className="border-b border-[rgba(84,82,77,0.06)] last:border-0 hover:bg-muted/40"
              >
                {row.getAllCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    className={cn(
                      "align-top whitespace-normal",
                      (cell.column.id === "guests" || cell.column.id === "template_id" || cell.column.id === "is_published") &&
                        "whitespace-nowrap",
                    )}
                  >
                    <table.FlexRender cell={cell} />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {items.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-xs text-muted-foreground">
              {search ? "Tidak ditemukan." : "Belum ada undangan."}
            </p>
            {!search && (
              <Button variant="outline" className="mt-3 min-h-11" size="sm" onClick={() => setOpen(true)}>
                <Plus className="mr-1.5 h-4 w-4" /> Buat Undangan Pertama
              </Button>
            )}
          </div>
        )}

        {totalPages > 1 && (
          <nav
            className="flex flex-wrap items-center justify-between gap-2 border-t border-border px-3 py-2.5"
            aria-label="Navigasi halaman undangan"
          >
            <p className="text-xs text-muted-foreground">
              Halaman {page} dari {totalPages}
            </p>
            <div className="flex gap-1.5">
              <Button
                variant="outline"
                size="sm"
                className="min-h-9 px-3"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft className="mr-1 h-4 w-4" /> Sebelumnya
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="min-h-9 px-3"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Berikutnya <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </nav>
        )}
      </div>

      {deleteMutation.isError && (
        <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <p className="font-medium">Gagal menghapus undangan.</p>
          <p className="mt-1 break-words">{(deleteMutation.error as Error).message}</p>
        </div>
      )}

      <Dialog open={confirmDelete !== null} onOpenChange={(o) => { if (!o) setConfirmDelete(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Hapus Undangan?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Undangan <span className="font-medium text-foreground">/{confirmDelete}</span> akan dihapus
            permanen dan tidak bisa dikembalikan.
          </p>
          <DialogFooter>
            <Button variant="outline" size="sm" className="min-h-11 px-4" onClick={() => setConfirmDelete(null)}>
              Batal
            </Button>
            <Button
              variant="destructive"
              size="sm"
              className="min-h-11 px-4"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Menghapus..." : "Hapus"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ShareInvitationDialog
        open={sharing !== null}
        onOpenChange={(o) => {
          if (!o) setSharing(null);
        }}
        invitation={sharing}
      />
    </div>
  );
}
