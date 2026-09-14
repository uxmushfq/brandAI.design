import { redirect } from "next/navigation";

import { Column, Frame } from "@/components/ui/Frame";
import { Button, Note, Panel } from "@/components/studio/ui";
import { currentStudio } from "@/lib/auth/session";
import { listBrandsForStudio } from "@/lib/db/brands";
import { PLAN, setSubscriptionStatus, trialDaysRemaining } from "@/lib/db/studios";

export const metadata = { title: "Billing — BrandAI.design" };

/**
 * Stripe is not wired up yet — there are no keys and no webhook endpoint. These
 * buttons move the studio's subscription status directly so the states the rest of
 * the app depends on can actually be exercised: what a past-due studio sees, and
 * that their published hubs stay online regardless.
 */
async function setStatusAction(formData: FormData): Promise<void> {
  "use server";

  const studio = await currentStudio();
  if (!studio) redirect("/login");

  const status = String(formData.get("status") ?? "");
  if (!["trialing", "active", "past_due", "canceled"].includes(status)) {
    redirect("/billing");
  }

  await setSubscriptionStatus(studio.id, status as "trialing" | "active" | "past_due" | "canceled");
  redirect("/billing");
}

const STATUS_COPY: Record<string, string> = {
  trialing: "On trial",
  active: "Active",
  past_due: "Payment failed",
  canceled: "Canceled",
};

export default async function BillingPage() {
  const studio = await currentStudio();
  if (!studio) redirect("/login");

  const brands = listBrandsForStudio(studio.id);
  const published = brands.filter((b) => b.published).length;
  const trialDays = trialDaysRemaining(studio);

  return (
    <main className="pt-12 pb-24">
      <Frame>
        <Column className="max-w-[680px]">
          <h1 className="text-h1 font-medium">Billing</h1>

          <Panel title="Your plan">
            <dl className="text-small">
              <div className="flex justify-between border-t border-rule py-3">
                <dt className="text-graphite">Plan</dt>
                <dd>
                  {PLAN.name}, ${PLAN.pricePerMonth} a month
                </dd>
              </div>
              <div className="flex justify-between border-t border-rule py-3">
                <dt className="text-graphite">Status</dt>
                <dd>{STATUS_COPY[studio.subscriptionStatus]}</dd>
              </div>
              {studio.subscriptionStatus === "trialing" && trialDays !== null ? (
                <div className="flex justify-between border-t border-rule py-3">
                  <dt className="text-graphite">Trial</dt>
                  <dd>
                    {trialDays} {trialDays === 1 ? "day" : "days"} left
                  </dd>
                </div>
              ) : null}
              <div className="flex justify-between border-t border-rule py-3">
                <dt className="text-graphite">Brands</dt>
                <dd>
                  {brands.length} of {PLAN.includedBrands}, {published} published
                </dd>
              </div>
            </dl>
          </Panel>

          <Panel
            title="What happens if payment fails"
            description="Worth stating plainly, because it is the decision that matters most here."
          >
            <Note>
              A failed payment locks this editor. It never takes a published hub
              offline. Your client opening a dead link because a card expired would
              be your reputation breaking, not ours, so the hubs stay up and we chase
              you instead.
            </Note>
          </Panel>

          <Panel
            title="Stripe"
            description="Not connected yet. Until it is, these move the subscription status directly so the rest of the app can be tested against each state."
          >
            <form action={setStatusAction} className="flex flex-wrap gap-3">
              <Button name="status" value="trialing" variant="quiet">
                Set to trialing
              </Button>
              <Button name="status" value="active" variant="quiet">
                Set to active
              </Button>
              <Button name="status" value="past_due" variant="quiet">
                Set to payment failed
              </Button>
              <Button name="status" value="canceled" variant="quiet">
                Set to canceled
              </Button>
            </form>
          </Panel>
        </Column>
      </Frame>
    </main>
  );
}
