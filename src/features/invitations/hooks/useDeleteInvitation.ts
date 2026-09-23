import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteInvitation } from "../services/invitationApi";

export function useDeleteInvitation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteInvitation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invitations"] });
    },
  });
}
