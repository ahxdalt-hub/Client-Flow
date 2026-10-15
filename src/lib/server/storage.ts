import "server-only";

import { PRODUCT_FILES } from "@/config/site";
import { getAdminClient } from "@/lib/server/db";
import { getProductVersionById } from "@/lib/server/fulfillment";

export const DOWNLOAD_BUCKET = "product-downloads";

/** Signed Supabase Storage URLs live for 10 minutes. */
export const SIGNED_URL_TTL_SECONDS = 600;

export type ProductFileRef = {
  name: string;
  path: string;
};

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
 * Resolves the files an entitlement is allowed to receive.
 *
 * - Entitlements pinned to a `product_versions` row resolve that version's
 *   paths (the customer keeps the version they paid for).
 * - Unpinned entitlements — or a version row that no longer exists — fall back
 *   to the default `PRODUCT_FILES` paths. Request input can never influence
 *   this choice.
 */
export async function filesForEntitlement(
  productVersionId: string | null,
): Promise<readonly ProductFileRef[]> {
  if (!productVersionId) return PRODUCT_FILES;
  const version = await getProductVersionById(productVersionId);
  if (!version) return PRODUCT_FILES;
  return [
    { name: "Marketloom Research Pack (CSV)", path: version.csvPath },
    { name: "Marketloom Research Pack (XLSX)", path: version.xlsxPath },
  ];
}

/**
 * Creates short-lived signed URLs for the given product files in the private
 * `product-downloads` bucket. Paths come from server-side config or the
 * entitlement's pinned version — never from request input.
 */
export async function createProductSignedUrls(
  files: readonly ProductFileRef[] = PRODUCT_FILES,
): Promise<{
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

  const signedFiles: SignedProductFile[] = [];
  for (const file of files) {
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
    signedFiles.push({ name: file.name, url: data.signedUrl, expiresAt });
  }

  return { ok: true, files: signedFiles, expiresAt };
}
