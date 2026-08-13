import type { Block, Channel } from "@aredotna/sdk";
import { z } from "astro/zod";

export type ArenaEntryData = Block | Channel;
export type ArenaChannelContent = Block | Channel;

const BLOCK_TYPES = new Set(["Text", "Image", "Link", "Attachment", "Embed", "PendingBlock"]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isPositiveId(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value > 0;
}

function isBlock(value: unknown): value is Block {
  return (
    isRecord(value) &&
    isPositiveId(value.id) &&
    value.base_type === "Block" &&
    typeof value.type === "string" &&
    BLOCK_TYPES.has(value.type)
  );
}

function isChannel(value: unknown): value is Channel {
  return isRecord(value) && isPositiveId(value.id) && value.type === "Channel";
}

/** A permissive schema for all block variants in the official Are.na SDK. */
export const arenaBlockSchema = z.custom<Block>(isBlock, "Expected an Are.na block");

/** A permissive schema for channels, including fields added by future API versions. */
export const arenaChannelSchema = z.custom<Channel>(isChannel, "Expected an Are.na channel");

/** The default schema used by channel loaders. */
export const arenaEntrySchema = z.union([arenaBlockSchema, arenaChannelSchema]);

export interface ArenaDataEntry<TData extends ArenaEntryData = ArenaEntryData> {
  id: string;
  data: TData;
  body?: string;
  digest: string;
  rendered?: {
    html: string;
  };
}

export interface ArenaEntryContext {
  generateDigest(data: Record<string, unknown> | string): string;
  parseData<TData extends Record<string, unknown>>(options: {
    id: string;
    data: TData;
  }): Promise<TData>;
}

/**
 * Get a collision-free Astro ID. Blocks use their numeric ID as text.
 * Nested channels use `channel:{id}`.
 */
export function getArenaEntryId(resource: ArenaEntryData): string {
  return resource.type === "Channel" ? `channel:${resource.id}` : String(resource.id);
}

function getRenderableContent(
  resource: ArenaEntryData,
): { html: string; markdown: string } | undefined {
  if (resource.type === "Text") {
    return resource.content;
  }

  return resource.description ?? undefined;
}

export async function createArenaDataEntry<TData extends ArenaEntryData>(
  resource: TData,
  context: ArenaEntryContext,
): Promise<ArenaDataEntry<TData>> {
  const id = getArenaEntryId(resource);
  const data = await context.parseData({
    id,
    data: resource as TData & Record<string, unknown>,
  });
  const content = getRenderableContent(resource);
  const entry: ArenaDataEntry<TData> = {
    id,
    data,
    digest: context.generateDigest(data),
  };

  if (content) {
    entry.body = content.markdown;
    entry.rendered = { html: content.html };
  }

  return entry;
}

export function selectChannelContents(
  contents: Array<ArenaChannelContent>,
  includeChannels = false,
): Array<ArenaChannelContent> {
  return includeChannels
    ? contents
    : contents.filter((item): item is Block => item.type !== "Channel");
}
