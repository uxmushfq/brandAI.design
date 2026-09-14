import "server-only";

import { mkdirSync, existsSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { join, normalize, sep } from "node:path";

/**
 * Uploaded brand assets.
 *
 * Files live outside public/ and are served by a route handler, so that an uploaded
 * SVG — which is untrusted markup — can be given sandboxing headers instead of being
 * served as a live document on our own origin. Supabase Storage replaces this
 * directory later; the shape of what is stored does not change.
 */

const UPLOAD_ROOT = process.env.BRANDAI_UPLOAD_DIR
  ? process.env.BRANDAI_UPLOAD_DIR
  : join(process.cwd(), ".data", "uploads");

/** Logo formats a studio actually delivers. Anything else is refused. */
export const ALLOWED_TYPES: Record<string, string> = {
  "image/svg+xml": "svg",
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

export interface StoredFile {
  fileName: string;
  path: string;
  mimeType: string;
  byteSize: number;
}

export type UploadResult =
  | { ok: true; file: StoredFile }
  | { ok: false; error: string };

/** Strips everything that could escape the brand's directory or confuse a browser. */
function safeName(name: string, mimeType: string): string {
  const extension = ALLOWED_TYPES[mimeType];
  const base = name
    .replace(/\.[^.]*$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return `${base || "asset"}.${extension}`;
}

export async function saveUpload(brandId: string, file: File): Promise<UploadResult> {
  if (file.size === 0) {
    return { ok: false, error: "That file is empty. Pick another one." };
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return {
      ok: false,
      error: `That file is ${(file.size / 1024 / 1024).toFixed(1)}MB. The limit is 5MB — export it smaller, or upload the SVG instead.`,
    };
  }
  if (!ALLOWED_TYPES[file.type]) {
    return {
      ok: false,
      error: "Logos have to be SVG, PNG, JPEG or WebP. SVG is the one your client will thank you for.",
    };
  }

  const directory = join(UPLOAD_ROOT, brandId);
  mkdirSync(directory, { recursive: true });

  let fileName = safeName(file.name, file.type);
  // Never silently overwrite a file the studio already uploaded.
  if (existsSync(join(directory, fileName))) {
    const [base, extension] = fileName.split(/\.(?=[^.]+$)/);
    let n = 2;
    while (existsSync(join(directory, `${base}-${n}.${extension}`))) n += 1;
    fileName = `${base}-${n}.${extension}`;
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  writeFileSync(join(directory, fileName), bytes);

  return {
    ok: true,
    file: {
      fileName,
      path: `/api/files/${brandId}/${fileName}`,
      mimeType: file.type,
      byteSize: bytes.length,
    },
  };
}

/** Resolves a request path to a file on disk, refusing anything outside the root. */
export function resolveUpload(segments: string[]): string | null {
  if (segments.length === 0) return null;
  if (segments.some((s) => s.includes("\0") || s === ".." || s === ".")) return null;

  const target = normalize(join(UPLOAD_ROOT, ...segments));
  if (target !== UPLOAD_ROOT && !target.startsWith(UPLOAD_ROOT + sep)) return null;
  return existsSync(target) ? target : null;
}

/**
 * Reads an asset's bytes for the zip, from either source.
 *
 * Seeded assets live in public/ and uploads live in the data directory. Reading
 * them off disk rather than fetching our own URLs keeps the export off the network
 * and out of the request's own auth.
 */
export function readAssetBytes(assetPath: string): Buffer | null {
  const uploadPrefix = "/api/files/";
  if (assetPath.startsWith(uploadPrefix)) {
    const target = resolveUpload(assetPath.slice(uploadPrefix.length).split("/"));
    // The bundler cannot see through resolveUpload, so without this it traces the
    // entire project into the server output. The path is already proven to sit
    // under UPLOAD_ROOT before it gets here.
    return target ? readFileSync(/* turbopackIgnore: true */ target) : null;
  }

  if (!assetPath.startsWith("/") || assetPath.includes("..") || assetPath.includes("\0")) {
    return null;
  }

  const publicRoot = join(process.cwd(), "public");
  const target = normalize(join(publicRoot, assetPath));
  if (!target.startsWith(publicRoot + sep)) return null;
  return existsSync(target) ? readFileSync(/* turbopackIgnore: true */ target) : null;
}

export function deleteUpload(assetPath: string): void {
  const prefix = "/api/files/";
  if (!assetPath.startsWith(prefix)) return;
  const target = resolveUpload(assetPath.slice(prefix.length).split("/"));
  if (target) rmSync(target, { force: true });
}
