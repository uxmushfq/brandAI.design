# BrandAI.design

Hosted brand hubs for small design studios. A studio fills in a brand once and gets a
link to send the client: the guidelines, the downloadable files, and a set of outputs
that let the client's AI tools use the brand correctly.

## Where this is

The whole V1 loop works end to end. Sign up, create a brand, fill in all five
sections, publish, and open the link as a client would.

| Surface | State |
| --- | --- |
| Public brand hub | Designed and finished |
| Studio side (auth, dashboard, editor, publish) | Working wireframe — plain on purpose |
| Generated outputs (`design.md`, `tokens.json`, AI context, zip) | Done, served by API routes |
| Supabase | Not wired. A file-backed store stands in behind the same boundary |
| Stripe | Not wired. Billing states can be set by hand to exercise the app |
| Marketing page | Placeholder, built last |

## Running it

```bash
npm install
npm run dev
```

Then open http://localhost:3000. The demo studio is seeded on first run:

```
demo@ropewalk.studio
meridian2026
```

It owns the Meridian Ferries brand, published at `/b/meridian`.

For a production build, copy `.env.example` to `.env.local` first — `npm run start`
refuses to boot without a real `SESSION_SECRET`, because a guessable secret means
forgeable sessions.

## Shape of the code

`src/lib/brand/types.ts` defines one `Brand` object holding the brand and all its
children. Everything reads that object.

- `src/lib/db/` is the store. `schema.ts` holds flat row types shaped like the
  eventual Postgres tables; `store.ts` is a JSON file standing in for the database;
  `brands.ts` and `studios.ts` are the only things that touch it.
- `src/lib/generate/*` are pure functions — `Brand` in, string out — for `design.md`,
  `tokens.json`, and the copy-paste AI context. No React, no database, so the
  generated files can never drift from the page the client is reading.
- `src/components/hub/*` is the client-facing page. `src/components/studio/*` is the
  editor.

### Swapping in Supabase

Reimplement `src/lib/db/brands.ts` and `src/lib/db/studios.ts` against Supabase and
delete `store.ts`. Nothing above them changes. Two things to carry over:

Every function that touches a brand takes a studio id and checks it. That check is
the app-level stand-in for row-level security; when the policies exist they do the
real enforcing and these stay as a second belt.

The store deliberately reads from disk on every call. An in-memory cache there is
wrong, not merely slow — Next splits pages, server actions and route handlers into
separate bundles, each with its own module instance, so a cache in one does not see
writes from another. That bug let a route handler serve a brand's files using state
from before a password was set on it.

## Design notes worth knowing before changing things

The two surfaces have different jobs. The hub is the studio's reputation on screen,
so it gets the design effort. The studio side is dense and plain, and right now it is
an unstyled wireframe on purpose.

On the hub: the frame has no color of its own. Every hue belongs to the brand, and a
neutral ground is the only ground on which a client can judge their own palette. The
color bands are the single place boldness is spent, and the only element allowed to
break the reading column. Instrument Sans carries anything a human wrote, IBM Plex
Mono anything a machine consumes, and everything in mono is click-to-copy.

Band label colors are computed, not chosen — see `src/lib/color.ts`. A studio can
enter any palette, including mid-tones where neither ink nor paper clears AA, so the
label escalates to pure black or white and secondary text is dimmed only where the
band has the headroom for it.

## Decisions already made that are easy to undo by accident

A failed payment locks the editor and never takes a published hub offline. A client
opening a dead link because a card expired is the studio's reputation breaking.

A brand's slug follows its name until it is published, then it is frozen. A link that
has already been sent must never start meaning something else.

An unpublished brand and a brand that does not exist give the same answer, so the
hub cannot be used to discover that a brand exists.

A licensed typeface gets no specimen — the sizes are shown and the page says the
shapes are not ours to show, rather than substituting a lookalike the client would
not know about.

## Scripts

```bash
npm run assets           # regenerate the Meridian fixture artwork into public/
npm run check:contrast   # render a hub and assert every text node meets WCAG AA
npm run smoke            # the hub: clipboard, generated files, zip, focus, motion
npm run smoke:studio     # the whole studio loop, including access control
```

The last three need a running server and a Chromium. Pass a URL or origin as the
first argument, and set `PLAYWRIGHT_CHROMIUM` if your browser is not where Playwright
expects it.

```bash
npm run build && npm run start
npm run smoke -- http://localhost:3000/b/meridian
npm run smoke:studio -- http://localhost:3000
```

`smoke:studio` covers the parts that are painful to check by hand: that another
studio cannot open or export your brand, that a password gate covers the generated
files and not just the page, and that a past-due studio is locked out of editing
while its hubs stay up.

## Not in V1

Custom domains, client-side editing, teams and permissions, version history, Figma
sync, analytics, white-label theming, multi-language, PDF export, comments, approval
flows.
