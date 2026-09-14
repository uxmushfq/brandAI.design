/**
 * Contrast maths for the color bands.
 *
 * The bands are filled with the client's own colors, which we don't control, so the
 * label color has to be decided per band rather than chosen once. Same WCAG 2.1
 * relative-luminance formula the checkers use.
 */

export const INK = "#15171B";
export const PAPER = "#F1F2F3";

const BLACK = "#000000";
const WHITE = "#FFFFFF";

/** WCAG AA for text below 24px. */
export const AA_BODY = 4.5;

export function parseHex(hex: string): [number, number, number] | null {
  const m = /^#?([0-9a-f]{6}|[0-9a-f]{3})$/i.exec(hex.trim());
  if (!m) return null;
  let h = m[1];
  if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

export function relativeLuminance(hex: string): number {
  const rgb = parseHex(hex);
  if (!rgb) return 0;
  const [r, g, b] = rgb.map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastRatio(a: string, b: string): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

/**
 * The label color for a band.
 *
 * Ink and paper are the house colors and are used wherever they clear AA. A mid-tone
 * brand color — a teal, a mid orange — can sit too close in value to both, and there
 * pure black or white buys roughly half a stop more. Still achromatic, so the band is
 * still the only hue on screen.
 */
export function readableOn(background: string): string {
  const house =
    contrastRatio(background, INK) >= contrastRatio(background, PAPER) ? INK : PAPER;
  if (contrastRatio(background, house) >= AA_BODY) return house;

  const extreme =
    contrastRatio(background, BLACK) >= contrastRatio(background, WHITE)
      ? BLACK
      : WHITE;
  return contrastRatio(background, extreme) > contrastRatio(background, house)
    ? extreme
    : house;
}

/** Per-channel sRGB mix, which is what CSS opacity actually composites. */
export function blend(foreground: string, background: string, alpha: number): string {
  const fg = parseHex(foreground);
  const bg = parseHex(background);
  if (!fg || !bg) return foreground;
  const mixed = fg.map((channel, i) =>
    Math.round(channel * alpha + bg[i] * (1 - alpha)),
  );
  return "#" + mixed.map((v) => v.toString(16).padStart(2, "0")).join("");
}

/**
 * The largest amount we can fade the secondary text on a band before it stops
 * meeting AA. Hierarchy by dimming is only available where the band has the
 * headroom for it; on the tight ones the size difference has to carry it alone.
 */
export function dimAlphaFor(background: string, foreground: string): number {
  for (const alpha of [0.75, 0.85]) {
    if (contrastRatio(blend(foreground, background, alpha), background) >= AA_BODY) {
      return alpha;
    }
  }
  return 1;
}

/**
 * A band close in value to the page ground needs a hairline or it dissolves into it.
 * Anything under 1.3:1 against paper is effectively the same surface.
 */
export function needsEdge(background: string): boolean {
  return contrastRatio(background, PAPER) < 1.3;
}

export function normalizeHex(hex: string): string {
  const rgb = parseHex(hex);
  if (!rgb) return hex.toUpperCase();
  return (
    "#" + rgb.map((v) => v.toString(16).padStart(2, "0")).join("").toUpperCase()
  );
}

/** `#0B2A3F` → `11, 42, 63`. Shown under the hex so print people can read it off. */
export function toRgbString(hex: string): string {
  const rgb = parseHex(hex);
  return rgb ? rgb.join(", ") : "";
}
