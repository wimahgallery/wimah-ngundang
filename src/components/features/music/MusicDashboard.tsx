"use client";

import { createContext, useContext, useRef, useState } from "react";
import { Music, Pause, Play, Trash2, Upload, ArrowUp, ArrowDown, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import {
  createColumnHelper,
  createSortedRowModel,
  rowSortingFeature,
  sortFn_alphanumeric,
  sortFn_datetime,
  sortFn_text,
  tableFeatures,
  useTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import {
  useCreateMusicTrack,
  useDeleteMusicTrack,
  useMusicTracks,
} from "@/features/music/hooks";
import { formatDuration, type MusicTrack } from "@/features/music/services/musicApi";
import { proxiedMediaSrc, cn } from "@/lib/utils";

/**
 * TanStack Table v9 — versi klien: seluruh daftar sudah dimuat (maks. 500), jadi
 * `sortedRowModel` ikut didaftarkan dan pengurutan tidak perlu ke server.
 */
const musicFeatures = tableFeatures({
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
  sortFns: { text: sortFn_text, datetime: sortFn_datetime, alphanumeric: sortFn_alphanumeric },
});
const musicHelper = createColumnHelper<typeof musicFeatures, MusicTrack>();
const EMPTY_TRACKS: MusicTrack[] = [];

/**
 * Sel aksi butuh status yang berubah (lagu diputar, lagu dihapus), sementara
 * kolom harus tetap stabil antar render. Nilainya dilewatkan lewat context
 * supaya definisi kolom bisa berada di module scope.
 */
interface MusicRowActions {
  playingId: string | null;
  deletingId: string | null;
  pending: boolean;
  onToggle: (track: MusicTrack) => void;
  onDelete: (track: MusicTrack) => void;
}
const MusicRowActionsContext = createContext<MusicRowActions | null>(null);

function MusicActionsCell({ track }: { track: MusicTrack }) {
  const actions = useContext(MusicRowActionsContext);
  if (!actions) return null;
  const { playingId, deletingId, pending, onToggle, onDelete } = actions;
  return (
    <div className="flex justify-end gap-1">
      <Button
        variant="ghost"
        size="icon"
        className="h-11 w-11"
        onClick={() => onToggle(track)}
        aria-label={playingId === track.id ? `Jeda ${track.name}` : `Putar ${track.name}`}
      >
        {playingId === track.id ? (
          <Pause className="h-4 w-4" fill="currentColor" />
        ) : (
          <Play className="h-4 w-4" fill="currentColor" />
        )}
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-11 w-11 text-red-500 hover:bg-red-50 hover:text-red-600"
        onClick={() => onDelete(track)}
        disabled={deletingId === track.id || pending}
        aria-label={`Hapus ${track.name}`}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}

function MusicSortIcon({ sorted }: { sorted: false | "asc" | "desc" }) {
  if (sorted === "asc") return <ArrowUp className="h-3.5 w-3.5" aria-hidden />;
  if (sorted === "desc") return <ArrowDown className="h-3.5 w-3.5" aria-hidden />;
  return <ChevronsUpDown className="h-3.5 w-3.5 opacity-40" aria-hidden />;
}

// `any` pada TValue: kolom accessor dan display dicampur, dan `TValue` invarian.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const musicColumns: ColumnDef<typeof musicFeatures, MusicTrack, any>[] = [
  musicHelper.accessor("name", {
    header: "Nama",
    sortFn: "text",
    cell: ({ row }) => {
      const track = row.original;
      return (
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent-dark">
            <Music className="h-4 w-4" aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="truncate font-medium text-foreground">{track.name}</p>
            <MusicPlayingLabel trackId={track.id} />
          </div>
        </div>
      );
    },
  }),
  musicHelper.accessor("duration_seconds", {
    header: "Durasi",
    sortFn: "alphanumeric",
    cell: ({ getValue }) => formatDuration(getValue()),
  }),
  musicHelper.accessor("created_at", {
    header: "Ditambahkan",
    sortFn: "datetime",
    cell: ({ getValue }) =>
      new Date(getValue()).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
  }),
  musicHelper.display({
    id: "actions",
    header: "Aksi",
    enableSorting: false,
    cell: ({ row }) => <MusicActionsCell track={row.original} />,
  }),
];

function MusicPlayingLabel({ trackId }: { trackId: string }) {
  const actions = useContext(MusicRowActionsContext);
  if (actions?.playingId !== trackId) return null;
  return <span className="text-[11px] text-accent-dark">Sedang diputar</span>;
}


/** Durasi dari berkas lokal — hanya pelengkap, boleh gagal tanpa membatalkan upload. */
function readDuration(file: File): Promise<number | null> {
  return new Promise((resolve) => {
    const objectUrl = URL.createObjectURL(file);
    const audio = new Audio();
    let settled = false;
    const finish = (value: number | null) => {
      if (settled) return;
      settled = true;
      URL.revokeObjectURL(objectUrl);
      resolve(value);
    };
    audio.preload = "metadata";
    audio.onloadedmetadata = () =>
      finish(Number.isFinite(audio.duration) ? Math.round(audio.duration) : null);
    audio.onerror = () => finish(null);
    audio.src = objectUrl;
    window.setTimeout(() => finish(null), 8000);
  });
}

export default function MusicDashboard() {
  const { data, isLoading, error, refetch } = useMusicTracks();
  /** Referensi kosong yang stabil — `= []` di destructuring membuat array baru
   *  tiap render dan membatalkan model baris TanStack Table. */
  const tracks = data ?? EMPTY_TRACKS;
  const createMutation = useCreateMusicTrack();
  const deleteMutation = useDeleteMusicTrack();

  const [name, setName] = useState("");
  const [nameEdited, setNameEdited] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [formError, setFormError] = useState("");
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [sorting, setSorting] = useState<SortingState>([{ id: "created_at", desc: true }]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  /** Lagu yang sedang diminta pemutarannya — dipakai saat perlu fallback proxy. */
  const currentTrackRef = useRef<MusicTrack | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const next = event.target.files?.[0] ?? null;
    setFile(next);
    setFormError("");
    createMutation.reset();
    // Isi nama otomatis dari nama berkas, kecuali nama sudah diketik manual.
    if (next && !nameEdited) {
      setName(next.name.replace(/\.[^.]+$/, "").slice(0, 80));
    }
  };

  const resetForm = () => {
    setFile(null);
    setName("");
    setNameEdited(false);
    setFormError("");
    createMutation.reset();
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = name.trim();
    if (!file) {
      setFormError("Pilih file musik dulu.");
      return;
    }
    if (!trimmed) {
      setFormError("Nama musik wajib diisi.");
      return;
    }
    setFormError("");
    try {
      const duration = await readDuration(file);
      await createMutation.mutateAsync({
        file,
        name: trimmed,
        durationSeconds: duration,
      });
      resetForm();
    } catch {
      // Pesan ditampilkan lewat `createMutation.error`.
    }
  };

  const togglePlay = (track: MusicTrack) => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playingId === track.id) {
      audio.pause();
      audio.removeAttribute("src");
      currentTrackRef.current = null;
      setPlayingId(null);
      return;
    }
    startTrack(track);
  };

  const startTrack = (track: MusicTrack, forceProxy = false) => {
    const audio = audioRef.current;
    if (!audio) return;
    currentTrackRef.current = track;
    audio.src = forceProxy ? proxiedMediaSrc(track.url) : track.url;
    void audio.play().then(
      () => setPlayingId(track.id),
      () => setPlayingId(null),
    );
  };

  /** URL asli gagal dimuat (diblokir jaringan) → coba sekali lewat proxy. */
  const handleAudioError = () => {
    const audio = audioRef.current;
    const track = currentTrackRef.current;
    if (!audio || !track) return;
    const proxied = proxiedMediaSrc(track.url);
    if (proxied === track.url || audio.src === new URL(proxied, window.location.origin).href) {
      currentTrackRef.current = null;
      setPlayingId(null);
      return;
    }
    startTrack(track, true);
  };

  const handleDelete = async (track: MusicTrack) => {
    if (!confirm(`Hapus musik "${track.name}"?`)) return;
    setDeletingId(track.id);
    deleteMutation.reset();
    try {
      await deleteMutation.mutateAsync(track.id);
      if (playingId === track.id) {
        audioRef.current?.pause();
        setPlayingId(null);
      }
    } catch {
      // Pesan ditampilkan lewat `deleteMutation.error`.
    } finally {
      setDeletingId(null);
    }
  };

  const createError = createMutation.error as Error | null;
  const deleteError = deleteMutation.error as Error | null;

  const rowActions: MusicRowActions = {
    playingId,
    deletingId,
    pending: deleteMutation.isPending,
    onToggle: togglePlay,
    onDelete: handleDelete,
  };

  const table = useTable({
    features: musicFeatures,
    columns: musicColumns,
    data: tracks,
    state: { sorting },
    onSortingChange: setSorting,
    // Data lengkap di tangan klien → pengurutan jalan di sini, bukan di server.
    manualSorting: false,
    enableSortingRemoval: false,
    // Klik pertama selalu naik (A→Z) supaya arah awal tidak bergantung pada
    // sampling isi halaman.
    sortDescFirst: false,
  });

  return (
    <div className="space-y-4 py-1">
      <div className="min-w-0">
        <h1 className="font-heading text-[clamp(1.25rem,1rem+1vw,1.75rem)] text-foreground">Musik</h1>
        <p className="text-xs text-muted-foreground">
          Daftarkan lagu sekali di sini, lalu pilih dari editor undangan — tidak perlu
          mengunggah lagu yang sama berulang.
        </p>
      </div>

      <form
        onSubmit={(e) => void onSubmit(e)}
        className="rounded-lg border border-border bg-white p-4 sm:p-5"
        aria-labelledby="music-upload-title"
      >
        <h2 id="music-upload-title" className="font-heading text-base text-foreground">
          Tambah musik baru
        </h2>

        <div className="mt-3 grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-end">
          <div className="min-w-0">
            <Label className="text-xs" htmlFor="music-file">
              File musik
            </Label>
            <input
              id="music-file"
              ref={fileInputRef}
              type="file"
              accept="audio/*,.mp3,.wav,.aac,.ogg,.m4a"
              onChange={handleFileChange}
              className="mt-1.5 block w-full cursor-pointer rounded-md border border-border bg-white px-3 py-2 text-sm text-foreground file:mr-3 file:rounded-md file:border-0 file:bg-muted file:px-3 file:py-1 file:text-xs file:font-medium file:text-foreground"
            />
            <p className="mt-1 text-[11px] text-muted-foreground">
              mp3, wav, aac, ogg, atau m4a — maksimal 15&nbsp;MB
            </p>
          </div>

          <div className="min-w-0">
            <Label className="text-xs" htmlFor="music-name">
              Nama lagu
            </Label>
            <Input
              id="music-name"
              value={name}
              maxLength={80}
              placeholder="Perfect — Ed Sheeran"
              onChange={(e) => {
                setNameEdited(true);
                setName(e.target.value);
              }}
              className="mt-1.5"
            />
            <p className="mt-1 text-[11px] text-muted-foreground">
              Nama harus unik — dipakai untuk memilih lagu di editor.
            </p>
          </div>

          <Button
            type="submit"
            size="sm"
            className="min-h-11 w-full px-5 sm:w-auto"
            disabled={createMutation.isPending}
          >
            <Upload className="mr-1.5 h-4 w-4" />
            {createMutation.isPending ? "Mengunggah…" : "Unggah"}
          </Button>
        </div>

        {formError && (
          <p role="alert" className="mt-3 text-xs text-red-600">
            {formError}
          </p>
        )}
        {createError && (
          <p role="alert" className="mt-3 text-xs text-red-600">
            {createError.message}
          </p>
        )}
      </form>

      {error && (
        <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <p className="font-medium">Gagal memuat daftar musik.</p>
          <p className="mt-1 break-words">{(error as Error).message}</p>
          <Button variant="outline" size="sm" className="mt-2 min-h-9" onClick={() => void refetch()}>
            Coba lagi
          </Button>
        </div>
      )}

      <MusicRowActionsContext.Provider value={rowActions}>
      <div className="overflow-x-auto rounded-lg border border-border bg-white">
        <Table className="min-w-[34rem]">
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
                        <MusicSortIcon sorted={sorted} />
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
                      cell.column.id === "duration_seconds" || cell.column.id === "created_at"
                        ? "text-muted-foreground"
                        : undefined,
                    )}
                  >
                    <table.FlexRender cell={cell} />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {!isLoading && tracks.length === 0 && !error && (
          <div className="py-12 text-center">
            <Music className="mx-auto h-6 w-6 text-muted-foreground" aria-hidden />
            <p className="mt-2 text-xs text-muted-foreground">
              Belum ada musik. Unggah lagu pertama lewat form di atas.
            </p>
          </div>
        )}

        {isLoading && (
          <div className="flex items-center justify-center py-12" role="status">
            <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <span className="sr-only">Memuat daftar musik…</span>
          </div>
        )}
      </div>
      </MusicRowActionsContext.Provider>

      {deleteError && (
        <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <p className="font-medium">Gagal menghapus musik.</p>
          <p className="mt-1 break-words">{deleteError.message}</p>
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Lagu dipakai dengan memilihnya di editor undangan → menu{" "}
        <Badge variant="outline" className="mx-1 align-middle font-normal">
          Musik
        </Badge>{" "}
        — satu lagu bisa dipakai banyak undangan.
      </p>

      <audio ref={audioRef} className="hidden" onError={handleAudioError} onEnded={() => setPlayingId(null)} />
      <span className="sr-only" aria-live="polite">
        {playingId ? "Musik diputar" : ""}
      </span>
    </div>
  );
}
