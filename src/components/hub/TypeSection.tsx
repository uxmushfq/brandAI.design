import type { Brand, BrandTypeface, TypeScaleStep } from "@/lib/brand/types";
import { Section } from "./Section";

const ROLE_LABEL: Record<BrandTypeface["role"], string> = {
  display: "Display",
  body: "Body",
};

/**
 * Only families we can legally serve get a real specimen.
 *
 * Family names come from studio input, so the value is checked against a strict
 * pattern before it is ever interpolated into a URL.
 */
function googleFontsHref(face: BrandTypeface): string | null {
  if (!face.webfontFamily) return null;
  if (!/^[A-Za-z0-9][A-Za-z0-9 ]{0,63}$/.test(face.webfontFamily)) return null;
  const weights = Array.from(new Set(face.scale.map((s) => s.weight))).sort(
    (a, b) => a - b,
  );
  const list = weights.length > 0 ? weights.join(";") : "400";
  const family = face.webfontFamily.trim().replace(/\s+/g, "+");
  return `https://fonts.googleapis.com/css2?family=${family}:wght@${list}&display=swap`;
}

function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function ScaleRow({
  step,
  specimen,
  renderIn,
}: {
  step: TypeScaleStep;
  specimen: string;
  renderIn: string | null;
}) {
  return (
    <div className="border-t border-rule py-6">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <p className="text-small">{step.label}</p>
        <p className="font-mono text-value text-graphite">
          {step.sizePx}px / {step.lineHeight} / {step.weight} /{" "}
          {step.letterSpacingEm}em
        </p>
      </div>

      {renderIn ? (
        <p
          className="mt-4 overflow-hidden"
          style={{
            fontFamily: renderIn,
            fontSize: `${step.sizePx}px`,
            lineHeight: step.lineHeight,
            fontWeight: step.weight,
            letterSpacing: `${step.letterSpacingEm}em`,
          }}
        >
          {specimen}
        </p>
      ) : null}
    </div>
  );
}

function Typeface({ face, brand }: { face: BrandTypeface; brand: Brand }) {
  const href = googleFontsHref(face);
  const renderIn = href ? `"${face.webfontFamily}", sans-serif` : null;

  return (
    <article className="pb-12">
      {href ? <link rel="stylesheet" href={href} precedence="default" /> : null}

      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <h3 className="text-h2 font-medium">{face.familyName}</h3>
        <p className="text-small text-graphite">{ROLE_LABEL[face.role]}</p>
      </div>

      {face.note ? <p className="measure mt-3 text-graphite">{face.note}</p> : null}

      {face.sourceUrl ? (
        <p className="mt-3">
          <a
            href={face.sourceUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="font-mono text-value underline decoration-rule underline-offset-4 transition-colors hover:decoration-ink"
          >
            {hostOf(face.sourceUrl)}
          </a>
        </p>
      ) : null}

      {/* No specimen rather than a lookalike: showing this family in a substitute
          would misrepresent the brand, and the client would not know we had. */}
      {!renderIn ? (
        <p className="measure mt-6 border-l-2 border-rule pl-4 text-small text-graphite">
          {face.familyName} is a licensed typeface, so it is not rendered here. The
          sizes below are correct; the shapes are not ours to show. Buy or license it
          from the source above.
        </p>
      ) : null}

      <div className="mt-8">
        {face.scale.map((step) => (
          <ScaleRow
            key={step.label}
            step={step}
            renderIn={renderIn}
            specimen={step.sizePx >= 28 ? brand.name : brand.description}
          />
        ))}
      </div>
    </article>
  );
}

export function TypeSection({ brand }: { brand: Brand }) {
  const faces = [...brand.typefaces].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <Section
      id="type"
      title="Type"
      intro="The families, what each one is for, and the sizes they are set at."
    >
      <div>
        {faces.map((face) => (
          <Typeface key={face.id} face={face} brand={brand} />
        ))}
      </div>
    </Section>
  );
}
