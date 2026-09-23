import { useQuery } from "@tanstack/react-query";
import { fetchInvitations } from "../services/invitationApi";
import type { InvitationRow } from "../services/invitationApi";

export function useInvitations(limit = 20) {
  return useQuery<InvitationRow[]>({
    queryKey: ["invitations", limit],
    queryFn: () => fetchInvitations(limit),
  });
}
