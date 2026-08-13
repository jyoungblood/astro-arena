import { getChannelContents } from "@aredotna/sdk/api";
import type { AstroArenaClientOptions } from "../auth.js";
import { createArenaClient } from "../client.js";
import {
  type ArenaChannelContent,
  type ArenaEntryData,
  arenaEntrySchema,
  getArenaEntryId,
  selectChannelContents,
} from "../data.js";
import { ArenaLoaderError, toArenaLoaderError } from "../errors.js";
import type { ArenaLiveLoader } from "../loader-types.js";
import { type ArenaChannelReference, parseChannelReference } from "../source.js";
import type { ArenaChannelQuery } from "./channel.js";

type LiveChannelSourceOption =
  | { id: ArenaChannelReference; url?: never }
  | { id?: never; url: ArenaChannelReference };

export type ArenaLiveChannelLoaderOptions = AstroArenaClientOptions &
  LiveChannelSourceOption & {
    includeChannels?: boolean;
    query?: ArenaChannelQuery;
  };

export type ArenaLiveCollectionFilter = ArenaChannelQuery;
export type ArenaLiveEntryFilter = { id: string } & ArenaChannelQuery;

function resourceDate(resource: ArenaEntryData): Date | undefined {
  const date = new Date(resource.updated_at);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function resourceTag(resource: ArenaEntryData): string {
  return resource.type === "Channel"
    ? `arena:channel:${resource.id}`
    : `arena:block:${resource.id}`;
}

function rendered(resource: ArenaEntryData): { html: string } | undefined {
  const content = resource.type === "Text" ? resource.content : resource.description;
  return content ? { html: content.html } : undefined;
}

function liveEntry(resource: ArenaEntryData) {
  const renderedContent = rendered(resource);
  const lastModified = resourceDate(resource);

  return {
    id: getArenaEntryId(resource),
    data: resource,
    ...(renderedContent ? { rendered: renderedContent } : {}),
    cacheHint: {
      ...(lastModified ? { lastModified } : {}),
      tags: [resourceTag(resource)],
    },
  };
}

export function liveChannelLoader(
  options: ArenaLiveChannelLoaderOptions,
): ArenaLiveLoader<
  ArenaEntryData,
  ArenaLiveEntryFilter,
  ArenaLiveCollectionFilter,
  ArenaLoaderError
> {
  const { id, includeChannels = false, query, url, ...clientOptions } = options;
  const source = id ?? url;
  const { id: channelId } = parseChannelReference(source);
  const arenaClient = createArenaClient(clientOptions);

  async function loadPage(runtimeQuery?: ArenaChannelQuery): Promise<Array<ArenaChannelContent>> {
    const mergedQuery = { ...query, ...runtimeQuery };
    const result = await getChannelContents({
      client: arenaClient.client,
      path: { id: String(channelId) },
      ...(Object.keys(mergedQuery).length === 0 ? {} : { query: mergedQuery }),
      throwOnError: false,
    });

    if (result.error) {
      throw result.error;
    }

    if (!result.data || !Array.isArray(result.data.data)) {
      throw new ArenaLoaderError(
        "INVALID_RESPONSE",
        "The live channel request failed because Are.na returned invalid channel data.",
        { status: result.response.status },
      );
    }

    const resources: Array<ArenaChannelContent> = [];
    for (const resource of result.data.data) {
      const parsedResource = arenaEntrySchema.safeParse(resource);
      if (!parsedResource.success) {
        throw new ArenaLoaderError(
          "INVALID_RESPONSE",
          "The live channel request failed because Are.na returned an invalid channel item.",
          { cause: parsedResource.error, status: result.response.status },
        );
      }
      resources.push(parsedResource.data);
    }

    return selectChannelContents(resources, includeChannels);
  }

  return {
    name: `astro-arena:live-channel:${channelId}`,
    async loadCollection({ filter }) {
      try {
        const resources = await loadPage(filter);
        const dates = resources
          .map(resourceDate)
          .filter((date): date is Date => date !== undefined);
        const lastModified = dates.length
          ? new Date(Math.max(...dates.map((date) => date.getTime())))
          : undefined;

        return {
          entries: resources.map(liveEntry),
          cacheHint: {
            ...(lastModified ? { lastModified } : {}),
            tags: [`arena:channel:${channelId}`],
          },
        };
      } catch (error) {
        return { error: toArenaLoaderError(error, "The live channel request") };
      }
    },
    async loadEntry({ filter }) {
      try {
        const { id: entryId, ...runtimeQuery } = filter;
        const resources = await loadPage(runtimeQuery);
        const resource = resources.find((item) => getArenaEntryId(item) === entryId);
        return resource ? liveEntry(resource) : undefined;
      } catch (error) {
        return { error: toArenaLoaderError(error, "The live channel entry request") };
      }
    },
  };
}
