import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export interface PaginationParams {
  page: number;
  limit: number;
  from: number;
  to: number;
}

export function parsePagination(searchParams: URLSearchParams): PaginationParams {
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit")) || 10));
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  return { page, limit, from, to };
}

export interface SortParams {
  /** Kolom urutkan sesuai permintaan klien; jatuh ke default bila tak dikenal. */
  key: string;
  /** Nama kolom database (hanya bisa datang dari `sortable`, jadi aman). */
  column: string;
  ascending: boolean;
}

/**
 * Terima `sort` + `dir` dari klien dengan allow-list.
 *
 * `sortable` memetakan id kolom (yang dipakai TanStack Table) ke nama kolom
 * database. Kunci di luar daftar diabaikan dan jatuh ke default — permintaan
 * pengguna tidak pernah sampai ke `.order()` sebagai string bebas.
 */
export function parseSort(
  searchParams: URLSearchParams,
  sortable: Record<string, string>,
  fallback: { key: string; ascending: boolean },
): SortParams {
  const requested = searchParams.get("sort")?.trim() ?? "";
  const column = sortable[requested];
  if (!column) return { key: fallback.key, column: sortable[fallback.key]!, ascending: fallback.ascending };
  const dir = (searchParams.get("dir")?.trim() ?? "").toLowerCase();
  return { key: requested, column, ascending: dir !== "desc" };
}

export function paginatedResponse<T>(
  data: T[] | null,
  count: number | null,
  page: number,
  limit: number,
) {
  return NextResponse.json({
    data: data ?? [],
    total: count ?? 0,
    page,
    limit,
    totalPages: Math.ceil((count ?? 0) / limit),
  });
}

export async function requireAuth() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return {
      supabase,
      user: null,
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
  return { supabase, user, error: null };
}
