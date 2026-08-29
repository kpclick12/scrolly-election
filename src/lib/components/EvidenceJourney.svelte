<script>
  import PollReality from "./PollReality.svelte";
  import { insuranceExperiment, strategicVoting2022 } from "../../data/story.js";

  let { step = 0 } = $props();
  const status = $derived([
    "I valet 2022 röstade 16 procent på ett annat parti än sitt tydliga förstahandsval enligt Valforskningsprogrammets snävare definition.",
    "Bland Liberalernas väljare 2022 föredrog 32 procent ett annat parti och 60 procent bestämde sitt partival under sista veckan. Flödet från M till L stod för 5,5 procent av de potentiellt strategiska rösterna.",
    "I ett svenskt experiment fick Liberalerna 6,78 procents stöd när en mätning visade 2,5 procent, 4,8 när den visade 4 och 4,93 när den visade 5,5. Skillnaderna var inte statistiskt säkerställda.",
    "Inför valen 2010 till 2022 ökade Liberalerna bara 2010 från den sena mätningen till valresultatet. I de tre senare valen minskade stödet.",
    "Statsvetaren Annika Fredén har sett stödröster till etablerade koalitionspartier redan vid 2,5 procent och nämner Kristdemokraterna. I DN och Ipsos undersökning var medianen 3,5 procent för när väljare säger att de vågar stödrösta.",
  ][step]);
</script>

<figure aria-label={status}>
  <div class="frame national" class:is-active={step === 0} aria-hidden={step !== 0}>
    <header><p>Valundersökningen 2022</p><strong>Var sjätte valde bort sitt tydliga förstahandsval</strong></header>
    <div class="big-stat"><strong>{strategicVoting2022.strictAllVoters}%</strong><span>räknas som möjliga taktikröster</span></div>
    <div class="definition"><b>20%</b><span>med en bredare definition</span></div>
    <p class="source-note">Valforskningsprogrammet. Viktade uppgifter från Valundersökningen 2022.</p>
  </div>

  <div class="frame liberal" class:is-active={step === 1} aria-hidden={step !== 1}>
    <header><p>L-väljarna 2022</p><strong>Många kom sent och föredrog ett annat parti</strong></header>
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
    <header><p>Sena mätningar och valresultat</p><strong>Tre av fyra slutspurter gick bakåt</strong></header>
    <div class="poll-wrap"><PollReality /></div>
  </div>

  <div class="frame signal-levels" class:is-active={step === 4} aria-hidden={step !== 4}>
    <header><p>När börjar stödrösterna komma?</p><strong>Det beror också på partiet</strong></header>
    <div class="level-scale" aria-hidden="true">
      <i></i>
      <div class="level current" style="--position:0%"><b>2,0%</b><span>L i Demoskop</span></div>
      <div class="level observed" style="--position:25%"><b>2,5%</b><span>Fredéns KD-exempel</span></div>
      <div class="level advice" style="--position:75%"><b>3,5%</b><span>DN/Ipsos median</span></div>
      <div class="level threshold" style="--position:100%"><b>4,0%</b><span>Riksdagsspärren</span></div>
    </div>
    <div class="level-notes">
      <p><strong>Fredén om KD.</strong> Ett etablerat koalitionsparti kan få stödröster redan vid 2,5 procent.</p>
      <p><strong>DN/Ipsos.</strong> Medianen var 3,0 för ”bortkastad” och 3,5 för att våga stödrösta.</p>
    </div>
    <p class="finding">Det är olika slags mått. Det ena bygger på tidigare beteende, det andra på hypotetiska frågor. Inget av dem ger en säker gräns för L.</p>
  </div>
  <p class="sr-only">{status}</p>
</figure>

