import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const invitationCreateSchema = z.object({
  slug: z
    .string()
    .min(3, "Slug minimal 3 karakter")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Gunakan huruf kecil, angka, dan tanda hubung"),
  event_title: z.string().min(1, "Judul acara wajib diisi"),
  event_type: z.string().min(1, "Jenis acara wajib diisi"),
  template_id: z.string().min(1, "Pilih template"),
  bride_name: z.string().optional(),
  groom_name: z.string().optional(),
});

export type InvitationCreateInput = z.infer<typeof invitationCreateSchema>;
