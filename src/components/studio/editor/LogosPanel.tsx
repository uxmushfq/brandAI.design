import type { Brand } from "@/lib/brand/types";
import {
  Button,
  Empty,
  Field,
  Note,
  Panel,
  Row,
  Select,
  TextArea,
} from "@/components/studio/ui";
import { formatBytes } from "@/lib/format";
import {
  deleteAssetAction,
  moveChildAction,
  updateAssetAction,
  uploadAssetAction,
} from "@/app/(studio)/brands/[id]/actions";

const CATEGORIES = [
  { value: "primary", label: "Primary" },
  { value: "secondary", label: "Secondary" },
  { value: "mark", label: "Mark" },
] as const;

const GROUNDS = [
  { value: "light", label: "Light — artwork is dark" },
  { value: "dark", label: "Dark — artwork is white" },
] as const;

export function LogosPanel({ brand }: { brand: Brand }) {
  return (
    <Panel
      title="Logos"
      description="Every approved file, with the rule that goes with it. SVG, PNG, JPEG or WebP, up to 5MB each."
    >
      {brand.assets.length === 0 ? (
        <Empty>
          No logo files yet. Upload the primary wordmark first — it is the one the
          client will reach for.
        </Empty>
      ) : (
        <div>
          {brand.assets.map((asset, index) => (
            <Row key={asset.id}>
              <div className="flex flex-wrap items-start gap-6">
                <div
                  className="flex h-24 w-40 shrink-0 items-center justify-center px-3"
                  style={{
                    backgroundColor:
                      asset.previewOn === "dark" ? "#15171B" : "var(--color-sheet)",
                    boxShadow:
                      asset.previewOn === "dark"
                        ? undefined
                        : "inset 0 0 0 1px var(--color-rule)",
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={asset.path}
                    alt={asset.fileName}
                    className="max-h-16 max-w-full object-contain"
                  />
                </div>

                <div className="min-w-[16rem] flex-1">
                  <p className="font-mono text-value">{asset.fileName}</p>
                  <p className="mt-0.5 font-mono text-value text-graphite">
                    {formatBytes(asset.byteSize)}
                  </p>

                  <form action={updateAssetAction} className="mt-3">
                    <input type="hidden" name="brandId" value={brand.id} />
                    <input type="hidden" name="id" value={asset.id} />

                    <div className="flex flex-wrap gap-4">
                      <div className="min-w-[10rem] flex-1">
                        <Field label="Category" name={`category-${asset.id}`}>
                          <Select
                            name="category"
                            options={CATEGORIES}
                            defaultValue={asset.category}
                          />
                        </Field>
                      </div>
                      <div className="min-w-[14rem] flex-1">
                        <Field label="Preview on" name={`previewOn-${asset.id}`}>
                          <Select
                            name="previewOn"
                            options={GROUNDS}
                            defaultValue={asset.previewOn}
                          />
                        </Field>
                      </div>
                    </div>

                    <Field label="Use" name={`usageDo-${asset.id}`}>
                      <TextArea
                        name="usageDo"
                        rows={2}
                        defaultValue={asset.usageDo ?? ""}
                        placeholder="When this file is the right one."
                      />
                    </Field>
                    <Field label="Avoid" name={`usageDont-${asset.id}`}>
                      <TextArea
                        name="usageDont"
                        rows={2}
                        defaultValue={asset.usageDont ?? ""}
                        placeholder="The mistake people actually make with it."
                      />
                    </Field>

                    <Button variant="quiet">Save</Button>
                  </form>

                  <div className="mt-3 flex flex-wrap gap-3">
                    <MoveButtons
                      brandId={brand.id}
                      table="assets"
                      id={asset.id}
                      isFirst={index === 0}
                      isLast={index === brand.assets.length - 1}
                    />
                    <form action={deleteAssetAction}>
                      <input type="hidden" name="brandId" value={brand.id} />
                      <input type="hidden" name="id" value={asset.id} />
                      <Button variant="danger">Delete file</Button>
                    </form>
                  </div>
                </div>
              </div>
            </Row>
          ))}
        </div>
      )}

      <div className="mt-8 border-t border-rule pt-5">
        <p className="text-small">Add a logo file</p>
        <form action={uploadAssetAction} className="mt-3">
          <input type="hidden" name="brandId" value={brand.id} />
          <input
            type="file"
            name="file"
            accept="image/svg+xml,image/png,image/jpeg,image/webp"
            required
            className="block text-small"
          />
          <div className="mt-3 flex flex-wrap gap-4">
            <div className="min-w-[10rem]">
              <Field label="Category" name="new-category">
                <Select name="category" options={CATEGORIES} defaultValue="primary" />
              </Field>
            </div>
            <div className="min-w-[14rem]">
              <Field label="Preview on" name="new-previewOn">
                <Select name="previewOn" options={GROUNDS} defaultValue="light" />
              </Field>
            </div>
          </div>
          <Button>Upload file</Button>
        </form>
        <div className="mt-3">
          <Note>
            A white logo on a white ground is invisible, so mark white artwork as
            &ldquo;dark&rdquo; and the hub will show it on the brand&rsquo;s darkest color.
          </Note>
        </div>
      </div>
    </Panel>
  );
}

export function MoveButtons({
  brandId,
  table,
  id,
  isFirst,
  isLast,
}: {
  brandId: string;
  table: string;
  id: string;
  isFirst: boolean;
  isLast: boolean;
}) {
  return (
    <form action={moveChildAction} className="flex gap-2">
      <input type="hidden" name="brandId" value={brandId} />
      <input type="hidden" name="table" value={table} />
      <input type="hidden" name="id" value={id} />
      <Button variant="quiet" name="direction" value="up" disabled={isFirst}>
        Move up
      </Button>
      <Button variant="quiet" name="direction" value="down" disabled={isLast}>
        Move down
      </Button>
    </form>
  );
}
