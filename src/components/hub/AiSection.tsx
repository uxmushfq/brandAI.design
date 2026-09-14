import type { Brand } from "@/lib/brand/types";
import { formatBytes } from "@/lib/format";
import { CopyContext } from "./CopyContext";

/**
 * Everything here is generated from the brand data above by pure functions, so a
 * studio cannot publish guidelines that say one thing and a design.md that says
 * another. That is the whole point of the section.
 */
export function AiSection({
  brand,
  context,
  designMd,
  tokensJson,
}: {
  brand: Brand;
  context: string;
  designMd: string;
  tokensJson: string;
}) {
  const assetBytes = brand.assets.reduce((sum, a) => sum + a.byteSize, 0);

  return (
    <div>
      <div className="border-t border-rule pt-6">
        <h3 className="text-h2 font-medium">Brand context</h3>
        <p className="measure mt-3 text-graphite">
          Paste this into ChatGPT, Claude, v0, or Framer Agent before you ask for
          anything. It is written as instructions, so the tool follows it instead of
          reaching for a default.
        </p>

        <div className="mt-6 bg-sheet p-5 shadow-[inset_0_0_0_1px_var(--color-rule)] sm:p-6">
          <pre className="max-h-80 overflow-auto font-mono text-value whitespace-pre-wrap">
            {context}
          </pre>
        </div>

        <CopyContext context={context} />
      </div>

      <div className="mt-12">
        <FileRow
          name="design.md"
          description="For a code editor. Drop it beside your project and Cursor, Copilot or Claude Code will read the brand as context."
          meta={formatBytes(Buffer.byteLength(designMd))}
          action="Download design.md"
          href={`/api/brands/${brand.id}/design-md`}
        />
        <FileRow
          name="tokens.json"
          description="Colors and the type scale as design tokens, in the format Style Dictionary and Tokens Studio read."
          meta={formatBytes(Buffer.byteLength(tokensJson))}
          action="Download tokens.json"
          href={`/api/brands/${brand.id}/tokens`}
        />
        <FileRow
          name="Everything"
          description="All logo files, plus design.md, tokens.json and the brand context, in one archive."
          meta={`${brand.assets.length} files, about ${formatBytes(assetBytes)}`}
          action="Download zip"
          href={`/api/brands/${brand.id}/export`}
        />
      </div>
    </div>
  );
}

function FileRow({
  name,
  description,
  meta,
  action,
  href,
}: {
  name: string;
  description: string;
  meta: string;
  action: string;
  href: string;
}) {
  return (
    <div className="border-t border-rule py-6">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <p className="font-mono text-value">{name}</p>
        <p className="font-mono text-value text-graphite">{meta}</p>
      </div>
      <p className="measure mt-2 text-small text-graphite">{description}</p>
      <p className="mt-4">
        <a
          href={href}
          className="font-mono text-value underline decoration-rule underline-offset-4 transition-colors hover:decoration-ink"
        >
          {action}
        </a>
      </p>
    </div>
  );
}
