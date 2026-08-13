import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";
import type { ArenaLoaderError } from "../src/errors.js";
import { blockLoader } from "../src/loaders/block.js";
import { blockFixture } from "./fixtures.js";
import { createLoaderContext } from "./loader-context.js";
import { server } from "./msw.js";

const endpoint = "https://api.are.na/v3/blocks/:id";

describe("blockLoader", () => {
  it("loads a public block", async () => {
    server.use(
      http.get(endpoint, () =>
        HttpResponse.json(blockFixture("Text"), { headers: { ETag: '"one"' } }),
      ),
    );
    const fixture = createLoaderContext();

    await blockLoader({ id: 101 }).load(fixture.context);

    expect(fixture.entries.get("101")).toMatchObject({ id: "101", body: "Hello **Arena**" });
    expect(fixture.metadata.get("arena:etag")).toBe('"one"');
  });

  it("sends credentials for a private block", async () => {
    server.use(
      http.get(endpoint, ({ request }) => {
        expect(request.headers.get("authorization")).toBe(
          ["Bearer", "private-fixture-token"].join(" "),
        );
        return HttpResponse.json(blockFixture("Image"));
      }),
    );
    const fixture = createLoaderContext();

    await blockLoader({ id: 101, token: "private-fixture-token" }).load(fixture.context);
    expect(fixture.entries.has("101")).toBe(true);
  });

  it("keeps the store after an unmodified response", async () => {
    let requests = 0;
    server.use(
      http.get(endpoint, ({ request }) => {
        requests += 1;
        if (requests === 1) {
          return HttpResponse.json(blockFixture("Text"), { headers: { ETag: '"same"' } });
        }
        expect(request.headers.get("if-none-match")).toBe('"same"');
        return new HttpResponse(null, { status: 304 });
      }),
    );
    const fixture = createLoaderContext();
    const loader = blockLoader({ id: 101 });

    await loader.load(fixture.context);
    const stored = fixture.entries.get("101");
    await loader.load(fixture.context);

    expect(fixture.entries.get("101")).toBe(stored);
    expect(requests).toBe(2);
  });

  it("does not use an old ETag after the source changes", async () => {
    server.use(
      http.get(endpoint, ({ params, request }) => {
        if (params.id === "102") {
          expect(request.headers.has("if-none-match")).toBe(false);
        }
        return HttpResponse.json(blockFixture("Text", { id: Number(params.id) }), {
          headers: { ETag: `"${params.id}"` },
        });
      }),
    );
    const fixture = createLoaderContext();

    await blockLoader({ id: 101 }).load(fixture.context);
    await blockLoader({ id: 102 }).load(fixture.context);
    expect(fixture.entries.has("102")).toBe(true);
  });

  for (const [status, code] of [
    [401, "AUTHENTICATION_ERROR"],
    [403, "FORBIDDEN"],
    [404, "NOT_FOUND"],
    [429, "RATE_LIMITED"],
  ] as const) {
    it(`maps HTTP ${status} and keeps existing data`, async () => {
      server.use(
        http.get(endpoint, () => HttpResponse.json({ message: "request failed" }, { status })),
      );
      const existing = { id: "old", data: { title: "keep" } };
      const fixture = createLoaderContext([existing]);

      await expect(
        blockLoader({ id: 101, retry: { maxRetries: 0 } }).load(fixture.context),
      ).rejects.toMatchObject({
        code,
      });
      expect(fixture.entries.get("old")).toBe(existing);
    });
  }

  it("rejects malformed block data without clearing the store", async () => {
    server.use(http.get(endpoint, () => HttpResponse.json({ id: 101, type: "Unknown" })));
    const existing = { id: "old", data: { title: "keep" } };
    const fixture = createLoaderContext([existing]);

    await expect(blockLoader({ id: 101 }).load(fixture.context)).rejects.toMatchObject({
      code: "INVALID_RESPONSE",
    } satisfies Partial<ArenaLoaderError>);
    expect(fixture.entries.get("old")).toBe(existing);
  });
});
