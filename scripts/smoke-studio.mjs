/**
 * Drives the studio side the way a studio does: sign up, create a brand, fill every
 * section, publish, protect it, and open the resulting hub as a stranger.
 *
 * The point is the whole loop. Any one of these steps passing on its own says very
 * little; what matters is that a brand built entirely through the editor comes out
 * of the public hub intact, with the generated files matching what was typed in.
 *
 * Usage: node scripts/smoke-studio.mjs [origin]
 */
import { chromium } from "playwright";

const ORIGIN = process.argv[2] ?? "http://localhost:3000";
const browser = await chromium.launch({
  executablePath: process.env.PLAYWRIGHT_CHROMIUM || undefined,
});
const context = await browser.newContext({
  viewport: { width: 1280, height: 1000 },
  acceptDownloads: true,
});
const page = await context.newPage();

const fails = [];
const ok = (label, cond, extra = "") => {
  if (cond) console.log(`  ok    ${label}`);
  else fails.push(`${label}${extra ? ` — ${extra}` : ""}`);
};
page.on("pageerror", (e) => fails.push(`pageerror: ${e.message}`));

/**
 * A server action re-renders through the RSC payload without navigating, so
 * waitForLoadState returns before the DOM has changed. Poll for the change itself.
 */
async function waitForCount(selector, atLeast) {
  await page.waitForFunction(
    ([sel, want]) => document.querySelectorAll(sel).length >= want,
    [selector, atLeast],
    { timeout: 15000 },
  );
}

const stamp = Date.now();
const EMAIL = `studio-${stamp}@example.com`;
const PASSWORD = "correct-horse-battery";
const STUDIO = `Test Studio ${stamp}`;
const BRAND = `Harbourline ${stamp}`;

console.log("sign up");
await page.goto(`${ORIGIN}/signup`, { waitUntil: "domcontentloaded" });
await page.fill('input[name="studioName"]', STUDIO);
await page.fill('input[name="email"]', EMAIL);
await page.fill('input[name="password"]', PASSWORD);
await page.click('button:text("Create studio")');
await page.waitForURL("**/dashboard");
ok("signup lands on the dashboard", page.url().endsWith("/dashboard"));
ok("new studio has no brands", (await page.locator("main ul li").count()) === 0);

console.log("create a brand");
await page.click('a[href="/brands/new"]');
await page.waitForURL("**/brands/new");
await page.fill('input[name="name"]', BRAND);
await page.fill('textarea[name="description"]', "Short-haul freight along the coast.");
// By label, not by button[type=submit]: the studio header has a Log out button that
// matches the generic selector first.
await page.click('button:text("Create brand")');
await page.waitForURL(/\/brands\/[0-9a-f-]{36}$/);
const brandId = page.url().split("/").pop();
ok("editor opens on the new brand", Boolean(brandId));
ok("brand name shows in the editor", (await page.locator("h1").innerText()) === BRAND);

console.log("logos");
await page.setInputFiles(
  'form:has(button:text("Upload file")) input[type="file"]',
  "public/assets/meridian/meridian-wordmark.svg",
);
await page.click('button:text("Upload file")');
await waitForCount('img[alt="meridian-wordmark.svg"]', 1);
ok("uploaded logo appears in the editor", true);

const assetSrc = await page.locator('img[alt="meridian-wordmark.svg"]').getAttribute("src");
ok("upload is served from the files route", assetSrc?.startsWith("/api/files/"), assetSrc ?? "");
const assetResponse = await page.request.get(`${ORIGIN}${assetSrc}`);
ok("uploaded file downloads", assetResponse.status() === 200);
ok(
  "uploaded SVG is served sandboxed",
  (assetResponse.headers()["content-security-policy"] ?? "").includes("sandbox"),
  assetResponse.headers()["content-security-policy"] ?? "none",
);

console.log("color");
let colorCount = 0;
async function addColor(name, hex, group, note) {
  const form = page.locator('form:has(button:text("Add color"))');
  await form.locator('input[name="name"]').fill(name);
  await form.locator('input[name="hex"]').fill(hex);
  await form.locator('select[name="group"]').selectOption(group);
  await form.locator('input[name="note"]').fill(note);
  await form.locator('button:text("Add color")').click();
  colorCount += 1;
  await waitForCount('input[name="hex"]', colorCount + 1);
}
await addColor("Harbour", "#123A5C", "primary", "The identity color.");
await addColor("Rust", "#B4441F", "primary", "Deck markings only.");
await addColor("Fog", "#DDE1E3", "neutral", "Page grounds.");
ok("three colors added", colorCount === 3);

