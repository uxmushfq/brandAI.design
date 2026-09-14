import Link from "next/link";
import { redirect } from "next/navigation";

import { Column, Frame } from "@/components/ui/Frame";
import { Button, ErrorNote, Field, TextInput } from "@/components/studio/ui";
import { currentStudio } from "@/lib/auth/session";
import { ensureSeeded } from "@/lib/db/seed";
import { PLAN } from "@/lib/db/studios";
import { signUpAction } from "../actions";

export const metadata = { title: "Sign up — BrandAI.design" };

export default async function SignUpPage({
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
          <h1 className="text-h1 font-medium">Create your studio</h1>
          <p className="mt-4 text-small text-graphite">
            {PLAN.trialDays} days free, then ${PLAN.pricePerMonth} a month for{" "}
            {PLAN.includedBrands} brands. No card needed to start.
          </p>

          <form action={signUpAction} className="mt-8">
            <Field
              label="Studio name"
              name="studioName"
              hint="This appears in the footer of every hub you send."
            >
              <TextInput name="studioName" required maxLength={80} />
            </Field>
            <Field label="Email" name="email">
              <TextInput name="email" type="email" required autoComplete="email" />
            </Field>
            <Field label="Password" name="password" hint="At least 8 characters.">
              <TextInput
                name="password"
                type="password"
                required
                autoComplete="new-password"
              />
            </Field>
            {error ? <ErrorNote>{error}</ErrorNote> : null}
            <div className="mt-5">
              <Button>Create studio</Button>
            </div>
          </form>

          <p className="mt-8 text-small text-graphite">
            Already have an account?{" "}
            <Link href="/login" className="underline underline-offset-4">
              Log in
            </Link>
            .
          </p>
        </Column>
      </Frame>
    </main>
  );
}
