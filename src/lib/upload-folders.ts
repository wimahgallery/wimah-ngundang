/** Folder ImageKit per bagian konten undangan. */
export const uploadFolders = {
  couple: "Wedding-Invitation/Couple",
  hero: "Wedding-Invitation/Hero",
  gallery: "Wedding-Invitation/Gallery",
  videoPoster: "Wedding-Invitation/Video-Poster",
  music: "Wedding-Invitation/Music",
  closing: "Wedding-Invitation/Closing",
} as const;

export const defaultUploadFolder = "invitations";

/** Whitelist yang diterima server — nilai di luar ini jatuh ke default. */
export const allowedUploadFolders: readonly string[] = [
  ...Object.values(uploadFolders),
  defaultUploadFolder,
];
