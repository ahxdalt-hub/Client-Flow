/**
 * Optional URL reachability probing for the dataset pipeline.
 *
 * Design rules:
 * - Off by default; only runs when the CLI is given `--check-urls`.
 * - One request per URL, no retries, no auth, no cookie jars, no robots
 *   bypasses, no provider APIs — a plain browser-like GET/HEAD of a public URL.
 * - Every failure (timeout, DNS, 404, 403, 429 …) is reported as an item for
 *   *manual review*. A failed request never proves a store is invalid, so it
 *   never becomes a validation error.
 */

export type ProbeOutcome =
  | "reachable"
  | "http_error"
  | "auth_or_rate_limited"
  | "timeout"
  | "network_error"
  | "unsupported_url";

export type UrlProbe = {
  url: string;
  outcome: ProbeOutcome;
  status?: number;
  detail: string;
  /** True when a human must look at this URL. */
  needsManualReview: boolean;
};

export type ProbeOptions = {
  timeoutMs?: number;
  concurrency?: number;
  userAgent?: string;
  /** Injectable for tests; defaults to global fetch. */
  fetchImpl?: typeof fetch;
};

export const DEFAULT_PROBE_USER_AGENT =
  "MarketloomDatasetValidator/1.0 (+contact your support address before blocking)";

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function probeOne(
  url: string,
  options: Required<Omit<ProbeOptions, "fetchImpl">> & { fetchImpl: typeof fetch },
): Promise<UrlProbe> {
  let parsed: URL;
  try {
    parsed = new URL(url);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return {
        url,
        outcome: "unsupported_url",
        detail: "only http(s) URLs are probed",
        needsManualReview: true,
      };
    }
  } catch {
    return {
      url,
      outcome: "unsupported_url",
      detail: "not parseable as a URL",
      needsManualReview: true,
    };
  }

  const request = async (method: "HEAD" | "GET"): Promise<Response> => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), options.timeoutMs);
    try {
      return await options.fetchImpl(url, {
        method,
        redirect: "follow",
        signal: controller.signal,
        headers: { "user-agent": options.userAgent, accept: "*/*" },
      });
    } finally {
      clearTimeout(timer);
    }
  };

  try {
    let response = await request("HEAD");

    // Some servers reject HEAD outright; retry once with GET.
    if ([400, 403, 404, 405, 406, 411, 501].includes(response.status)) {
      response = await request("GET");
    }

    const status = response.status;
    if (status >= 200 && status < 400) {
      return {
        url,
        outcome: "reachable",
        status,
        detail: `HTTP ${status}`,
        needsManualReview: false,
      };
    }
    if (status === 401 || status === 403 || status === 429 || status === 503) {
      return {
        url,
        outcome: "auth_or_rate_limited",
        status,
        detail: `HTTP ${status} — the site may be blocking automated requests; this does not mean the store is gone`,
        needsManualReview: true,
      };
    }
    return {
      url,
      outcome: "http_error",
      status,
      detail: `HTTP ${status} — confirm manually before excluding this row`,
      needsManualReview: true,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const timedOut = error instanceof Error && error.name === "AbortError";
    return {
      url,
      outcome: timedOut ? "timeout" : "network_error",
      detail: timedOut
        ? `no response within ${options.timeoutMs}ms`
        : message,
      needsManualReview: true,
    };
  }
}

/** Probes URLs with a small concurrency limit and a polite gap. */
export async function probeUrls(
  urls: string[],
  options: ProbeOptions = {},
): Promise<UrlProbe[]> {
  const resolved = {
    timeoutMs: options.timeoutMs ?? 8000,
    concurrency: Math.max(1, options.concurrency ?? 4),
    userAgent: options.userAgent ?? DEFAULT_PROBE_USER_AGENT,
    fetchImpl: options.fetchImpl ?? fetch,
  };

  const unique = [...new Set(urls)];
  const results: UrlProbe[] = [];
  let cursor = 0;

  async function worker(): Promise<void> {
    while (cursor < unique.length) {
      const index = cursor;
      cursor += 1;
      const url = unique[index];
      if (!url) continue;
      results.push(await probeOne(url, resolved));
      await sleep(250);
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(resolved.concurrency, unique.length) }, () =>
      worker(),
    ),
  );

  return results;
}
