import { createClient } from "@/lib/supabase/server";
import { normalizeInvitation, type Invitation } from "@/lib/invitation";

export async function getInvitationBySlug(slug: string, { publishedOnly = false } = {}) {
  const supabase = await createClient();
  let query = supabase.from("invitations").select("*").eq("slug", slug);
  if (publishedOnly) query = query.eq("is_published", true);

  const { data, error } = await query.maybeSingle();
  if (error || !data) return null;
  return normalizeInvitation(data as Record<string, unknown>);
}

export type { Invitation };
