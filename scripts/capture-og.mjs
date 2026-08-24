import { chromium } from "playwright";

const base = process.env.SCROLLY_PREVIEW_URL || "http://127.0.0.1:4173/scrolly-election/";
const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 1200, height: 630 },
  deviceScaleFactor: 1,
  colorScheme: "light",
  reducedMotion: "reduce",
});
const page = await context.newPage();
await page.goto(base, { waitUntil: "networkidle" });
await page.evaluate(async () => {
  await document.fonts.ready;
  document.querySelector(".skip-link")?.remove();
  document.querySelector(".progress")?.remove();
});
await page.screenshot({ path: "public/og.png" });
await browser.close();
