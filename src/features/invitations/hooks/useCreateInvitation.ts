import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createInvitation } from "../services/invitationApi";

export function useCreateInvitation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createInvitation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invitations"] });
    },
  });
}
