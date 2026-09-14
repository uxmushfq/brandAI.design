# BrandAI.design

Hosted brand hubs for small design studios. A studio fills in a brand once and gets a
link to send the client: the guidelines, the downloadable files, and a set of outputs
that let the client's AI tools use the brand correctly.

## Where this is

Step one of the build order only: the public brand hub, rendered from a fixture. No
database, no auth, no Stripe, no marketing page yet.

- `/` — placeholder, links to the demo hub
- `/b/meridian` — the page a client opens

## Running it

```bash
npm install
npm run dev
```

Then open http://localhost:3000/b/meridian.

## Shape of the code

`src/lib/brand/types.ts` defines one `Brand` object holding the brand and all its
children. Everything else reads that object:

- `src/lib/brand/query.ts` is the single data boundary. It returns a fixture today; it
  becomes a Supabase query returning the identical shape, and nothing downstream
  changes.
- `src/lib/generate/*` are pure functions — `Brand` in, string out — for `design.md`,
  `tokens.json`, and the copy-paste AI context block. No React and no database, so the
  generated files can never drift from the page the client is reading.
- `src/components/hub/*` is the client-facing page. `src/components/ui/*` is shared.

## Design notes worth knowing before changing things

The frame has no color of its own. Every hue on a hub belongs to the brand; the chrome
is paper, ink, and one hairline. A neutral ground is also the only ground on which a
client can judge their own palette accurately, so this is not only deference.

The color bands are the single place boldness is spent. They are the only element
allowed to break the reading column and run edge to edge.

Two families, split by function rather than decoration: Instrument Sans for anything a
human wrote, IBM Plex Mono for anything a machine will consume. Everything in mono is
click-to-copy, which is how the reader learns the rule without being told.

Band label colors are computed, not chosen — see `src/lib/color.ts`. A studio can
enter any palette, including mid-tones where neither ink nor paper clears AA, so the
label escalates to pure black or white and secondary text is only dimmed where the
band has the contrast headroom to afford it.

## Scripts

```bash
npm run assets           # regenerate the Meridian fixture artwork into public/
npm run check:contrast   # render a hub and assert every text node meets WCAG AA
```

`check:contrast` needs a running server and a Chromium. Pass a URL as the first
argument, and set `PLAYWRIGHT_CHROMIUM` if your browser is not where Playwright
expects it.

## Not in V1

Custom domains, client-side editing, teams and permissions, version history, Figma
sync, analytics, white-label theming, multi-language, PDF export, comments, approval
flows.
