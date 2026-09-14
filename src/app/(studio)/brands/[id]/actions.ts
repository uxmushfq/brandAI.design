"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { hashPassword } from "@/lib/auth/password";
import { currentStudio } from "@/lib/auth/session";
import {
  addChild,
  deleteBrand,
  getBrandForStudio,
  removeChild,
  reorderChild,
  setHubPassword,
  setPublished,
  updateChild,
  updateIdentity,
} from "@/lib/db/brands";
import { canEdit, updateStudio } from "@/lib/db/studios";
import type { AssetCategory, ColorGroup, RuleKind, TypeRole, TypeScaleStep } from "@/lib/brand/types";
import { deleteUpload, saveUpload } from "@/lib/files";
import { normalizeHex, parseHex } from "@/lib/color";

/**
 * One gate for every mutation: signed in, subscription lets them edit, and the
 * brand is theirs. Anything that skips this is a bug — a studio must never be able
 * to write to another studio's brand.
 */
async function gate(brandId: string) {
  const studio = await currentStudio();
  if (!studio) redirect("/login");
  if (!canEdit(studio)) redirect("/billing");

  const owned = getBrandForStudio(brandId, studio.id);
  if (!owned) redirect("/dashboard");

  return { studio, brand: owned.brand, row: owned.row };
}

/** Refresh the editor and, if it is live, the client's hub. */
function refresh(brandId: string, slug: string) {
  revalidatePath(`/brands/${brandId}`);
  revalidatePath(`/b/${slug}`);
}

function fail(brandId: string, message: string): never {
  redirect(`/brands/${brandId}?error=${encodeURIComponent(message)}`);
}

/* Identity */

export async function saveIdentityAction(formData: FormData): Promise<void> {
  const brandId = String(formData.get("brandId") ?? "");
  const { studio, row } = await gate(brandId);

  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const studioName = String(formData.get("studioName") ?? "").trim();

  if (name.length === 0) fail(brandId, "The brand needs a name.");
  if (studioName.length === 0) fail(brandId, "Your studio needs a name for the footer.");

  await updateIdentity(brandId, studio.id, { name, description });
  if (studioName !== studio.name) {
    await updateStudio(studio.id, { name: studioName });
  }

  refresh(brandId, row.slug);
  revalidatePath("/dashboard");
}

export async function uploadStudioLogoAction(formData: FormData): Promise<void> {
  const brandId = String(formData.get("brandId") ?? "");
  const { studio, row } = await gate(brandId);

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    fail(brandId, "Choose a file to upload.");
  }

  const result = await saveUpload(`studio-${studio.id}`, file);
  if (!result.ok) fail(brandId, result.error);

  await updateStudio(studio.id, { logoPath: result.file.path });
  refresh(brandId, row.slug);
}

/* Logos */

export async function uploadAssetAction(formData: FormData): Promise<void> {
  const brandId = String(formData.get("brandId") ?? "");
  const { studio, row } = await gate(brandId);

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    fail(brandId, "Choose a file to upload.");
  }

  const stored = await saveUpload(brandId, file);
  if (!stored.ok) fail(brandId, stored.error);

  await addChild("assets", brandId, studio.id, {
    fileName: stored.file.fileName,
    path: stored.file.path,
    mimeType: stored.file.mimeType,
    byteSize: stored.file.byteSize,
    category: (String(formData.get("category") ?? "primary") as AssetCategory),
    previewOn: formData.get("previewOn") === "dark" ? "dark" : "light",
    usageDo: null,
    usageDont: null,
  });

  refresh(brandId, row.slug);
}

export async function updateAssetAction(formData: FormData): Promise<void> {
  const brandId = String(formData.get("brandId") ?? "");
  const { studio, row } = await gate(brandId);
  const id = String(formData.get("id") ?? "");

  await updateChild("assets", id, brandId, studio.id, {
    category: String(formData.get("category") ?? "primary") as AssetCategory,
    previewOn: formData.get("previewOn") === "dark" ? "dark" : "light",
    usageDo: emptyToNull(formData.get("usageDo")),
    usageDont: emptyToNull(formData.get("usageDont")),
  });

  refresh(brandId, row.slug);
}

export async function deleteAssetAction(formData: FormData): Promise<void> {
  const brandId = String(formData.get("brandId") ?? "");
  const { studio, brand, row } = await gate(brandId);
  const id = String(formData.get("id") ?? "");

  const asset = brand.assets.find((a) => a.id === id);
  await removeChild("assets", id, brandId, studio.id);
  // Only after the row is gone, so a failed delete cannot orphan the record.
  if (asset) deleteUpload(asset.path);

  refresh(brandId, row.slug);
}

