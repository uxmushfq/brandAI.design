import Link from "next/link";
import { Column, Frame } from "@/components/ui/Frame";

/**
 * Placeholder. The marketing page is the last thing built, once the product has
 * settled enough to describe honestly.
 */
export default function Home() {
  return (
    <main className="pt-24 pb-20">
      <Frame>
        <Column>
          <h1 className="text-h1 font-medium">BrandAI.design</h1>
          <p className="measure mt-5 text-lead text-graphite">
            Hosted brand hubs for design studios. Build the brand once, send the
            client a link that holds the guidelines, the files, and everything their
            AI tools need to use it correctly.
          </p>

          <div className="mt-10 border-t border-rule pt-6">
            <p className="text-small text-graphite">
              The marketing page comes last. For now, here is what a client sees.
            </p>
            <p className="mt-4">
              <Link
                href="/b/meridian"
                className="inline-block bg-ink px-5 py-2.5 text-small text-paper transition-opacity hover:opacity-85"
              >
                Open the Meridian Ferries hub
              </Link>
            </p>
          </div>
        </Column>
      </Frame>
    </main>
  );
}
