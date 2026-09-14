import "server-only";

import type { Brand } from "@/lib/brand/types";
import { currentStudio, hasHubAccess } from "@/lib/auth/session";
import { getBrandForStudio, getPublicBrandBySlug } from "@/lib/db/brands";
import { read } from "@/lib/db/store";
import { ensureSeeded } from "@/lib/db/seed";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://brandai.design";

/**
 * Who may read a brand's generated files.
 *
 * The same gate as the hub page, because these routes hand over the entire brand.
 * A published, open brand is public; a password-protected one needs the unlock
 * cookie; an unpublished one is for its owner alone.
 */
export async function readableBrand(
  brandId: string,
): Promise<{ brand: Brand; hubUrl: string } | null> {
  await ensureSeeded();

  const row = read((db) => db.brands.find((b) => b.id === brandId) ?? null);
  if (!row) return null;

  const studio = await currentStudio();
  if (studio) {
    const owned = getBrandForStudio(brandId, studio.id);
    if (owned) return { brand: owned.brand, hubUrl: `${SITE_URL}/b/${owned.row.slug}` };
  }

  const published = getPublicBrandBySlug(row.slug);
  if (!published || !published.published) return null;
  if (published.requiresPassword && !(await hasHubAccess(published.id))) return null;

  return { brand: published.brand, hubUrl: `${SITE_URL}/b/${row.slug}` };
}
