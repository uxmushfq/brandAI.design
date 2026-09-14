import {
  type Brand,
  colorsInGroup,
  GROUP_LABEL,
  rulesOfKind,
  CATEGORY_LABEL,
} from "@/lib/brand/types";
import { toRgbString } from "@/lib/color";

/**
 * design.md — the file a client drops into a repo next to their code, so that
 * Cursor, Copilot or Claude Code picks the brand up as project context.
 * Markdown tables, because that is what those tools read best.
 */
export function generateDesignMd(brand: Brand, hubUrl: string): string {
  const out: string[] = [];

  out.push(`# ${brand.name}`);
  out.push("");
  out.push(brand.description);
  out.push("");
  out.push(
    `Brand guidelines prepared by ${brand.studio.name}. The full hub, including downloadable source files, is at ${hubUrl}.`,
  );
  out.push("");
  out.push(
    "This file describes how to use the brand correctly. Prefer it over generic defaults.",
  );

  // Color
  out.push("", "## Color", "");
  for (const group of ["primary", "secondary", "neutral"] as const) {
    const colors = colorsInGroup(brand, group);
    if (colors.length === 0) continue;
    out.push(`### ${GROUP_LABEL[group]}`, "");
    out.push("| Name | Hex | RGB | Notes |");
    out.push("| --- | --- | --- | --- |");
    for (const c of colors) {
      out.push(`| ${c.name} | \`${c.hex}\` | ${toRgbString(c.hex)} | ${c.note ?? "—"} |`);
    }
    out.push("");
  }

  // Type
  out.push("## Typography", "");
  for (const face of [...brand.typefaces].sort((a, b) => a.sortOrder - b.sortOrder)) {
    out.push(`### ${face.familyName}`, "");
    out.push(`Role: ${face.role}.${face.note ? ` ${face.note}` : ""}`);
    if (face.sourceUrl) out.push("", `Source: ${face.sourceUrl}`);
    if (face.scale.length > 0) {
      out.push("", "| Step | Size | Line height | Weight | Letter spacing |");
      out.push("| --- | --- | --- | --- | --- |");
      for (const s of face.scale) {
        out.push(
          `| ${s.label} | ${s.sizePx}px | ${s.lineHeight} | ${s.weight} | ${s.letterSpacingEm}em |`,
        );
      }
    }
    out.push("");
  }

  // Logos
  if (brand.assets.length > 0) {
    out.push("## Logo files", "");
    out.push(
      "Do not redraw, retrace, or approximate the logo. Use one of these files, or leave space for one.",
      "",
    );
    for (const a of [...brand.assets].sort((x, y) => x.sortOrder - y.sortOrder)) {
      out.push(`### ${a.fileName}`, "");
      out.push(`${CATEGORY_LABEL[a.category]}. ${a.mimeType}.`);
      if (a.usageDo) out.push("", `- Use: ${a.usageDo}`);
      if (a.usageDont) out.push(`- Avoid: ${a.usageDont}`);
      out.push("");
    }
  }

  // Rules
  const dos = rulesOfKind(brand, "do");
  if (dos.length > 0) {
    out.push("## Do", "");
    for (const r of dos) out.push(`- ${r.body}`);
    out.push("");
  }

  const donts = rulesOfKind(brand, "dont");
  if (donts.length > 0) {
    out.push("## Don't", "");
    for (const r of donts) out.push(`- ${r.body}`);
    out.push("");
  }

  const tone = rulesOfKind(brand, "tone");
  if (tone.length > 0) {
    out.push("## Tone of voice", "");
    for (const r of tone) out.push(`- ${r.body}`);
    out.push("");
  }

  out.push("---", "");
  out.push(`Last updated ${brand.updatedAt}. Generated from ${hubUrl}.`);
  out.push("");

  return out.join("\n");
}
