import type { Block } from "@aredotna/sdk";
import { getBlock } from "@aredotna/sdk/api";
import type { AstroArenaClientOptions } from "../auth.js";
import { createArenaClient } from "../client.js";
import { arenaBlockSchema, createArenaDataEntry } from "../data.js";
import { ArenaLoaderError, toArenaLoaderError } from "../errors.js";
import type { ArenaStaticLoader } from "../loader-types.js";
import { type ArenaBlockReference, parseBlockReference } from "../source.js";
import { conditionalHeaders, createRequestFingerprint, saveRequestMetadata } from "../sync.js";

type BlockSourceOption =
  | { id: ArenaBlockReference; url?: never }
  | { id?: never; url: ArenaBlockReference };

export type ArenaBlockLoaderOptions = AstroArenaClientOptions & BlockSourceOption;

export function blockLoader(
  options: ArenaBlockLoaderOptions,
): ArenaStaticLoader<typeof arenaBlockSchema> {
  const { id, url, ...clientOptions } = options;
  const source = id ?? url;
  const parsed = parseBlockReference(source);
  if (typeof parsed.id !== "number") {
    throw new ArenaLoaderError("INVALID_SOURCE", "The Are.na block ID must be a positive number.");
  }
  const blockId = parsed.id;
  const fingerprint = createRequestFingerprint({
    baseUrl: clientOptions.baseUrl,
    id: blockId,
    kind: "block",
  });

  return {
    name: `astro-arena:block:${blockId}`,
    schema: arenaBlockSchema,
    async load(context) {
      const arenaClient = createArenaClient(clientOptions);

      try {
        const result = await getBlock({
          client: arenaClient.client,
          headers: conditionalHeaders(context.meta, fingerprint),
          path: { id: blockId },
          throwOnError: false,
        });

        if (result.response.status === 304) {
          return;
        }

        if (result.error) {
          throw result.error;
        }

        const parsedBlock = arenaBlockSchema.safeParse(result.data);
        if (!parsedBlock.success) {
          throw new ArenaLoaderError(
            "INVALID_RESPONSE",
            "The block request failed because Are.na returned invalid block data.",
            { cause: parsedBlock.error, status: result.response.status },
          );
        }

        const entry = await createArenaDataEntry(parsedBlock.data as Block, context);
        context.store.clear();
        context.store.set(entry);
        saveRequestMetadata(context.meta, fingerprint, result.response);
      } catch (error) {
        throw toArenaLoaderError(error, "The block request");
      }
    },
  };
}
