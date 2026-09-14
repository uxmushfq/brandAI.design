import type { Brand } from "@/lib/brand/types";
import { Column, Frame } from "@/components/ui/Frame";
import { formatDate } from "@/lib/format";
import { SECTIONS } from "./sections";

export function Masthead({ brand }: { brand: Brand }) {
  return (
    <header className="pt-14 md:pt-24">
      <Frame>
        <Column>
          <h1 className="text-display font-medium">{brand.name}</h1>
          <p className="measure mt-5 text-lead text-graphite">
            {brand.description}
          </p>

          <div className="mt-10 flex flex-wrap items-baseline gap-x-10 gap-y-2 border-t border-rule pt-5 text-small text-graphite">
            <p>Brand guidelines, prepared by {brand.studio.name}.</p>
            <p className="font-mono text-value">
              Updated {formatDate(brand.updatedAt)}
            </p>
          </div>

          {/* The margin index is a desktop affordance; on a phone it reads inline, once. */}
          <nav aria-label="Sections" className="mt-8 lg:hidden">
            <ul className="flex flex-wrap gap-x-6 gap-y-2">
              {SECTIONS.map((section) => (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    className="text-small underline decoration-rule underline-offset-4 transition-colors hover:decoration-ink"
                  >
                    {section.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </Column>
      </Frame>
    </header>
  );
}
