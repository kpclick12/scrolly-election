import { chromium } from "playwright";
import { mkdirSync, readdirSync, unlinkSync } from "node:fs";

const base = process.env.SCROLLY_PREVIEW_URL || "http://127.0.0.1:4173/scrolly-election/";
const output = process.env.SCROLLY_SHOTS || "/tmp/scrolly-election-shots-tactical";
const viewports = [
  { name: "desktop", width: 1440, height: 900, reducedMotion: "no-preference" },
  { name: "desktop-short", width: 1280, height: 680, reducedMotion: "no-preference" },
  { name: "tablet-edge-high", width: 821, height: 900, reducedMotion: "no-preference" },
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

async function placeStepAtTrigger(page, step, ratio) {
  await step.evaluate((node, triggerRatio) => {
    const rect = node.getBoundingClientRect();
    const top = window.scrollY + rect.top;
    const target = top + rect.height / 2 - window.innerHeight * triggerRatio;
    window.scrollTo({ top: Math.max(0, target), behavior: "instant" });
  }, ratio);
}

for (const viewport of viewports) {
  const context = await browser.newContext({ viewport, colorScheme: "light", reducedMotion: viewport.reducedMotion });
  const page = await context.newPage();
  page.on("pageerror", (error) => problems.push(`PAGEERROR [${viewport.name}]: ${error.message}`));
  page.on("console", (message) => {
    if (["error", "warning"].includes(message.type())) problems.push(`CONSOLE ${message.type()} [${viewport.name}]: ${message.text()}`);
  });

  await page.goto(base, { waitUntil: "networkidle" });
  await page.evaluate(() => { document.documentElement.style.scrollBehavior = "auto"; });
  await page.locator(".seat-act figure").waitFor();

  await page.locator(".skip-link").focus();
  await page.keyboard.press("Enter");
  await page.waitForTimeout(80);
  const skipTarget = await page.evaluate(() => ({ hash: location.hash, id: document.activeElement?.id, outline: getComputedStyle(document.activeElement).outlineStyle }));
  if (skipTarget.hash !== "#story" || skipTarget.id !== "story" || skipTarget.outline === "none") problems.push(`SKIP LINK [${viewport.name}]: ${JSON.stringify(skipTarget)}`);
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
    mainTabIndex: document.querySelector("main")?.getAttribute("tabindex"),
    seats: document.querySelectorAll(".seat-act svg circle").length,
    historyPoints: document.querySelectorAll(".hero-chart .history-point").length,
    gameDots: document.querySelectorAll(".game-act .dot-field > i").length,
    partyMarks: document.querySelectorAll(".duel-grid .party-mark").length,
    brokenImages: [...document.images].filter((image) => !image.complete || image.naturalWidth === 0).map((image) => image.currentSrc || image.src),
    donorRows: document.querySelectorAll(".donor-act .donor-row").length,
    experimentColumns: document.querySelectorAll(".evidence-act .experiment-column").length,
    pollRows: document.querySelectorAll(".evidence-act .poll-wrap .year").length,
    title: document.querySelector("h1")?.textContent.trim().replace(/\s+/g, " "),
    documentTitle: document.title,
  }));
  if (semantics.language !== "sv" || semantics.h1 !== 1 || semantics.scrollys !== 4 || semantics.steps !== 18 || semantics.sourceLinks < 10 || semantics.mainTabIndex !== "-1" || semantics.seats !== 349 || semantics.historyPoints < 20 || semantics.gameDots !== 100 || semantics.partyMarks !== 2 || semantics.brokenImages.length || semantics.donorRows !== 4 || semantics.experimentColumns !== 3 || semantics.pollRows !== 4 || semantics.title !== "Vad är en taktikröst på Liberalerna värd?" || semantics.documentTitle !== semantics.title) problems.push(`STRUCTURE [${viewport.name}]: ${JSON.stringify(semantics)}`);

  const overflow = await page.evaluate(() => {
    const offenders = [];
    for (const element of document.querySelectorAll("body *")) {
      if (element.closest("svg") && element.tagName.toLowerCase() !== "svg") continue;
      const rect = element.getBoundingClientRect();
      if (rect.width && (rect.left < -1 || rect.right > innerWidth + 1)) offenders.push(`${element.tagName.toLowerCase()}.${String(element.className).slice(0, 35)} [${Math.round(rect.left)}, ${Math.round(rect.right)}]`);
      if (offenders.length === 8) break;
    }
    return { scrollWidth: document.documentElement.scrollWidth, viewportWidth: innerWidth, offenders };
  });
  if (overflow.scrollWidth > overflow.viewportWidth || overflow.offenders.length) problems.push(`OVERFLOW [${viewport.name}]: ${JSON.stringify(overflow)}`);

  const seatSteps = await page.locator(".seat-act [data-step]").all();
  const expected = [
    ["2,0", "161", "188"],
    ["3,9", "157", "192"],
    ["4,0", "164", "185"],
    ["3,9", "172", "177"],
    ["4,0", "179", "170"],
  ];
  for (const [index, step] of seatSteps.entries()) {
    const ratio = viewport.width <= 820 ? (viewport.width <= 360 ? 0.84 : 0.82) : 0.52;
    await placeStepAtTrigger(page, step, ratio);
    await page.waitForTimeout(viewport.reducedMotion === "reduce" ? 80 : 760);
    if (!(await step.evaluate((node) => node.classList.contains("is-active")))) problems.push(`SCROLL [${viewport.name}]: step ${index + 1} did not activate`);
    const visual = await page.locator(".seat-act figure").innerText();
    if (!expected[index].every((value) => visual.includes(value))) problems.push(`SCENARIO [${viewport.name}] ${index + 1}: ${visual.replace(/\s+/g, " ")}`);
    if (["desktop", "phone", "phone-small"].includes(viewport.name)) await page.screenshot({ path: `${output}/${viewport.name}-seat-${index + 1}.png` });
  }

  for (const [actName, selector] of [["game", ".game-act"], ["donor", ".donor-act"], ["evidence", ".evidence-act"]]) {
    const actSteps = await page.locator(`${selector} [data-step]`).all();
    const donorExpected = [
      ["15,2", "18,3", "8,5", "4,0"],
      ["17,2", "16,3", "8,5", "4,0"],
      ["17,2", "18,3", "6,5", "4,0"],
    ];
    for (const [index, step] of actSteps.entries()) {
      const ratio = viewport.width <= 820 ? (viewport.width <= 360 ? 0.84 : 0.82) : 0.52;
      await placeStepAtTrigger(page, step, ratio);
      await page.waitForTimeout(viewport.reducedMotion === "reduce" ? 80 : 620);
      if (!(await step.evaluate((node) => node.classList.contains("is-active")))) problems.push(`SCROLL [${viewport.name}]: ${actName} step ${index + 1} did not activate`);
      if (actName === "donor") {
        const visual = await page.locator(".donor-act figure").innerText();
        if (!donorExpected[index].every((value) => visual.includes(value))) problems.push(`DONOR SCENARIO [${viewport.name}] ${index + 1}: ${visual.replace(/\s+/g, " ")}`);
      }
      if (["desktop", "phone", "phone-small"].includes(viewport.name)) await page.screenshot({ path: `${output}/${viewport.name}-${actName}-${index + 1}.png` });
    }
  }

  const storyText = (await page.locator("main").textContent()).replace(/\s+/g, " ");
  for (const required of ["130 000", "32 000", "KD har större marginal", "Hypotetiskt jämnt val", "6 477 970", "Var sjätte valde bort sitt tydliga förstahandsval", "Många kom sent och föredrog ett annat parti", "Det beror också på partiet", "En röstmajoritet blir ingen mandatmajoritet", "lägga kalkylen åt sidan"]) {
    if (!storyText.includes(required)) problems.push(`COPY [${viewport.name}]: missing ${required}`);
  }

  await page.evaluate(() => {
    for (const element of document.querySelectorAll(".skip-link, .progress")) element.style.visibility = "hidden";
  });
  await page.locator(".hero").screenshot({ path: `${output}/${viewport.name}-hero.png` });
  await page.locator(".duel").scrollIntoViewIfNeeded();
  await page.waitForTimeout(viewport.reducedMotion === "reduce" ? 50 : 500);
  await page.locator(".duel").screenshot({ path: `${output}/${viewport.name}-duel.png` });
  await page.locator(".preference-section").scrollIntoViewIfNeeded();
  await page.waitForTimeout(viewport.reducedMotion === "reduce" ? 50 : 500);
  await page.locator(".preference-section").screenshot({ path: `${output}/${viewport.name}-preference.png` });
  await page.locator(".closing").scrollIntoViewIfNeeded();
  await page.waitForTimeout(viewport.reducedMotion === "reduce" ? 50 : 500);
  await page.locator(".closing").screenshot({ path: `${output}/${viewport.name}-closing.png` });
  await context.close();
}

const sweepContext = await browser.newContext({ viewport: { width: 300, height: 800 }, reducedMotion: "reduce" });
const sweepPage = await sweepContext.newPage();
await sweepPage.goto(base, { waitUntil: "networkidle" });
await sweepPage.locator(".seat-act figure").waitFor();
for (let width = 300; width <= 1000; width += 10) {
  await sweepPage.setViewportSize({ width, height: 800 });
  const fit = await sweepPage.evaluate(() => ({ pageWidth: document.documentElement.scrollWidth, viewportWidth: innerWidth }));
  if (fit.pageWidth > fit.viewportWidth) problems.push(`WIDTH SWEEP [${width}px]: ${JSON.stringify(fit)}`);
}
await sweepContext.close();
await browser.close();

if (problems.length) {
  console.error(problems.join("\n"));
  process.exitCode = 1;
} else {
  console.log(`Checks passed: 18 story steps in four acts, seven viewports, 71-width sweep, 349 seats, no overflow, focus and reduced motion. Screenshots: ${output}`);
}
