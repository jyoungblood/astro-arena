import { ArenaLoaderError, arena, arenaBlockSchema } from "astro-arena";
import { getBlock, getChannelContents, getUser } from "astro-arena/api";

const exportsToCheck = [
  arena.block,
  arena.channel,
  arena.client,
  arena.liveChannel,
  arenaBlockSchema.parse,
  ArenaLoaderError,
  getBlock,
  getChannelContents,
  getUser,
];

if (exportsToCheck.some((value) => typeof value !== "function")) {
  throw new TypeError("A public package export is missing.");
}
