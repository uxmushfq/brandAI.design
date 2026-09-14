import Link from "next/link";
import type { Brand } from "@/lib/brand/types";
import { Column, Frame } from "@/components/ui/Frame";
import { formatDate } from "@/lib/format";

/**
 * The studio signs the work; we sign the paper it is printed on, and no louder
 * than that. This line is how the studio's other clients find out we exist, so it
 * has to be present and has to stay quiet.
 */
export function HubFooter({ brand }: { brand: Brand }) {
  const { studio } = brand;

  return (
    <footer className="mt-24 pb-20 md:mt-32">
      <Frame>
        <Column>
          <div className="border-t border-rule pt-6">
            <div className="flex flex-wrap items-start justify-between gap-x-10 gap-y-6">
              <div className="flex items-center gap-3">
                {studio.logoPath ? (
                  // Studio logos are uploaded SVGs. next/image would need
                  // dangerouslyAllowSVG, which is the opposite of what untrusted
                  // markup should get.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={studio.logoPath}
                    alt=""
                    aria-hidden
                    className="h-7 w-7 shrink-0"
                  />
                ) : null}
                <div>
                  <p className="text-small">{studio.name}</p>
                  {studio.url ? (
                    <p>
                      <a
                        href={studio.url}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="font-mono text-value text-graphite underline decoration-rule underline-offset-4 transition-colors hover:decoration-ink hover:text-ink"
                      >
                        {studio.url.replace(/^https?:\/\//, "")}
                      </a>
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="sm:text-right">
                <p className="font-mono text-value text-graphite">
                  Updated {formatDate(brand.updatedAt)}
                </p>
                <p className="mt-1 font-mono text-value text-graphite">
                  Published with{" "}
                  <Link
                    href="/"
                    className="underline decoration-rule underline-offset-4 transition-colors hover:decoration-ink hover:text-ink"
                  >
                    BrandAI.design
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </Column>
      </Frame>
    </footer>
  );
}
