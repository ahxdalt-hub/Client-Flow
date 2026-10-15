import "server-only";

import { PRODUCT_FILES } from "@/config/site";
import { getAdminClient } from "@/lib/server/db";

export const DOWNLOAD_BUCKET = "product-downloads";

/** Signed Supabase Storage URLs live for 10 minutes. */
export const SIGNED_URL_TTL_SECONDS = 600;

export type SignedProductFile = {
  name: string;
  url: string;
  expiresAt: string;
};

export class StorageNotConfiguredError extends Error {
  constructor() {
    super("Supabase Storage is not configured.");
    this.name = "StorageNotConfiguredError";
  }
}

export class StorageFileMissingError extends Error {
  constructor(path: string) {
    super(`Product file is missing from the ${DOWNLOAD_BUCKET} bucket: ${path}`);
    this.name = "StorageFileMissingError";
  }
}

/**
 * Creates short-lived signed URLs for the configured product files in the
 * private `product-downloads` bucket. Paths come from server-side config
 * only — never from request input.
 */
export async function createProductSignedUrls(): Promise<{
  ok: true;
  files: SignedProductFile[];
  expiresAt: string;
} | {
  ok: false;
  reason: "not_configured" | "file_missing" | "storage_error";
}> {
  const supabase = getAdminClient();
  if (!supabase) return { ok: false, reason: "not_configured" };

  const expiresAt = new Date(
    Date.now() + SIGNED_URL_TTL_SECONDS * 1000,
  ).toISOString();

  const files: SignedProductFile[] = [];
  for (const file of PRODUCT_FILES) {
    const { data, error } = await supabase.storage
      .from(DOWNLOAD_BUCKET)
      .createSignedUrl(file.path, SIGNED_URL_TTL_SECONDS);
    if (error) {
      const message = error.message?.toLowerCase() ?? "";
      if (message.includes("not found") || message.includes("missing")) {
        return { ok: false, reason: "file_missing" };
      }
      console.error("[storage] signed URL failed:", error.message);
      return { ok: false, reason: "storage_error" };
    }
    files.push({ name: file.name, url: data.signedUrl, expiresAt });
  }

  return { ok: true, files, expiresAt };
}