// A bad hex must be refused with an explanation rather than stored.
const colorForm = page.locator('form:has(button:text("Add color"))');
await colorForm.locator('input[name="name"]').fill("Broken");
await colorForm.locator('input[name="hex"]').fill("not-a-color");
await colorForm.locator('button:text("Add color")').click();
await page.waitForURL(/error=/, { timeout: 15000 });
ok(
  "a bad hex is refused with a readable message",
  (await page.locator('main [role="alert"]').innerText()).includes("not a hex value"),
);
ok("the bad color was not stored", (await page.locator('input[name="hex"]').count()) === 4);

console.log("type");
const typeForm = page.locator('form:has(button:text("Add typeface"))');
await typeForm.locator('input[name="familyName"]').fill("Public Sans");
await typeForm.locator('select[name="role"]').selectOption("body");
await typeForm
  .locator('input[name="sourceUrl"]')
  .fill("https://fonts.google.com/specimen/Public+Sans");
await typeForm.locator('input[name="onGoogleFonts"]').check();
await typeForm.locator('button:text("Add typeface")').click();
await waitForCount('input[name="familyName"]', 2);
ok("typeface added", true);

const stepForm = page.locator('form:has(button:text("Add step"))').first();
await stepForm.locator('input[name="label"]').fill("Body");
await stepForm.locator('input[name="sizePx"]').fill("16");
await stepForm.locator('input[name="lineHeight"]').fill("1.6");
await stepForm.locator('input[name="weight"]').fill("400");
await stepForm.locator('button:text("Add step")').click();
await page.locator("text=16px / 1.6 / 400").first().waitFor({ timeout: 15000 });
ok("scale step added", true);

console.log("rules");
let ruleCount = 0;
async function addRule(kind, body) {
  const form = page.locator('form:has(button:text("Add rule"))');
  await form.locator('select[name="kind"]').selectOption(kind);
  await form.locator('textarea[name="body"]').fill(body);
  await form.locator('button:text("Add rule")').click();
  ruleCount += 1;
  await waitForCount('textarea[name="body"]', ruleCount + 1);
}
await addRule("do", "Give the mark clear space equal to the cap height.");
await addRule("dont", "Never stretch the wordmark to fill a space.");
await addRule("tone", "Plain and specific. No exclamation marks.");
ok("three rules added", ruleCount === 3);

console.log("publish");
await page.click('button:text("Publish brand")');
await page.locator('a:has-text("Open the hub")').waitFor({ timeout: 15000 });
ok("brand reports as published", (await page.locator('button:text("Unpublish")').count()) === 1);

const slug = await page.locator('a:has-text("Open the hub")').getAttribute("href");
ok("slug derives from the name", slug.startsWith("/b/harbourline-"), slug);

console.log("the hub, as a stranger");
const stranger = await browser.newContext({ acceptDownloads: true });
const visitor = await stranger.newPage();
await visitor.goto(`${ORIGIN}${slug}`, { waitUntil: "networkidle" });
ok("hub renders the brand name", (await visitor.locator("h1").innerText()) === BRAND);
ok("hub shows the colors", (await visitor.locator("#color button").count()) === 3);
ok("hub shows the uploaded logo", (await visitor.locator("#logos img").count()) === 1);
ok("hub credits the studio", (await visitor.locator("footer").innerText()).includes(STUDIO));
ok(
  "a rejected color never reached the hub",
  !(await visitor.locator("#color").innerText()).includes("Broken"),
);

const contextText = await visitor.locator("#use-with-ai pre").innerText();
ok(
  "AI context carries what was typed",
  contextText.includes("#123A5C") && contextText.includes("Never stretch the wordmark"),
);
ok("AI context names the studio", contextText.includes(STUDIO));

console.log("generated files");
const md = await visitor.request.get(`${ORIGIN}/api/brands/${brandId}/design-md`);
const mdText = await md.text();
ok("design.md serves", md.status() === 200);
ok("design.md has the color table", mdText.includes("| Harbour | `#123A5C` |"));

const tokens = await visitor.request.get(`${ORIGIN}/api/brands/${brandId}/tokens`);
const parsed = JSON.parse(await tokens.text());
ok("tokens.json serves as DTCG", parsed.color.primary.harbour.$value === "#123A5C");
ok("type tokens carry the step", parsed.typography.body.body.$value.fontSize === "16px");

