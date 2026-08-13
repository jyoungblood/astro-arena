import { ArenaAuthError, ArenaRateLimitError } from "@aredotna/sdk";
import { describe, expect, it } from "vitest";
import { ArenaLoaderError, toArenaLoaderError } from "../src/errors.js";

describe("ArenaLoaderError", () => {
  it("maps authentication errors without credentials", () => {
    const secret = "do-not-display-this-token";
    const cause = new ArenaAuthError(secret, { status: 401 });
    const error = toArenaLoaderError(cause, "The block request");

    expect(error).toMatchObject({ code: "AUTHENTICATION_ERROR", status: 401 });
    expect(error.message).not.toContain(secret);
    expect(error.cause).toBe(cause);
  });

  it("maps rate-limit errors", () => {
    const cause = new ArenaRateLimitError("limited", { status: 429 });
    const error = toArenaLoaderError(cause, "The channel request");

    expect(error).toMatchObject({ code: "RATE_LIMITED", status: 429 });
  });

  it("does not copy unknown error messages", () => {
    const secret = "unknown-secret";
    const error = toArenaLoaderError(new Error(secret), "The request");

    expect(error).toBeInstanceOf(ArenaLoaderError);
    expect(error.message).not.toContain(secret);
  });
});
