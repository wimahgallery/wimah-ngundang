"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Pencil, Plus, Search, Trash2, ExternalLink } from "lucide-react";
import Pagination from "@/components/ui/Pagination";
import { Button } from "@/components/ui/button";
import { coupleLabel, type Invitation } from "@/lib/invitation";

interface ListResponse {
  data: Invitation[];
  total: number;
  page: number;
  totalPages: number;
}

export default function InvitationList() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<ListResponse | null>(null);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const query = useMemo(() => {
    const params = new URLSearchParams({ page: String(page), limit: "10" });
    if (debouncedSearch.trim()) params.set("search", debouncedSearch.trim());
    return params.toString();
  }, [page, debouncedSearch]);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/invitations?${query}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Gagal memuat undangan");
        return res.json();
      })
      .then((data) => {
        if (!cancelled) {
          setError("");
          setData(data);
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      });
    return () => { cancelled = true; };
  }, [query]);

  async function handleDelete(slug: string) {
    if (!confirm(`Hapus undangan /${slug}?`)) return;
    setDeleting(slug);
    try {
      const res = await fetch(`/api/invitations/${slug}`, { method: "DELETE" });
      if (!res.ok) {
        setError("Gagal menghapus undangan");
        return;
      }
      setData((prev) =>
        prev ? { ...prev, data: prev.data.filter((item) => item.slug !== slug), total: prev.total - 1 } : prev,
      );
    } catch {
      setError("Gagal menghapus undangan. Periksa koneksi internet.");
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl text-foreground">Undangan</h1>
          <p className="text-sm text-muted-foreground">Kelola undangan digital Wimah</p>
        </div>
        <Link href="/dashboard/invitations/new">
          <Button>
            <Plus className="h-4 w-4" /> Create Invitation
          </Button>
        </Link>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari slug, judul, atau nama..."
          className="w-full rounded-xl border border-border bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-primary"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="overflow-hidden rounded-2xl border border-border bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border/60 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Undangan</th>
              <th className="px-4 py-3">Template</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {(data?.data ?? []).map((item) => (
              <tr key={item.id} className="border-b border-[rgba(84,82,77,0.06)] last:border-0">
                <td className="px-4 py-3">
                  <p className="font-medium text-foreground">{item.event_title || coupleLabel(item)}</p>
                  <p className="text-xs text-muted-foreground">/{item.slug}</p>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{item.template_id}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs ${item.is_published ? "bg-primary/15 text-accent-dark" : "bg-background text-muted-foreground"}`}
                  >
                    {item.is_published ? "Published" : "Draft"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <Link href={`/dashboard/invitations/${item.slug}`} className="rounded-lg p-2 hover:bg-background" title="Edit">
                      <Pencil className="h-4 w-4" />
                    </Link>
                    <Link
                      href={`/preview/invitation/${item.slug}`}
                      target="_blank"
                      className="rounded-lg p-2 hover:bg-background"
                      title="Preview"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => void handleDelete(item.slug)}
                      disabled={deleting === item.slug}
                      className="rounded-lg p-2 text-red-500 hover:bg-red-50 disabled:opacity-50"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {data && data.data.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-sm text-muted-foreground">
                  Belum ada undangan.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {data && (
          <Pagination page={data.page} totalPages={data.totalPages} total={data.total} onPageChange={setPage} />
        )}
      </div>
    </div>
  );
}
