"use server";

import { redirect } from "next/navigation";

import { verifyPassword } from "@/lib/auth/password";
import { grantHubAccess } from "@/lib/auth/session";
import { getHubPasswordHash, getPublicBrandBySlug } from "@/lib/db/brands";
import { ensureSeeded } from "@/lib/db/seed";

export async function unlockHub(formData: FormData): Promise<void> {
  await ensureSeeded();

  const slug = String(formData.get("slug") ?? "");
  const password = String(formData.get("password") ?? "");

  const result = getPublicBrandBySlug(slug);
  if (!result || !result.published) redirect("/");

  const hash = getHubPasswordHash(result.id);
  if (!hash) redirect(`/b/${slug}`);

  if (await verifyPassword(password, hash)) {
    await grantHubAccess(result.id);
    redirect(`/b/${slug}`);
  }

  redirect(`/b/${slug}?wrong=1`);
}
