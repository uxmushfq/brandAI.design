import type { Brand } from "@/lib/brand/types";
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
  addScaleStepAction,
  addTypefaceAction,
  removeChildAction,
  removeScaleStepAction,
  updateTypefaceAction,
} from "@/app/(studio)/brands/[id]/actions";

const ROLES = [
  { value: "display", label: "Display — headlines" },
  { value: "body", label: "Body — running text" },
] as const;

export function TypePanel({ brand }: { brand: Brand }) {
  return (
    <Panel
      title="Type"
      description="The families, what each is for, and the sizes they are set at."
    >
      {brand.typefaces.length === 0 ? (
        <Empty>No typefaces yet. Add the display face and the body face.</Empty>
      ) : (
        <div>
          {brand.typefaces.map((face) => (
            <Row key={face.id}>
              <form action={updateTypefaceAction}>
                <input type="hidden" name="brandId" value={brand.id} />
                <input type="hidden" name="id" value={face.id} />

                <div className="flex flex-wrap gap-4">
                  <div className="min-w-[12rem] flex-1">
                    <Field label="Family name" name={`familyName-${face.id}`}>
                      <TextInput
                        name="familyName"
                        defaultValue={face.familyName}
                        required
                      />
                    </Field>
                  </div>
                  <div className="min-w-[12rem]">
                    <Field label="Role" name={`role-${face.id}`}>
                      <Select name="role" options={ROLES} defaultValue={face.role} />
                    </Field>
                  </div>
                </div>

                <Field
                  label="Where it comes from"
                  name={`sourceUrl-${face.id}`}
                  hint="The foundry or specimen page, so the client can license it themselves."
                >
                  <TextInput
                    name="sourceUrl"
                    type="url"
                    defaultValue={face.sourceUrl ?? ""}
                    placeholder="https://"
                  />
                </Field>

                <Field label="Note" name={`note-${face.id}`}>
                  <TextInput
                    name="note"
                    defaultValue={face.note ?? ""}
                    placeholder="Why this face was chosen."
                  />
                </Field>

                <label className="mt-1 flex items-start gap-2 text-small">
                  <input
                    type="checkbox"
                    name="onGoogleFonts"
                    defaultChecked={face.webfontFamily !== null}
                    className="mt-1"
                  />
                  <span>
                    This family is on Google Fonts
                    <span className="block text-graphite">
                      Only then can the hub show a real specimen. For a licensed face
                      it shows the sizes and says the shapes are not ours to show,
                      rather than substituting a lookalike.
                    </span>
                  </span>
                </label>

                <div className="mt-4">
                  <Button variant="quiet">Save typeface</Button>
                </div>
              </form>

              <div className="mt-5 border-t border-rule pt-4">
                <p className="text-small">Scale</p>
                {face.scale.length === 0 ? (
                  <p className="mt-2 text-small text-graphite">
                    No steps yet. Add the sizes this face is actually set at.
                  </p>
                ) : (
                  <ul className="mt-2">
                    {face.scale.map((step) => (
                      <li
                        key={step.label}
                        className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-t border-rule py-2"
                      >
                        <span className="text-small">{step.label}</span>
                        <span className="font-mono text-value text-graphite">
                          {step.sizePx}px / {step.lineHeight} / {step.weight} /{" "}
                          {step.letterSpacingEm}em
                        </span>
                        <form action={removeScaleStepAction}>
                          <input type="hidden" name="brandId" value={brand.id} />
                          <input type="hidden" name="id" value={face.id} />
                          <input type="hidden" name="label" value={step.label} />
                          <button
                            type="submit"
                            className="cursor-pointer font-mono text-value text-graphite underline underline-offset-4 hover:text-ink"
                          >
                            Remove
                          </button>
                        </form>
                      </li>
                    ))}
                  </ul>
                )}

                <form action={addScaleStepAction} className="mt-4">
                  <input type="hidden" name="brandId" value={brand.id} />
                  <input type="hidden" name="id" value={face.id} />
                  <div className="flex flex-wrap gap-3">
                    <div className="w-32">
                      <Field label="Step" name={`label-${face.id}`}>
                        <TextInput name="label" placeholder="Headline" required />
                      </Field>
                    </div>
                    <div className="w-24">
                      <Field label="Size px" name={`sizePx-${face.id}`}>
                        <TextInput name="sizePx" type="number" placeholder="40" required />
                      </Field>
                    </div>
                    <div className="w-24">
                      <Field label="Line height" name={`lineHeight-${face.id}`}>
                        <TextInput name="lineHeight" type="number" defaultValue="1.2" />
                      </Field>
                    </div>
                    <div className="w-24">
                      <Field label="Weight" name={`weight-${face.id}`}>
                        <TextInput name="weight" type="number" defaultValue="400" />
                      </Field>
                    </div>
                    <div className="w-28">
                      <Field label="Tracking em" name={`letterSpacingEm-${face.id}`}>
                        <TextInput name="letterSpacingEm" type="number" defaultValue="0" />
                      </Field>
                    </div>
                  </div>
                  <Button variant="quiet">Add step</Button>
                </form>
              </div>

              <div className="mt-4">
                <form action={removeChildAction}>
                  <input type="hidden" name="brandId" value={brand.id} />
                  <input type="hidden" name="table" value="typefaces" />
                  <input type="hidden" name="id" value={face.id} />
                  <Button variant="danger">Delete typeface</Button>
                </form>
              </div>
            </Row>
          ))}
        </div>
      )}

      <div className="mt-8 border-t border-rule pt-5">
        <p className="text-small">Add a typeface</p>
        <form action={addTypefaceAction} className="mt-3">
          <input type="hidden" name="brandId" value={brand.id} />
          <div className="flex flex-wrap gap-4">
            <div className="min-w-[12rem] flex-1">
              <Field label="Family name" name="new-familyName">
                <TextInput name="familyName" placeholder="Public Sans" required />
              </Field>
            </div>
            <div className="min-w-[12rem]">
              <Field label="Role" name="new-role">
                <Select name="role" options={ROLES} defaultValue="display" />
              </Field>
            </div>
          </div>
          <Field label="Where it comes from" name="new-sourceUrl">
            <TextInput name="sourceUrl" type="url" placeholder="https://" />
          </Field>
          <label className="mb-4 flex items-center gap-2 text-small">
            <input type="checkbox" name="onGoogleFonts" />
            This family is on Google Fonts
          </label>
          <Button>Add typeface</Button>
        </form>
        <div className="mt-3">
          <Note>
            Sizes are stored as numbers, so they come out of tokens.json as real design
            tokens rather than as prose a developer has to read.
          </Note>
        </div>
      </div>
    </Panel>
  );
}
