import { meridian } from "./fixtures";
import type { Brand } from "./types";

/**
 * The single data boundary.
 *
 * Today this reads a fixture. When Supabase lands it becomes a query that returns
 * the identical Brand shape, and nothing that consumes it has to change — that is
 * the entire reason the fixture went behind a function instead of being imported
 * straight into the page.
 */
const BRANDS: Brand[] = [meridian];

export function getBrandBySlug(slug: string): Brand | null {
  return BRANDS.find((brand) => brand.slug === slug) ?? null;
}

export function listBrandSlugs(): string[] {
  return BRANDS.map((brand) => brand.slug);
}
