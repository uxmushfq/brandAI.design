/**
 * The one shape everything agrees on.
 *
 * The hub page, the generators (design.md / tokens.json / AI context) and — later —
 * the editor all read this object. In V1 it comes from a fixture. When Supabase lands,
 * a query returns the identical shape and nothing downstream changes.
 */

export type AssetCategory = "primary" | "secondary" | "mark";
export type ColorGroup = "primary" | "secondary" | "neutral";
export type TypeRole = "display" | "body";
export type RuleKind = "do" | "dont" | "tone";

export interface BrandAsset {
  id: string;
  /** Shown to the client, and used as the filename inside the zip. */
  fileName: string;
  /** Public path today; a Supabase storage path once the database lands. */
  path: string;
  mimeType: string;
  byteSize: number;
  category: AssetCategory;
  /**
   * Which ground this file is drawn for. A white logo on a white well is invisible,
   * so the preview picks its background from the artwork rather than the page.
   */
  previewOn: "light" | "dark";
  usageDo: string | null;
  usageDont: string | null;
  sortOrder: number;
}

export interface BrandColor {
  id: string;
  name: string;
  /** Always `#RRGGBB`, uppercase. Validated at the database boundary later. */
  hex: string;
  group: ColorGroup;
  note: string | null;
  sortOrder: number;
}

export interface TypeScaleStep {
  label: string;
  sizePx: number;
  lineHeight: number;
  weight: number;
  letterSpacingEm: number;
}

export interface BrandTypeface {
  id: string;
  familyName: string;
  role: TypeRole;
  sourceUrl: string | null;
  /**
   * Set only when the family is on Google Fonts and we can legally webfont it.
   * Null means the specimen falls back to measurements plus a source link —
   * most studios use licensed type we have no right to serve.
   */
  webfontFamily: string | null;
  note: string | null;
  scale: TypeScaleStep[];
  sortOrder: number;
}

export interface BrandRule {
  id: string;
  kind: RuleKind;
  body: string;
  sortOrder: number;
}

export interface Studio {
  name: string;
  url: string | null;
  logoPath: string | null;
}

export interface Brand {
  id: string;
  slug: string;
  name: string;
  description: string;
  /** ISO date. Rendered as "Updated 4 September 2026" in the footer. */
  updatedAt: string;
  studio: Studio;
  assets: BrandAsset[];
  colors: BrandColor[];
  typefaces: BrandTypeface[];
  rules: BrandRule[];
}

/** Convenience accessors used by both the page and the generators. */

export function colorsInGroup(brand: Brand, group: ColorGroup): BrandColor[] {
  return brand.colors
    .filter((c) => c.group === group)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export function rulesOfKind(brand: Brand, kind: RuleKind): BrandRule[] {
  return brand.rules
    .filter((r) => r.kind === kind)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export function typefaceForRole(
  brand: Brand,
  role: TypeRole,
): BrandTypeface | undefined {
  return brand.typefaces.find((t) => t.role === role);
}

export const GROUP_LABEL: Record<ColorGroup, string> = {
  primary: "Primary",
  secondary: "Secondary",
  neutral: "Neutral",
};

export const CATEGORY_LABEL: Record<AssetCategory, string> = {
  primary: "Primary",
  secondary: "Secondary",
  mark: "Mark",
};
