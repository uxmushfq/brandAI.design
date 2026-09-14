import type { Brand } from "@/lib/brand/types";
import { contrastRatio, readableOn, AA_BODY } from "@/lib/color";
import {
  Button,
  Empty,
  Field,
  Note,
  Panel,
  Row,
  Select,
  TextInput,
} from "@/components/studio/ui";
import {
  addColorAction,
  removeChildAction,
  updateColorAction,
} from "@/app/(studio)/brands/[id]/actions";
import { MoveButtons } from "./LogosPanel";

const GROUPS = [
  { value: "primary", label: "Primary" },
  { value: "secondary", label: "Secondary" },
  { value: "neutral", label: "Neutral" },
] as const;

export function ColorPanel({ brand }: { brand: Brand }) {
  return (
    <Panel
      title="Color"
      description="Named values, grouped. The hub renders each one as a full-width band the client can click to copy."
    >
      {brand.colors.length === 0 ? (
        <Empty>
          No colors yet. Start with the one the brand is actually known by.
        </Empty>
      ) : (
        <div>
          {brand.colors.map((color, index) => {
            const foreground = readableOn(color.hex);
            const ratio = contrastRatio(color.hex, foreground);
            return (
              <Row key={color.id}>
                <div className="flex flex-wrap items-start gap-6">
                  <div
                    className="flex h-24 w-40 shrink-0 items-center justify-center"
                    style={{ backgroundColor: color.hex, color: foreground }}
                  >
                    <span className="font-mono text-value">{color.hex}</span>
                  </div>

                  <div className="min-w-[16rem] flex-1">
                    <form action={updateColorAction}>
                      <input type="hidden" name="brandId" value={brand.id} />
                      <input type="hidden" name="id" value={color.id} />

                      <div className="flex flex-wrap gap-4">
                        <div className="min-w-[10rem] flex-1">
                          <Field label="Name" name={`name-${color.id}`}>
                            <TextInput name="name" defaultValue={color.name} required />
                          </Field>
                        </div>
                        <div className="min-w-[8rem]">
                          <Field label="Hex" name={`hex-${color.id}`}>
                            <TextInput name="hex" defaultValue={color.hex} required />
                          </Field>
                        </div>
                        <div className="min-w-[9rem]">
                          <Field label="Group" name={`group-${color.id}`}>
                            <Select
                              name="group"
                              options={GROUPS}
                              defaultValue={color.group}
                            />
                          </Field>
                        </div>
                      </div>

                      <Field
                        label="Note"
                        name={`note-${color.id}`}
                        hint="What it is for. This goes in the band and into the AI context."
                      >
                        <TextInput name="note" defaultValue={color.note ?? ""} />
                      </Field>

                      <Button variant="quiet">Save</Button>
                    </form>

                    <p className="mt-3 font-mono text-value text-graphite">
                      Label contrast {ratio.toFixed(2)}:1
                      {ratio < AA_BODY
                        ? " — the hub drops the note text on this band to full strength to stay readable"
                        : ""}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-3">
                      <MoveButtons
                        brandId={brand.id}
                        table="colors"
                        id={color.id}
                        isFirst={index === 0}
                        isLast={index === brand.colors.length - 1}
                      />
                      <form action={removeChildAction}>
                        <input type="hidden" name="brandId" value={brand.id} />
                        <input type="hidden" name="table" value="colors" />
                        <input type="hidden" name="id" value={color.id} />
                        <Button variant="danger">Delete</Button>
                      </form>
                    </div>
                  </div>
                </div>
              </Row>
            );
          })}
        </div>
      )}

      <div className="mt-8 border-t border-rule pt-5">
        <p className="text-small">Add a color</p>
        <form action={addColorAction} className="mt-3">
          <input type="hidden" name="brandId" value={brand.id} />
          <div className="flex flex-wrap gap-4">
            <div className="min-w-[10rem] flex-1">
              <Field label="Name" name="new-color-name">
                <TextInput name="name" placeholder="Marine" required />
              </Field>
            </div>
            <div className="min-w-[8rem]">
              <Field label="Hex" name="new-color-hex">
                <TextInput name="hex" placeholder="#0B2A3F" required />
              </Field>
            </div>
            <div className="min-w-[9rem]">
              <Field label="Group" name="new-color-group">
                <Select name="group" options={GROUPS} defaultValue="primary" />
              </Field>
            </div>
          </div>
          <Field label="Note" name="new-color-note">
            <TextInput name="note" placeholder="What this color is for." />
          </Field>
          <Button>Add color</Button>
        </form>
        <div className="mt-3">
          <Note>
            Name colors the way the studio talks about them. &ldquo;Marine&rdquo; survives a
            handover; &ldquo;Blue 1&rdquo; does not.
          </Note>
        </div>
      </div>
    </Panel>
  );
}
