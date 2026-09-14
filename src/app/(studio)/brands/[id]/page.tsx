import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { Column, Frame } from "@/components/ui/Frame";
import { ErrorNote } from "@/components/studio/ui";
import { IdentityPanel } from "@/components/studio/editor/IdentityPanel";
import { LogosPanel } from "@/components/studio/editor/LogosPanel";
import { ColorPanel } from "@/components/studio/editor/ColorPanel";
import { TypePanel } from "@/components/studio/editor/TypePanel";
import { RulesPanel } from "@/components/studio/editor/RulesPanel";
import { PublishPanel } from "@/components/studio/editor/PublishPanel";
import { currentStudio } from "@/lib/auth/session";
import { getBrandForStudio } from "@/lib/db/brands";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const studio = await currentStudio();
  if (!studio) return { title: "Editor" };
  const { id } = await params;
  const owned = getBrandForStudio(id, studio.id);
  return { title: owned ? `${owned.brand.name} — Editor` : "Editor" };
}

const SECTIONS = [
  { id: "identity", label: "Identity" },
  { id: "logos", label: "Logos" },
  { id: "color", label: "Color" },
  { id: "type", label: "Type" },
  { id: "rules", label: "Rules" },
  { id: "publish", label: "Publish" },
];

export default async function BrandEditorPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const studio = await currentStudio();
  if (!studio) redirect("/login");

  const { id } = await params;
  const owned = getBrandForStudio(id, studio.id);
  // Not found and not yours are the same answer, so this cannot be used to
  // discover that another studio's brand exists.
  if (!owned) notFound();

  const { brand, row } = owned;
  const { error } = await searchParams;

  return (
    <main className="pt-10 pb-24">
      <Frame>
        <Column className="max-w-[840px]">
          <p className="text-small text-graphite">
            <Link href="/dashboard" className="underline underline-offset-4">
              Brands
            </Link>
          </p>

          <div className="mt-3 flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2">
            <h1 className="text-h1 font-medium">{brand.name}</h1>
            <p className="text-small text-graphite">
              {row.published ? "Published" : "Draft"}
            </p>
          </div>

          <nav aria-label="Editor sections" className="mt-6 border-t border-rule pt-4">
            <ul className="flex flex-wrap gap-x-6 gap-y-2">
              {SECTIONS.map((section) => (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    className="text-small underline decoration-rule underline-offset-4 hover:decoration-ink"
                  >
                    {section.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {error ? (
            <div className="mt-6">
              <ErrorNote>{error}</ErrorNote>
            </div>
          ) : null}

          <div className="mt-10">
            <div id="identity" className="scroll-mt-6">
              <IdentityPanel brand={brand} slug={row.slug} published={row.published} />
            </div>
            <div id="logos" className="scroll-mt-6">
              <LogosPanel brand={brand} />
            </div>
            <div id="color" className="scroll-mt-6">
              <ColorPanel brand={brand} />
            </div>
            <div id="type" className="scroll-mt-6">
              <TypePanel brand={brand} />
            </div>
            <div id="rules" className="scroll-mt-6">
              <RulesPanel brand={brand} />
            </div>
            <div id="publish" className="scroll-mt-6">
              <PublishPanel
                brand={brand}
                slug={row.slug}
                published={row.published}
                hasPassword={row.passwordHash !== null}
              />
            </div>
          </div>
        </Column>
      </Frame>
    </main>
  );
}
