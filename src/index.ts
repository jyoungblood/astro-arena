import { type AstroArenaClientOptions, createArenaClient } from "./client.js";
import { blockLoader } from "./loaders/block.js";
import { channelLoader } from "./loaders/channel.js";
import { liveChannelLoader } from "./loaders/live-channel.js";

export type { Arena, Block, Channel } from "@aredotna/sdk";
export type { AstroArenaClientOptions } from "./client.js";
export {
  type ArenaChannelContent,
  type ArenaDataEntry,
  type ArenaEntryData,
  arenaBlockSchema,
  arenaChannelSchema,
  arenaEntrySchema,
} from "./data.js";
export { ArenaLoaderError, type ArenaLoaderErrorCode } from "./errors.js";
export type { ArenaBlockLoaderOptions } from "./loaders/block.js";
export type { ArenaChannelLoaderOptions, ArenaChannelQuery } from "./loaders/channel.js";
export type {
  ArenaLiveChannelLoaderOptions,
  ArenaLiveCollectionFilter,
  ArenaLiveEntryFilter,
} from "./loaders/live-channel.js";
export type {
  ArenaBlockReference,
  ArenaChannelReference,
  ParsedArenaReference,
} from "./source.js";

/** Astro loaders and the full Are.na SDK client. */
export const arena = {
  block: blockLoader,
  channel: channelLoader,
  client: (options?: AstroArenaClientOptions) => createArenaClient(options),
  liveChannel: liveChannelLoader,
} as const;
