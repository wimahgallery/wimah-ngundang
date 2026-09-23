"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, Eye, LogOut } from "lucide-react";
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
import { invitationCreateSchema, type InvitationCreateInput } from "@/lib/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { EVENT_TYPES } from "@/lib/invitation";
import { cn } from "@/lib/utils";
import { templateMeta } from "@/components/invitation/template-registry";
import { useInvitations, useCreateInvitation, useDeleteInvitation } from "@/features/invitations/hooks";
import type { InvitationRow } from "@/features/invitations/services/invitationApi";

export default function InvitationDashboard() {
  const router = useRouter();
  const { data: invitations, isLoading, error } = useInvitations();
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
      template_id: "elegant-classic",
      bride_name: "",
      groom_name: "",
    },
  });

  const templateId = watch("template_id");
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);

  const items: InvitationRow[] = invitations ?? [];
  const filtered = items.filter(
    (i: InvitationRow) =>
      i.slug.toLowerCase().includes(search.toLowerCase()) ||
      i.event_title.toLowerCase().includes(search.toLowerCase()) ||
      `${i.bride_name} ${i.groom_name}`.toLowerCase().includes(search.toLowerCase()),
  );

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

  const handleDelete = async (slug: string) => {
    if (!confirm(`Hapus undangan /${slug}?`)) return;
    setDeleting(slug);
    try {
      await deleteMutation.mutateAsync(slug);
    } catch {
      // error displayed via mutation state
    } finally {
      setDeleting(null);
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
            <Button size="sm" className="min-h-11 px-4" onClick={() => setOpen(true)}>
              <Plus className="mr-1.5 h-4 w-4" /> Buat Baru
            </Button>
          <DialogContent className="max-w-lg">
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
              <div className="grid grid-cols-[repeat(auto-fit,minmax(9rem,1fr))] gap-3">
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
                <div className="min-w-0">
                  <Label className="text-xs">Template</Label>
                  <Select
                    value={templateId ?? "elegant-classic"}
                    onValueChange={(v) => { if (v) setValue("template_id", v); }}
                  >
                    <SelectTrigger className="w-full min-w-0">
                      <SelectValue placeholder="Pilih template" />
                    </SelectTrigger>
                    <SelectContent>
                      {templateMeta.map((t) => (
                        <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
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
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari slug, judul, atau nama..."
          aria-label="Cari undangan"
          className="w-full rounded-lg border border-border bg-white py-3 pl-10 pr-3 text-base text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring/60 md:py-2.5 md:text-sm"
        />
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
      </div>

      {error && <p className="text-sm text-red-500">{(error as Error).message}</p>}

      <div className="overflow-x-auto rounded-xl border border-border bg-white">
        <table className="w-full min-w-[34rem] text-left text-xs">
          <thead className="border-b border-border/60 bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th scope="col" className="px-3 py-2">Acara</th>
              <th scope="col" className="px-3 py-2">Template</th>
              <th scope="col" className="px-3 py-2">Status</th>
              <th scope="col" className="px-3 py-2 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item: InvitationRow) => (
              <tr key={item.id} className="border-b border-[rgba(84,82,77,0.06)] last:border-0">
                <td className="px-3 py-2">
                  <p className="font-medium text-foreground">{item.event_title || item.slug}</p>
                  <p className="text-[11px] text-muted-foreground">/{item.slug}</p>
                </td>
                <td className="px-3 py-2 text-muted-foreground">{item.template_id}</td>
                <td className="px-3 py-2">
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[11px] font-medium",
                      item.is_published
                        ? "bg-primary/15 text-accent-dark"
                        : "bg-background text-muted-foreground",
                    )}
                  >
                    {item.is_published ? "Published" : "Draft"}
                  </span>
                </td>
                <td className="px-3 py-2">
                  <div className="flex justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => router.push(`/dashboard/invitations/${item.slug}`)}
                      className="grid h-11 w-11 place-items-center rounded-md hover:bg-background transition-colors"
                      aria-label={`Edit ${item.event_title || item.slug}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => router.push(`/preview/invitation/${item.slug}`)}
                      className="grid h-11 w-11 place-items-center rounded-md hover:bg-background transition-colors"
                      aria-label={`Preview ${item.event_title || item.slug}`}
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(item.slug)}
                      disabled={deleting === item.slug || deleteMutation.isPending}
                      className="grid h-11 w-11 place-items-center rounded-md text-red-500 hover:bg-red-50 disabled:opacity-50 transition-colors"
                      aria-label={`Hapus ${item.event_title || item.slug}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
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
      </div>
    </div>
  );
}
