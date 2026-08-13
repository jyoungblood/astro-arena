import { readdirSync, readFileSync } from "node:fs";
import { extname, join, resolve } from "node:path";

const projectRoot = resolve(import.meta.dirname, "..");

function markdownFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? markdownFiles(path) : extname(path) === ".md" ? [path] : [];
  });
}

const files = [join(projectRoot, "README.md"), ...markdownFiles(join(projectRoot, "docs"))];
const links = new Set(
  files.flatMap((file) =>
    [...readFileSync(file, "utf8").matchAll(/\[[^\]]+\]\((https?:\/\/[^)]+)\)/g)].map(
      (match) => match[1],
    ),
  ),
);

const errors = [];
for (const link of links) {
  try {
    const response = await fetch(link, {
      headers: { "User-Agent": "astro-arena-link-check/0.1" },
      redirect: "follow",
      signal: AbortSignal.timeout(20_000),
    });
    if (!response.ok) errors.push(`${link}: HTTP ${response.status}`);
  } catch (error) {
    errors.push(`${link}: ${error instanceof Error ? error.message : "request failed"}`);
  }
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(`External link checks passed for ${links.size} links.`);
