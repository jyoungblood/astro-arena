import { describe, expect, it } from "vitest";
import { arena } from "../../src/index.js";

const smokeEnabled = process.env.ARENA_SMOKE_TEST === "1";

describe.skipIf(!smokeEnabled)("public Are.na v3 smoke test", () => {
  it("gets one item from Arena Influences without a token", async () => {
    const client = arena.client({ token: false });
    const page = await client.channels.contents("arena-influences", { page: 1, per: 1 });

    expect(page.data).toHaveLength(1);
    expect(page.meta.current_page).toBe(1);
    expect(page.data[0]?.id).toBeTypeOf("number");
  }, 30_000);
});
