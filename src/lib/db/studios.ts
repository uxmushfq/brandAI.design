import "server-only";

import { hashPassword, verifyPassword } from "@/lib/auth/password";
import type { DbStudio } from "./schema";
import { newId, now, read, write } from "./store";

const TRIAL_DAYS = 14;

/** V1 plan: one tier, 3 brands included. Enforced when a studio creates the fourth. */
export const PLAN = {
  name: "Studio",
  pricePerMonth: 49,
  currency: "USD",
  includedBrands: 3,
  trialDays: TRIAL_DAYS,
} as const;

export function findStudioByEmail(email: string): DbStudio | null {
  const normalized = email.trim().toLowerCase();
  return read((db) => db.studios.find((s) => s.email === normalized) ?? null);
}

export type SignUpResult =
  | { ok: true; studioId: string }
  | { ok: false; error: string };

export async function signUp(
  email: string,
  password: string,
  studioName: string,
): Promise<SignUpResult> {
  const normalized = email.trim().toLowerCase();

  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(normalized)) {
    return { ok: false, error: "That does not look like an email address." };
  }
  if (password.length < 8) {
    return { ok: false, error: "Use a password of at least 8 characters." };
  }
  if (studioName.trim().length === 0) {
    return { ok: false, error: "Your studio needs a name. It goes in the hub footer." };
  }
  if (findStudioByEmail(normalized)) {
    return { ok: false, error: "An account already exists for that email. Log in instead." };
  }

  const passwordHash = await hashPassword(password);
  const trialEnds = new Date();
  trialEnds.setDate(trialEnds.getDate() + TRIAL_DAYS);

  const studioId = await write((db) => {
    const id = newId();
    db.studios.push({
      id,
      email: normalized,
      passwordHash,
      name: studioName.trim(),
      logoPath: null,
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      subscriptionStatus: "trialing",
      trialEndsAt: trialEnds.toISOString(),
      createdAt: now(),
    });
    return id;
  });

  return { ok: true, studioId };
}

export type SignInResult =
  | { ok: true; studioId: string }
  | { ok: false; error: string };

export async function signIn(email: string, password: string): Promise<SignInResult> {
  const studio = findStudioByEmail(email);
  // Same message either way, so this cannot be used to enumerate accounts.
  const wrong = { ok: false as const, error: "That email and password do not match." };
  if (!studio) return wrong;
  return (await verifyPassword(password, studio.passwordHash))
    ? { ok: true, studioId: studio.id }
    : wrong;
}

export async function updateStudio(
  studioId: string,
  fields: Partial<Pick<DbStudio, "name" | "logoPath">>,
): Promise<void> {
  await write((db) => {
    const studio = db.studios.find((s) => s.id === studioId);
    if (studio) Object.assign(studio, fields);
  });
}

export async function setSubscriptionStatus(
  studioId: string,
  status: DbStudio["subscriptionStatus"],
): Promise<void> {
  await write((db) => {
    const studio = db.studios.find((s) => s.id === studioId);
    if (studio) studio.subscriptionStatus = status;
  });
}

export function trialDaysRemaining(studio: DbStudio): number | null {
  if (!studio.trialEndsAt) return null;
  const ms = new Date(studio.trialEndsAt).getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}

/**
 * Whether the studio can still edit.
 *
 * A failed payment locks the editor and never the published hubs. A client opening
 * a dead link because their studio's card expired is the worst failure this product
 * has, and it would be the studio's reputation that broke, not ours.
 */
export function canEdit(studio: DbStudio): boolean {
  return studio.subscriptionStatus === "trialing" || studio.subscriptionStatus === "active";
}
