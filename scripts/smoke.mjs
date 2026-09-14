/**
 * End-to-end check of everything on a hub that a client actually touches: the
 * clipboard, the three generated files, the archive, keyboard focus and reduced
 * motion. The generated outputs are the product, so it asserts their contents
 * rather than just that a download happened.
 *
 * Usage: node scripts/smoke.mjs [url]
 */
import { chromium } from "playwright";
import { readFileSync } from "node:fs";

const URL = process.argv[2] ?? "http://localhost:3000/b/meridian";
const browser = await chromium.launch({
  executablePath: process.env.PLAYWRIGHT_CHROMIUM || undefined,
});
const context = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
  permissions: ["clipboard-read", "clipboard-write"],
  acceptDownloads: true,
});
const page = await context.newPage();
const fails = [];
const ok = (label, cond, extra = "") =>
  (cond ? console.log(`  ok    ${label}`) : fails.push(`${label} ${extra}`)) ;

page.on("pageerror", (e) => fails.push(`console pageerror: ${e.message}`));

await page.goto(URL, { waitUntil: "networkidle" });
await page.waitForTimeout(600);

console.log("clipboard");
// Copy a color band.
const marine = page.locator('#color button[aria-label*="Marine"]');
await marine.click();
await page.waitForTimeout(250);
let clip = await page.evaluate(() => navigator.clipboard.readText());
ok("band copies its hex", clip === "#0B2A3F", `got ${JSON.stringify(clip)}`);
ok(
  "band shows the confirmation",
  (await marine.textContent()).includes("Copied"),
);

// Copy the AI context.
await page.getByRole("button", { name: "Copy brand context" }).click();
await page.waitForTimeout(250);
clip = await page.evaluate(() => navigator.clipboard.readText());
ok("context copies", clip.startsWith("Brand context for Meridian Ferries."));
ok("context carries the hexes", clip.includes("#0B2A3F") && clip.includes("#E8521E"));
ok("context carries the rules", clip.includes("Never rotate, arch, or condense"));
ok("context has no orphan article bug", !/is coastal passenger/.test(clip));

console.log("downloads");
async function grab(name) {
  const [download] = await Promise.all([
    page.waitForEvent("download", { timeout: 20000 }),
    page.getByRole("button", { name }).click(),
  ]);
  const path = await download.path();
  return { filename: download.suggestedFilename(), size: readFileSync(path).length, path };
}

const md = await grab("Download design.md");
ok("design.md downloads", md.filename === "design.md" && md.size > 2000, JSON.stringify(md));
const mdText = readFileSync(md.path, "utf8");
ok("design.md has a color table", mdText.includes("| Marine | `#0B2A3F` |"));
ok("design.md has the type scale", mdText.includes("| Poster | 72px |"));

const tokens = await grab("Download tokens.json");
const parsed = JSON.parse(readFileSync(tokens.path, "utf8"));
ok("tokens.json parses", typeof parsed === "object");
ok(
  "tokens use DTCG shape",
  parsed.color.primary.marine.$value === "#0B2A3F" &&
    parsed.color.primary.marine.$type === "color",
  JSON.stringify(parsed.color?.primary?.marine),
);
ok("token names are slugged", parsed.color.neutral["hull-white"].$value === "#FFFFFF");
ok(
  "typography tokens are composite",
  parsed.typography.display.poster.$value.fontSize === "72px",
);

const zip = await grab("Download zip");
ok("zip downloads", zip.filename === "meridian-brand-assets.zip" && zip.size > 5000, JSON.stringify(zip));
const zipBytes = readFileSync(zip.path);
ok("zip is a real archive", zipBytes[0] === 0x50 && zipBytes[1] === 0x4b);
const names = zipBytes.toString("latin1");
for (const entry of [
  "assets/meridian-wordmark.svg",
  "assets/meridian-mark.png",
  "design.md",
  "tokens.json",
  "brand-context.txt",
]) {
  ok(`zip contains ${entry}`, names.includes(entry));
}

console.log("keyboard and motion");
// Fresh page: focus order only means anything from a clean load.
const kb = await context.newPage();
await kb.goto(URL, { waitUntil: "domcontentloaded" });
await kb.waitForTimeout(300);
await kb.keyboard.press("Tab");
const focusOutline = await kb.evaluate(() => {
  const el = document.activeElement;
  const cs = getComputedStyle(el);
  const r = el.getBoundingClientRect();
  return {
    text: el.textContent.trim().slice(0, 30),
    width: cs.outlineWidth,
    style: cs.outlineStyle,
    onScreen: r.top >= 0 && r.left >= 0 && r.width > 0,
  };
});
ok(
  "first tab reaches the skip link, visible and with a ring",
  focusOutline.text.startsWith("Skip") &&
    parseFloat(focusOutline.width) >= 2 &&
    focusOutline.style === "solid" &&
    focusOutline.onScreen,
  JSON.stringify(focusOutline),
);

// Tabbing through the bands must show a ring on each.
await kb.evaluate(() => document.querySelector("#color button").focus());
const bandRing = await kb.evaluate(() => {
  const cs = getComputedStyle(document.activeElement);
  return { width: cs.outlineWidth, offset: cs.outlineOffset };
});
ok(
  "a focused band shows a ring",
  parseFloat(bandRing.width) >= 2,
  JSON.stringify(bandRing),
);

// Every band must be keyboard-operable.
const bandCount = await page.locator("#color button").count();
ok("every color is a real button", bandCount === 7, `got ${bandCount}`);

// Reduced motion must flatten the transitions.
const reduced = await context.newPage();
await reduced.emulateMedia({ reducedMotion: "reduce" });
await reduced.goto(URL, { waitUntil: "domcontentloaded" });
await reduced.waitForTimeout(400);
const dur = await reduced.evaluate(() => {
  const el = document.querySelector("#color button");
  return getComputedStyle(el).transitionDuration;
});
ok("reduced motion flattens transitions", parseFloat(dur) < 0.002, `got ${dur}`);

await browser.close();
console.log(fails.length === 0 ? "\nALL PASS" : "\nFAILURES:\n" + fails.map((f) => " - " + f).join("\n"));
if (fails.length) process.exitCode = 1;
