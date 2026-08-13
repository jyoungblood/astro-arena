import type { GetChannelContentsData } from "@aredotna/sdk/api";
import { getChannelContents } from "@aredotna/sdk/api";
import type { AstroArenaClientOptions } from "../auth.js";
import { createArenaClient } from "../client.js";
import {
  type ArenaChannelContent,
  arenaEntrySchema,
  createArenaDataEntry,
  selectChannelContents,
} from "../data.js";
import { ArenaLoaderError, toArenaLoaderError } from "../errors.js";
import type { ArenaStaticLoader } from "../loader-types.js";
import { type ArenaChannelReference, parseChannelReference } from "../source.js";
import { conditionalHeaders, createRequestFingerprint, saveRequestMetadata } from "../sync.js";

export type ArenaChannelQuery = NonNullable<GetChannelContentsData["query"]> &
  Record<string, unknown>;

type ChannelSourceOption =
  | { id: ArenaChannelReference; url?: never }
  | { id?: never; url: ArenaChannelReference };

export type ArenaChannelLoaderOptions = AstroArenaClientOptions &
  ChannelSourceOption & {
    /** Keep channels connected inside this channel. Blocks are always kept. */
    includeChannels?: boolean;
    /** Parameters forwarded to the Are.na channel contents endpoint. */
    query?: ArenaChannelQuery;
  };

export function channelLoader(
  options: ArenaChannelLoaderOptions,
): ArenaStaticLoader<typeof arenaEntrySchema> {
  const { id, includeChannels = false, query, url, ...clientOptions } = options;
  const source = id ?? url;
  const { id: channelId } = parseChannelReference(source);
  const fingerprint = createRequestFingerprint({
    baseUrl: clientOptions.baseUrl,
    channelId,
    includeChannels,
    kind: "channel",
    query,
  });

  return {
    name: `astro-arena:channel:${channelId}`,
    schema: arenaEntrySchema,
    async load(context) {
      const arenaClient = createArenaClient(clientOptions);

      try {
        const result = await getChannelContents({
          client: arenaClient.client,
          headers: conditionalHeaders(context.meta, fingerprint),
          path: { id: String(channelId) },
          ...(query === undefined ? {} : { query }),
          throwOnError: false,
        });

        if (result.response.status === 304) {
          context.logger.debug(`Are.na channel ${channelId} is unchanged.`);
          return;
        }

        if (result.error) {
          throw result.error;
        }

        if (!result.data || !Array.isArray(result.data.data)) {
          throw new ArenaLoaderError(
            "INVALID_RESPONSE",
            "The channel request failed because Are.na returned invalid channel data.",
            { status: result.response.status },
          );
        }

        const resources: Array<ArenaChannelContent> = [];
        for (const resource of result.data.data) {
          const parsedResource = arenaEntrySchema.safeParse(resource);
          if (!parsedResource.success) {
            throw new ArenaLoaderError(
              "INVALID_RESPONSE",
              "The channel request failed because Are.na returned an invalid channel item.",
              { cause: parsedResource.error, status: result.response.status },
            );
          }
          resources.push(parsedResource.data);
        }

        const entries = await Promise.all(
          selectChannelContents(resources, includeChannels).map((resource) =>
            createArenaDataEntry(resource, context),
          ),
        );

        context.store.clear();
        for (const entry of entries) {
          context.store.set(entry);
        }
        saveRequestMetadata(context.meta, fingerprint, result.response);
        context.logger.info(`Loaded ${entries.length} entries from Are.na channel ${channelId}.`);
      } catch (error) {
        throw toArenaLoaderError(error, "The channel request");
      }
    },
  };
}
