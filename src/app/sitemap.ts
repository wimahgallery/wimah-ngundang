import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";
import { siteConfig } from "@/lib/site-config";

// Sitemap dibangun ulang tiap jam supaya undangan yang baru dipublikasikan
// cepat masuk tanpa menunggu deploy berikutnya.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();

  // RLS sudah menyaring data orang lain, tetap difilter eksplisit supaya
  // undangan draft (milik sesi login) tidak pernah muncul di sitemap.
  const { data } = await supabase
    .from("invitations")
    .select("slug, updated_at")
    .eq("is_published", true)
    .not("slug", "is", null)
    .order("updated_at", { ascending: false })
    .limit(5000);

  const invitations: MetadataRoute.Sitemap = (data ?? []).map((row) => ({
    url: `${siteConfig.siteUrl}/${row.slug}`,
    lastModified: new Date(row.updated_at),
    changeFrequency: "daily",
    priority: 0.7,
  }));

  return [
    {
      url: siteConfig.siteUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    ...invitations,
  ];
}
