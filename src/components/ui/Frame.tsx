import type { ReactNode } from "react";

/**
 * The page frame. Everything — including the full-bleed color bands — aligns its
 * contents to this gutter, so the bands break the column without breaking the grid.
 */
export function Frame({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`mx-auto w-full max-w-[1180px] px-6 md:px-10 ${className}`}>
      {children}
    </div>
  );
}

/**
 * The reading column. Held left inside the frame rather than centered: the asymmetry
 * leaves the right margin for the index, and a document reads better off-center than
 * a hero does.
 */
export function Column({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`w-full max-w-[680px] ${className}`}>{children}</div>;
}
