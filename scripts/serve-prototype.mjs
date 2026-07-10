#!/usr/bin/env node
/**
 * Serve a high-fidelity clickable prototype for Stage-4 visual review.
 *
 *   npm run prototype                 → serves prototypes/admin-console
 *   npm run prototype review-system   → serves prototypes/review-system
 *   npm run prototype -- --port 9000  → custom port
 *
 * The CLICKABLE prototype is the PRIMARY Stage-4 review artifact (owner ruling
 * 2026-07-08). Screenshots are evidence for the audit trail, never the review
 * surface. Static files only — no build, no backend. Node (not python) per the
 * local-server lesson on this box.
 */
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const args = process.argv.slice(2);
let dir = "admin-console";
let port = 8080;
for (let i = 0; i < args.length; i++) {
  if (args[i] === "--port" || args[i] === "-p") port = Number(args[++i]);
  else if (!args[i].startsWith("-")) dir = args[i];
}

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const root = path.join(repoRoot, "prototypes", dir);
if (!fs.existsSync(path.join(root, "index.html"))) {
  console.error(`✗ No prototype at prototypes/${dir}/index.html`);
  console.error(
    `  Available: ${fs
      .readdirSync(path.join(repoRoot, "prototypes"))
      .filter((d) => fs.existsSync(path.join(repoRoot, "prototypes", d, "index.html")))
      .join(", ")}`,
  );
  process.exit(1);
}

const MIME = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "text/javascript",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
};

http
  .createServer((req, res) => {
    const clean = decodeURIComponent(req.url.split("?")[0].split("#")[0]);
    let file = path.join(root, clean === "/" ? "index.html" : clean);
    if (!path.resolve(file).startsWith(root)) {
      res.writeHead(403);
      return res.end("403");
    }
    fs.readFile(file, (err, data) => {
      if (err) {
        res.writeHead(404);
        return res.end("404 — not found");
      }
      res.writeHead(200, {
        "content-type": MIME[path.extname(file)] || "application/octet-stream",
        "cache-control": "no-store",
      });
      res.end(data);
    });
  })
  .listen(port, () => {
    console.log(`\n  ✓ Prototype:  prototypes/${dir}`);
    console.log(`  ✓ Reviewing:  http://localhost:${port}\n`);
    console.log(`  The clickable prototype is the primary Stage-4 artifact. Ctrl-C to stop.\n`);
  });
