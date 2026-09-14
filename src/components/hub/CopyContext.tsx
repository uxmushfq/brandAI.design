"use client";

import { useCopy } from "@/lib/use-copy";

/** The only interactive part of the Use with AI section. */
export function CopyContext({ context }: { context: string }) {
  const { state, copy } = useCopy();

  return (
    <>
      <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2">
        <button
          type="button"
          onClick={() => void copy(context)}
          className="cursor-pointer bg-ink px-5 py-2.5 text-small text-paper transition-opacity hover:opacity-85"
        >
          {state === "copied" ? (
            <span className="animate-copy-in inline-block">Copied to clipboard</span>
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
          Your browser blocked the clipboard. Select the text above and press Ctrl+C.
        </p>
      ) : null}

      <span role="status" aria-live="polite" className="sr-only">
        {state === "copied" ? "Brand context copied to clipboard" : ""}
      </span>
    </>
  );
}
