import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";

const environment = {
  ...process.env,
  NPM_CONFIG_CACHE: join(tmpdir(), "astro-arena-npm-cache"),
};

for (const [command, args] of [
  ["pnpm", ["exec", "publint"]],
  ["pnpm", ["exec", "attw", "--pack", "--profile", "esm-only"]],
]) {
  const result = spawnSync(command, args, { env: environment, stdio: "inherit" });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}
