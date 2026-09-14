"use client";

/**
 * Client-side file delivery for step one.
 *
 * The generators are pure functions, so the hub can hand over design.md, tokens.json
 * and the zip without a server. When the API routes land these become fetches to
 * /api/brands/[id]/… and the callers do not change.
 */

export function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  // Revoke on the next frame; revoking synchronously cancels the download in Safari.
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

export function downloadText(
  text: string,
  fileName: string,
  mimeType = "text/plain;charset=utf-8",
): void {
  downloadBlob(new Blob([text], { type: mimeType }), fileName);
}

export interface ZipEntry {
  /** Path inside the archive. */
  name: string;
  /** A URL to fetch, or literal contents. */
  url?: string;
  text?: string;
}

/**
 * Builds the "everything" archive in the browser.
 *
 * JSZip is loaded on demand so it stays out of the initial bundle — a client who
 * only reads the guidelines never pays for it.
 */
export async function downloadZip(
  entries: ZipEntry[],
  fileName: string,
): Promise<void> {
  const { default: JSZip } = await import("jszip");
  const zip = new JSZip();

  await Promise.all(
    entries.map(async (entry) => {
      if (entry.text !== undefined) {
        zip.file(entry.name, entry.text);
        return;
      }
      if (!entry.url) return;
      const response = await fetch(entry.url);
      if (!response.ok) {
        throw new Error(`Could not read ${entry.name}`);
      }
      zip.file(entry.name, await response.blob());
    }),
  );

  const blob = await zip.generateAsync({
    type: "blob",
    compression: "DEFLATE",
    compressionOptions: { level: 6 },
  });
  downloadBlob(blob, fileName);
}
