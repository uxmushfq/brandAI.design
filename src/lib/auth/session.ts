import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

import { read } from "@/lib/db/store";
import type { DbStudio } from "@/lib/db/schema";

const STUDIO_COOKIE = "brandai_studio";
const HUB_COOKIE_PREFIX = "brandai_hub_";

/**
 * Signed cookies, so a session cannot be forged by editing the value.
 *
 * The secret falls back to a fixed development string when unset. That is fine for
 * a wireframe running on one machine and is not fine in production, which is why
 * it is loud about it rather than silently generating one per boot.
 */
function secret(): string {
  const configured = process.env.SESSION_SECRET;
  if (configured && configured.length >= 16) return configured;
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "SESSION_SECRET must be set to at least 16 characters in production.",
    );
  }
  return "development-only-session-secret";
}

function sign(value: string): string {
  const mac = createHmac("sha256", secret()).update(value).digest("base64url");
  return `${value}.${mac}`;
}

function unsign(signed: string | undefined): string | null {
  if (!signed) return null;
  const index = signed.lastIndexOf(".");
  if (index <= 0) return null;
  const value = signed.slice(0, index);
  const mac = signed.slice(index + 1);
  const expected = createHmac("sha256", secret()).update(value).digest("base64url");
  const a = Buffer.from(mac);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  return value;
}

const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  secure: process.env.NODE_ENV === "production",
};

export async function startSession(studioId: string): Promise<void> {
  const jar = await cookies();
  jar.set(STUDIO_COOKIE, sign(studioId), {
    ...COOKIE_OPTIONS,
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function endSession(): Promise<void> {
  const jar = await cookies();
  jar.delete(STUDIO_COOKIE);
}

/** The signed-in studio, or null. Every studio-side page starts here. */
export async function currentStudio(): Promise<DbStudio | null> {
  const jar = await cookies();
  const studioId = unsign(jar.get(STUDIO_COOKIE)?.value);
  if (!studioId) return null;
  return read((db) => db.studios.find((s) => s.id === studioId) ?? null);
}

/* Brand hub passwords. Not accounts — a shared secret on a link. */

export async function grantHubAccess(brandId: string): Promise<void> {
  const jar = await cookies();
  jar.set(`${HUB_COOKIE_PREFIX}${brandId}`, sign(brandId), {
    ...COOKIE_OPTIONS,
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function hasHubAccess(brandId: string): Promise<boolean> {
  const jar = await cookies();
  return unsign(jar.get(`${HUB_COOKIE_PREFIX}${brandId}`)?.value) === brandId;
}
