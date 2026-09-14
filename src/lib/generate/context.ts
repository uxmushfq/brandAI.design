import {
  type Brand,
  colorsInGroup,
  rulesOfKind,
  typefaceForRole,
} from "@/lib/brand/types";

/**
 * The copy-paste block.
 *
 * This is the thing a client actually pastes into ChatGPT, Claude, v0 or Framer
 * Agent, so it is written as prose rather than as a data dump: models follow
 * instructions better than they follow JSON, and the client can read it back and
 * see whether it is right.
 */

function sentenceList(items: string[]): string {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

function describeColors(brand: Brand): string[] {
  const paragraphs: string[] = [];

  /** Lead sentence, then one line per color. Notes run long, and a model reads a
      labelled list more reliably than four notes spliced into a single sentence. */
  function group(colors: ReturnType<typeof colorsInGroup>, lead: string): void {
    if (colors.length === 0) return;
    const named = sentenceList(colors.map((c) => `${c.name} (${c.hex})`));
    const lines = [`${lead} ${named}.`];
    for (const color of colors) {
      if (color.note) lines.push(`- ${color.name}. ${color.note}`);
    }
    paragraphs.push(lines.join("\n"));
  }

  const primary = colorsInGroup(brand, "primary");
  group(
    primary,
    primary.length === 1 ? "The primary color is" : "The primary colors are",
  );

  const secondary = colorsInGroup(brand, "secondary");
  group(
    secondary,
    secondary.length === 1
      ? "The secondary color is"
      : "The secondary colors are",
  );

  const neutral = colorsInGroup(brand, "neutral");
  group(neutral, neutral.length === 1 ? "The neutral is" : "The neutrals are");
  if (neutral.length > 0) {
    paragraphs.push(
      "Use the neutrals for grounds, body copy and rules rather than inventing grays.",
    );
  }

  return paragraphs;
}

function describeTypeface(brand: Brand, role: "display" | "body"): string | null {
  const face = typefaceForRole(brand, role);
  if (!face) return null;

  const what =
    role === "display"
      ? "Headlines and display type are set in"
      : "Body copy is set in";

  const steps = face.scale
    .map(
      (s) =>
        `${s.label} at ${s.sizePx}px with a line height of ${s.lineHeight} and a weight of ${s.weight}`,
    )
    .join("; ");

  const parts = [`${what} ${face.familyName}.`];
  if (face.note) parts.push(face.note);
  if (steps) parts.push(`The scale runs: ${steps}.`);
  if (face.sourceUrl) parts.push(`The typeface comes from ${face.sourceUrl}.`);

  return parts.join(" ");
}

export function generateContext(brand: Brand, hubUrl: string): string {
  const sections: string[] = [];

  // Kept as separate sentences rather than spliced together: a one-line description
  // is written to stand alone, and folding it into a clause mangles the grammar.
  sections.push(`Brand context for ${brand.name}.`);
  sections.push(brand.description);

  sections.push(
    `Everything below describes how this brand works. ` +
      `Apply it to anything you design, write, or build for ${brand.name}, and prefer it over your own defaults. ` +
      `Where this document is silent, keep to the spirit of what it does say rather than reaching for a generic choice.`,
  );

  const colors = describeColors(brand);
  if (colors.length > 0) {
    sections.push(["COLOR", ...colors].join("\n\n"));
  }

  const type = [
    describeTypeface(brand, "display"),
    describeTypeface(brand, "body"),
  ].filter((s): s is string => s !== null);
  if (type.length > 0) {
    sections.push(
      [
        "TYPOGRAPHY",
        ...type,
        "If a typeface is not available to you, tell me rather than substituting a lookalike without saying so.",
      ].join("\n\n"),
    );
  }

  const dos = rulesOfKind(brand, "do");
  if (dos.length > 0) {
    sections.push(["HOW THE BRAND IS USED", ...dos.map((r) => `- ${r.body}`)].join("\n"));
  }

  const donts = rulesOfKind(brand, "dont");
  if (donts.length > 0) {
    sections.push(["WHAT TO AVOID", ...donts.map((r) => `- ${r.body}`)].join("\n"));
  }

  const tone = rulesOfKind(brand, "tone");
  if (tone.length > 0) {
    sections.push(["TONE OF VOICE", ...tone.map((r) => `- ${r.body}`)].join("\n"));
  }

  const logoCount = brand.assets.length;
  if (logoCount > 0) {
    sections.push(
      `LOGO FILES\n\n${brand.name} has ${logoCount} approved logo ${
        logoCount === 1 ? "file" : "files"
      }: ${sentenceList(brand.assets.map((a) => a.fileName))}. ` +
        `Do not redraw, retrace, or approximate the logo. Use a supplied file, or leave a space for one.`,
    );
  }

  sections.push(
    `The guidelines, the source files, and a design.md and tokens.json of everything above are at ${hubUrl}. ` +
      `Prepared by ${brand.studio.name}.`,
  );

  return sections.join("\n\n");
}

