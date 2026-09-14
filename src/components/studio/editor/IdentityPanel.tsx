import type { Brand } from "@/lib/brand/types";
import { Button, Field, Note, Panel, TextArea, TextInput } from "@/components/studio/ui";
import { saveIdentityAction, uploadStudioLogoAction } from "@/app/(studio)/brands/[id]/actions";

export function IdentityPanel({
  brand,
  slug,
  published,
}: {
  brand: Brand;
  slug: string;
  published: boolean;
}) {
  return (
    <Panel
      title="Identity"
      description="The name and line at the top of the hub, and the studio credit in its footer."
    >
      <form action={saveIdentityAction}>
        <input type="hidden" name="brandId" value={brand.id} />

        <Field label="Brand name" name="name">
          <TextInput name="name" defaultValue={brand.name} required maxLength={80} />
        </Field>

        <Field
          label="One-line description"
          name="description"
          hint="What the company does, in a sentence."
        >
          <TextArea name="description" rows={2} defaultValue={brand.description} />
        </Field>

        <Field
          label="Studio name"
          name="studioName"
          hint="Yours, not the client's. It signs every hub you publish."
        >
          <TextInput name="studioName" defaultValue={brand.studio.name} required />
        </Field>

        <div className="mt-5">
          <Button>Save identity</Button>
        </div>
      </form>

      <div className="mt-8 border-t border-rule pt-5">
        <p className="text-small">Studio logo</p>
        <Note>
          A small mark for the hub footer. SVG or PNG, up to 5MB.
        </Note>

        {brand.studio.logoPath ? (
          // Uploaded SVG. next/image would need dangerouslyAllowSVG, which is
          // exactly what untrusted markup should not get.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={brand.studio.logoPath}
            alt="Your studio logo"
            className="mt-3 h-8 w-8 object-contain"
          />
        ) : null}

        <form action={uploadStudioLogoAction} className="mt-3">
          <input type="hidden" name="brandId" value={brand.id} />
          <input
            type="file"
            name="file"
            accept="image/svg+xml,image/png,image/jpeg,image/webp"
            required
            className="block text-small"
          />
          <div className="mt-3">
            <Button variant="quiet">Upload logo</Button>
          </div>
        </form>
      </div>

      <div className="mt-8 border-t border-rule pt-5">
        <p className="text-small">Link</p>
        <p className="mt-1 font-mono text-value text-graphite">/b/{slug}</p>
        <Note>
          {published
            ? "Frozen, because the link is already out. A link you have sent must never start meaning something else."
            : "Follows the brand name until you publish, then it is fixed for good."}
        </Note>
      </div>
    </Panel>
  );
}
