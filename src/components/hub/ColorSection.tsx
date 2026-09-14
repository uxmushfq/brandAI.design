"use client";

import { type BrandColor } from "@/lib/brand/types";
import { dimAlphaFor, needsEdge, readableOn, toRgbString } from "@/lib/color";
import { useCopy } from "@/lib/use-copy";

/**
 * The one loud element on the page.
 *
 * Color is the part of a brand that is literally colorful and the part clients
 * actually reach for, so it is the part allowed to break the column and run edge to
 * edge. Everything around it stays ink on paper. The band earned the boldness by
 * being the content; we did not impose it.
 */
function Band({ color }: { color: BrandColor }) {
  const { state, copy } = useCopy();
  const foreground = readableOn(color.hex);
  const edge = needsEdge(color.hex);
  // Fading the secondary text is a luxury the band has to be able to afford.
  const dim = dimAlphaFor(color.hex, foreground);

  return (
    <button
      type="button"
      onClick={() => void copy(color.hex)}
      aria-label={`Copy the hex value for ${color.name}, ${color.hex}`}
      className="relative block w-full cursor-pointer text-left"
      style={{ backgroundColor: color.hex, color: foreground }}
    >
      {/* A band close in value to the page ground would otherwise dissolve into it,
          at the top edge and at the bottom of a run. */}
      {edge ? (
        <>
          <span
            aria-hidden
            className="absolute inset-x-0 top-0 h-px"
            style={{ backgroundColor: "var(--color-rule)" }}
          />
          <span
            aria-hidden
            className="absolute inset-x-0 bottom-0 h-px"
            style={{ backgroundColor: "var(--color-rule)" }}
          />
        </>
      ) : null}

      {/* The page's one motion: a hairline drawn under the band that answered the click. */}
      {state === "copied" ? (
        <span
          aria-hidden
          className="animate-edge-draw absolute inset-x-0 bottom-0 h-0.5"
          style={{ backgroundColor: foreground }}
        />
      ) : null}

      <div className="mx-auto w-full max-w-[1180px] px-6 md:px-10">
        <div className="flex min-h-[7rem] flex-col justify-center gap-3 py-6 sm:min-h-[8.5rem] sm:flex-row sm:items-center sm:justify-between sm:gap-10">
          <div className="max-w-[34rem]">
            <p className="text-h2 font-medium">{color.name}</p>
            {color.note ? (
              <p className="mt-1.5 text-small" style={{ opacity: dim }}>
                {color.note}
              </p>
            ) : null}
          </div>

          <div className="shrink-0 sm:text-right">
            <p className="font-mono text-lead">{color.hex}</p>
            <p className="mt-1 font-mono text-value" style={{ opacity: dim }}>
              {state === "copied" ? (
                <span className="animate-copy-in inline-block">Copied</span>
              ) : state === "failed" ? (
                <span>Select the hex and press Ctrl+C</span>
              ) : (
                toRgbString(color.hex)
              )}
            </p>
          </div>
        </div>
      </div>

      <span role="status" aria-live="polite" className="sr-only">
        {state === "copied" ? `${color.name} ${color.hex} copied` : ""}
      </span>
    </button>
  );
}

export function ColorBands({ colors }: { colors: BrandColor[] }) {
  return (
    <>
      {colors.map((color) => (
        <Band key={color.id} color={color} />
      ))}
    </>
  );
}
