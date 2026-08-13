import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const temporaryDirectory = mkdtempSync(join(tmpdir(), "astro-arena-tarball-"));
const npmCache = join(tmpdir(), "astro-arena-npm-cache");
const environment = { ...process.env, NPM_CONFIG_CACHE: npmCache };

execFileSync("npm", ["pack", "--pack-destination", temporaryDirectory], {
  cwd: resolve(import.meta.dirname, ".."),
  env: environment,
  stdio: "inherit",
});

const tarball = join(temporaryDirectory, "astro-arena-0.1.0.tgz");
writeFileSync(
  join(temporaryDirectory, "package.json"),
  JSON.stringify({ name: "astro-arena-install-test", private: true, type: "module" }),
);
execFileSync("npm", ["install", "--ignore-scripts", "--no-package-lock", tarball], {
  cwd: temporaryDirectory,
  env: environment,
  stdio: "inherit",
});
writeFileSync(
  join(temporaryDirectory, "verify.mjs"),
  'import { arena } from "astro-arena"; import { getPing } from "astro-arena/api"; if (typeof arena.channel !== "function" || typeof getPing !== "function") process.exit(1);\n',
);
execFileSync("node", ["verify.mjs"], {
  cwd: temporaryDirectory,
  env: environment,
  stdio: "inherit",
});

const installedPackage = JSON.parse(
  readFileSync(join(temporaryDirectory, "node_modules", "astro-arena", "package.json"), "utf8"),
);
if (installedPackage.version !== "0.1.0") {
  throw new Error("The clean installation did not contain astro-arena@0.1.0.");
}
