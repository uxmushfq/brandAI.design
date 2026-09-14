import { colorsInGroup, GROUP_LABEL, type Brand, type ColorGroup } from "@/lib/brand/types";
import { Column, Frame } from "@/components/ui/Frame";
import { GroupLabel, SectionHeading } from "./Section";
import { ColorBands } from "./ColorSection";

const GROUPS: ColorGroup[] = ["primary", "secondary", "neutral"];

export function ColorSection({ brand }: { brand: Brand }) {
  const groups = GROUPS.map((group) => ({
    group,
    colors: colorsInGroup(brand, group),
  })).filter((g) => g.colors.length > 0);

  return (
    <section
      id="color"
      aria-labelledby="color-heading"
      className="scroll-mt-10 pt-16 md:pt-24"
    >
      <SectionHeading
        id="color"
        title="Color"
        intro="Every value, in the order it matters. Select a band to copy its hex."
      />

      {groups.map(({ group, colors }) => (
        <div key={group} className="mt-10">
          <Frame>
            <Column>
              <GroupLabel>{GROUP_LABEL[group]}</GroupLabel>
            </Column>
          </Frame>
          <div className="mt-4">
            <ColorBands colors={colors} />
          </div>
        </div>
      ))}
    </section>
  );
}
