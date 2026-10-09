import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { fetchInvitations, type InvitationListPage } from "../services/invitationApi";

export interface InvitationListParams {
  page?: number;
  limit?: number;
  search?: string;
  /** Id kolom urutkan — harus salah satu kunci `SORTABLE` di route API. */
  sort?: string;
  dir?: "asc" | "desc";
}

/**
 * Pencarian, paginasi, DAN pengurutan semuanya milik server, jadi keduanya
 * ikut masuk ke query key — TanStack Table memakai `manualSorting: true`,
 * artinya ia hanya memegang state urutkan dan mempercayai urutan data masuk.
 */
export function useInvitations({
  page = 1,
  limit = 20,
  search = "",
  sort = "updated_at",
  dir = "desc",
}: InvitationListParams = {}) {
  const term = search.trim();
  return useQuery<InvitationListPage>({
    queryKey: queryKeys.invitations.list({ page, limit, search: term, sort, dir }),
    queryFn: () => fetchInvitations({ page, limit, search: term, sort, dir }),
    // Tampilkan halaman lama sambil halaman berikutnya dimuat supaya daftar
    // tidak berkedip (dan tidak melompat ke "tidak ada data") saat ganti halaman.
    placeholderData: keepPreviousData,
  });
}
