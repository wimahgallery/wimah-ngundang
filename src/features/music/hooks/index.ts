import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import {
  createMusicTrack,
  deleteMusicTrack,
  fetchMusicTracks,
} from "../services/musicApi";

export function useMusicTracks() {
  return useQuery({
    queryKey: queryKeys.musicTracks,
    queryFn: fetchMusicTracks,
    // Pustaka musik jarang berubah dan selalu tampil utuh di dropdown editor.
    staleTime: 60 * 1000,
  });
}

export function useCreateMusicTrack() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createMusicTrack,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.musicTracks });
    },
  });
}

export function useDeleteMusicTrack() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteMusicTrack,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.musicTracks });
    },
  });
}
