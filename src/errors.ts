import {
  ArenaApiError,
  ArenaAuthError,
  ArenaForbiddenError,
  ArenaNetworkError,
  ArenaNotFoundError,
  ArenaRateLimitError,
  ArenaValidationError,
} from "@aredotna/sdk";

export type ArenaLoaderErrorCode =
  | "AUTHENTICATION_ERROR"
  | "FORBIDDEN"
  | "INVALID_RESPONSE"
  | "INVALID_SOURCE"
  | "NETWORK_ERROR"
  | "NOT_FOUND"
  | "RATE_LIMITED"
  | "REQUEST_ERROR";

export interface ArenaLoaderErrorOptions {
  cause?: unknown;
  status?: number;
}

/** A safe, structured failure from an astro-arena loader. */
export class ArenaLoaderError extends Error {
  readonly code: ArenaLoaderErrorCode;
  readonly status: number | undefined;

  constructor(
    code: ArenaLoaderErrorCode,
    message: string,
    { cause, status }: ArenaLoaderErrorOptions = {},
  ) {
    super(message, cause === undefined ? undefined : { cause });
    this.name = "ArenaLoaderError";
    this.code = code;
    this.status = status;
  }
}

export function toArenaLoaderError(error: unknown, action: string): ArenaLoaderError {
  if (error instanceof ArenaLoaderError) {
    return error;
  }

  if (error instanceof ArenaAuthError) {
    return new ArenaLoaderError(
      "AUTHENTICATION_ERROR",
      `${action} failed because Are.na rejected the credentials. Check ARENA_BEARER_TOKEN.`,
      { cause: error, status: error.status },
    );
  }

  if (error instanceof ArenaForbiddenError) {
    return new ArenaLoaderError(
      "FORBIDDEN",
      `${action} failed because the account cannot access this Are.na resource.`,
      { cause: error, status: error.status },
    );
  }

  if (error instanceof ArenaNotFoundError) {
    return new ArenaLoaderError(
      "NOT_FOUND",
      `${action} failed because the Are.na resource does not exist or is not visible.`,
      { cause: error, status: error.status },
    );
  }

  if (error instanceof ArenaRateLimitError) {
    return new ArenaLoaderError(
      "RATE_LIMITED",
      `${action} failed because the Are.na rate limit was reached. Retry after the reset time.`,
      { cause: error, status: error.status },
    );
  }

  if (error instanceof ArenaNetworkError) {
    return new ArenaLoaderError(
      "NETWORK_ERROR",
      `${action} failed because Are.na could not be reached. Check the network connection.`,
      { cause: error },
    );
  }

  if (error instanceof ArenaValidationError) {
    return new ArenaLoaderError(
      "INVALID_RESPONSE",
      `${action} failed because Are.na rejected the request or returned invalid data.`,
      { cause: error, status: error.status },
    );
  }

  if (error instanceof ArenaApiError) {
    return new ArenaLoaderError(
      "REQUEST_ERROR",
      `${action} failed because Are.na returned HTTP ${error.status}.`,
      { cause: error, status: error.status },
    );
  }

  return new ArenaLoaderError(
    "REQUEST_ERROR",
    `${action} failed because an unexpected error occurred.`,
    { cause: error },
  );
}
