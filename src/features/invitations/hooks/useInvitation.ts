import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchInvitation, saveInvitation, deleteInvitation } from "../services/invitationApi";
import type { Invitation } from "@/lib/invitation";

export function useInvitation(slug: string) {
  return useQuery<Invitation>({
    queryKey: ["invitation", slug],
    queryFn: () => fetchInvitation(slug),
    enabled: !!slug,
    retry: 1,
  });
}

export function useSaveInvitation(slug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => saveInvitation(slug, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invitation", slug] });
      queryClient.invalidateQueries({ queryKey: ["invitations"] });
    },
  });
}

export function useDeleteInvitation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteInvitation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invitations"] });
    },
  });
}
