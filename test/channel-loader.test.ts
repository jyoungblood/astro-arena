import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";
import { channelLoader } from "../src/loaders/channel.js";
import { blockFixture, channelFixture } from "./fixtures.js";
import { createLoaderContext } from "./loader-context.js";
import { server } from "./msw.js";

const endpoint = "https://api.are.na/v3/channels/:id/contents";
const responseBody = () => ({
  data: [blockFixture("Text"), channelFixture()],
  meta: {
    current_page: 2,
    has_more_pages: true,
    next_page: 3,
    per_page: 24,
    total_count: 30,
    total_pages: 2,
  },
});

describe("channelLoader", () => {
  it("forwards query parameters in exactly one request", async () => {
    let requests = 0;
    server.use(
      http.get(endpoint, ({ request }) => {
        requests += 1;
        const query = new URL(request.url).searchParams;
        expect(Object.fromEntries(query)).toEqual({
          page: "2",
          per: "24",
          sort: "position_desc",
          user_id: "42",
        });
        return HttpResponse.json(responseBody());
      }),
    );
    const fixture = createLoaderContext();

    await channelLoader({
      query: { page: 2, per: 24, sort: "position_desc", user_id: 42 },
      url: "https://www.are.na/are-na-team/arena-influences",
    }).load(fixture.context);

    expect(requests).toBe(1);
    expect(fixture.entries.has("101")).toBe(true);
    expect(fixture.entries.has("channel:101")).toBe(false);
  });

  it("retains nested channels and raw connection metadata when requested", async () => {
    const body = responseBody();
    server.use(http.get(endpoint, () => HttpResponse.json(body)));
    const fixture = createLoaderContext();

    await channelLoader({ id: "arena-influences", includeChannels: true }).load(fixture.context);

    const block = fixture.entries.get("101") as { data: ReturnType<typeof blockFixture> };
    const channel = fixture.entries.get("channel:101") as {
      data: ReturnType<typeof channelFixture>;
    };
    expect(block.data.connection).toEqual(body.data[0]?.connection);
    expect(block.data.metadata).toEqual(body.data[0]?.metadata);
    expect(channel.data.connection).toEqual(body.data[1]?.connection);
  });

  it("sends a credential for a private channel", async () => {
    server.use(
      http.get(endpoint, ({ request }) => {
        expect(request.headers.get("authorization")).toBe(["Bearer", "test-credential"].join(" "));
        return HttpResponse.json(responseBody());
      }),
    );
    const fixture = createLoaderContext();

    await channelLoader({ id: 101, token: "test-credential" }).load(fixture.context);
    expect(fixture.entries.has("101")).toBe(true);
  });

  it("keeps the current page after a 304 response", async () => {
    let requests = 0;
    server.use(
      http.get(endpoint, ({ request }) => {
        requests += 1;
        if (requests === 1) {
          return HttpResponse.json(responseBody(), { headers: { ETag: '"channel-page"' } });
        }
        expect(request.headers.get("if-none-match")).toBe('"channel-page"');
        return new HttpResponse(null, { status: 304 });
      }),
    );
    const fixture = createLoaderContext();
    const loader = channelLoader({ id: 101, query: { page: 1 } });

    await loader.load(fixture.context);
    const stored = fixture.entries.get("101");
    await loader.load(fixture.context);

    expect(requests).toBe(2);
    expect(fixture.entries.get("101")).toBe(stored);
  });

  it("does not replace the store after a request error", async () => {
    server.use(
      http.get(endpoint, () => HttpResponse.json({ message: "no access" }, { status: 403 })),
    );
    const existing = { id: "old", data: { title: "keep" } };
    const fixture = createLoaderContext([existing]);

    await expect(channelLoader({ id: 101 }).load(fixture.context)).rejects.toMatchObject({
      code: "FORBIDDEN",
    });
    expect(fixture.entries.get("old")).toBe(existing);
  });
});
