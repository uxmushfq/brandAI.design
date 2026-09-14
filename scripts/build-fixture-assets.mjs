/**
 * Generates the Meridian Ferries fixture artwork into public/assets/meridian/.
 *
 * The wordmark is a stencil-cut construction: every glyph is built from straight
 * segments and chamfers, which is both what painted hull lettering actually looks
 * like and what survives being scaled to a favicon. Glyphs are emitted flattened
 * (no <use>, no <defs>) so the downloaded files open anywhere.
 *
 * Run with: node scripts/build-fixture-assets.mjs
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "assets", "meridian");
mkdirSync(OUT, { recursive: true });

const MARINE = "#0B2A3F";
const CAP = 48;
const GAP = 7;
const WORD_SPACE = 20;

/** Cap height 48, baseline at y=48. `evenodd` where a glyph has a counter. */
const GLYPHS = {
  M: { w: 44, d: "M0,48 V0 H11 L22,25 L33,0 H44 V48 H34 V18 L25,39 H19 L10,18 V48 Z" },
  E: { w: 32, d: "M0,0 H32 V10 H10 V19 H28 V29 H10 V38 H32 V48 H0 Z" },
  R: {
    w: 34,
    evenodd: true,
    d: "M0,48 V0 H34 V26 H23.5 L34,48 H22.5 L12,26 H10 V48 Z M10,10 H24 V16 H10 Z",
  },
  I: { w: 10, d: "M0,0 H10 V48 H0 Z" },
  D: {
    w: 34,
    evenodd: true,
    d: "M0,0 H25 L34,9 V39 L25,48 H0 Z M10,10 H21 L24,13 V35 L21,38 H10 Z",
  },
  A: {
    w: 36,
    evenodd: true,
    d: "M0,48 L11,0 H25 L36,48 H26 L23.4,37 H12.6 L10,48 Z M13.6,30 L18,12 L22.4,30 Z",
  },
  N: { w: 34, d: "M0,48 V0 H11 L24,27 V0 H34 V48 H23 L10,21 V48 Z" },
  F: { w: 30, d: "M0,0 H30 V10 H10 V20 H26 V30 H10 V48 H0 Z" },
  S: { w: 32, d: "M32,0 V10 H10 V19 H32 V48 H0 V38 H22 V29 H0 V0 Z" },
};

/** Lays out a string of glyphs on one baseline. Returns paths plus total width. */
function setText(text) {
  let x = 0;
  const parts = [];
  for (const ch of text) {
    if (ch === " ") {
      x += WORD_SPACE;
      continue;
    }
    const g = GLYPHS[ch];
    if (!g) throw new Error(`No glyph drawn for "${ch}"`);
    const rule = g.evenodd ? ' fill-rule="evenodd"' : "";
    parts.push(`    <path${rule} transform="translate(${x} 0)" d="${g.d}"/>`);
    x += g.w + GAP;
  }
  return { paths: parts.join("\n"), width: x - GAP };
}

const svg = (viewBox, body, title) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" role="img" aria-label="${title}">
  <title>${title}</title>
${body}
</svg>
`;

/**
 * The mark: a ring cut by a meridian, sitting in a solid waterline.
 * Chord at y=42 on the outer radius 32 → half-chord √(32² − 10²) ≈ 30.4.
 */
function mark(color) {
  return `  <g fill="${color}">
    <path d="M32,0 A32,32 0 1 1 32,64 A32,32 0 1 1 32,0 Z M32,6 A26,26 0 1 0 32,58 A26,26 0 1 0 32,6 Z" fill-rule="evenodd"/>
    <path d="M1.6,42 A32,32 0 0 0 62.4,42 Z"/>
    <rect x="29" y="2" width="6" height="40"/>
  </g>`;
}

const files = {};

// Horizontal wordmark, the primary asset.
{
  const { paths, width } = setText("MERIDIAN FERRIES");
  files["meridian-wordmark.svg"] = svg(
    `0 0 ${width} ${CAP}`,
    `  <g fill="${MARINE}">\n${paths}\n  </g>`,
    "Meridian Ferries",
  );
  files["meridian-wordmark-white.svg"] = svg(
    `0 0 ${width} ${CAP}`,
    `  <g fill="#FFFFFF">\n${paths}\n  </g>`,
    "Meridian Ferries",
  );
}

// Stacked lockup: mark over two centred lines.
{
  const top = setText("MERIDIAN");
  const bottom = setText("FERRIES");
  const width = top.width;
  // The mark carries the lockup, so it is set at twice the cap height, not at it.
  const markSize = 96;
  const markScale = markSize / 64;
  const markX = (width - markSize) / 2;
  const wordTop = markSize + 34;
  const bottomTop = wordTop + CAP + 12;
  const bottomX = (width - bottom.width) / 2;
  const body = [
    `  <g transform="translate(${markX} 0) scale(${markScale})">`,
    mark(MARINE),
    `  </g>`,
    `  <g fill="${MARINE}" transform="translate(0 ${wordTop})">`,
    top.paths,
    `  </g>`,
    `  <g fill="${MARINE}" transform="translate(${bottomX} ${bottomTop})">`,
    bottom.paths,
    `  </g>`,
  ].join("\n");
  files["meridian-lockup-stacked.svg"] = svg(
    `0 0 ${width} ${bottomTop + CAP}`,
    body,
    "Meridian Ferries",
  );
}

files["meridian-mark.svg"] = svg("0 0 64 64", mark(MARINE), "Meridian Ferries mark");

// The studio's own mark, for the hub footer. Three sheared bars — rope being laid.
files["ropewalk-studio.svg"] = svg(
  "0 0 32 32",
  `  <g fill="currentColor">
    <path d="M6,6 H28 L24,11 H2 Z"/>
    <path d="M8,13 H26 L22,18 H4 Z"/>
    <path d="M10,20 H24 L20,25 H6 Z"/>
  </g>`,
  "Ropewalk Studio",
);

for (const [name, contents] of Object.entries(files)) {
  writeFileSync(join(OUT, name), contents, "utf8");
  console.log(`wrote ${name} (${Buffer.byteLength(contents)} bytes)`);
}

// PNG variant of the mark, for the places that still won't take an SVG.
const { default: sharp } = await import("sharp");
await sharp(Buffer.from(files["meridian-mark.svg"]))
  .resize(512, 512)
  .png()
  .toFile(join(OUT, "meridian-mark.png"));
console.log("wrote meridian-mark.png (512x512)");
