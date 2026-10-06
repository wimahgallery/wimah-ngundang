import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { fetchInvitations, type InvitationListPage } from "../services/invitationApi";

export function useInvitations(
  { page = 1, limit = 20, search = "" }: { page?: number; limit?: number; search?: string } = {},
) {
  const term = search.trim();
  return useQuery<InvitationListPage>({
    queryKey: ["invitations", { page, limit, search: term }],
    queryFn: () => fetchInvitations({ page, limit, search: term }),
    // Tampilkan halaman lama sambil halaman berikutnya dimuat supaya daftar
    // tidak berkedip (dan tidak melompat ke "tidak ada data") saat ganti halaman.
    placeholderData: keepPreviousData,
  });
}
