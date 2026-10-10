import { chromium } from "playwright";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
for (const [name, url] of [
  [
    "twenty-table",
    "https://docs.twenty.com/user-guide/views-pipelines/capabilities/table-views",
  ],
  [
    "twenty-record",
    "https://docs.twenty.com/user-guide/layout/capabilities/record-pages",
  ],
]) {
  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.waitForTimeout(1500);
    await page.screenshot({
      path: `docs/references/${name}.png`,
      fullPage: true,
    });
    console.log(`${name}: captured ${page.url()}`);
  } catch {
    console.log(`${name}: unavailable`);
  }
}
await browser.close();