<style>
  figure { position:relative; width:min(100%,1060px); min-height:min(790px,92svh); margin:0; overflow:hidden; color:var(--ink); background:#f8faff; border:1px solid var(--rule-strong); }
  .frame { position:absolute; inset:0; display:flex; flex-direction:column; padding:clamp(28px,4vw,46px); opacity:0; pointer-events:none; transform:translateY(10px); transition:opacity .42s ease,transform .55s cubic-bezier(.22,.72,.22,1); }
  .frame.is-active { opacity:1; pointer-events:auto; transform:none; }
  header p { margin:0 0 7px; color:var(--accent-dark); font-size:12px; font-weight:800; letter-spacing:.07em; text-transform:uppercase; }
  header strong { display:block; max-width:850px; font-family:var(--display); font-size:clamp(34px,4.3vw,50px); line-height:1.02; letter-spacing:-.035em; }
  .big-stat { display:grid; grid-template-columns:auto minmax(0,330px); gap:26px; align-items:end; margin:auto 0; }
  .big-stat strong { color:var(--accent); font-family:var(--display); font-size:clamp(110px,18vw,190px); line-height:.72; letter-spacing:-.08em; }
  .big-stat span { color:var(--muted); font-size:20px; line-height:1.4; }
  .definition { display:flex; align-items:baseline; gap:10px; padding:18px 0; border-block:1px solid var(--rule-strong); }
  .definition b { font-family:var(--display); font-size:32px; }
  .definition span,.source-note { color:var(--muted); font-size:14px; }
  .source-note { margin:16px 0 0; }
  .fact-grid { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:1px; margin:auto 0; background:var(--rule-strong); border-block:1px solid var(--rule-strong); }
  .fact-grid > div { min-width:0; padding:27px 22px 29px; background:white; }
  .fact-grid strong,.fact-grid span { display:block; }
  .fact-grid strong { color:var(--accent); font-family:var(--display); font-size:clamp(43px,6vw,65px); line-height:1; letter-spacing:-.05em; }
  .fact-grid span { margin-top:13px; color:var(--muted); font-size:16px; line-height:1.5; }
  .experiment-chart { display:grid; grid-template-columns:repeat(3,1fr); gap:clamp(20px,5vw,55px); height:330px; margin:50px 0 0; padding-inline:20px; border-bottom:1px solid var(--rule-strong); }
  .experiment-column { position:relative; display:flex; flex-direction:column; justify-content:flex-end; align-items:center; min-width:0; }
  .experiment-column > i { display:block; width:min(82px,60%); height:var(--height); min-height:20px; background:var(--accent); }
  .experiment-column b { min-height:50px; margin-top:12px; font-size:14px; line-height:1.35; text-align:center; }
  .vote-value { margin-bottom:8px; color:var(--accent-dark); font-size:15px; font-weight:750; }
  .finding { margin:auto 0 0; padding-top:18px; border-top:1px solid var(--rule); color:var(--muted); font-size:16px; line-height:1.55; }
  .poll-wrap { margin-top:20px; }
  .poll-wrap :global(figure) { border:0; padding:8px 0 0; background:transparent; }
  .level-scale { position:relative; height:175px; margin:clamp(70px,10vh,105px) 28px 0; }
  .level-scale > i { position:absolute; left:0; right:0; top:48px; height:2px; background:linear-gradient(90deg,var(--accent),var(--teal)); }
  .level { position:absolute; left:var(--position); top:37px; width:18px; height:18px; border:3px solid white; border-radius:50%; background:var(--accent); box-shadow:0 0 0 1px var(--accent); transform:translateX(-50%); }
  .level b,.level span { position:absolute; left:50%; width:145px; text-align:center; transform:translateX(-50%); }
  .level b { bottom:24px; color:var(--ink); font-family:var(--display); font-size:25px; }
  .level span { top:27px; color:var(--muted); font-size:11px; line-height:1.3; }
  .level.current { transform:translateX(0); }
  .level.current b,.level.current span { left:0; text-align:left; transform:none; }
  .level.threshold { background:var(--teal); box-shadow:0 0 0 1px var(--teal); transform:translateX(-100%); }
  .level.threshold b,.level.threshold span { left:auto; right:0; text-align:right; transform:none; }
  .level.observed { background:var(--violet); box-shadow:0 0 0 2px var(--violet),0 0 0 9px rgba(112,88,189,.12); }
  .level.advice { background:#d3a62c; box-shadow:0 0 0 1px #9b7615; }
  .level-notes { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:1px; margin-top:auto; background:var(--rule-strong); border-block:1px solid var(--rule-strong); }
  .level-notes p { margin:0; padding:20px; color:var(--muted); background:white; font-size:14px; line-height:1.5; }
  .level-notes strong { color:var(--ink); }

  @media (max-width:820px) {
    figure { min-height:0; height:100%; border:0; }
    .frame { padding:15px 14px 13px; }
    header p { font-size:9px; }
    header strong { font-size:26px; }
    .big-stat { grid-template-columns:auto 1fr; gap:14px; }
    .big-stat strong { font-size:86px; }
    .big-stat span { font-size:12px; }
    .definition { padding:10px 0; }
    .definition b { font-size:24px; }
    .definition span,.source-note { font-size:10px; }
    .fact-grid { margin:25px 0 auto; }
    .fact-grid > div { padding:16px 10px 18px; }
    .fact-grid strong { font-size:35px; }
    .fact-grid span { margin-top:8px; font-size:9px; }
    .experiment-chart { height:225px; margin-top:22px; padding-inline:0; gap:12px; }
    .experiment-column > i { width:48px; }
    .vote-value { font-size:9px; }
    .experiment-column b { font-size:9px; }
    .finding { padding-top:10px; font-size:10px; }
    .poll-wrap { margin-top:12px; }
    .level-scale { height:150px; margin:38px 8px 0; }
    .level-scale > i { top:39px; }
    .level { top:31px; width:16px; height:16px; }
    .level b { bottom:21px; font-size:18px; }
    .level span { top:23px; width:80px; font-size:8px; }
    .level.observed b,.level.threshold b { top:28px; bottom:auto; }
    .level.observed span,.level.threshold span { top:52px; }
    .level-notes p { padding:10px; font-size:9px; }
  }

  @media (prefers-reduced-motion:reduce) { .frame { transition:none; } }
</style>
