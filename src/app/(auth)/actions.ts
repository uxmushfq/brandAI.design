"use server";

import { redirect } from "next/navigation";

import { endSession, startSession } from "@/lib/auth/session";
import { signIn, signUp } from "@/lib/db/studios";
import { ensureSeeded } from "@/lib/db/seed";

export async function signUpAction(formData: FormData): Promise<void> {
  await ensureSeeded();

  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const studioName = String(formData.get("studioName") ?? "");

  const result = await signUp(email, password, studioName);
  if (!result.ok) {
    redirect(`/signup?error=${encodeURIComponent(result.error)}`);
  }

  await startSession(result.studioId);
  redirect("/dashboard");
}

export async function signInAction(formData: FormData): Promise<void> {
  await ensureSeeded();

  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  const result = await signIn(email, password);
  if (!result.ok) {
    redirect(`/login?error=${encodeURIComponent(result.error)}`);
  }

  await startSession(result.studioId);
  redirect("/dashboard");
}

export async function signOutAction(): Promise<void> {
  await endSession();
  redirect("/login");
}
