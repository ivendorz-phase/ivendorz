import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const BASE = process.argv[2] || "http://localhost:3001";
const OUT = "e:/Projects/iVendorz/governanceReviews/milestones/public-m2-4";
mkdirSync(OUT, { recursive: true });

const shots = [
  { name: "profile-desktop-patched", path: "/vendors/padma-valve-fittings", w: 1440, h: 1100 },
  { name: "regress-workspace-company", path: "/workspace/company", w: 1440, h: 1000 },
];

const browser = await chromium.launch();
const results = [];
for (const s of shots) {
  const ctx = await browser.newContext({
    viewport: { width: s.w, height: s.h },
    deviceScaleFactor: 1,
  });
  const page = await ctx.newPage();
  try {
    const resp = await page.goto(BASE + s.path, { waitUntil: "networkidle", timeout: 60000 });
    await page.waitForTimeout(700);
    await page.screenshot({ path: `${OUT}/${s.name}.png`, fullPage: true });
    results.push(`${s.name}: HTTP ${resp ? resp.status() : "?"}`);
  } catch (e) {
    results.push(`${s.name}: ERROR ${e.message}`);
  }
  await ctx.close();
}
await browser.close();
console.log(results.join("\n"));
