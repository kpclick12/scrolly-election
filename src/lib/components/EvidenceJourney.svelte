<script>
  import PollReality from "./PollReality.svelte";
  import { insuranceExperiment, pollHistory, strategicVoting2022 } from "../../data/story.js";

  let { step = 0 } = $props();
  const lateChanges = pollHistory.map((row) => ({ ...row, change: row.result - row.poll }));
  const status = $derived([
    "I valet 2022 röstade 16 procent på ett annat parti än sitt tydliga förstahandsval enligt Valforskningsprogrammets strikta definition.",
    "Bland Liberalernas väljare 2022 föredrog 32 procent ett annat parti och 60 procent bestämde sitt partival under sista veckan.",
    "I ett svenskt experiment fick Liberalerna 6,78 procents stöd när en mätning visade 2,5 procent, 4,8 när den visade 4 och 4,93 när den visade 5,5. Skillnaderna var inte statistiskt säkerställda.",
    "Inför valen 2010 till 2022 ökade Liberalerna bara 2010 från den sena mätningen till valresultatet. I de tre senare valen minskade stödet.",
    "Från dagens 2,2 procent krävs en ökning på 1,8 procentenheter. Från 3,5 krävs 0,5. Ingen av de fyra historiska slutspurterna nådde plus 0,5.",
  ][step]);
</script>

