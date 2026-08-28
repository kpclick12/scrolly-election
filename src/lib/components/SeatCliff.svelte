<script>
  import { colors, partyNames, seatScenarios } from "../../data/story.js";

  let { step = 0 } = $props();

  const partyOrder = ["V", "S", "MP", "C", "L", "KD", "M", "SD"];
  const centerX = 380;
  const baseY = 408;
  const radii = Array.from({ length: 13 }, (_, index) => 108 + index * 17);
  const rawTotal = radii.reduce((sum, value) => sum + value, 0);
  const counts = radii.map((value) => Math.floor(value / rawTotal * 349));
  let remainder = 349 - counts.reduce((sum, value) => sum + value, 0);
  for (let index = counts.length - 1; remainder > 0; index = (index - 1 + counts.length) % counts.length) {
    counts[index] += 1;
    remainder -= 1;
  }
  const positions = radii.flatMap((radius, ring) =>
    Array.from({ length: counts[ring] }, (_, index) => {
      const padding = .035;
      const angle = Math.PI - padding - index / Math.max(1, counts[ring] - 1) * (Math.PI - padding * 2);
      return {
        x: centerX + Math.cos(angle) * radius,
        y: baseY - Math.sin(angle) * radius,
        angle,
      };
    }),
  ).sort((left, right) => right.angle - left.angle);

  const scenarioIndex = $derived(step >= 5 ? 3 : Math.min(step, 4));
  const scenario = $derived(seatScenarios[scenarioIndex]);
  const assignment = $derived(partyOrder.flatMap((code) => Array(scenario.seats[code]).fill(code)));
  const representedL = $derived(scenario.seats.L > 0);
  const status = $derived(
    `Liberalerna har ${scenario.liberalShare.toLocaleString("sv-SE")} procent och ${scenario.seats.L} mandat. Blågula partier får ${scenario.blueSeats} mandat och oppositionen ${scenario.oppositionSeats}.`,
  );
</script>

