import { readFileSync, statSync } from "node:fs";
import { extname } from "node:path";

import { resolveUpload } from "@/lib/files";

const TYPES: Record<string, string> = {
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
};

/**
 * Serves uploaded brand assets.
 *
 * An uploaded SVG is markup a stranger wrote, sitting on our origin. `sandbox` in
 * the CSP neutralizes script inside it even if someone navigates to the file
 * directly, and nosniff stops a mislabelled file being reinterpreted as something
 * executable. Previews elsewhere go through <img>, which will not run script
 * either — this is the belt for the case where the URL is opened on its own.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  const target = resolveUpload(path);
  if (!target) {
    return new Response("Not found", { status: 404 });
  }

  const stats = statSync(target);
  if (!stats.isFile()) {
    return new Response("Not found", { status: 404 });
  }

  const download = new URL(request.url).searchParams.has("download");
  const fileName = path[path.length - 1];
  const contentType = TYPES[extname(target).toLowerCase()] ?? "application/octet-stream";

  // Path is already proven to sit under the upload root by resolveUpload; the
  // annotation stops the bundler tracing the whole project because it cannot tell.
  return new Response(readFileSync(/* turbopackIgnore: true */ target), {
    headers: {
      "Content-Type": contentType,
      "Content-Length": String(stats.size),
      "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; sandbox",
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "private, max-age=60",
      "Content-Disposition": `${download ? "attachment" : "inline"}; filename="${fileName}"`,
    },
  });
}
