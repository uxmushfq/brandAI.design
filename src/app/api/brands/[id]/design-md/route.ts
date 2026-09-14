import { readableBrand } from "@/lib/api/brand-access";
import { generateDesignMd } from "@/lib/generate/design-md";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const result = await readableBrand(id);
  if (!result) return new Response("Not found", { status: 404 });

  return new Response(generateDesignMd(result.brand, result.hubUrl), {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Disposition": 'attachment; filename="design.md"',
    },
  });
}