<figure aria-label={status}>
  <div class="frame national" class:is-active={step === 0} aria-hidden={step !== 0}>
    <header><p>Valundersökningen 2022</p><strong>Strategiska röster är ingen marginalföreteelse</strong></header>
    <div class="big-stat"><strong>{strategicVoting2022.strictAllVoters}%</strong><span>röstade på ett annat parti än sitt tydliga förstahandsval</span></div>
    <div class="definition"><b>20%</b><span>med den bredare definitionen</span></div>
    <p class="source-note">Valforskningsprogrammet. Viktade uppgifter från Valundersökningen 2022.</p>
  </div>

  <div class="frame liberal" class:is-active={step === 1} aria-hidden={step !== 1}>
    <header><p>L-väljarna 2022</p><strong>Många bestämde sig sent</strong></header>
    <div class="fact-grid">
      <div><strong>{strategicVoting2022.liberalVotersDecidedLastWeek}%</strong><span>bestämde sig sista veckan</span></div>
      <div><strong>{strategicVoting2022.liberalVotersOtherFirstChoice}%</strong><span>hade ett annat parti som förstahandsval</span></div>
      <div><strong>{strategicVoting2022.potentialStrategicFlowMtoL.toLocaleString("sv-SE")}%</strong><span>av de potentiellt strategiska rösterna gick från M till L</span></div>
    </div>
    <p class="source-note">Siffrorna beskriver valet 2022. De är ingen prognos för 2026.</p>
  </div>

  <div class="frame experiment" class:is-active={step === 2} aria-hidden={step !== 2}>
    <header><p>Svenskt surveyexperiment · 2022</p><strong>Vad händer när mätningen flyttas?</strong></header>
    <div class="experiment-chart">
      {#each insuranceExperiment as point}
        <div class="experiment-column">
          <span class="vote-value">{point.liberalVote.toLocaleString("sv-SE", { minimumFractionDigits: 1 })}% valde L</span>
          <i style={`--height:${point.liberalVote / 7 * 100}%`}></i>
          <b>Mätningen visar<br />{point.shownPoll.toLocaleString("sv-SE", { minimumFractionDigits: 1 })}%</b>
        </div>
      {/each}
    </div>
    <p class="finding">L fick mest stöd när partiet visades på 2,5 procent. Skillnaderna mellan grupperna var för osäkra för att forskarna skulle slå fast en L-effekt.</p>
  </div>

  <div class="frame history" class:is-active={step === 3} aria-hidden={step !== 3}>
    <header><p>Sena mätningar och valresultat</p><strong>Fyra val ger ingen säker regel</strong></header>
    <div class="poll-wrap"><PollReality /></div>
  </div>

  <div class="frame distance" class:is-active={step === 4} aria-hidden={step !== 4}>
    <header><p>Avståndet 2026</p><strong>3,5 förändrar uppgiften</strong></header>
    <div class="distance-bars">
      <div><span>Från 2,2 till spärren</span><i style="--width:100%"></i><b>+1,8 p</b><small>≈ 117 000 väljare</small></div>
      <div><span>Från 3,5 till spärren</span><i style="--width:27.8%"></i><b>+0,5 p</b><small>≈ 32 000 väljare</small></div>
    </div>
    <div class="change-axis" aria-label="Liberalernas förändring från sen mätning till valresultat 2010 till 2022">
      <div class="axis-line"><i class="zero"></i>
        {#each lateChanges as row}
          <span style={`--position:${(row.change + 3.2) / 5.2 * 100}%`}><i></i><b>{row.year}</b><small>{row.change > 0 ? "+" : ""}{row.change.toLocaleString("sv-SE", { maximumFractionDigits: 2 })}</small></span>
        {/each}
      </div>
      <p>Förändring från den visade sena mätningen till valresultatet, procentenheter</p>
    </div>
    <p class="finding">Historiken är kort. Den visar ändå varför 3,5 kan beskrivas som möjligt att samordna kring, medan 2,2 kräver en betydligt större rörelse.</p>
  </div>
  <p class="sr-only">{status}</p>
</figure>

<style>
  figure { position:relative; width:min(100%,980px); min-height:min(740px,90svh); margin:0; overflow:hidden; color:var(--ink); background:#f8faff; border:1px solid var(--rule-strong); }
  .frame { position:absolute; inset:0; display:flex; flex-direction:column; padding:clamp(24px,4vw,42px); opacity:0; pointer-events:none; transform:translateY(10px); transition:opacity .42s ease,transform .55s cubic-bezier(.22,.72,.22,1); }
  .frame.is-active { opacity:1; pointer-events:auto; transform:none; }
  header p { margin:0 0 7px; color:var(--accent-dark); font-size:12px; font-weight:800; letter-spacing:.07em; text-transform:uppercase; }
  header strong { display:block; max-width:760px; font-family:var(--display); font-size:clamp(31px,4vw,46px); line-height:1.02; letter-spacing:-.035em; }
  .big-stat { display:grid; grid-template-columns:auto minmax(0,330px); gap:26px; align-items:end; margin:auto 0; }
  .big-stat strong { color:var(--accent); font-family:var(--display); font-size:clamp(110px,18vw,190px); line-height:.72; letter-spacing:-.08em; }
  .big-stat span { color:var(--muted); font-size:20px; line-height:1.4; }
  .definition { display:flex; align-items:baseline; gap:10px; padding:18px 0; border-block:1px solid var(--rule-strong); }
  .definition b { font-family:var(--display); font-size:32px; }
  .definition span,.source-note { color:var(--muted); font-size:13px; }
  .source-note { margin:16px 0 0; }
  .fact-grid { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:1px; margin:auto 0; background:var(--rule-strong); border-block:1px solid var(--rule-strong); }
  .fact-grid > div { min-width:0; padding:27px 22px 29px; background:white; }
  .fact-grid strong,.fact-grid span { display:block; }
  .fact-grid strong { color:var(--accent); font-family:var(--display); font-size:clamp(43px,6vw,65px); line-height:1; letter-spacing:-.05em; }
  .fact-grid span { margin-top:13px; color:var(--muted); font-size:14px; line-height:1.5; }
  .experiment-chart { display:grid; grid-template-columns:repeat(3,1fr); gap:clamp(20px,5vw,55px); height:300px; margin:50px 0 0; padding-inline:20px; border-bottom:1px solid var(--rule-strong); }
  .experiment-column { position:relative; display:flex; flex-direction:column; justify-content:flex-end; align-items:center; min-width:0; }
  .experiment-column > i { display:block; width:min(82px,60%); height:var(--height); min-height:20px; background:var(--accent); }
  .experiment-column b { min-height:48px; margin-top:12px; font-size:12px; line-height:1.35; text-align:center; }
  .vote-value { margin-bottom:8px; color:var(--accent-dark); font-size:13px; font-weight:750; }
  .finding { margin:auto 0 0; padding-top:18px; border-top:1px solid var(--rule); color:var(--muted); font-size:14px; line-height:1.55; }
  .poll-wrap { margin-top:32px; }
  .poll-wrap :global(figure) { border:0; padding:15px 0 0; background:transparent; }
  .distance-bars { margin-top:42px; }
  .distance-bars > div { position:relative; display:grid; grid-template-columns:minmax(0,1fr) auto; gap:4px 15px; padding:18px 0; border-bottom:1px solid var(--rule); }
  .distance-bars span { color:var(--muted); font-size:13px; }
  .distance-bars b { grid-column:2; grid-row:1/3; align-self:center; color:var(--accent-dark); font-family:var(--display); font-size:29px; }
  .distance-bars small { color:var(--muted); font-size:12px; }
  .distance-bars i { grid-column:1/-1; width:var(--width); height:5px; margin-top:8px; background:var(--accent); }
  .distance-bars > div:nth-child(2) i { background:var(--teal); }
  .change-axis { margin:50px 0 0; }
  .axis-line { position:relative; height:65px; margin-inline:28px; border-top:1px solid var(--rule-strong); }
  .axis-line .zero { position:absolute; left:61.54%; top:-8px; bottom:18px; width:1px; background:var(--ink); }
  .axis-line > span { position:absolute; left:var(--position); top:-7px; display:flex; flex-direction:column; align-items:center; transform:translateX(-50%); }
  .axis-line > span > i { width:13px; height:13px; border:2px solid white; border-radius:50%; background:var(--violet); box-shadow:0 0 0 1px var(--violet); }
  .axis-line b { margin-top:7px; font-size:11px; }
  .axis-line small { color:var(--muted); font-size:10px; }
  .change-axis > p { margin:0; color:var(--muted); font-size:11px; text-align:center; }

  @media (max-width:820px) {
    figure { min-height:0; height:100%; border:0; }
    .frame { padding:15px 14px 13px; }
    header p { font-size:8px; }
    header strong { font-size:25px; }
    .big-stat { grid-template-columns:auto 1fr; gap:14px; }
    .big-stat strong { font-size:86px; }
    .big-stat span { font-size:12px; }
    .definition { padding:10px 0; }
    .definition b { font-size:24px; }
    .definition span,.source-note { font-size:9px; }
    .fact-grid { margin:25px 0 auto; }
    .fact-grid > div { padding:16px 10px 18px; }
    .fact-grid strong { font-size:35px; }
    .fact-grid span { margin-top:8px; font-size:8px; }
    .experiment-chart { height:225px; margin-top:22px; padding-inline:0; gap:12px; }
    .experiment-column > i { width:48px; }
    .vote-value { font-size:8px; }
    .experiment-column b { font-size:8px; }
    .finding { padding-top:10px; font-size:9px; }
    .poll-wrap { margin-top:12px; }
    .distance-bars { margin-top:16px; }
    .distance-bars > div { padding:10px 0; }
    .distance-bars span { font-size:11px; }
    .distance-bars b { font-size:22px; }
    .distance-bars small { font-size:10px; }
    .change-axis { margin-top:30px; }
    .axis-line b { font-size:9px; }
    .axis-line small { font-size:8px; }
    .change-axis > p { font-size:9px; }
  }

  @media (prefers-reduced-motion:reduce) { .frame { transition:none; } }
</style>
