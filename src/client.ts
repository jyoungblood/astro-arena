import { type Arena, createArena } from "@aredotna/sdk";
import { type AstroArenaClientOptions, type SecretReader, toArenaSdkOptions } from "./auth.js";

export type { AstroArenaClientOptions } from "./auth.js";

/** Create the official Are.na SDK client with Astro-aware token resolution. */
export function createArenaClient(
  options: AstroArenaClientOptions = {},
  readSecret?: SecretReader,
): Arena {
  return createArena(toArenaSdkOptions(options, readSecret));
}
