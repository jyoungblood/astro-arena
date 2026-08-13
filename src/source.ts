import { ArenaLoaderError } from "./errors.js";

export type ArenaResourceKind = "block" | "channel";
export type ArenaChannelReference = string | number | URL;
export type ArenaBlockReference = string | number | URL;

export interface ParsedArenaReference {
  id: string | number;
  kind: ArenaResourceKind;
}

const CHANNEL_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/i;
const POSITIVE_INTEGER = /^[1-9]\d*$/;
const WEB_HOSTS = new Set(["are.na", "www.are.na"]);

function invalidSource(kind: ArenaResourceKind): ArenaLoaderError {
  return new ArenaLoaderError(
    "INVALID_SOURCE",
    `The Are.na ${kind} source is invalid. Use an Are.na URL, slug, or positive numeric ID.`,
  );
}

function parsePositiveInteger(value: string | number): number | undefined {
  const normalized = typeof value === "number" ? String(value) : value;

  if (!POSITIVE_INTEGER.test(normalized)) {
    return undefined;
  }

  const number = Number(normalized);
  return Number.isSafeInteger(number) ? number : undefined;
}

function parseUrl(input: URL, expectedKind: ArenaResourceKind): ParsedArenaReference {
  if (input.protocol !== "https:") {
    throw invalidSource(expectedKind);
  }

  const segments = input.pathname.split("/").filter(Boolean);

  if (WEB_HOSTS.has(input.hostname)) {
    if (expectedKind === "channel" && segments.length === 2 && segments[0] !== "block") {
      const slug = segments[1];
      if (slug && CHANNEL_SLUG.test(slug)) {
        return { id: slug, kind: "channel" };
      }
    }

    if (expectedKind === "block" && segments.length === 2 && segments[0] === "block") {
      const id = segments[1] ? parsePositiveInteger(segments[1]) : undefined;
      if (id !== undefined) {
        return { id, kind: "block" };
      }
    }
  }

  if (input.hostname === "api.are.na" && segments.length === 3 && segments[0] === "v3") {
    const resourceSegment = expectedKind === "channel" ? "channels" : "blocks";
    if (segments[1] === resourceSegment && segments[2]) {
      if (expectedKind === "channel") {
        const id = parsePositiveInteger(segments[2]);
        if (id !== undefined) {
          return { id, kind: "channel" };
        }
        if (CHANNEL_SLUG.test(segments[2])) {
          return { id: segments[2], kind: "channel" };
        }
      } else {
        const id = parsePositiveInteger(segments[2]);
        if (id !== undefined) {
          return { id, kind: "block" };
        }
      }
    }
  }

  throw invalidSource(expectedKind);
}

function asUrl(value: string): URL | undefined {
  if (!/^https?:\/\//i.test(value)) {
    return undefined;
  }

  try {
    return new URL(value);
  } catch {
    return undefined;
  }
}

export function parseChannelReference(input: ArenaChannelReference): ParsedArenaReference {
  if (input instanceof URL) {
    return parseUrl(input, "channel");
  }

  const numericId = parsePositiveInteger(input);
  if (numericId !== undefined) {
    return { id: numericId, kind: "channel" };
  }

  if (typeof input === "string") {
    const url = asUrl(input);
    if (url) {
      return parseUrl(url, "channel");
    }
    if (CHANNEL_SLUG.test(input)) {
      return { id: input, kind: "channel" };
    }
  }

  throw invalidSource("channel");
}

export function parseBlockReference(input: ArenaBlockReference): ParsedArenaReference {
  if (input instanceof URL) {
    return parseUrl(input, "block");
  }

  const numericId = parsePositiveInteger(input);
  if (numericId !== undefined) {
    return { id: numericId, kind: "block" };
  }

  if (typeof input === "string") {
    const url = asUrl(input);
    if (url) {
      return parseUrl(url, "block");
    }
  }

  throw invalidSource("block");
}
