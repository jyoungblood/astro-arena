declare module "astro:env/server" {
  export function getSecret(key: string): string | undefined;
}
