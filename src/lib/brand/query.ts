import "server-only";

import { getPublicBrandBySlug, type PublicBrand } from "@/lib/db/brands";
import { ensureSeeded } from "@/lib/db/seed";

/**
 * The single data boundary for the public hub.
 *
 * It reads the file-backed store today and becomes a Supabase query returning the
 * same shape later. Nothing downstream of here knows which.
 */
export async function getPublishedBrand(slug: string): Promise<PublicBrand | null> {
  await ensureSeeded();
  const result = getPublicBrandBySlug(slug);
  // An unpublished brand is indistinguishable from one that does not exist.
  if (!result || !result.published) return null;
  return result;
}
