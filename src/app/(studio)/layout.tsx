import Link from "next/link";
import { redirect } from "next/navigation";

import { Frame } from "@/components/ui/Frame";
import { currentStudio } from "@/lib/auth/session";
import { ensureSeeded } from "@/lib/db/seed";
import { canEdit, trialDaysRemaining } from "@/lib/db/studios";
import { signOutAction } from "../(auth)/actions";

/**
 * Every studio-side page sits behind this layout, so the signed-out redirect and
 * the billing banner are decided in exactly one place.
 */
export default async function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await ensureSeeded();
  const studio = await currentStudio();
  if (!studio) redirect("/login");

  const trialDays = trialDaysRemaining(studio);
  const locked = !canEdit(studio);

  return (
    <div className="min-h-dvh">
      <header className="border-b border-rule">
        <Frame className="flex flex-wrap items-center justify-between gap-x-8 gap-y-3 py-4">
          <nav className="flex items-center gap-6">
            <Link href="/dashboard" className="text-small">
              {studio.name}
            </Link>
            <Link href="/dashboard" className="text-small text-graphite hover:text-ink">
              Brands
            </Link>
            <Link href="/billing" className="text-small text-graphite hover:text-ink">
              Billing
            </Link>
          </nav>

          <div className="flex items-center gap-5">
            <span className="font-mono text-value text-graphite">{studio.email}</span>
            <form action={signOutAction}>
              <button type="submit" className="cursor-pointer text-small text-graphite hover:text-ink">
                Log out
              </button>
            </form>
          </div>
        </Frame>
      </header>

      {locked ? (
        <div className="border-b border-rule bg-sheet">
          <Frame className="py-3">
            <p className="text-small">
              Editing is paused because the subscription is{" "}
              {studio.subscriptionStatus.replace("_", " ")}.{" "}
              <Link href="/billing" className="underline underline-offset-4">
                Fix billing
              </Link>{" "}
              to make changes again. Published hubs stay online.
            </p>
          </Frame>
        </div>
      ) : studio.subscriptionStatus === "trialing" && trialDays !== null ? (
        <div className="border-b border-rule">
          <Frame className="py-3">
            <p className="text-small text-graphite">
              {trialDays === 0
                ? "Your trial ends today."
                : `${trialDays} ${trialDays === 1 ? "day" : "days"} left in your trial.`}{" "}
              <Link href="/billing" className="underline underline-offset-4">
                Billing
              </Link>
            </p>
          </Frame>
        </div>
      ) : null}

      {children}
    </div>
  );
}
