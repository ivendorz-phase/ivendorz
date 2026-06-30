import { chromium } from "playwright";
import { AxeBuilder } from "@axe-core/playwright";

const PORT = process.argv[2] || "3013";
const OUT =
  "C:/Users/engra/AppData/Local/Temp/claude/e--Projects-iVendorz/3dc8ed6d-a8d2-4fd8-9525-8db5a75bd701/scratchpad";
const cases = [
  {
    url: "/previewclar",
    tag: "host",
    vps: [
      ["desktop", 1440, 900],
      ["tablet", 768, 900],
      ["mobile", 390, 900],
    ],
  },
  { url: "/previewclar?nf=1", tag: "notfound", vps: [["desktop", 1440, 900]] },
];
const browser = await chromium.launch();
for (const c of cases) {
  for (const [name, width, height] of c.vps) {
    const ctx = await browser.newContext({ viewport: { width, height } });
    const page = await ctx.newPage();
    await page.goto(`http://localhost:${PORT}${c.url}`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(600);
    await page.screenshot({ path: `${OUT}/m-clar-${c.tag}-${name}.png`, fullPage: true });
    if (name === "desktop") {
      const r = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "best-practice"])
        .analyze();
      const v = r.violations.map((x) => ({ id: x.id, impact: x.impact, nodes: x.nodes.length }));
      const headings = await page.evaluate(() =>
        Array.from(document.querySelectorAll("h1,h2,h3")).map(
          (h) => `${h.tagName}:${h.textContent.trim().slice(0, 24)}`,
        ),
      );
      console.log(
        `AXE[${c.tag}] ${v.length} ${JSON.stringify(v)} HEADINGS ${JSON.stringify(headings)}`,
      );
    }
    console.log("shot", c.tag, name);
    await ctx.close();
  }
}
await browser.close();
