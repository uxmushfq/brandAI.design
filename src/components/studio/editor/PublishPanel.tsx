import Link from "next/link";

import type { Brand } from "@/lib/brand/types";
import { Button, Field, Note, Panel, TextInput } from "@/components/studio/ui";
import {
  deleteBrandAction,
  removeHubPasswordAction,
  setHubPasswordAction,
  togglePublishAction,
} from "@/app/(studio)/brands/[id]/actions";

export function PublishPanel({
  brand,
  slug,
  published,
  hasPassword,
}: {
  brand: Brand;
  slug: string;
  published: boolean;
  hasPassword: boolean;
}) {
  const hubPath = `/b/${slug}`;

  return (
    <Panel
      title="Publish"
      description="Publishing puts the hub online at its link. Nothing is visible to anyone until you do."
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-3">
        <div>
          <p className="text-small">{published ? "Live" : "Not published"}</p>
          <p className="mt-1 font-mono text-value text-graphite">{hubPath}</p>
        </div>

        <form action={togglePublishAction}>
          <input type="hidden" name="brandId" value={brand.id} />
          <input type="hidden" name="publish" value={published ? "false" : "true"} />
          <Button variant={published ? "quiet" : "primary"}>
            {published ? "Unpublish" : "Publish brand"}
          </Button>
        </form>
      </div>

      {published ? (
        <p className="mt-4">
          <Link
            href={hubPath}
            className="font-mono text-value underline decoration-rule underline-offset-4 hover:decoration-ink"
          >
            Open the hub as your client sees it
          </Link>
        </p>
      ) : null}

      <div className="mt-8 border-t border-rule pt-5">
        <p className="text-small">
          Password {hasPassword ? "— on" : "— off"}
        </p>
        <Note>
          {hasPassword
            ? "Anyone opening the link is asked for the password first. Send it separately from the link itself."
            : "Off means anyone with the link can read the guidelines. Add a password if the work is not announced yet."}
        </Note>

        <form action={setHubPasswordAction} className="mt-4 max-w-sm">
          <input type="hidden" name="brandId" value={brand.id} />
          <Field label={hasPassword ? "Change password" : "Set a password"} name="password">
            <TextInput name="password" type="text" required />
          </Field>
          <Button variant="quiet">{hasPassword ? "Change password" : "Set password"}</Button>
        </form>

        {hasPassword ? (
          <form action={removeHubPasswordAction} className="mt-3">
            <input type="hidden" name="brandId" value={brand.id} />
            <Button variant="quiet">Remove password</Button>
          </form>
        ) : null}
      </div>

      <div className="mt-8 border-t border-rule pt-5">
        <p className="text-small">Delete this brand</p>
        <Note>
          The hub goes offline, the files are removed, and the link stops working for
          your client. This cannot be undone.
        </Note>
        <form action={deleteBrandAction} className="mt-4 max-w-sm">
          <input type="hidden" name="brandId" value={brand.id} />
          <Field
            label="Type the brand name to confirm"
            name="confirm"
            hint={brand.name}
          >
            <TextInput name="confirm" required />
          </Field>
          <Button variant="danger">Delete brand</Button>
        </form>
      </div>
    </Panel>
  );
}
