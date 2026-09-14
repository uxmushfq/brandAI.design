import "server-only";

import type { Brand } from "@/lib/brand/types";
import type { Database, DbBrand, DbStudio } from "./schema";
import { newId, now, read, write } from "./store";

/**
 * Every function here that touches a brand takes the studio id and checks it.
 *
 * That check is the app-level stand-in for row-level security. When Supabase lands
 * the policies do the real enforcing and these stay as a second belt — a studio
 * must never be able to read another studio's brands, and one layer of defence for
 * that is not enough.
 */

export interface BrandSummary {
  id: string;
  name: string;
  slug: string;
  description: string;
  published: boolean;
  hasPassword: boolean;
  updatedAt: string;
  counts: { assets: number; colors: number; typefaces: number; rules: number };
}

function assemble(db: Database, row: DbBrand, studio: DbStudio): Brand {
  const bySort = <T extends { sortOrder: number }>(a: T, b: T) =>
    a.sortOrder - b.sortOrder;

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    updatedAt: row.updatedAt.slice(0, 10),
    studio: {
      name: studio.name,
      url: null,
      logoPath: studio.logoPath,
    },
    assets: db.assets.filter((a) => a.brandId === row.id).sort(bySort),
    colors: db.colors.filter((c) => c.brandId === row.id).sort(bySort),
    typefaces: db.typefaces.filter((t) => t.brandId === row.id).sort(bySort),
    rules: db.rules.filter((r) => r.brandId === row.id).sort(bySort),
  };
}

/* Reads */

export function listBrandsForStudio(studioId: string): BrandSummary[] {
  return read((db) =>
    db.brands
      .filter((b) => b.studioId === studioId)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      .map((row) => ({
        id: row.id,
        name: row.name,
        slug: row.slug,
        description: row.description,
        published: row.published,
        hasPassword: row.passwordHash !== null,
        updatedAt: row.updatedAt,
        counts: {
          assets: db.assets.filter((a) => a.brandId === row.id).length,
          colors: db.colors.filter((c) => c.brandId === row.id).length,
          typefaces: db.typefaces.filter((t) => t.brandId === row.id).length,
          rules: db.rules.filter((r) => r.brandId === row.id).length,
        },
      })),
  );
}

export function countBrandsForStudio(studioId: string): number {
  return read((db) => db.brands.filter((b) => b.studioId === studioId).length);
}

/** The editor's view. Returns null when the brand is missing or not this studio's. */
export function getBrandForStudio(
  brandId: string,
  studioId: string,
): { brand: Brand; row: DbBrand } | null {
  return read((db) => {
    const row = db.brands.find((b) => b.id === brandId);
    if (!row || row.studioId !== studioId) return null;
    const studio = db.studios.find((s) => s.id === row.studioId);
    if (!studio) return null;
    return { brand: assemble(db, row, studio), row };
  });
}

export interface PublicBrand {
  id: string;
  published: boolean;
  requiresPassword: boolean;
  brand: Brand;
}

/**
 * The public hub's view.
 *
 * Returns the assembled brand along with its gate state, and never returns the
 * password hash — callers decide whether to render or challenge. An unpublished
 * brand is indistinguishable from a missing one to anyone who is not its owner.
 */
export function getPublicBrandBySlug(slug: string): PublicBrand | null {
  return read((db) => {
    const row = db.brands.find((b) => b.slug === slug);
    if (!row) return null;
    const studio = db.studios.find((s) => s.id === row.studioId);
    if (!studio) return null;
    return {
      id: row.id,
      published: row.published,
      requiresPassword: row.passwordHash !== null,
      brand: assemble(db, row, studio),
    };
  });
}

export function getHubPasswordHash(brandId: string): string | null {
  return read((db) => db.brands.find((b) => b.id === brandId)?.passwordHash ?? null);
}

/* Writes */

/** "Meridian Ferries" → "meridian-ferries", with a suffix if that is taken. */
export function slugify(name: string): string {
  const base = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return base || "brand";
}

function uniqueSlug(db: Database, base: string, exceptId?: string): string {
  const taken = new Set(
    db.brands.filter((b) => b.id !== exceptId).map((b) => b.slug),
  );
  if (!taken.has(base)) return base;
  for (let n = 2; n < 500; n += 1) {
    const candidate = `${base}-${n}`;
    if (!taken.has(candidate)) return candidate;
  }
  return `${base}-${Date.now()}`;
}

export async function createBrand(
  studioId: string,
  name: string,
  description: string,
): Promise<string> {
  return write((db) => {
    const id = newId();
    const timestamp = now();
    db.brands.push({
      id,
      studioId,
      name,
      slug: uniqueSlug(db, slugify(name)),
      description,
      published: false,
      passwordHash: null,
      createdAt: timestamp,
      updatedAt: timestamp,
    });
    return id;
  });
}

