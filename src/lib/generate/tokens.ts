import { type Brand, colorsInGroup } from "@/lib/brand/types";

/**
 * tokens.json in the Design Tokens Community Group format ($value / $type).
 *
 * That format is what Style Dictionary and Tokens Studio consume, so the client's
 * developer can point a build at this file and get CSS variables out without
 * writing a parser. It is also what most models expect when handed "design tokens".
 */

export interface TokenLeaf {
  $type: string;
  $value: string | number | Record<string, string | number>;
  $description?: string;
}

export type TokenGroup = { [key: string]: TokenLeaf | TokenGroup };

/** "Hull White" → "hull-white". Token names must survive being turned into CSS vars. */
export function tokenName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function generateTokens(brand: Brand): TokenGroup {
  const color: TokenGroup = {};
  for (const group of ["primary", "secondary", "neutral"] as const) {
    const colors = colorsInGroup(brand, group);
    if (colors.length === 0) continue;
    const bucket: TokenGroup = {};
    for (const c of colors) {
      const leaf: TokenLeaf = { $type: "color", $value: c.hex };
      if (c.note) leaf.$description = c.note;
      bucket[tokenName(c.name)] = leaf;
    }
    color[group] = bucket;
  }

  const fontFamily: TokenGroup = {};
  const typography: TokenGroup = {};
  for (const face of [...brand.typefaces].sort((a, b) => a.sortOrder - b.sortOrder)) {
    const leaf: TokenLeaf = { $type: "fontFamily", $value: face.familyName };
    if (face.note) leaf.$description = face.note;
    fontFamily[face.role] = leaf;

    if (face.scale.length === 0) continue;
    const steps: TokenGroup = {};
    for (const s of face.scale) {
      steps[tokenName(s.label)] = {
        $type: "typography",
        $value: {
          fontFamily: face.familyName,
          fontSize: `${s.sizePx}px`,
          lineHeight: s.lineHeight,
          fontWeight: s.weight,
          letterSpacing: `${s.letterSpacingEm}em`,
        },
      };
    }
    typography[face.role] = steps;
  }

  const tokens: TokenGroup = {};
  if (Object.keys(color).length > 0) tokens.color = color;
  if (Object.keys(fontFamily).length > 0) tokens.fontFamily = fontFamily;
  if (Object.keys(typography).length > 0) tokens.typography = typography;

  return tokens;
}

export function generateTokensJson(brand: Brand): string {
  return JSON.stringify(generateTokens(brand), null, 2) + "\n";
}
