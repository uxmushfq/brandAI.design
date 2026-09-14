import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getBrandBySlug, listBrandSlugs } from "@/lib/brand/query";
import { generateContext } from "@/lib/generate/context";
import { generateDesignMd } from "@/lib/generate/design-md";
import { generateTokensJson } from "@/lib/generate/tokens";

import { Masthead } from "@/components/hub/Masthead";
import { MarginIndex } from "@/components/hub/MarginIndex";
import { LogoSection } from "@/components/hub/LogoSection";
import { ColorSection } from "@/components/hub/ColorSectionWrapper";
import { TypeSection } from "@/components/hub/TypeSection";
import { RulesSection } from "@/components/hub/RulesSection";
import { AiSection } from "@/components/hub/AiSection";
import { HubFooter } from "@/components/hub/HubFooter";
import { Section } from "@/components/hub/Section";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://brandai.design";

export function generateStaticParams() {
  return listBrandSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const brand = getBrandBySlug(slug);
  if (!brand) return { title: "Brand not found" };

  return {
    title: `${brand.name} — Brand guidelines`,
    description: brand.description,
    openGraph: {
      title: `${brand.name} — Brand guidelines`,
      description: brand.description,
      type: "website",
    },
  };
}

export default async function BrandHubPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const brand = getBrandBySlug(slug);
  if (!brand) notFound();

  const hubUrl = `${SITE_URL}/b/${brand.slug}`;

  // Pure functions over the same object the page renders, so the files a client
  // downloads can never disagree with the guidelines they are reading.
  const context = generateContext(brand, hubUrl);
  const designMd = generateDesignMd(brand, hubUrl);
  const tokensJson = generateTokensJson(brand);

  return (
    <>
      <a
        href="#logos"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-ink focus:px-4 focus:py-2 focus:text-small focus:text-paper"
      >
        Skip to the guidelines
      </a>

      <MarginIndex />

      <main>
        <Masthead brand={brand} />
        <LogoSection brand={brand} />
        <ColorSection brand={brand} />
        <TypeSection brand={brand} />
        <RulesSection brand={brand} />

        <Section
          id="use-with-ai"
          title="Use with AI"
          intro="Your tools can get this brand right if you hand them the right file. These three are generated from the guidelines above, so they stay in step with them."
        >
          <AiSection
            brand={brand}
            context={context}
            designMd={designMd}
            tokensJson={tokensJson}
          />
        </Section>

        <HubFooter brand={brand} />
      </main>
    </>
  );
}
