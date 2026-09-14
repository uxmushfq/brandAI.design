"use client";

import { useEffect, useState } from "react";
import { SECTIONS } from "./sections";

/**
 * The right-margin index.
 *
 * The active mark is state, not motion: it changes instantly as you pass a heading
 * and nothing about it animates. On a page this long, an index that doesn't say
 * where you are is furniture.
 */
export function MarginIndex() {
  const [active, setActive] = useState<string | null>(null);
  const [covered, setCovered] = useState(false);

  /**
   * The color bands run edge to edge and pass underneath this index, where graphite
   * links disappear into a dark navy. Rather than plate the index or tint it to
   * whatever is behind, it stands down for the length of the bands — the one place
   * the page is deliberately handed over to the client's color.
   */
  useEffect(() => {
    const bands = document.querySelectorAll("#color button");
    const first = bands[0];
    const last = bands[bands.length - 1];
    if (!first || !last) return;

    let frame = 0;
    const measure = () => {
      frame = 0;
      const top = first.getBoundingClientRect().top;
      const bottom = last.getBoundingClientRect().bottom;
      // The strip this index occupies: 4.5rem from the top, roughly 260px tall.
      setCovered(top < 332 && bottom > 56);
    };
    const onScroll = () => {
      if (frame === 0) frame = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (frame !== 0) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  useEffect(() => {
    const targets = SECTIONS.map((s) => document.getElementById(s.id)).filter(
      (el): el is HTMLElement => el !== null,
    );
    if (targets.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      // A band across the upper third: a section is "current" once its heading
      // has settled near the top, not the instant its first pixel appears.
      { rootMargin: "-10% 0px -70% 0px", threshold: 0 },
    );

    for (const target of targets) observer.observe(target);
    return () => observer.disconnect();
  }, []);

  return (
    <nav
      className={`margin-index transition-opacity duration-150 ${
        covered ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
      aria-hidden={covered}
      aria-label="Sections"
    >
      <ul className="border-t border-rule">
        {SECTIONS.map((section) => {
          const isActive = active === section.id;
          return (
            <li key={section.id} className="border-b border-rule">
              <a
                href={`#${section.id}`}
                aria-current={isActive ? "true" : undefined}
                className={`block py-2.5 text-small ${
                  isActive ? "text-ink" : "text-graphite hover:text-ink"
                }`}
              >
                {section.label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
