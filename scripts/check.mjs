import { chromium } from "playwright";
import { mkdirSync, readdirSync, unlinkSync } from "node:fs";

const base = process.env.SCROLLY_PREVIEW_URL || "http://127.0.0.1:4173/scrolly-election/";
const output = process.env.SCROLLY_SHOTS || "/tmp/scrolly-election-shots-general";
const viewports = [
  { name: "desktop", width: 1440, height: 900, reducedMotion: "no-preference" },
  { name: "desktop-short", width: 1280, height: 680, reducedMotion: "no-preference" },
  { name: "tablet-edge-high", width: 902, height: 900, reducedMotion: "no-preference" },
  { name: "tablet-edge-low", width: 821, height: 900, reducedMotion: "no-preference" },
  { name: "tablet", width: 820, height: 900, reducedMotion: "no-preference" },
  { name: "phone-wide", width: 517, height: 707, reducedMotion: "no-preference" },
  { name: "phone", width: 390, height: 740, reducedMotion: "no-preference" },
  { name: "phone-small", width: 320, height: 640, reducedMotion: "reduce" },
];

mkdirSync(output, { recursive: true });
for (const file of readdirSync(output)) {
  if (file.endsWith(".png")) unlinkSync(`${output}/${file}`);
}

const browser = await chromium.launch();
const problems = [];

async function placeStepAtTrigger(page, step, triggerRatio) {
  await step.evaluate((node, ratio) => {
    const rect = node.getBoundingClientRect();
    const top = window.scrollY + rect.top;
    const target = top + rect.height / 2 - window.innerHeight * ratio;
    window.scrollTo({ top: Math.max(0, target), behavior: "instant" });
  }, triggerRatio);
}

