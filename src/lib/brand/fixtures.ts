import type { Brand } from "./types";

/**
 * Step-one fixture. Deleted when the editor starts writing real rows.
 *
 * Deliberately awkward in the places that matter: a near-white brand color that
 * fights the page ground, a white-only logo variant, and a licensed display face
 * that is not on Google Fonts — so the specimen fallback gets exercised from day one
 * rather than discovered later.
 */
export const meridian: Brand = {
  id: "fixture-meridian",
  slug: "meridian",
  name: "Meridian Ferries",
  description: "Coastal passenger service between the islands.",
  updatedAt: "2026-09-04",
  studio: {
    name: "Ropewalk Studio",
    url: "https://example.com",
    logoPath: "/assets/meridian/ropewalk-studio.svg",
  },

  assets: [
    {
      id: "a1",
      fileName: "meridian-wordmark.svg",
      path: "/assets/meridian/meridian-wordmark.svg",
      mimeType: "image/svg+xml",
      byteSize: 1718,
      category: "primary",
      previewOn: "light",
      usageDo:
        "The default. Use this everywhere the full name fits on one line — timetables, signage, the top of a letter.",
      usageDont:
        "Don't set it below 120px wide. The counters close up and it turns into a smudge at booking-confirmation size.",
      sortOrder: 1,
    },
    {
      id: "a2",
      fileName: "meridian-wordmark-white.svg",
      path: "/assets/meridian/meridian-wordmark-white.svg",
      mimeType: "image/svg+xml",
      byteSize: 1718,
      category: "primary",
      previewOn: "dark",
      usageDo:
        "For Marine, Slate, and photography. Check the photograph behind it is doing nothing in the area the letters sit.",
      usageDont:
        "Don't place it on Signal. Orange and white is a hazard pairing and it reads as a warning, not a name.",
      sortOrder: 2,
    },
    {
      id: "a3",
      fileName: "meridian-lockup-stacked.svg",
      path: "/assets/meridian/meridian-lockup-stacked.svg",
      mimeType: "image/svg+xml",
      byteSize: 2106,
      category: "secondary",
      previewOn: "light",
      usageDo:
        "For square and near-square spaces: social avatars, stamps, the side of a container.",
      usageDont:
        "Don't rebuild this by stacking the mark and the wordmark yourself. The optical spacing here is not the mathematical spacing.",
      sortOrder: 3,
    },
    {
      id: "a4",
      fileName: "meridian-mark.svg",
      path: "/assets/meridian/meridian-mark.svg",
      mimeType: "image/svg+xml",
      byteSize: 401,
      category: "mark",
      previewOn: "light",
      usageDo:
        "Alone only where the name is already obvious — the app icon, a favicon, embroidery on crew jackets.",
      usageDont:
        "Don't rotate it to follow a hull curve or an arch. The waterline is horizontal because it is a waterline.",
      sortOrder: 4,
    },
    {
      id: "a5",
      fileName: "meridian-mark.png",
      path: "/assets/meridian/meridian-mark.png",
      mimeType: "image/png",
      byteSize: 17236,
      category: "mark",
      previewOn: "light",
      usageDo:
        "512px, transparent background. For the places that still won't take an SVG — email signatures, older booking systems.",
      usageDont:
        "Don't scale it up past 512px. Ask us for the size you need, or use the SVG.",
      sortOrder: 5,
    },
  ],

  colors: [
    {
      id: "c1",
      name: "Marine",
      hex: "#0B2A3F",
      group: "primary",
      note: "The identity color. Hulls, headers, and the default dark in any interface.",
      sortOrder: 1,
    },
    {
      id: "c2",
      name: "Signal",
      hex: "#E8521E",
      group: "primary",
      note: "Wayfinding, hazard marking, and the single most important action on a screen. Rationed on purpose.",
      sortOrder: 2,
    },
    {
      id: "c3",
      name: "Tide",
      hex: "#3E7C8C",
      group: "secondary",
      note: "Route lines, map fills, and charts. Never for type under 18px.",
      sortOrder: 3,
    },
    {
      id: "c4",
      name: "Rope",
      hex: "#C9A227",
      group: "secondary",
      note: "Reserved for the heritage service and the 1961 anniversary material.",
      sortOrder: 4,
    },
    {
      id: "c5",
      name: "Chalk",
      hex: "#F2EFE9",
      group: "neutral",
      note: "The paper color. Printed timetables, ticket stock, and page grounds.",
      sortOrder: 5,
    },
    {
      id: "c6",
      name: "Slate",
      hex: "#2B3138",
      group: "neutral",
      note: "Body copy on Chalk. Softer than black, which looks like a fine notice.",
      sortOrder: 6,
    },
    {
      id: "c7",
      name: "Hull White",
      hex: "#FFFFFF",
      group: "neutral",
      note: "A real color, not the absence of one. Specified as paint on the upper works.",
      sortOrder: 7,
    },
  ],

  typefaces: [
    {
      id: "t1",
      familyName: "GT Pressura",
      role: "display",
      sourceUrl: "https://www.grillitype.com/typeface/gt-pressura",
      // Licensed. We have no right to serve it, so the specimen falls back.
      webfontFamily: null,
      note: "Chosen because it was drawn for ink spread on rough stock, and most of what we print gets wet.",
      scale: [
        { label: "Poster", sizePx: 72, lineHeight: 0.95, weight: 700, letterSpacingEm: -0.02 },
        { label: "Headline", sizePx: 40, lineHeight: 1.05, weight: 700, letterSpacingEm: -0.015 },
        { label: "Subhead", sizePx: 28, lineHeight: 1.2, weight: 500, letterSpacingEm: -0.01 },
      ],
      sortOrder: 1,
    },
    {
      id: "t2",
      familyName: "Public Sans",
      role: "body",
      sourceUrl: "https://fonts.google.com/specimen/Public+Sans",
      webfontFamily: "Public Sans",
      note: "Open license, so the ferry operators can install it on the terminal machines without asking anyone.",
      scale: [
        { label: "Lead", sizePx: 20, lineHeight: 1.5, weight: 400, letterSpacingEm: 0 },
        { label: "Body", sizePx: 16, lineHeight: 1.6, weight: 400, letterSpacingEm: 0 },
        { label: "Caption", sizePx: 13, lineHeight: 1.45, weight: 500, letterSpacingEm: 0.01 },
      ],
      sortOrder: 2,
    },
  ],

  rules: [
    {
      id: "r1",
      kind: "do",
      body: "Give the mark clear space equal to the height of the M on every side. On vessel hulls, double it — nothing else gets painted inside that box.",
      sortOrder: 1,
    },
    {
      id: "r2",
      kind: "do",
      body: "Set all timetable and signage type in Public Sans. It was chosen to stay legible at distance, at an angle, and in rain.",
      sortOrder: 2,
    },
    {
      id: "r3",
      kind: "do",
      body: "Use Signal for exactly one thing per view: the way out, the way on, or the thing that will hurt you.",
      sortOrder: 3,
    },
    {
      id: "r4",
      kind: "do",
      body: "Write times as 24-hour with a leading zero. 07:40, not 7.40am.",
      sortOrder: 4,
    },
    {
      id: "r5",
      kind: "dont",
      body: "Never rotate, arch, or condense the wordmark. It has been drawn for the curve of a hull already.",
      sortOrder: 1,
    },
    {
      id: "r6",
      kind: "dont",
      body: "Never set body copy on Signal. It fails contrast at every size we use and it reads as an alarm.",
      sortOrder: 2,
    },
    {
      id: "r7",
      kind: "dont",
      body: "No drop shadows, outer glows, or bevels on the mark. Not on video, not over photography, not at night.",
      sortOrder: 3,
    },
    {
      id: "r8",
      kind: "dont",
      body: "Don't recolor the mark to match a campaign. If the background won't take Marine, use the white version.",
      sortOrder: 4,
    },
    {
      id: "r9",
      kind: "tone",
      body: "Plain, specific, unhurried. We move people across water on a schedule, and the writing should sound like it knows the schedule.",
      sortOrder: 1,
    },
    {
      id: "r10",
      kind: "tone",
      body: "Say what happens and when. “The 07:40 to Ardmore is boarding at Berth 2”, not “Your journey begins soon”.",
      sortOrder: 2,
    },
    {
      id: "r11",
      kind: "tone",
      body: "When something goes wrong, lead with the fact and follow with the option. People standing in weather do not read the second sentence first.",
      sortOrder: 3,
    },
    {
      id: "r12",
      kind: "tone",
      body: "No exclamation marks. Nothing about a ferry is exciting enough to warrant one, and the one time it is, we will want it back.",
      sortOrder: 4,
    },
  ],
};
