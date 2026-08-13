import type { MetaStore } from "astro/loaders";

const ETAG_KEY = "arena:etag";
const FINGERPRINT_KEY = "arena:fingerprint";

function stableValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(stableValue);
  }

  if (typeof value === "object" && value !== null) {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, nested]) => [key, stableValue(nested)]),
    );
  }

  return value;
}

export function createRequestFingerprint(value: unknown): string {
  return JSON.stringify(stableValue(value));
}

export function conditionalHeaders(meta: MetaStore, fingerprint: string): HeadersInit | undefined {
  if (meta.get(FINGERPRINT_KEY) !== fingerprint) {
    return undefined;
  }

  const etag = meta.get(ETAG_KEY);
  return etag ? { "If-None-Match": etag } : undefined;
}

export function saveRequestMetadata(
  meta: MetaStore,
  fingerprint: string,
  response: Response,
): void {
  meta.set(FINGERPRINT_KEY, fingerprint);
  const etag = response.headers.get("etag");

  if (etag) {
    meta.set(ETAG_KEY, etag);
  } else {
    meta.delete(ETAG_KEY);
  }
}
