import { CATEGORY_LABEL, type Brand, type BrandAsset } from "@/lib/brand/types";
import { relativeLuminance } from "@/lib/color";
import { formatBytes } from "@/lib/format";
import { Section } from "./Section";

/** The darkest color the brand actually owns, for wells that need a dark ground. */
function darkestColor(brand: Brand): string {
  let darkest = "#15171B";
  let lowest = Number.POSITIVE_INFINITY;
  for (const color of brand.colors) {
    const luminance = relativeLuminance(color.hex);
    if (luminance < lowest) {
      lowest = luminance;
      darkest = color.hex;
    }
  }
  return darkest;
}

function UsageNote({ label, children }: { label: string; children: string }) {
  return (
    <div className="grid grid-cols-[4rem_1fr] gap-x-3 gap-y-1 sm:grid-cols-[4.5rem_1fr]">
      <dt className="text-small text-graphite">{label}</dt>
      <dd className="measure text-small">{children}</dd>
    </div>
  );
}

function AssetRow({ asset, darkGround }: { asset: BrandAsset; darkGround: string }) {
  const onDark = asset.previewOn === "dark";
  const extension = asset.fileName.split(".").pop()?.toUpperCase() ?? "File";

  return (
    <article className="border-t border-rule py-10 first:border-t-0 first:pt-0">
      <div
        className="flex h-52 w-full items-center justify-center px-6"
        style={{
          backgroundColor: onDark ? darkGround : "var(--color-sheet)",
          boxShadow: onDark ? undefined : "inset 0 0 0 1px var(--color-rule)",
        }}
      >
        {/* Rendered through <img> rather than inlined: an uploaded SVG is untrusted
            markup, and <img> will not execute a script inside one. next/image is
            wrong here for the same reason — it would need dangerouslyAllowSVG. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={asset.path}
          alt={`${asset.fileName}, shown on ${onDark ? "a dark" : "a white"} ground`}
          className="max-h-24 max-w-[78%] object-contain"
        />
      </div>

      <div className="mt-5 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <p className="font-mono text-value">{asset.fileName}</p>
        <p className="text-small text-graphite">{CATEGORY_LABEL[asset.category]}</p>
      </div>

      <dl className="mt-5 space-y-3">
        {asset.usageDo ? <UsageNote label="Use">{asset.usageDo}</UsageNote> : null}
        {asset.usageDont ? <UsageNote label="Avoid">{asset.usageDont}</UsageNote> : null}
      </dl>

      <p className="mt-5">
        <a
          href={asset.path}
          download={asset.fileName}
          className="font-mono text-value underline decoration-rule underline-offset-4 transition-colors hover:decoration-ink"
        >
          Download {extension}
        </a>
        <span className="ml-3 font-mono text-value text-graphite">
          {formatBytes(asset.byteSize)}
        </span>
      </p>
    </article>
  );
}

export function LogoSection({ brand }: { brand: Brand }) {
  const assets = [...brand.assets].sort((a, b) => a.sortOrder - b.sortOrder);
  const darkGround = darkestColor(brand);

  return (
    <Section
      id="logos"
      title="Logos"
      intro="Every approved file, with the rule that goes with it. Use one of these rather than pulling a logo off the website."
    >
      <div>
        {assets.map((asset) => (
          <AssetRow key={asset.id} asset={asset} darkGround={darkGround} />
        ))}
      </div>
    </Section>
  );
}
