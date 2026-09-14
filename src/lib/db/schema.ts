import type {
  AssetCategory,
  ColorGroup,
  RuleKind,
  TypeRole,
  TypeScaleStep,
} from "@/lib/brand/types";

/**
 * Row shapes.
 *
 * These are deliberately flat and boring — one interface per table, foreign keys as
 * plain ids — because they are what the Supabase tables will look like. The store
 * underneath is a JSON file for now; the shapes are meant to survive the swap.
 *
 * V1 is one studio per account, so email and password live on the studio rather
 * than in a separate users table. That is the only place this diverges from the
 * schema in the brief, and it collapses every ownership check to a single hop.
 */

export interface DbStudio {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  logoPath: string | null;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  subscriptionStatus: "trialing" | "active" | "past_due" | "canceled";
  trialEndsAt: string | null;
  createdAt: string;
}

export interface DbBrand {
  id: string;
  studioId: string;
  name: string;
  slug: string;
  description: string;
  published: boolean;
  /** Null means the published hub is open to anyone with the link. */
  passwordHash: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DbAsset {
  id: string;
  brandId: string;
  fileName: string;
  path: string;
  mimeType: string;
  byteSize: number;
  category: AssetCategory;
  previewOn: "light" | "dark";
  usageDo: string | null;
  usageDont: string | null;
  sortOrder: number;
}

export interface DbColor {
  id: string;
  brandId: string;
  name: string;
  hex: string;
  group: ColorGroup;
  note: string | null;
  sortOrder: number;
}

export interface DbTypeface {
  id: string;
  brandId: string;
  familyName: string;
  role: TypeRole;
  sourceUrl: string | null;
  webfontFamily: string | null;
  note: string | null;
  scale: TypeScaleStep[];
  sortOrder: number;
}

export interface DbRule {
  id: string;
  brandId: string;
  kind: RuleKind;
  body: string;
  sortOrder: number;
}

export interface Database {
  studios: DbStudio[];
  brands: DbBrand[];
  assets: DbAsset[];
  colors: DbColor[];
  typefaces: DbTypeface[];
  rules: DbRule[];
}

export const EMPTY_DATABASE: Database = {
  studios: [],
  brands: [],
  assets: [],
  colors: [],
  typefaces: [],
  rules: [],
};
