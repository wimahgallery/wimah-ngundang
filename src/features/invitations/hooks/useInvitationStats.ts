import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { fetchInvitationStats, type GuestStats } from "../services/invitationApi";

/**
 * Statistik tamu (ucapan / RSVP) untuk slug pada halaman daftar yang sedang
 * tampil. Kunci diurutkan supaya urutan baris tidak memicu refetch.
 */
export function useInvitationStats(slugs: string[]): {
  stats?: Record<string, GuestStats>;
  isStatsLoading: boolean;
} {
  const key = [...slugs].sort();

  const query = useQuery<Record<string, GuestStats>>({
    queryKey: ["invitation-stats", key],
    queryFn: () => fetchInvitationStats(key),
    enabled: key.length > 0,
    placeholderData: keepPreviousData,
    staleTime: 60_000,
    // Statistik bersifat pelengkap — API bermasalah tidak boleh menggagalkan
    // pemuatan daftar undangan.
    retry: false,
  });

  return { stats: query.data, isStatsLoading: query.isLoading && key.length > 0 };
}