/* Color */

export async function addColorAction(formData: FormData): Promise<void> {
  const brandId = String(formData.get("brandId") ?? "");
  const { studio, row } = await gate(brandId);

  const name = String(formData.get("name") ?? "").trim();
  const hex = String(formData.get("hex") ?? "").trim();

  if (name.length === 0) fail(brandId, "Give the color a name. “Marine” beats “Blue 1”.");
  if (!parseHex(hex)) fail(brandId, `“${hex}” is not a hex value. Use six characters, like #0B2A3F.`);

  await addChild("colors", brandId, studio.id, {
    name,
    hex: normalizeHex(hex),
    group: String(formData.get("group") ?? "primary") as ColorGroup,
    note: emptyToNull(formData.get("note")),
  });

  refresh(brandId, row.slug);
}

export async function updateColorAction(formData: FormData): Promise<void> {
  const brandId = String(formData.get("brandId") ?? "");
  const { studio, row } = await gate(brandId);
  const id = String(formData.get("id") ?? "");

  const hex = String(formData.get("hex") ?? "").trim();
  if (!parseHex(hex)) fail(brandId, `“${hex}” is not a hex value. Use six characters, like #0B2A3F.`);

  await updateChild("colors", id, brandId, studio.id, {
    name: String(formData.get("name") ?? "").trim(),
    hex: normalizeHex(hex),
    group: String(formData.get("group") ?? "primary") as ColorGroup,
    note: emptyToNull(formData.get("note")),
  });

  refresh(brandId, row.slug);
}

/* Type */

export async function addTypefaceAction(formData: FormData): Promise<void> {
  const brandId = String(formData.get("brandId") ?? "");
  const { studio, row } = await gate(brandId);

  const familyName = String(formData.get("familyName") ?? "").trim();
  if (familyName.length === 0) fail(brandId, "Name the typeface.");

  await addChild("typefaces", brandId, studio.id, {
    familyName,
    role: String(formData.get("role") ?? "display") as TypeRole,
    sourceUrl: emptyToNull(formData.get("sourceUrl")),
    webfontFamily: formData.get("onGoogleFonts") === "on" ? familyName : null,
    note: emptyToNull(formData.get("note")),
    scale: [],
  });

  refresh(brandId, row.slug);
}

export async function updateTypefaceAction(formData: FormData): Promise<void> {
  const brandId = String(formData.get("brandId") ?? "");
  const { studio, row } = await gate(brandId);
  const id = String(formData.get("id") ?? "");

  const familyName = String(formData.get("familyName") ?? "").trim();
  if (familyName.length === 0) fail(brandId, "Name the typeface.");

  await updateChild("typefaces", id, brandId, studio.id, {
    familyName,
    role: String(formData.get("role") ?? "display") as TypeRole,
    sourceUrl: emptyToNull(formData.get("sourceUrl")),
    webfontFamily: formData.get("onGoogleFonts") === "on" ? familyName : null,
    note: emptyToNull(formData.get("note")),
  });

  refresh(brandId, row.slug);
}

export async function addScaleStepAction(formData: FormData): Promise<void> {
  const brandId = String(formData.get("brandId") ?? "");
  const { studio, brand, row } = await gate(brandId);
  const id = String(formData.get("id") ?? "");

  const face = brand.typefaces.find((t) => t.id === id);
  if (!face) fail(brandId, "That typeface is no longer there.");

  const label = String(formData.get("label") ?? "").trim();
  const sizePx = Number(formData.get("sizePx"));
  if (label.length === 0) fail(brandId, "Name the step, like “Headline”.");
  if (!Number.isFinite(sizePx) || sizePx <= 0) fail(brandId, "Give the step a size in pixels.");

  const step: TypeScaleStep = {
    label,
    sizePx,
    lineHeight: toNumber(formData.get("lineHeight"), 1.4),
    weight: toNumber(formData.get("weight"), 400),
    letterSpacingEm: toNumber(formData.get("letterSpacingEm"), 0),
  };

  await updateChild("typefaces", id, brandId, studio.id, {
    scale: [...face.scale, step].sort((a, b) => b.sizePx - a.sizePx),
  });

  refresh(brandId, row.slug);
}

