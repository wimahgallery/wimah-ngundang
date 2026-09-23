import { useMutation, useQueryClient } from "@tanstack/react-query";
import { saveInvitation } from "../services/invitationApi";

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