<figure class:crossed={representedL} class:ending={step >= 5} aria-label={status}>
  <header>
    <div>
      <p>Mandatsimulering · augusti 2026</p>
      <h3>Stödet för L</h3>
    </div>
    <strong>{scenario.liberalShare.toLocaleString("sv-SE", { minimumFractionDigits: 1 })}%</strong>
  </header>

  <div class="threshold-scale" aria-hidden="true">
    <span class="scale-start">2%</span>
    <span class="threshold-word">spärren</span>
    <span class="scale-end">5%</span>
    <i></i>
    <b style={`--position:${Math.max(0, Math.min(100, (scenario.liberalShare - 2) / 3 * 100))}%`}></b>
  </div>

  <div class="score" aria-hidden="true">
    <div class="blue">
      <span>Blågula</span>
      <strong>{scenario.blueSeats}</strong>
    </div>
    <div class="majority"><i></i><span>176</span></div>
    <div class="opposition">
      <span>Oppositionen</span>
      <strong>{scenario.oppositionSeats}</strong>
    </div>
  </div>

  <svg viewBox="0 0 760 455" role="img" aria-hidden="true">
    {#each positions as position, index}
      {@const code = assignment[index]}
      <circle
        class:l-seat={code === "L"}
        cx={position.x}
        cy={position.y}
        r="4.8"
        fill={colors[code]}
      >
        <title>{partyNames[code]}, ett mandat</title>
      </circle>
    {/each}
    <text class="total" x="380" y="373" text-anchor="middle">349</text>
    <text class="total-label" x="380" y="392" text-anchor="middle">mandat</text>
  </svg>

  <div class="party-key" aria-hidden="true">
    {#each partyOrder as code}
      <span class:liberal={code === "L"}><i style={`--party:${colors[code]}`}></i>{code} <b>{scenario.seats[code]}</b></span>
    {/each}
  </div>

  {#if scenarioIndex === 2}
    <p class="cliff-note">3,9 ger fortfarande <strong>0 mandat</strong> till L.</p>
  {:else if scenarioIndex === 3 && step < 5}
    <p class="cliff-note"><strong>+7 blågula mandat</strong> jämfört med 3,9.</p>
  {:else if step >= 5}
    <p class="cliff-note">L är över spärren. <strong>Blågula har 166 mandat.</strong></p>
  {:else}
    <p class="cliff-note">L får <strong>{scenario.seats.L} mandat</strong>.</p>
  {/if}
  <p class="sr-only">{status}</p>
</figure>

<style>
  figure { position:relative; width:min(100%,980px); min-height:min(780px,94svh); margin:0; padding:clamp(24px,3vw,38px); overflow:hidden; color:var(--ink); background:#f8faff; border:1px solid var(--rule-strong); }
  header { display:flex; align-items:end; justify-content:space-between; gap:22px; }
  header p { margin:0 0 5px; color:var(--muted); font-size:12px; font-weight:700; letter-spacing:.06em; text-transform:uppercase; }
  header h3 { margin:0; font-family:var(--display); font-size:clamp(31px,3.4vw,44px); line-height:1; letter-spacing:-.035em; }
  header > strong { color:var(--accent); font-family:var(--display); font-size:clamp(42px,6vw,68px); line-height:.86; letter-spacing:-.05em; font-variant-numeric:tabular-nums; }
  .threshold-scale { position:relative; height:48px; margin-top:25px; color:var(--muted); font-size:9px; }
  .threshold-scale i { position:absolute; left:0; right:0; top:23px; height:2px; background:linear-gradient(90deg,var(--rule-strong),var(--rule-strong) 66.4%,var(--accent) 66.4%,var(--accent)); }
  .threshold-scale::after { content:""; position:absolute; left:66.66%; top:14px; width:1px; height:19px; background:var(--ink); }
  .threshold-scale b { position:absolute; left:var(--position); top:16px; width:16px; height:16px; border:3px solid white; border-radius:50%; background:var(--accent); box-shadow:0 0 0 1px var(--accent-dark); transform:translateX(-50%); transition:left .72s cubic-bezier(.22,.72,.22,1); }
  .scale-start, .scale-end, .threshold-word { position:absolute; top:0; }
  .scale-start { left:0; }
  .scale-end { right:0; }
  .threshold-word { left:66.66%; color:var(--ink); font-weight:700; transform:translateX(-50%); }
  .score { display:grid; grid-template-columns:1fr 70px 1fr; gap:12px; align-items:end; margin-top:8px; }
  .score > div:not(.majority) { display:flex; align-items:baseline; gap:9px; }
  .score .opposition { justify-content:flex-end; text-align:right; }
  .score span { color:var(--muted); font-size:13px; font-weight:650; }
  .score strong { font-family:var(--display); font-size:35px; line-height:1; font-variant-numeric:tabular-nums; }
  .score .blue strong { color:var(--accent-dark); }
  .majority { position:relative; height:25px; text-align:center; }
  .majority i { position:absolute; left:50%; top:0; bottom:-405px; width:1px; border-left:1px dashed var(--rule-strong); }
  .majority span { position:relative; padding:2px 6px; color:var(--muted); background:#f8faff; font-size:9px; }
  svg { display:block; width:100%; height:auto; margin-top:-3px; overflow:visible; }
  circle { stroke:rgba(255,255,255,.78); stroke-width:.85; transition:fill .48s ease,opacity .35s ease,stroke-width .35s ease; }
  .crossed circle.l-seat { stroke:white; stroke-width:1.5; }
  .total { fill:var(--ink); font-family:var(--display); font-size:45px; font-weight:760; letter-spacing:-.04em; }
  .total-label { fill:var(--muted); font:700 10px var(--sans); letter-spacing:.08em; text-transform:uppercase; }
  .party-key { display:flex; flex-wrap:wrap; justify-content:center; gap:8px 16px; margin-top:-2px; padding-top:16px; border-top:1px solid var(--rule); color:var(--muted); font-size:12px; }
  .party-key span { display:flex; align-items:center; gap:4px; }
  .party-key i { width:8px; height:8px; border-radius:50%; background:var(--party); }
  .party-key b { color:var(--ink); font-variant-numeric:tabular-nums; }
  .party-key .liberal { color:var(--accent-dark); font-weight:700; }
  .cliff-note { margin:17px auto 0; color:var(--muted); font-size:14px; text-align:center; }
  .cliff-note strong { color:var(--ink); }
  .ending .cliff-note strong { color:var(--accent-dark); }

  @media (max-width:820px) {
    figure { min-height:0; width:100%; padding:15px 14px 13px; border:0; }
    header p { font-size:8px; }
    header h3 { font-size:25px; }
    header > strong { font-size:42px; }
    .threshold-scale { height:40px; margin-top:15px; }
    .threshold-scale i { top:21px; }
    .threshold-scale b { top:14px; }
    .score { grid-template-columns:1fr 52px 1fr; margin-top:2px; }
    .score strong { font-size:24px; }
    .score span { font-size:9px; }
    .majority i { bottom:-280px; }
    svg { margin-top:-10px; }
    .party-key { gap:5px 9px; padding-top:10px; font-size:8px; }
    .party-key i { width:6px; height:6px; }
    .cliff-note { margin-top:9px; font-size:10px; }
  }

  @media (max-width:360px) {
    .score span { display:none; }
    .score .opposition { justify-content:flex-end; }
    .party-key { gap:4px 7px; }
  }

  @media (prefers-reduced-motion:reduce) {
    .threshold-scale b, circle { transition:none; }
  }
</style>
