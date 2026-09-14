import type { ReactNode } from "react";
import { Column, Frame } from "@/components/ui/Frame";

/**
 * A section opens with a hairline and a heading. No cards, no shadows, no corners —
 * structure comes from rules and space, which is what a specimen sheet does and what
 * keeps our chrome from competing with the work it frames.
 */
export function SectionHeading({
  id,
  title,
  intro,
}: {
  id: string;
  title: string;
  intro?: string;
}) {
  return (
    <Frame>
      <Column>
        <div className="border-t border-rule pt-5">
          <h2 id={`${id}-heading`} className="text-h2 font-medium">
            {title}
          </h2>
          {intro ? (
            <p className="measure mt-3 text-graphite">{intro}</p>
          ) : null}
        </div>
      </Column>
    </Frame>
  );
}

export function Section({
  id,
  title,
  intro,
  children,
  bleed = false,
}: {
  id: string;
  title: string;
  intro?: string;
  children: ReactNode;
  /** Set when the section renders its own full-width content past the column. */
  bleed?: boolean;
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-heading`}
      className="scroll-mt-10 pt-16 md:pt-24"
    >
      <SectionHeading id={id} title={title} intro={intro} />
      {bleed ? (
        <div className="mt-10">{children}</div>
      ) : (
        <Frame>
          <Column className="mt-10">{children}</Column>
        </Frame>
      )}
    </section>
  );
}

/** A quiet label above a run of items. Sentence case, never a tracked-out eyebrow. */
export function GroupLabel({ children }: { children: ReactNode }) {
  return <p className="text-small text-graphite">{children}</p>;
}
