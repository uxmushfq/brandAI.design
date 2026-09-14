import { rulesOfKind, type Brand, type BrandRule, type RuleKind } from "@/lib/brand/types";
import {
  Button,
  Empty,
  Field,
  Note,
  Panel,
  Select,
  TextArea,
} from "@/components/studio/ui";
import {
  addRuleAction,
  moveChildAction,
  removeChildAction,
  updateRuleAction,
} from "@/app/(studio)/brands/[id]/actions";

const KINDS = [
  { value: "do", label: "Do" },
  { value: "dont", label: "Don't" },
  { value: "tone", label: "Tone of voice" },
] as const;

function RuleGroup({
  brandId,
  title,
  kind,
  rules,
}: {
  brandId: string;
  title: string;
  kind: RuleKind;
  rules: BrandRule[];
}) {
  return (
    <div className="mb-8">
      <h3 className="text-small">{title}</h3>
      {rules.length === 0 ? (
        <p className="mt-2 text-small text-graphite">Nothing here yet.</p>
      ) : (
        <ul className="mt-2">
          {rules.map((rule, index) => (
            <li key={rule.id} className="border-t border-rule py-4">
              <form action={updateRuleAction}>
                <input type="hidden" name="brandId" value={brandId} />
                <input type="hidden" name="id" value={rule.id} />
                <input type="hidden" name="kind" value={kind} />
                <TextArea name="body" rows={2} defaultValue={rule.body} required />
                <div className="mt-2 flex flex-wrap gap-3">
                  <Button variant="quiet">Save</Button>
                </div>
              </form>
              <div className="mt-2 flex flex-wrap gap-3">
                <form action={moveChildAction} className="flex gap-2">
                  <input type="hidden" name="brandId" value={brandId} />
                  <input type="hidden" name="table" value="rules" />
                  <input type="hidden" name="id" value={rule.id} />
                  <Button variant="quiet" name="direction" value="up" disabled={index === 0}>
                    Move up
                  </Button>
                  <Button
                    variant="quiet"
                    name="direction"
                    value="down"
                    disabled={index === rules.length - 1}
                  >
                    Move down
                  </Button>
                </form>
                <form action={removeChildAction}>
                  <input type="hidden" name="brandId" value={brandId} />
                  <input type="hidden" name="table" value="rules" />
                  <input type="hidden" name="id" value={rule.id} />
                  <Button variant="danger">Delete</Button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function RulesPanel({ brand }: { brand: Brand }) {
  const dos = rulesOfKind(brand, "do");
  const donts = rulesOfKind(brand, "dont");
  const tone = rulesOfKind(brand, "tone");

  return (
    <Panel
      title="Rules"
      description="The things that go wrong often enough to be worth writing down. These carry straight into the AI context block."
    >
      {brand.rules.length === 0 ? (
        <Empty>
          No rules yet. The useful ones are specific: the mistake you have had to
          correct more than once.
        </Empty>
      ) : (
        <>
          <RuleGroup brandId={brand.id} title="Do" kind="do" rules={dos} />
          <RuleGroup brandId={brand.id} title="Don't" kind="dont" rules={donts} />
          <RuleGroup brandId={brand.id} title="Tone of voice" kind="tone" rules={tone} />
        </>
      )}

      <div className="mt-4 border-t border-rule pt-5">
        <p className="text-small">Add a rule</p>
        <form action={addRuleAction} className="mt-3">
          <input type="hidden" name="brandId" value={brand.id} />
          <div className="max-w-[12rem]">
            <Field label="Kind" name="new-rule-kind">
              <Select name="kind" options={KINDS} defaultValue="do" />
            </Field>
          </div>
          <Field label="Rule" name="new-rule-body">
            <TextArea
              name="body"
              rows={3}
              required
              placeholder="Never set body copy on Signal. It fails contrast at every size we use."
            />
          </Field>
          <Button>Add rule</Button>
        </form>
        <div className="mt-3">
          <Note>
            Write these as instructions rather than principles. &ldquo;Never rotate the
            wordmark&rdquo; is followed; &ldquo;respect the mark&rdquo; is not.
          </Note>
        </div>
      </div>
    </Panel>
  );
}