for (const viewport of viewports) {
  const context = await browser.newContext({
    viewport,
    colorScheme: "light",
    reducedMotion: viewport.reducedMotion,
  });
  const page = await context.newPage();
  page.on("pageerror", (error) => problems.push(`PAGEERROR [${viewport.name}]: ${error.message}`));
  page.on("console", (message) => {
    if (["error", "warning"].includes(message.type())) {
      problems.push(`CONSOLE ${message.type()} [${viewport.name}]: ${message.text()}`);
    }
  });

  await page.goto(base, { waitUntil: "networkidle" });
  await page.evaluate(() => { document.documentElement.style.scrollBehavior = "auto"; });
  await page.locator(".map-header").waitFor();
  await page.waitForFunction(() => !document.querySelector(".map-act .loading"));

  await page.locator(".skip-link").focus();
  await page.keyboard.press("Enter");
  await page.waitForTimeout(80);
  const skipTarget = await page.evaluate(() => ({ hash: location.hash, id: document.activeElement?.id, outline: getComputedStyle(document.activeElement).outlineStyle }));
  if (skipTarget.hash !== "#story" || skipTarget.id !== "story" || skipTarget.outline === "none") {
    problems.push(`SKIP LINK [${viewport.name}]: ${JSON.stringify(skipTarget)}`);
  }
  await page.evaluate(() => {
    history.replaceState(null, "", location.pathname);
    window.scrollTo({ top: 0, behavior: "instant" });
  });

  const semantics = await page.evaluate(() => ({
    language: document.documentElement.lang,
    h1: document.querySelectorAll("h1").length,
    scrollys: document.querySelectorAll(".scrolly").length,
    steps: document.querySelectorAll("[data-step]").length,
    sourceLinks: document.querySelectorAll(".method a").length,
    mapControls: document.querySelectorAll(".map-act button, .map-act input, .map-act select").length,
    mainTabIndex: document.querySelector("main")?.getAttribute("tabindex"),
    mandateSummary: document.querySelector(".party-intro .sr-only")?.textContent,
    genderDots: document.querySelectorAll(".gender-act .waffle > i").length,
    genderDataRows: document.querySelectorAll(".gender-act .gender-data li").length,
    mapLegendItems: document.querySelectorAll(".map-act .party-legend span").length,
    title: document.querySelector("h1")?.textContent.trim().replace(/\s+/g, " "),
    documentTitle: document.title,
  }));
  if (semantics.language !== "sv" || semantics.h1 !== 1 || semantics.scrollys !== 3 || semantics.steps !== 16 || semantics.sourceLinks < 9 || semantics.mapControls !== 0 || semantics.mainTabIndex !== "-1" || !semantics.mandateSummary?.includes("Socialdemokraterna 107") || semantics.genderDots !== 200 || semantics.genderDataRows !== 9 || semantics.mapLegendItems !== 8 || semantics.title !== "Kan några tusen tala för åtta miljoner?" || semantics.documentTitle !== semantics.title) {
    problems.push(`STRUCTURE [${viewport.name}]: ${JSON.stringify(semantics)}`);
  }

  const overflow = await page.evaluate(() => {
    const viewportWidth = window.innerWidth;
    const offenders = [];
    for (const element of document.querySelectorAll("body *")) {
      if (element.closest(".hero-dots")) continue;
      if (element.closest("svg") && element.tagName.toLowerCase() !== "svg") continue;
      const rect = element.getBoundingClientRect();
      if (rect.width && (rect.left < -1 || rect.right > viewportWidth + 1)) {
        offenders.push(`${element.tagName.toLowerCase()}.${String(element.className).slice(0, 35)} [${Math.round(rect.left)}, ${Math.round(rect.right)}]`);
      }
      if (offenders.length === 8) break;
    }
    return { scrollWidth: document.documentElement.scrollWidth, viewportWidth, offenders };
  });
  if (overflow.scrollWidth > overflow.viewportWidth || overflow.offenders.length) {
    problems.push(`OVERFLOW [${viewport.name}]: ${JSON.stringify(overflow)}`);
  }

  for (const [scrollyIndex, scrolly] of (await page.locator(".scrolly").all()).entries()) {
    for (const [stepIndex, step] of (await scrolly.locator("[data-step]").all()).entries()) {
      const triggerRatio = viewport.width <= 820 ? (scrollyIndex === 0 ? 0.72 : 0.90) : 0.52;
      await placeStepAtTrigger(page, step, triggerRatio);
      if (scrollyIndex === 0 && [2, 3, 5, 8].includes(stepIndex) && viewport.reducedMotion !== "reduce") {
        await page.waitForTimeout(380);
        await page.screenshot({ path: `${output}/${viewport.name}-map-${stepIndex + 1}-transition.png` });
      }
      const visualWait = viewport.reducedMotion === "reduce" ? 90 : scrollyIndex === 0 ? 850 : 300;
      await page.waitForTimeout(visualWait);
      if (!(await step.evaluate((node) => node.classList.contains("is-active")))) {
        problems.push(`SCROLL [${viewport.name}]: step ${scrollyIndex + 1}.${stepIndex + 1} did not activate`);
      }
      if (viewport.width <= 820) {
        const visibleCard = await step.evaluate((node) => {
          const rect = node.getBoundingClientRect();
          const visible = Math.max(0, Math.min(innerHeight, rect.bottom) - Math.max(0, rect.top));
          return { visible: Math.round(visible), height: Math.round(rect.height), top: Math.round(rect.top), bottom: Math.round(rect.bottom) };
        });
        if (visibleCard.visible < Math.min(90, visibleCard.height * .65)) {
          problems.push(`MOBILE CARD [${viewport.name}] ${scrollyIndex + 1}.${stepIndex + 1}: ${JSON.stringify(visibleCard)}`);
        }
      }
      if (scrollyIndex === 0 || ["desktop", "phone-small"].includes(viewport.name)) {
        const label = ["map", "gender", "explanation"][scrollyIndex];
        await page.screenshot({ path: `${output}/${viewport.name}-${label}-${stepIndex + 1}.png` });
      }
      if (scrollyIndex === 0 && stepIndex === 3) {
        const comparison = await step.locator(".experiment-compare").innerText();
        if (!comparison.includes("58,4%") || !comparison.includes("19,1%") || !comparison.includes("+39,3 p")) {
          problems.push(`EXPERIMENT [${viewport.name}]: ${comparison}`);
        }
      }
    }
  }

  const finalMapLabel = await page.locator(".map-act figure").getAttribute("aria-label");
  if (!finalMapLabel?.includes("6 264")) {
    problems.push(`MAP [${viewport.name}]: unexpected final aria label ${finalMapLabel}`);
  }
  const endingText = await page.locator(".explanation-act").innerText();
  if (!endingText.includes("9 260") || !endingText.includes("4 542") || !endingText.includes("51% bortfall")) {
    problems.push(`SCB ENDING [${viewport.name}]: ${endingText}`);
  }

  await page.evaluate(() => {
    for (const element of document.querySelectorAll(".skip-link, .progress")) element.style.visibility = "hidden";
  });

  await page.locator(".hero").screenshot({ path: `${output}/${viewport.name}-hero.png` });
  await page.locator(".party-intro").evaluate((node) => node.scrollIntoView({ block: "center" }));
  await page.waitForTimeout(viewport.reducedMotion === "reduce" ? 80 : 1300);
  await page.locator(".party-intro").screenshot({ path: `${output}/${viewport.name}-parties.png` });
  await page.locator(".gender-act").screenshot({ path: `${output}/${viewport.name}-gender-act.png` });
  await page.locator(".explanation-act").evaluate((node) => node.scrollIntoView({ block: "center" }));
  await page.waitForTimeout(viewport.reducedMotion === "reduce" ? 80 : 800);
  await page.locator(".explanation-act").screenshot({ path: `${output}/${viewport.name}-explanation.png` });
  await page.locator(".closing").evaluate((node) => node.scrollIntoView({ block: "center" }));
  await page.waitForTimeout(viewport.reducedMotion === "reduce" ? 80 : 800);
  await page.locator(".closing").screenshot({ path: `${output}/${viewport.name}-closing.png` });
  await context.close();
}

const sweepContext = await browser.newContext({ viewport: { width: 300, height: 800 }, reducedMotion: "reduce" });
const sweepPage = await sweepContext.newPage();
await sweepPage.goto(base, { waitUntil: "networkidle" });
await sweepPage.locator(".map-header").waitFor();
for (let width = 300; width <= 1000; width += 10) {
  await sweepPage.setViewportSize({ width, height: 800 });
  const fit = await sweepPage.evaluate(() => {
    const party = document.querySelector(".party-intro-visual")?.getBoundingClientRect();
    const pageWidth = document.documentElement.scrollWidth;
    return {
      pageWidth,
      viewportWidth: innerWidth,
      partyLeft: party ? Math.round(party.left) : null,
      partyRight: party ? Math.round(party.right) : null,
    };
  });
  if (fit.pageWidth > fit.viewportWidth || fit.partyLeft < -1 || fit.partyRight > fit.viewportWidth + 1) {
    problems.push(`WIDTH SWEEP [${width}px]: ${JSON.stringify(fit)}`);
  }
}
await sweepContext.close();

await browser.close();
if (problems.length) {
  console.error(problems.join("\n"));
  process.exitCode = 1;
} else {
  console.log(`Checks passed: 16 steps, eight full viewports, 71-width sweep, no overflow, gender waffles, sampling explanation, reduced motion. Screenshots: ${output}`);
}
