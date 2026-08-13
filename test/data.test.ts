import { describe, expect, it } from "vitest";
import {
  arenaBlockSchema,
  arenaChannelSchema,
  createArenaDataEntry,
  selectChannelContents,
} from "../src/data.js";
import { blockFixture, channelFixture } from "./fixtures.js";

const context = {
  generateDigest: (data: Record<string, unknown> | string) =>
    JSON.stringify(data).length.toString(16),
  parseData: async <TData extends Record<string, unknown>>({ data }: { data: TData }) => data,
};

describe("Are.na entry data", () => {
  for (const type of ["Text", "Image", "Link", "Attachment", "Embed", "PendingBlock"] as const) {
    it(`preserves a ${type} block`, async () => {
      const resource = blockFixture(type, { future_field: { added: true } });
      const parsed = arenaBlockSchema.parse(resource);
      const entry = await createArenaDataEntry(parsed, context);

      expect(entry.id).toBe("101");
      expect(entry.data).toBe(resource);
      expect((entry.data as unknown as Record<string, unknown>).future_field).toEqual({
        added: true,
      });
      expect(entry.digest).toBeTruthy();
    });
  }

  it("uses text content for Astro rendering", async () => {
    const entry = await createArenaDataEntry(blockFixture("Text"), context);

    expect(entry.body).toBe("Hello **Arena**");
    expect(entry.rendered?.html).toBe("<p>Hello <strong>Arena</strong></p>");
  });

  it("uses a description when text content is absent", async () => {
    const entry = await createArenaDataEntry(blockFixture("Image"), context);

    expect(entry.body).toBe("A **description**");
    expect(entry.rendered?.html).toContain("<strong>description</strong>");
  });

  it("prefixes nested channel IDs and preserves metadata", async () => {
    const resource = channelFixture({ future_field: true });
    const parsed = arenaChannelSchema.parse(resource);
    const entry = await createArenaDataEntry(parsed, context);

    expect(entry.id).toBe("channel:101");
    expect(entry.data).toBe(resource);
    expect(entry.data.connection).toEqual(resource.connection);
    expect(entry.data.metadata).toEqual(resource.metadata);
    expect(entry.id).not.toBe(String(resource.id));
  });

  it("excludes nested channels by default", () => {
    const block = blockFixture("Text");
    const channel = channelFixture();

    expect(selectChannelContents([block, channel])).toEqual([block]);
    expect(selectChannelContents([block, channel], true)).toEqual([block, channel]);
  });
});
