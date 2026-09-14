import { rulesOfKind, type Brand, type BrandRule } from "@/lib/brand/types";
import { Section } from "./Section";

function RuleList({ title, rules }: { title: string; rules: BrandRule[] }) {
  if (rules.length === 0) return null;
  return (
    <div>
      <h3 className="text-small text-graphite">{title}</h3>
      <ul className="mt-3">
        {rules.map((rule) => (
          <li key={rule.id} className="border-t border-rule py-4 text-small">
            {rule.body}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function RulesSection({ brand }: { brand: Brand }) {
  const dos = rulesOfKind(brand, "do");
  const donts = rulesOfKind(brand, "dont");
  const tone = rulesOfKind(brand, "tone");

  return (
    <Section
      id="rules"
      title="Rules"
      intro="The things that go wrong often enough to be worth writing down."
    >
      <div className="grid gap-10 sm:grid-cols-2 sm:gap-x-10">
        <RuleList title="Do" rules={dos} />
        <RuleList title="Don't" rules={donts} />
      </div>

      {tone.length > 0 ? (
        <div className="mt-12">
          <RuleList title="Tone of voice" rules={tone} />
        </div>
      ) : null}
    </Section>
  );
}
