import "server-only";

import { meridian } from "@/lib/brand/fixtures";
import { hashPassword } from "@/lib/auth/password";
import { newId, now, read, write } from "./store";

/**
 * Seeds the demo studio and the Meridian Ferries brand on first run.
 *
 * Keeping the fixture as seed data rather than as a hardcoded page means the demo
 * hub is served by exactly the same code path as a real brand — if the editor can
 * produce it, the hub can render it, and there is no second route to keep in step.
 */
export const DEMO_EMAIL = "demo@ropewalk.studio";
export const DEMO_PASSWORD = "meridian2026";

let seeding: Promise<void> | null = null;

export function ensureSeeded(): Promise<void> {
  if (!seeding) seeding = seed();
  return seeding;
}

async function seed(): Promise<void> {
  const alreadySeeded = read((db) => db.studios.length > 0);
  if (alreadySeeded) return;

  const passwordHash = await hashPassword(DEMO_PASSWORD);

  await write((db) => {
    // Re-check inside the write: two requests can race to here on a cold start.
    if (db.studios.length > 0) return;

    const studioId = newId();
    const timestamp = now();

    db.studios.push({
      id: studioId,
      email: DEMO_EMAIL,
      passwordHash,
      name: meridian.studio.name,
      logoPath: meridian.studio.logoPath,
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      subscriptionStatus: "trialing",
      trialEndsAt: new Date(Date.now() + 14 * 864e5).toISOString(),
      createdAt: timestamp,
    });

    const brandId = newId();
    db.brands.push({
      id: brandId,
      studioId,
      name: meridian.name,
      slug: meridian.slug,
      description: meridian.description,
      published: true,
      passwordHash: null,
      createdAt: timestamp,
      updatedAt: `${meridian.updatedAt}T00:00:00.000Z`,
    });

    for (const asset of meridian.assets) {
      db.assets.push({ ...asset, id: newId(), brandId });
    }
    for (const color of meridian.colors) {
      db.colors.push({ ...color, id: newId(), brandId });
    }
    for (const face of meridian.typefaces) {
      db.typefaces.push({ ...face, id: newId(), brandId });
    }
    for (const rule of meridian.rules) {
      db.rules.push({ ...rule, id: newId(), brandId });
    }
  });
}
