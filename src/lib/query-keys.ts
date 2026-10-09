/**
 * Query key factory untuk TanStack Query.
 *
 * Semua kunci dibangun lewat satu objek ini supaya:
 *  - penulisan tidak berpencar (tiap file menulis string literal sendiri);
 *  - invalidasi berprefix bisa memakai `queryKeys.invitations.all` tanpa
 *    menyebarkan potongan string ke banyak tempat;
 *  - penambahan parameter baru hanya menyentuh satu berkas.
 *
 * Root `invitation` (detail) dan `invitations` (daftar) sengaja dibedakan:
 * invalidasi daftar tidak menyentuh cache detail undangan, dan sebaliknya.
 */
export const queryKeys = {
  invitations: {
    /** Berprefix — memvalidasi seluruh halaman/hasil pencarian daftar. */
    all: ["invitations"] as const,
    list: (params: { page: number; limit: number; search: string; sort: string; dir: "asc" | "desc" }) =>
      ["invitations", params] as const,
  },
  invitation: {
    detail: (slug: string) => ["invitation", slug] as const,
  },
  invitationStats: (slugs: string[]) => ["invitation-stats", slugs] as const,
  wishes: (slug: string) => ["wishes", slug] as const,
  musicTracks: ["music-tracks"] as const,
} as const;
