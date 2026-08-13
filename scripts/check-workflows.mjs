import { readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { createLinter } from "actionlint";

const workflowDirectory = resolve(import.meta.dirname, "../.github/workflows");
const lint = await createLinter();
const findings = [];

for (const file of readdirSync(workflowDirectory)) {
  if (!file.endsWith(".yml") && !file.endsWith(".yaml")) continue;
  const path = join(workflowDirectory, file);
  findings.push(...lint(readFileSync(path, "utf8"), path));
}

if (findings.length) {
  for (const finding of findings) {
    console.error(`${finding.file}:${finding.line}:${finding.column}: ${finding.message}`);
  }
  process.exit(1);
}

console.log("GitHub Actions checks passed.");
