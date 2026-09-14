"use client";

import { useState } from "react";
import type { Brand } from "@/lib/brand/types";
import { downloadText, downloadZip } from "@/lib/download";
import { formatBytes } from "@/lib/format";
import { useCopy } from "@/lib/use-copy";

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
  const { state, copy } = useCopy();
  const [zipState, setZipState] = useState<"idle" | "working" | "failed">("idle");

  const assetBytes = brand.assets.reduce((sum, a) => sum + a.byteSize, 0);

  async function handleZip() {
    setZipState("working");
    try {
      await downloadZip(
        [
          ...brand.assets.map((asset) => ({
            name: `assets/${asset.fileName}`,
            url: asset.path,
          })),
          { name: "design.md", text: designMd },
          { name: "tokens.json", text: tokensJson },
          { name: "brand-context.txt", text: context },
        ],
        `${brand.slug}-brand-assets.zip`,
      );
      setZipState("idle");
    } catch {
      setZipState("failed");
    }
  }

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

        <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2">
          <button
            type="button"
            onClick={() => void copy(context)}
            className="cursor-pointer bg-ink px-5 py-2.5 text-small text-paper transition-opacity hover:opacity-85"
          >
            {state === "copied" ? (
              <span className="animate-copy-in inline-block">
                Copied to clipboard
              </span>
            ) : (
              "Copy brand context"
            )}
          </button>
          <span className="font-mono text-value text-graphite">
            {context.length.toLocaleString("en-GB")} characters
          </span>
        </div>

        {state === "failed" ? (
          <p className="mt-3 text-small text-alert">
            Your browser blocked the clipboard. Select the text above and press
            Ctrl+C.
          </p>
        ) : null}

        <span role="status" aria-live="polite" className="sr-only">
          {state === "copied" ? "Brand context copied to clipboard" : ""}
        </span>
      </div>

      <div className="mt-12">
        <FileRow
          name="design.md"
          description="For a code editor. Drop it beside your project and Cursor, Copilot or Claude Code will read the brand as context."
          meta={formatBytes(new Blob([designMd]).size)}
          action="Download design.md"
          onClick={() => downloadText(designMd, "design.md", "text/markdown;charset=utf-8")}
        />
        <FileRow
          name="tokens.json"
          description="Colors and the type scale as design tokens, in the format Style Dictionary and Tokens Studio read."
          meta={formatBytes(new Blob([tokensJson]).size)}
          action="Download tokens.json"
          onClick={() =>
            downloadText(tokensJson, "tokens.json", "application/json;charset=utf-8")
          }
        />
        <FileRow
          name="Everything"
          description="All logo files, plus design.md, tokens.json and the brand context, in one archive."
          meta={`${brand.assets.length} files, about ${formatBytes(assetBytes)}`}
          action={zipState === "working" ? "Preparing the archive…" : "Download zip"}
          disabled={zipState === "working"}
          onClick={() => void handleZip()}
          error={
            zipState === "failed"
              ? "The archive could not be built. Reload the page and try again, or download the files one at a time."
              : null
          }
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
  onClick,
  disabled = false,
  error = null,
}: {
  name: string;
  description: string;
  meta: string;
  action: string;
  onClick: () => void;
  disabled?: boolean;
  error?: string | null;
}) {
  return (
    <div className="border-t border-rule py-6">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <p className="font-mono text-value">{name}</p>
        <p className="font-mono text-value text-graphite">{meta}</p>
      </div>
      <p className="measure mt-2 text-small text-graphite">{description}</p>
      <p className="mt-4">
        <button
          type="button"
          onClick={onClick}
          disabled={disabled}
          className="cursor-pointer font-mono text-value underline decoration-rule underline-offset-4 transition-colors hover:decoration-ink disabled:cursor-default disabled:text-graphite disabled:no-underline"
        >
          {action}
        </button>
      </p>
      {error ? <p className="mt-3 text-small text-alert">{error}</p> : null}
    </div>
  );
}