const zip = await visitor.request.get(`${ORIGIN}/api/brands/${brandId}/export`);
const zipBody = Buffer.from(await zip.body());
ok("zip serves", zip.status() === 200 && zipBody[0] === 0x50 && zipBody[1] === 0x4b);
const zipText = zipBody.toString("latin1");
for (const entry of [
  "assets/meridian-wordmark.svg",
  "design.md",
  "tokens.json",
  "brand-context.txt",
]) {
  ok(`zip contains ${entry}`, zipText.includes(entry));
}

console.log("password protection");
await page.bringToFront();
const passwordForm = page.locator('form:has(button:text("Set password"))');
await passwordForm.locator('input[name="password"]').fill("harbour-2026");
await passwordForm.locator('button:text("Set password")').click();
await page.locator('button:text("Remove password")').waitFor({ timeout: 15000 });
ok("password is set", true);

const outsider = await browser.newContext();
const outsiderPage = await outsider.newPage();
await outsiderPage.goto(`${ORIGIN}${slug}`, { waitUntil: "domcontentloaded" });
ok(
  "a protected hub challenges",
  (await outsiderPage.locator("h1").innerText()).includes("protected"),
);
ok(
  "the challenge leaks nothing about the brand",
  !(await outsiderPage.locator("body").innerText()).includes("#123A5C"),
);

const gatedMd = await outsiderPage.request.get(`${ORIGIN}/api/brands/${brandId}/design-md`);
ok("generated files are behind the same gate", gatedMd.status() === 404, `got ${gatedMd.status()}`);

await outsiderPage.fill('input[name="password"]', "wrong-password");
await outsiderPage.click('button:text("Open guidelines")');
await outsiderPage.waitForURL(/wrong=1/, { timeout: 15000 });
ok(
  "a wrong password is refused",
  (await outsiderPage.locator("body").innerText()).includes("does not match"),
);

await outsiderPage.fill('input[name="password"]', "harbour-2026");
await outsiderPage.click('button:text("Open guidelines")');
await outsiderPage.waitForSelector("#color", { timeout: 15000 });
ok("the right password opens it", (await outsiderPage.locator("h1").innerText()) === BRAND);

console.log("isolation between studios");
const other = await browser.newContext();
const otherPage = await other.newPage();
await otherPage.goto(`${ORIGIN}/signup`, { waitUntil: "domcontentloaded" });
await otherPage.fill('input[name="studioName"]', "Rival Studio");
await otherPage.fill('input[name="email"]', `rival-${stamp}@example.com`);
await otherPage.fill('input[name="password"]', PASSWORD);
await otherPage.click('button:text("Create studio")');
await otherPage.waitForURL("**/dashboard");
ok("rival sees no brands", (await otherPage.locator("main ul li").count()) === 0);

const stolen = await otherPage.goto(`${ORIGIN}/brands/${brandId}`, {
  waitUntil: "domcontentloaded",
});
ok(
  "another studio cannot open the editor",
  stolen.status() === 404,
  `status ${stolen.status()}`,
);

const stolenFiles = await otherPage.request.get(`${ORIGIN}/api/brands/${brandId}/export`);
ok(
  "another studio cannot export the files",
  stolenFiles.status() === 404,
  `status ${stolenFiles.status()}`,
);

console.log("unpublish takes the hub down");
await page.bringToFront();
await page.click('button:text("Unpublish")');
await page.locator('button:text("Publish brand")').waitFor({ timeout: 15000 });
const gone = await visitor.goto(`${ORIGIN}${slug}`, { waitUntil: "domcontentloaded" });
ok("an unpublished hub is gone", gone.status() === 404, `status ${gone.status()}`);

console.log("billing lock");
await page.goto(`${ORIGIN}/billing`, { waitUntil: "domcontentloaded" });
await page.click('button:text("Set to payment failed")');
await page.waitForLoadState("domcontentloaded");
await page.goto(`${ORIGIN}/brands/${brandId}`, { waitUntil: "domcontentloaded" });
ok(
  "a past-due studio is told editing is paused",
  (await page.locator("body").innerText()).includes("Editing is paused"),
);

await page.click('button:text("Publish brand")');
await page.waitForURL(/\/billing/, { timeout: 15000 });
ok("a past-due studio cannot publish and is sent to billing", page.url().includes("/billing"));

await browser.close();
console.log(
  fails.length === 0 ? "\nALL PASS" : "\nFAILURES:\n" + fails.map((f) => " - " + f).join("\n"),
);
if (fails.length) process.exitCode = 1;
