/** Section order, shared by the page and both copies of the index. */
export const SECTIONS = [
  { id: "logos", label: "Logos" },
  { id: "color", label: "Color" },
  { id: "type", label: "Type" },
  { id: "rules", label: "Rules" },
  { id: "use-with-ai", label: "Use with AI" },
] as const;

export type SectionId = (typeof SECTIONS)[number]["id"];
