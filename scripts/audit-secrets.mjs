import { readdirSync, readFileSync } from "node:fs";
import { basename, join, resolve } from "node:path";

const projectRoot = resolve(import.meta.dirname, "..");
const roots = [projectRoot, resolve(projectRoot, "../astro-arena-playground")];
const ignored = new Set([".git", ".astro", "coverage", "dist", "node_modules"]);
const findings = [];

const patterns = [
  {
    label: "nonempty Are.na environment value",
    regex: /ARENA_BEARER_TOKEN[ \t]*=[ \t]*(?!replace_with_your_token\b)\S+/g,
  },
  { label: "literal bearer credential", regex: /Bearer\s+[A-Za-z0-9._~-]{12,}/g },
  { label: "npm credential", regex: /\bnpm_[A-Za-z0-9]{20,}\b/g },
  { label: "GitHub credential", regex: /\b(?:ghp|github_pat)_[A-Za-z0-9_]{20,}\b/g },
];

function visit(path) {
  for (const entry of readdirSync(path, { withFileTypes: true })) {
    if (ignored.has(entry.name) || entry.isSymbolicLink()) continue;
    const entryPath = join(path, entry.name);
    if (entry.isDirectory()) {
      visit(entryPath);
      continue;
    }

    let source;
    try {
      source = readFileSync(entryPath, "utf8");
    } catch {
      continue;
    }

    for (const pattern of patterns) {
      for (const match of source.matchAll(pattern.regex)) {
        const line = source.slice(0, match.index).split("\n").length;
        findings.push(`${entryPath}:${line}: ${pattern.label}`);
      }
    }
  }
}

for (const root of roots) visit(root);

if (findings.length) {
  console.error(findings.join("\n"));
  process.exit(1);
}

console.log(`Credential audit passed for ${roots.map((root) => basename(root)).join(" and ")}.`);
