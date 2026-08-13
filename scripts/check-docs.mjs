import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, extname, join, resolve } from "node:path";

const projectRoot = resolve(import.meta.dirname, "..");

function markdownFiles(directory) {
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? markdownFiles(path) : extname(path) === ".md" ? [path] : [];
  });
}

const files = [join(projectRoot, "README.md"), ...markdownFiles(join(projectRoot, "docs"))];
const errors = [];

for (const file of files) {
  const source = readFileSync(file, "utf8");

  for (const match of source.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)) {
    const target = match[1]?.split("#")[0];
    if (!target || /^(?:https?:|mailto:)/.test(target)) continue;
    if (!existsSync(resolve(dirname(file), target))) {
      errors.push(`${file}: missing local link ${target}`);
    }
  }

  const prose = source
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`[^`]+`/g, "technical-name")
    .replace(/\[[^\]]+\]\([^)]+\)/g, "link")
    .replace(/^#+\s+/gm, "")
    .replace(/^[-*>]+\s*/gm, "");

  for (const pattern of [
    { label: "contraction", regex: /\b\w+'(?:ll|re|ve|d|m|t)\b/gi },
    { label: "unsupported modal", regex: /\b(?:should|would|might|could)\b/gi },
    { label: "semicolon", regex: /;/g },
  ]) {
    for (const match of prose.matchAll(pattern.regex)) {
      errors.push(`${file}: ${pattern.label}: ${match[0]}`);
    }
  }

  for (const sentence of prose.split(/[.!?](?:\s+|$)|\n+/)) {
    const words = sentence.match(/[A-Za-z0-9][A-Za-z0-9:'-]*/g) ?? [];
    if (words.length > 25) {
      errors.push(`${file}: sentence has ${words.length} words: ${words.slice(0, 10).join(" ")}…`);
    }
  }
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(`Documentation checks passed for ${files.length} files.`);
