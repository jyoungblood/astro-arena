import { describe, expect, it } from "vitest";
import { ArenaLoaderError } from "../src/errors.js";
import { parseBlockReference, parseChannelReference } from "../src/source.js";

describe("parseChannelReference", () => {
  it.each([
    ["arena-influences", "arena-influences"],
    [123, 123],
    ["123", 123],
    ["https://www.are.na/are-na-team/arena-influences", "arena-influences"],
    ["https://are.na/are-na-team/arena-influences/", "arena-influences"],
    ["https://api.are.na/v3/channels/arena-influences", "arena-influences"],
    ["https://api.are.na/v3/channels/123", 123],
  ])("parses %s", (input, id) => {
    expect(parseChannelReference(input)).toEqual({ id, kind: "channel" });
  });

  it.each([
    "",
    0,
    -1,
    "https://example.com/person/channel",
    "http://www.are.na/person/channel",
    "https://www.are.na/block/123",
    "https://api.are.na/v3/blocks/123",
    "https://api.are.na/v3/channels/channel/contents",
  ])("rejects %s", (input) => {
    expect(() => parseChannelReference(input)).toThrowError(ArenaLoaderError);
  });
});

describe("parseBlockReference", () => {
  it.each([
    [123, 123],
    ["123", 123],
    ["https://www.are.na/block/45029519", 45029519],
    ["https://api.are.na/v3/blocks/45029519", 45029519],
  ])("parses %s", (input, id) => {
    expect(parseBlockReference(input)).toEqual({ id, kind: "block" });
  });

  it.each([
    "block-slug",
    0,
    -1,
    "https://example.com/block/123",
    "http://www.are.na/block/123",
    "https://www.are.na/person/channel",
    "https://api.are.na/v3/channels/123",
  ])("rejects %s", (input) => {
    expect(() => parseBlockReference(input)).toThrowError(ArenaLoaderError);
  });
});
