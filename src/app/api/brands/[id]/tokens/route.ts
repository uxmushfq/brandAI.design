import { readableBrand } from "@/lib/api/brand-access";
import { generateTokensJson } from "@/lib/generate/tokens";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const result = await readableBrand(id);
  if (!result) return new Response("Not found", { status: 404 });

  return new Response(generateTokensJson(result.brand), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": 'attachment; filename="tokens.json"',
    },
  });
}
