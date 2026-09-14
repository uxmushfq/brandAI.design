import { redirect } from "next/navigation";

import { Column, Frame } from "@/components/ui/Frame";
import { Button, ErrorNote, Field, TextArea, TextInput } from "@/components/studio/ui";
import { currentStudio } from "@/lib/auth/session";
import { createBrand, countBrandsForStudio } from "@/lib/db/brands";
import { PLAN, canEdit } from "@/lib/db/studios";

export const metadata = { title: "New brand — BrandAI.design" };

async function createBrandAction(formData: FormData): Promise<void> {
  "use server";

  const studio = await currentStudio();
  if (!studio) redirect("/login");
  if (!canEdit(studio)) redirect("/billing");

  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();

  if (name.length === 0) {
    redirect("/brands/new?error=Give+the+brand+a+name.");
  }
  if (countBrandsForStudio(studio.id) >= PLAN.includedBrands) {
    redirect("/brands/new?error=You+have+used+every+brand+on+your+plan.");
  }

  const id = await createBrand(studio.id, name, description);
  redirect(`/brands/${id}`);
}

export default async function NewBrandPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const studio = await currentStudio();
  if (!studio) redirect("/login");

  const { error } = await searchParams;

  return (
    <main className="pt-12 pb-24">
      <Frame>
        <Column className="max-w-lg">
          <h1 className="text-h1 font-medium">New brand</h1>
          <p className="measure mt-3 text-small text-graphite">
            Two things to start. Everything else goes in the editor, and nothing is
            visible to anyone until you publish.
          </p>

          <form action={createBrandAction} className="mt-8">
            <Field
              label="Brand name"
              name="name"
              hint="The client's name, as it should appear at the top of their hub."
            >
              <TextInput name="name" required maxLength={80} />
            </Field>
            <Field
              label="One-line description"
              name="description"
              hint="What the company does, in a sentence."
            >
              <TextArea name="description" rows={2} />
            </Field>
            {error ? <ErrorNote>{error}</ErrorNote> : null}
            <div className="mt-5">
              <Button>Create brand</Button>
            </div>
          </form>
        </Column>
      </Frame>
    </main>
  );
}