export async function removeScaleStepAction(formData: FormData): Promise<void> {
  const brandId = String(formData.get("brandId") ?? "");
  const { studio, brand, row } = await gate(brandId);
  const id = String(formData.get("id") ?? "");
  const label = String(formData.get("label") ?? "");

  const face = brand.typefaces.find((t) => t.id === id);
  if (!face) return;

  await updateChild("typefaces", id, brandId, studio.id, {
    scale: face.scale.filter((s) => s.label !== label),
  });

  refresh(brandId, row.slug);
}

/* Rules */

export async function addRuleAction(formData: FormData): Promise<void> {
  const brandId = String(formData.get("brandId") ?? "");
  const { studio, row } = await gate(brandId);

  const body = String(formData.get("body") ?? "").trim();
  if (body.length === 0) fail(brandId, "Write the rule before adding it.");

  await addChild("rules", brandId, studio.id, {
    kind: String(formData.get("kind") ?? "do") as RuleKind,
    body,
  });

  refresh(brandId, row.slug);
}

export async function updateRuleAction(formData: FormData): Promise<void> {
  const brandId = String(formData.get("brandId") ?? "");
  const { studio, row } = await gate(brandId);

  await updateChild("rules", String(formData.get("id") ?? ""), brandId, studio.id, {
    kind: String(formData.get("kind") ?? "do") as RuleKind,
    body: String(formData.get("body") ?? "").trim(),
  });

  refresh(brandId, row.slug);
}

/* Shared child operations */

export async function removeChildAction(formData: FormData): Promise<void> {
  const brandId = String(formData.get("brandId") ?? "");
  const { studio, row } = await gate(brandId);

  const table = String(formData.get("table") ?? "");
  if (!isChildTable(table)) return;

  await removeChild(table, String(formData.get("id") ?? ""), brandId, studio.id);
  refresh(brandId, row.slug);
}

export async function moveChildAction(formData: FormData): Promise<void> {
  const brandId = String(formData.get("brandId") ?? "");
  const { studio, row } = await gate(brandId);

  const table = String(formData.get("table") ?? "");
  if (!isChildTable(table)) return;

  await reorderChild(
    table,
    String(formData.get("id") ?? ""),
    brandId,
    studio.id,
    formData.get("direction") === "up" ? "up" : "down",
  );
  refresh(brandId, row.slug);
}

/* Publishing */

export async function togglePublishAction(formData: FormData): Promise<void> {
  const brandId = String(formData.get("brandId") ?? "");
  const { studio, brand, row } = await gate(brandId);

  const publish = formData.get("publish") === "true";

  // Publishing an empty hub embarrasses the studio in front of their client.
  if (publish && brand.assets.length === 0 && brand.colors.length === 0) {
    fail(brandId, "Add at least one logo or color before you publish. An empty hub is worse than no link.");
  }

  await setPublished(brandId, studio.id, publish);
  refresh(brandId, row.slug);
  revalidatePath("/dashboard");
}

export async function setHubPasswordAction(formData: FormData): Promise<void> {
  const brandId = String(formData.get("brandId") ?? "");
  const { studio, row } = await gate(brandId);

  const password = String(formData.get("password") ?? "");
  if (password.length < 4) {
    fail(brandId, "Use a password of at least 4 characters, and send it separately from the link.");
  }

  await setHubPassword(brandId, studio.id, await hashPassword(password));
  refresh(brandId, row.slug);
  revalidatePath("/dashboard");
}

export async function removeHubPasswordAction(formData: FormData): Promise<void> {
  const brandId = String(formData.get("brandId") ?? "");
  const { studio, row } = await gate(brandId);

  await setHubPassword(brandId, studio.id, null);
  refresh(brandId, row.slug);
  revalidatePath("/dashboard");
}

export async function deleteBrandAction(formData: FormData): Promise<void> {
  const brandId = String(formData.get("brandId") ?? "");
  const { studio, brand } = await gate(brandId);

  // Typing the name is the confirmation. A brand is months of someone's work.
  if (String(formData.get("confirm") ?? "").trim() !== brand.name) {
    fail(brandId, "Type the brand name exactly to confirm deletion.");
  }

  for (const asset of brand.assets) deleteUpload(asset.path);
  await deleteBrand(brandId, studio.id);

  revalidatePath("/dashboard");
  redirect("/dashboard");
}

/* Helpers */

function emptyToNull(value: FormDataEntryValue | null): string | null {
  const text = String(value ?? "").trim();
  return text.length === 0 ? null : text;
}

function toNumber(value: FormDataEntryValue | null, fallback: number): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function isChildTable(
  value: string,
): value is "assets" | "colors" | "typefaces" | "rules" {
  return ["assets", "colors", "typefaces", "rules"].includes(value);
}
