// repo.manifest.json generator — REPOSITORY_STRUCTURE v1.1 P-5 / Board G1 ask ⑨ (2026-07-06).
//
// The manifest is GENERATED metadata for AI tooling: derived from the constitution's directory
// registry, regenerated on every structure change and committed together with it. It is never
// hand-edited and never an independently maintained source of truth — this script is the only
// writer. The version field is read from REPOSITORY_STRUCTURE.md so the two cannot drift.
//
//   node scripts/build-repo-manifest.mjs           # (re)generate repo.manifest.json
//   node scripts/build-repo-manifest.mjs --check   # verify: fails if the committed manifest
//                                                  # differs from freshly generated output

import { existsSync, readFileSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const TARGET = path.join(ROOT, "repo.manifest.json");

// Version comes from the Structural Constitution header — the single source.
const constitution = readFileSync(path.join(ROOT, "REPOSITORY_STRUCTURE.md"), "utf8");
const versionMatch = constitution.match(/^\*\*Version:\*\* v([\d.]+)/m);
if (!versionMatch) {
  console.error("✖ Could not read **Version:** from REPOSITORY_STRUCTURE.md");
  process.exit(1);
}

// Area map per the v1.1 P-4 directory registry (closed list — changing it requires a
// constitution patch, exactly like scripts/check-structure.mjs).
const AREAS = {
  frozenCorpus: "generatedDocs/",
  governance: "governanceReviews/",
  livingDocs: "docs/",
  projectManagement: "project-management/",
  designSources: "design/",
  prompts: "prompts/",
  templates: "templates/",
  examples: "examples/",
  prototypes: "prototypes/",
};

const missing = Object.values(AREAS).filter((dir) => {
  const p = path.join(ROOT, dir);
  return !existsSync(p) || !statSync(p).isDirectory();
});
if (missing.length) {
  console.error(`✖ Registered area(s) missing on disk: ${missing.join(", ")}`);
  process.exit(1);
}

const manifest = { version: versionMatch[1], ...AREAS };
const output = JSON.stringify(manifest, null, 2) + "\n";

if (process.argv.includes("--check")) {
  const committed = existsSync(TARGET) ? readFileSync(TARGET, "utf8") : "";
  if (committed !== output) {
    console.error(
      "✖ repo.manifest.json is stale — regenerate with: node scripts/build-repo-manifest.mjs",
    );
    process.exit(1);
  }
  console.log(`✔ repo.manifest.json matches the registry (v${manifest.version}).`);
} else {
  writeFileSync(TARGET, output);
  console.log(`✔ repo.manifest.json generated (v${manifest.version}).`);
}
