import Link from "next/link";
import { redirect } from "next/navigation";

import { Column, Frame } from "@/components/ui/Frame";
import { Empty } from "@/components/studio/ui";
import { currentStudio } from "@/lib/auth/session";
import { listBrandsForStudio } from "@/lib/db/brands";
import { PLAN } from "@/lib/db/studios";
import { formatDate } from "@/lib/format";

export const metadata = { title: "Brands — BrandAI.design" };

export default async function DashboardPage() {
  const studio = await currentStudio();
  if (!studio) redirect("/login");

  const brands = listBrandsForStudio(studio.id);
  const atLimit = brands.length >= PLAN.includedBrands;

  return (
    <main className="pt-12 pb-24">
      <Frame>
        <Column className="max-w-[840px]">
          <div className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-3">
            <h1 className="text-h1 font-medium">Brands</h1>
            <p className="font-mono text-value text-graphite">
              {brands.length} of {PLAN.includedBrands} used
            </p>
          </div>

          <div className="mt-8">
            {atLimit ? (
              <p className="text-small text-graphite">
                You have used all {PLAN.includedBrands} brands on your plan. Delete one,
                or{" "}
                <Link href="/billing" className="underline underline-offset-4">
                  change your plan
                </Link>
                .
              </p>
            ) : (
              <Link
                href="/brands/new"
                className="inline-block bg-ink px-4 py-2 text-small text-paper"
              >
                New brand
              </Link>
            )}
          </div>

          <div className="mt-10">
            {brands.length === 0 ? (
              <Empty>
                No brands yet. Start with the one you are closest to delivering — you
                can publish it as soon as the logos and colors are in.
              </Empty>
            ) : (
              <ul>
                {brands.map((brand) => (
                  <li key={brand.id} className="border-t border-rule py-5">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                      <h2 className="text-h2 font-medium">
                        <Link
                          href={`/brands/${brand.id}`}
                          className="underline decoration-rule underline-offset-4 hover:decoration-ink"
                        >
                          {brand.name}
                        </Link>
                      </h2>
                      <p className="text-small text-graphite">
                        {brand.published ? "Published" : "Draft"}
                        {brand.published && brand.hasPassword
                          ? ", password protected"
                          : ""}
                      </p>
                    </div>

                    {brand.description ? (
                      <p className="measure mt-1 text-small text-graphite">
                        {brand.description}
                      </p>
                    ) : null}

                    <p className="mt-3 font-mono text-value text-graphite">
                      {brand.counts.assets} logos, {brand.counts.colors} colors,{" "}
                      {brand.counts.typefaces} typefaces, {brand.counts.rules} rules
                    </p>

                    <p className="mt-3 flex flex-wrap items-baseline gap-x-5 gap-y-1">
                      <Link
                        href={`/brands/${brand.id}`}
                        className="font-mono text-value underline decoration-rule underline-offset-4 hover:decoration-ink"
                      >
                        Edit
                      </Link>
                      {brand.published ? (
                        <Link
                          href={`/b/${brand.slug}`}
                          className="font-mono text-value underline decoration-rule underline-offset-4 hover:decoration-ink"
                        >
                          Open hub
                        </Link>
                      ) : null}
                      <span className="font-mono text-value text-graphite">
                        Updated {formatDate(brand.updatedAt.slice(0, 10))}
                      </span>
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Column>
      </Frame>
    </main>
  );
}
