import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";
import { liveChannelLoader } from "../src/loaders/live-channel.js";
import { blockFixture, channelFixture } from "./fixtures.js";
import { server } from "./msw.js";

const endpoint = "https://api.are.na/v3/channels/:id/contents";
const body = () => ({
  data: [blockFixture("Text"), channelFixture()],
  meta: {
    current_page: 1,
    has_more_pages: false,
    next_page: null,
    per_page: 2,
    total_count: 2,
    total_pages: 1,
  },
});

describe("liveChannelLoader", () => {
  it("loads one collection page and gives runtime filters precedence", async () => {
    let requests = 0;
    server.use(
      http.get(endpoint, ({ request }) => {
        requests += 1;
        expect(Object.fromEntries(new URL(request.url).searchParams)).toEqual({
          page: "3",
          per: "12",
        });
        return HttpResponse.json(body());
      }),
    );
    const loader = liveChannelLoader({ id: 101, query: { page: 1, per: 12 } });

    const result = await loader.loadCollection({ collection: "live", filter: { page: 3 } });

    expect(requests).toBe(1);
    expect("entries" in result && result.entries).toHaveLength(1);
    expect("cacheHint" in result && result.cacheHint).toMatchObject({
      tags: ["arena:channel:101"],
      lastModified: new Date("2026-01-02T00:00:00.000Z"),
    });
    expect("cacheHint" in result && result.cacheHint).not.toHaveProperty("maxAge");
  });

  it("loads block and nested-channel entries with stable cache tags", async () => {
    server.use(http.get(endpoint, () => HttpResponse.json(body())));
    const loader = liveChannelLoader({ id: 101, includeChannels: true });

    const block = await loader.loadEntry({ collection: "live", filter: { id: "101" } });
    const channel = await loader.loadEntry({ collection: "live", filter: { id: "channel:101" } });

    expect(block).toMatchObject({ id: "101", cacheHint: { tags: ["arena:block:101"] } });
    expect(channel).toMatchObject({
      id: "channel:101",
      cacheHint: { tags: ["arena:channel:101"] },
    });
  });

  it("returns undefined for a missing or filtered nested-channel entry", async () => {
    server.use(http.get(endpoint, () => HttpResponse.json(body())));
    const loader = liveChannelLoader({ id: 101 });

    await expect(
      loader.loadEntry({ collection: "live", filter: { id: "missing" } }),
    ).resolves.toBeUndefined();
    await expect(
      loader.loadEntry({ collection: "live", filter: { id: "channel:101" } }),
    ).resolves.toBeUndefined();
  });

  it("returns normalized errors through the live loader contract", async () => {
    server.use(
      http.get(endpoint, () => HttpResponse.json({ message: "no access" }, { status: 403 })),
    );
    const loader = liveChannelLoader({ id: 101 });

    await expect(loader.loadCollection({ collection: "live" })).resolves.toMatchObject({
      error: { code: "FORBIDDEN" },
    });
  });
});
