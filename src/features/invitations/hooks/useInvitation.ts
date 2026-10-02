import { useQuery } from "@tanstack/react-query";
import { fetchInvitation } from "../services/invitationApi";
import type { Invitation } from "@/lib/invitation";

export function useInvitation(slug: string) {
  return useQuery<Invitation>({
    queryKey: ["invitation", slug],
    queryFn: () => fetchInvitation(slug),
    enabled: !!slug,
    retry: 1,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}
