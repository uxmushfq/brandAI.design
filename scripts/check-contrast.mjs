/**
 * Renders a published hub and checks every visible text node against WCAG AA.
 *
 * Worth having as a real script rather than a one-off: the color bands are filled
 * with values the studio types in, so the contrast of our own labels changes with
 * every brand. This is the only way to know the page still holds up on a palette
 * nobody anticipated.
 *
 * Usage: node scripts/check-contrast.mjs [url]
 */
import { chromium } from "playwright";

const url = process.argv[2] ?? "http://localhost:3000/b/meridian";
const executablePath = process.env.PLAYWRIGHT_CHROMIUM || undefined;

const browser = await chromium.launch(executablePath ? { executablePath } : {});
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
await page.goto(url, { waitUntil: "networkidle" });
await page.waitForTimeout(700);

const results = await page.evaluate(() => {
  const lum = (r, g, b) => {
    const f = (v) => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  };
  const ratio = (a, b) => {
    const [hi, lo] = a > b ? [a, b] : [b, a];
    return (hi + 0.05) / (lo + 0.05);
  };
  const rgb = (s) => (s.match(/\d+(\.\d+)?/g) || []).map(Number);
  const hex = (r, g, b) =>
    "#" + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, "0")).join("");

  /** First opaque background at or above the element. */
  function bgOf(el) {
    let n = el;
    while (n) {
      const p = rgb(getComputedStyle(n).backgroundColor);
      if (p.length >= 3 && (p[3] === undefined || p[3] > 0)) return [p[0], p[1], p[2]];
      n = n.parentElement;
    }
    return [255, 255, 255];
  }

  /** Ancestors' opacity composites too, so it has to be cumulative. */
  function effectiveAlpha(el) {
    let a = 1;
    let n = el;
    while (n && n !== document.documentElement) {
      a *= parseFloat(getComputedStyle(n).opacity);
      n = n.parentElement;
    }
    return a;
  }

  const out = [];
  const root = document.querySelector("main");
  if (!root) return out;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const seen = new Set();

  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const text = node.nodeValue.trim();
    if (!text) continue;
    const el = node.parentElement;
    if (!el || seen.has(el)) continue;
    seen.add(el);
    if (el.closest(".sr-only")) continue;
    const cs = getComputedStyle(el);
    if (cs.display === "none" || cs.visibility === "hidden") continue;

    const [r, g, b] = rgb(cs.color);
    const alpha = effectiveAlpha(el);
    const [br, bg, bb] = bgOf(el);
    const er = r * alpha + br * (1 - alpha);
    const eg = g * alpha + bg * (1 - alpha);
    const eb = b * alpha + bb * (1 - alpha);
    const cr = ratio(lum(er, eg, eb), lum(br, bg, bb));

    const size = parseFloat(cs.fontSize);
    const weight = parseInt(cs.fontWeight, 10);
    const large = size >= 24 || (size >= 18.66 && weight >= 700);
    const need = large ? 3 : 4.5;

    if (cr < need) {
      out.push({
        text: text.slice(0, 45),
        size: +size.toFixed(1),
        fg: hex(er, eg, eb),
        bg: hex(br, bg, bb),
        ratio: +cr.toFixed(2),
        need,
      });
    }
  }
  return out;
});

await browser.close();

if (results.length === 0) {
  console.log(`PASS — every text node on ${url} meets WCAG AA against its own ground`);
} else {
  console.error(`FAIL — ${results.length} text nodes below AA on ${url}`);
  console.error(JSON.stringify(results, null, 2));
  process.exitCode = 1;
}
