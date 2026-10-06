"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, Eye, LogOut, Search, ChevronLeft, ChevronRight } from "lucide-react";
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
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { EVENT_TYPES } from "@/lib/invitation";
import { cn } from "@/lib/utils";
import { isTemplateId, templateMetaById } from "@/components/invitation/template-registry";
import { TemplatePicker } from "./TemplatePicker";
import { useInvitations, useCreateInvitation, useDeleteInvitation } from "@/features/invitations/hooks";
import type { InvitationRow } from "@/features/invitations/services/invitationApi";

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

export default function InvitationDashboard() {
  const router = useRouter();
  const createMutation = useCreateInvitation();
  const deleteMutation = useDeleteInvitation();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<InvitationCreateInput>({
    resolver: zodResolver(invitationCreateSchema),
    defaultValues: {
      slug: "",
      event_title: "",
      event_type: "Wedding",
      template_id: "lume",
      bride_name: "",
      groom_name: "",
    },
  });

  const templateId = watch("template_id");
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  // Pencarian & paginasi dilakukan di server (API mendukung `search` + `range`)
  // supaya undangan ke-21 ke atas tetap terjangkau.
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const { data, isLoading, error } = useInvitations({ page, search: debouncedSearch });
  const items: InvitationRow[] = data?.items ?? [];
  const totalPages = data?.totalPages ?? 1;

  // Hapus item terakhir di halaman terakhir → jangan sampai berhenti di halaman kosong.
  useEffect(() => {
    if (!isLoading && items.length === 0 && page > 1) setPage((p) => Math.max(1, p - 1));
  }, [isLoading, items.length, page]);

  const onSubmit = async (values: InvitationCreateInput) => {
    try {
      const row = await createMutation.mutateAsync(values);
      setOpen(false);
      reset();
      router.push(`/dashboard/invitations/${row.slug}`);
    } catch {
      // error displayed via mutation state
    }
  };

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
    setDeleting(slug);
    try {
      await deleteMutation.mutateAsync(slug);
    } catch {
      // error displayed via mutation state
    } finally {
      setDeleting(null);
      setConfirmDelete(null);
    }
  };

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
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
              <div>
                <Label className="text-xs">Judul Acara</Label>
                <Input
                  className={cn(errors.event_title && "border-red-500")}
                  placeholder="Pernikahan Rina & Pradipta"
                  {...register("event_title")}
                />
                {errors.event_title && (
                  <p className="mt-0.5 text-xs text-red-500">{errors.event_title.message}</p>
                )}
              </div>
              <div>
                <Label className="text-xs">Slug</Label>
                <Input
                  className={cn(errors.slug && "border-red-500")}
                  placeholder="rina-pradipta"
                  {...register("slug")}
                />
                {errors.slug && (
                  <p className="mt-0.5 text-xs text-red-500">{errors.slug.message}</p>
                )}
              </div>
              <div className="grid grid-cols-[repeat(auto-fit,minmax(9rem,1fr))] gap-3">
                <div className="min-w-0">
                  <Label className="text-xs">Mempelai Pria</Label>
                  <Input placeholder="I Wayan Pradipta Wibawa" {...register("groom_name")} />
                </div>
                <div className="min-w-0">
                  <Label className="text-xs">Mempelai Wanita</Label>
                  <Input placeholder="Rina Maharani" {...register("bride_name")} />
                </div>
              </div>
              <div className="grid max-w-[24rem] grid-cols-[repeat(auto-fit,minmax(9rem,1fr))] gap-3">
                <div className="min-w-0">
                  <Label className="text-xs">Jenis Acara</Label>
                  <Select
                    value={watch("event_type") ?? "Wedding"}
                    onValueChange={(v) => { if (v) setValue("event_type", v); }}
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
              <div>
                <Label className="text-xs">Template</Label>
                <TemplatePicker
                  className="mt-1.5"
                  value={templateId}
                  onChange={(id) => setValue("template_id", id)}
                />
                {errors.template_id && (
                  <p className="mt-0.5 text-xs text-red-500">{errors.template_id.message}</p>
                )}
              </div>
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
                    reset();
                  }}
                >
                  Batal
                </Button>
                <Button type="submit" disabled={isSubmitting || createMutation.isPending}>
                  {createMutation.isPending ? "Membuat..." : "Buat Undangan"}
                </Button>
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

      <div className="overflow-x-auto rounded-xl border border-border bg-white">
        <Table className="min-w-[34rem]">
          <TableHeader className="bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground">
            <TableRow className="border-b border-border/60 hover:bg-transparent">
              <TableHead className="text-muted-foreground">Acara</TableHead>
              <TableHead className="text-muted-foreground">Template</TableHead>
              <TableHead className="text-muted-foreground">Status</TableHead>
              <TableHead className="text-right text-muted-foreground">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item: InvitationRow) => (
              <TableRow key={item.id} className="border-b border-[rgba(84,82,77,0.06)] last:border-0 hover:bg-muted/40">
                <TableCell>
                  <p className="font-medium text-foreground">{item.event_title || item.slug}</p>
                  <p className="text-[11px] text-muted-foreground">/{item.slug}</p>
                </TableCell>
                <TableCell>
                  <TemplateBadge id={item.template_id} />
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={cn(
                      "border-transparent font-normal",
                      item.is_published
                        ? "bg-primary/15 text-accent-dark"
                        : "bg-background text-muted-foreground",
                    )}
                  >
                    {item.is_published ? "Published" : "Draft"}
                  </Badge>
                </TableCell>
                <TableCell>
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
                      className="h-11 w-11 text-red-500 hover:bg-red-50 hover:text-red-600"
                      onClick={() => setConfirmDelete(item.slug)}
                      disabled={deleting === item.slug || deleteMutation.isPending}
                      aria-label={`Hapus ${item.event_title || item.slug}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
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
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
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
    </div>
  );
}
