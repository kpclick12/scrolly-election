<script>
  import { colors, scenarioForL } from "../../data/story.js";

  let { step = 0 } = $props();

  const scenarios = [
    {
      eyebrow: "M ger 2,0 procentenheter",
      headline: "SD:s försprång växer",
      scenario: scenarioForL(4.0, "M"),
      focus: new Set(["M", "SD", "L"]),
      takeaway: "SD 3,1 före M",
      note: "M sjunker till 15,2. SD ligger kvar på 18,3.",
    },
    {
      eyebrow: "SD ger 2,0 procentenheter",
      headline: "M blir störst på sidan",
      scenario: scenarioForL(4.0, "SD"),
      focus: new Set(["M", "SD", "L"]),
      takeaway: "M 0,9 före SD",
      note: "SD sjunker till 16,3. M ligger kvar på 17,2.",
    },
    {
      eyebrow: "KD ger 2,0 procentenheter",
      headline: "KD har marginal kvar",
      scenario: scenarioForL(4.0, "KD"),
      focus: new Set(["KD", "L"]),
      takeaway: "KD 2,5 över spärren",
      note: "KD sjunker till 6,5. L når precis fyra.",
    },
  ];

  const parties = ["M", "SD", "KD", "L"];
  const current = $derived(scenarios[step]);
  const format = (value) => value.toLocaleString("sv-SE", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  const status = $derived(
    `${current.headline}. Moderaterna har ${format(current.scenario.shares.M)} procent, Sverigedemokraterna ${format(current.scenario.shares.SD)}, Kristdemokraterna ${format(current.scenario.shares.KD)} och Liberalerna ${format(current.scenario.shares.L)}.`,
  );
</script>

<figure class:leadership={step <= 1} class:threshold-pair={step === 2} aria-label={status}>
  <header>
    <p>{current.eyebrow}</p>
    <strong>{current.headline}</strong>
  </header>

  <div class="chart-stage">
    <div class="axis" aria-hidden="true">
      <span>0%</span>
      <div><i></i><b>4% · spärren</b></div>
      <span>20%</span>
    </div>

    <div class="rows">
      {#each parties as party}
        {@const share = current.scenario.shares[party]}
        <div class="donor-row" class:focused={current.focus.has(party)} class:below={share < 4}>
          <b>{party}</b>
          <div class="track" aria-hidden="true">
            <em></em>
            <i style={`--width:${share / 20 * 100}%;--party:${colors[party]}`}></i>
          </div>
          <span>{format(share)}%</span>
        </div>
      {/each}
    </div>
  </div>

  <div class="takeaway">
    <span>{current.takeaway}</span>
    <p>{current.note}</p>
  </div>
  <p class="sr-only">{status}</p>
</figure>

<style>
  figure { position:relative; width:min(100%,980px); min-height:min(740px,90svh); margin:0; padding:clamp(28px,4vw,44px); overflow:hidden; color:var(--ink); background:#f8faff; border:1px solid var(--rule-strong); }
  header p { margin:0 0 7px; color:var(--accent-dark); font-size:12px; font-weight:800; letter-spacing:.07em; text-transform:uppercase; }
  header strong { display:block; max-width:720px; font-family:var(--display); font-size:clamp(32px,4vw,46px); line-height:1.02; letter-spacing:-.035em; }
  .chart-stage { margin-top:clamp(55px,8vh,82px); transition:transform .62s cubic-bezier(.22,.72,.22,1); }
  .axis { display:grid; grid-template-columns:54px minmax(0,1fr) 62px; gap:14px; align-items:end; color:var(--muted); font-size:10px; }
  .axis > span:last-child { text-align:right; }
  .axis > div { position:relative; height:31px; border-bottom:1px solid var(--rule-strong); }
  .axis i { position:absolute; left:20%; top:18px; bottom:-300px; width:1px; background:var(--teal); }
  .axis b { position:absolute; left:20%; top:0; color:var(--teal-text); font-size:10px; transform:translateX(-50%); white-space:nowrap; }
  .rows { display:grid; gap:19px; margin-top:23px; }
  .donor-row { display:grid; grid-template-columns:54px minmax(0,1fr) 62px; gap:14px; align-items:center; opacity:.2; transition:opacity .4s ease; }
  .donor-row.focused { opacity:1; }
  .donor-row > b { font-size:18px; }
  .donor-row > span { color:var(--muted); font-size:15px; font-variant-numeric:tabular-nums; text-align:right; }
  .track { position:relative; height:30px; background:rgba(20,26,51,.045); }
  .track > em { position:absolute; z-index:2; left:20%; top:-5px; bottom:-5px; width:1px; background:var(--teal); opacity:.5; }
  .track > i { position:relative; z-index:1; display:block; width:var(--width); height:100%; background:var(--party); transition:width .72s cubic-bezier(.22,.72,.22,1),filter .4s ease; }
  .focused .track > i::after { content:""; position:absolute; right:0; top:50%; width:12px; height:12px; border:3px solid white; border-radius:50%; background:var(--party); box-shadow:0 0 0 1px var(--party); transform:translate(50%,-50%); }
  .below .track > i::after { box-shadow:0 0 0 2px var(--violet),0 0 0 8px rgba(112,88,189,.12); }
  .takeaway { margin-top:auto; padding-top:24px; border-top:1px solid var(--rule-strong); }
  .takeaway span { color:var(--accent-dark); font-size:11px; font-weight:800; letter-spacing:.06em; text-transform:uppercase; }
  .takeaway p { margin:8px 0 0; color:var(--muted); font-size:17px; line-height:1.55; }
  figure { display:flex; flex-direction:column; }
  .leadership .chart-stage { transform:scale(1.035); transform-origin:58% 28%; }
  .threshold-pair .chart-stage { transform:scale(1.05); transform-origin:24% 72%; }

  @media (max-width:820px) {
    figure { min-height:0; height:100%; padding:15px 14px 13px; border:0; }
    header p { font-size:8px; }
    header strong { font-size:25px; }
    .chart-stage { margin-top:28px; }
    .axis,.donor-row { grid-template-columns:32px minmax(0,1fr) 43px; gap:8px; }
    .axis { font-size:8px; }
    .axis b { font-size:8px; }
    .axis i { bottom:-212px; }
    .rows { gap:12px; margin-top:14px; }
    .donor-row > b { font-size:13px; }
    .donor-row > span { font-size:10px; }
    .track { height:22px; }
    .focused .track > i::after { width:9px; height:9px; border-width:2px; }
    .takeaway { padding-top:12px; }
    .takeaway span { font-size:8px; }
    .takeaway p { margin-top:5px; font-size:10px; }
    .leadership .chart-stage { transform:scale(1.015); }
    .threshold-pair .chart-stage { transform:scale(1.025); }
  }

  @media (prefers-reduced-motion:reduce) {
    .chart-stage,.donor-row,.track > i { transition:none; }
    .leadership .chart-stage,.threshold-pair .chart-stage { transform:none; }
  }
</style>
