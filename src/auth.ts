import type { ArenaOptions, TokenProvider } from "@aredotna/sdk";

export const ARENA_TOKEN_ENV = "ARENA_BEARER_TOKEN";

export type ArenaTokenOption = TokenProvider | false;
export type SecretReader = (key: string) => string | undefined | Promise<string | undefined>;

export interface AstroArenaClientOptions extends Omit<ArenaOptions, "token"> {
  /**
   * A personal access token, a lazy token getter, or `false` for an anonymous request.
   * When omitted, astro-arena reads ARENA_BEARER_TOKEN through astro:env/server.
   */
  token?: ArenaTokenOption;
}

export async function readAstroSecret(key: string): Promise<string | undefined> {
  try {
    const { getSecret } = await import("astro:env/server");
    return getSecret(key);
  } catch {
    // Public SDK use can occur outside an initialized Astro runtime.
    return undefined;
  }
}

export function toArenaSdkOptions(
  options: AstroArenaClientOptions = {},
  readSecret: SecretReader = readAstroSecret,
): ArenaOptions {
  const { token, ...sdkOptions } = options;

  if (token === false) {
    return sdkOptions;
  }

  if (token !== undefined) {
    return { ...sdkOptions, token };
  }

  return {
    ...sdkOptions,
    token: () => readSecret(ARENA_TOKEN_ENV),
  };
}
