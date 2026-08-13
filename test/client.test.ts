import { describe, expect, it, vi } from "vitest";
import { ARENA_TOKEN_ENV } from "../src/auth.js";
import { createArenaClient } from "../src/client.js";

function createFetchRecorder() {
  const requests: Request[] = [];
  const fetch = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const request = input instanceof Request ? input : new Request(input, init);
    requests.push(request);
    return Response.json({ status: "ok" });
  });

  return { fetch, requests };
}

describe("createArenaClient", () => {
  it("omits authorization when the secret is absent", async () => {
    const { fetch, requests } = createFetchRecorder();
    const readSecret = vi.fn(() => undefined);

    await createArenaClient({ fetch }, readSecret).ping();

    expect(readSecret).toHaveBeenCalledWith(ARENA_TOKEN_ENV);
    expect(requests[0]?.headers.has("authorization")).toBe(false);
  });

  it("uses ARENA_BEARER_TOKEN when no explicit token exists", async () => {
    const { fetch, requests } = createFetchRecorder();

    await createArenaClient({ fetch }, () => "environment-token").ping();

    expect(requests[0]?.headers.get("authorization")).toBe(
      ["Bearer", "environment-token"].join(" "),
    );
  });

  it("prefers an explicit token", async () => {
    const { fetch, requests } = createFetchRecorder();
    const readSecret = vi.fn(() => "environment-token");

    await createArenaClient({ fetch, token: "explicit-token" }, readSecret).ping();

    expect(readSecret).not.toHaveBeenCalled();
    expect(requests[0]?.headers.get("authorization")).toBe(["Bearer", "explicit-token"].join(" "));
  });

  it("forces anonymous access when token is false", async () => {
    const { fetch, requests } = createFetchRecorder();
    const readSecret = vi.fn(() => "environment-token");

    await createArenaClient({ fetch, token: false }, readSecret).ping();

    expect(readSecret).not.toHaveBeenCalled();
    expect(requests[0]?.headers.has("authorization")).toBe(false);
  });
});
