import Link from "next/link";
import { redirect } from "next/navigation";

import { Column, Frame } from "@/components/ui/Frame";
import { Button, ErrorNote, Field, TextInput } from "@/components/studio/ui";
import { currentStudio } from "@/lib/auth/session";
import { DEMO_EMAIL, DEMO_PASSWORD } from "@/lib/db/seed";
import { ensureSeeded } from "@/lib/db/seed";
import { signInAction } from "../actions";

export const metadata = { title: "Log in — BrandAI.design" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  await ensureSeeded();
  if (await currentStudio()) redirect("/dashboard");

  const { error } = await searchParams;

  return (
    <main className="pt-20 pb-20">
      <Frame>
        <Column className="max-w-sm">
          <h1 className="text-h1 font-medium">Log in</h1>

          <form action={signInAction} className="mt-8">
            <Field label="Email" name="email">
              <TextInput name="email" type="email" required autoComplete="email" />
            </Field>
            <Field label="Password" name="password">
              <TextInput
                name="password"
                type="password"
                required
                autoComplete="current-password"
              />
            </Field>
            {error ? <ErrorNote>{error}</ErrorNote> : null}
            <div className="mt-5">
              <Button>Log in</Button>
            </div>
          </form>

          <p className="mt-8 text-small text-graphite">
            No account yet?{" "}
            <Link href="/signup" className="underline underline-offset-4">
              Create one
            </Link>
            .
          </p>

          <div className="mt-8 border-t border-rule pt-5">
            <p className="text-small text-graphite">
              The seeded demo studio, which owns the Meridian Ferries brand:
            </p>
            <p className="mt-2 font-mono text-value">
              {DEMO_EMAIL}
              <br />
              {DEMO_PASSWORD}
            </p>
          </div>
        </Column>
      </Frame>
    </main>
  );
}