/** Runs `mutate` against the brand only if this studio owns it. */
async function withOwnedBrand<T>(
  brandId: string,
  studioId: string,
  mutate: (db: Database, row: DbBrand) => T,
): Promise<T | null> {
  return write((db) => {
    const row = db.brands.find((b) => b.id === brandId);
    if (!row || row.studioId !== studioId) return null;
    const result = mutate(db, row);
    row.updatedAt = now();
    return result;
  });
}

export async function updateIdentity(
  brandId: string,
  studioId: string,
  fields: { name: string; description: string },
): Promise<void> {
  await withOwnedBrand(brandId, studioId, (db, row) => {
    row.name = fields.name;
    row.description = fields.description;
    // The slug is the client's link. Once published it is frozen, because a link
    // that has already been sent must never start meaning something else.
    if (!row.published) {
      row.slug = uniqueSlug(db, slugify(fields.name), row.id);
    }
  });
}

export async function setPublished(
  brandId: string,
  studioId: string,
  published: boolean,
): Promise<void> {
  await withOwnedBrand(brandId, studioId, (_db, row) => {
    row.published = published;
  });
}

export async function setHubPassword(
  brandId: string,
  studioId: string,
  passwordHash: string | null,
): Promise<void> {
  await withOwnedBrand(brandId, studioId, (_db, row) => {
    row.passwordHash = passwordHash;
  });
}

export async function deleteBrand(brandId: string, studioId: string): Promise<void> {
  await write((db) => {
    const row = db.brands.find((b) => b.id === brandId);
    if (!row || row.studioId !== studioId) return;
    db.brands = db.brands.filter((b) => b.id !== brandId);
    db.assets = db.assets.filter((a) => a.brandId !== brandId);
    db.colors = db.colors.filter((c) => c.brandId !== brandId);
    db.typefaces = db.typefaces.filter((t) => t.brandId !== brandId);
    db.rules = db.rules.filter((r) => r.brandId !== brandId);
  });
}

/* Child rows. Each verifies ownership through the parent brand. */

function ownsBrand(db: Database, brandId: string, studioId: string): boolean {
  const row = db.brands.find((b) => b.id === brandId);
  return row !== undefined && row.studioId === studioId;
}

function nextSort(items: { sortOrder: number }[]): number {
  return items.reduce((max, item) => Math.max(max, item.sortOrder), 0) + 1;
}

type ChildTable = "assets" | "colors" | "typefaces" | "rules";

export async function addChild<T extends ChildTable>(
  table: T,
  brandId: string,
  studioId: string,
  row: Omit<Database[T][number], "id" | "brandId" | "sortOrder">,
): Promise<string | null> {
  return write((db) => {
    if (!ownsBrand(db, brandId, studioId)) return null;
    const id = newId();
    const siblings = db[table].filter((r) => r.brandId === brandId);
    const record = {
      ...row,
      id,
      brandId,
      sortOrder: nextSort(siblings),
    } as Database[T][number];
    (db[table] as Database[T][number][]).push(record);
    const brand = db.brands.find((b) => b.id === brandId);
    if (brand) brand.updatedAt = now();
    return id;
  });
}

export async function updateChild<T extends ChildTable>(
  table: T,
  id: string,
  brandId: string,
  studioId: string,
  fields: Partial<Database[T][number]>,
): Promise<void> {
  await write((db) => {
    if (!ownsBrand(db, brandId, studioId)) return;
    const record = (db[table] as Database[T][number][]).find(
      (r) => r.id === id && r.brandId === brandId,
    );
    if (!record) return;
    Object.assign(record, fields, { id, brandId });
    const brand = db.brands.find((b) => b.id === brandId);
    if (brand) brand.updatedAt = now();
  });
}

export async function removeChild(
  table: ChildTable,
  id: string,
  brandId: string,
  studioId: string,
): Promise<void> {
  await write((db) => {
    if (!ownsBrand(db, brandId, studioId)) return;
    (db[table] as { id: string; brandId: string }[]) = db[table].filter(
      (r) => !(r.id === id && r.brandId === brandId),
    );
    const brand = db.brands.find((b) => b.id === brandId);
    if (brand) brand.updatedAt = now();
  });
}

/** Moves a child one place up or down within its brand. */
export async function reorderChild(
  table: ChildTable,
  id: string,
  brandId: string,
  studioId: string,
  direction: "up" | "down",
): Promise<void> {
  await write((db) => {
    if (!ownsBrand(db, brandId, studioId)) return;
    const siblings = (db[table] as { id: string; brandId: string; sortOrder: number }[])
      .filter((r) => r.brandId === brandId)
      .sort((a, b) => a.sortOrder - b.sortOrder);
    const index = siblings.findIndex((r) => r.id === id);
    if (index === -1) return;
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= siblings.length) return;
    // Renumber from scratch rather than swapping, so a gap or a duplicate in the
    // existing order cannot make the move a no-op.
    const reordered = [...siblings];
    [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
    reordered.forEach((item, position) => {
      item.sortOrder = position + 1;
    });
    const brand = db.brands.find((b) => b.id === brandId);
    if (brand) brand.updatedAt = now();
  });
}
