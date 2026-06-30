import { chromium } from "playwright";
import { AxeBuilder } from "@axe-core/playwright";

const PORT = process.argv[2] || "3013";
const OUT =
  "C:/Users/engra/AppData/Local/Temp/claude/e--Projects-iVendorz/3dc8ed6d-a8d2-4fd8-9525-8db5a75bd701/scratchpad";
const browser = await chromium.launch();

async function check(path, tag) {
  const ctx = await browser.newContext({ viewport: { width: 1200, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(`http://localhost:${PORT}${path}`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(700);
  await page.screenshot({ path: `${OUT}/platform-fixes-${tag}.png`, fullPage: true });
  const r = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  const v = r.violations.map((x) => ({
    id: x.id,
    impact: x.impact,
    nodes: x.nodes.length,
    targets: x.nodes.flatMap((n) => n.target).slice(0, 4),
  }));
  const headings = await page.evaluate(() =>
    Array.from(document.querySelectorAll("h1,h2,h3,h4")).map(
      (h) => `${h.tagName}:${h.textContent.trim().slice(0, 24)}`,
    ),
  );
  console.log(`AXE[${tag}] violations: ${v.length} ${JSON.stringify(v)}`);
  console.log(`HEADINGS[${tag}] ${JSON.stringify(headings)}`);
  await ctx.close();
}

await check("/previewpf", "preview");
await browser.close();
