import JSZip from "jszip";

import { readableBrand } from "@/lib/api/brand-access";
import { readAssetBytes } from "@/lib/files";
import { generateContext } from "@/lib/generate/context";
import { generateDesignMd } from "@/lib/generate/design-md";
import { generateTokensJson } from "@/lib/generate/tokens";

/**
 * The "download everything" archive.
 *
 * Built in memory, which is fine at the sizes a logo package actually runs to and
 * is capped so it cannot become a way to exhaust a serverless function. A studio
 * with more than this belongs on a streaming export, which is a later problem.
 */
const MAX_ARCHIVE_BYTES = 50 * 1024 * 1024;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const result = await readableBrand(id);
  if (!result) return new Response("Not found", { status: 404 });

  const { brand, hubUrl } = result;
  const zip = new JSZip();

  let total = 0;
  const missing: string[] = [];

  for (const asset of brand.assets) {
    const bytes = readAssetBytes(asset.path);
    if (!bytes) {
      missing.push(asset.fileName);
      continue;
    }
    total += bytes.length;
    if (total > MAX_ARCHIVE_BYTES) {
      return new Response(
        "This brand's files are larger than the 50MB export limit. Download them individually.",
        { status: 413 },
      );
    }
    zip.file(`assets/${asset.fileName}`, bytes);
  }

  zip.file("design.md", generateDesignMd(brand, hubUrl));
  zip.file("tokens.json", generateTokensJson(brand));
  zip.file("brand-context.txt", generateContext(brand, hubUrl));

  // Say so in the archive rather than silently shipping an incomplete one.
  if (missing.length > 0) {
    zip.file(
      "assets/MISSING.txt",
      `These files are listed in the guidelines but could not be read:\n\n${missing
        .map((name) => `- ${name}`)
        .join("\n")}\n\nAsk ${brand.studio.name} to re-upload them.\n`,
    );
  }

  const archive = await zip.generateAsync({
    type: "nodebuffer",
    compression: "DEFLATE",
    compressionOptions: { level: 6 },
  });

  return new Response(new Uint8Array(archive), {
    headers: {
      "Content-Type": "application/zip",
      "Content-Length": String(archive.length),
      "Content-Disposition": `attachment; filename="${brand.slug}-brand-assets.zip"`,
    },
  });
}
