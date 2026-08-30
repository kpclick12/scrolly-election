<script>
  import PollReality from "./PollReality.svelte";
  import { strategicVoting2022 } from "../../data/story.js";

  let { step = 0 } = $props();
  const status = $derived([
    "Bland Liberalernas väljare 2022 föredrog 32 procent ett annat parti och 60 procent bestämde sitt partival under sista veckan. Flödet från M till L stod för 5,5 procent av de potentiellt strategiska rösterna.",
    "En sen mätning är inte ett facit. Inför valen 2010 till 2022 ökade Liberalerna bara 2010 från den sena mätningen till valresultatet. I de tre senare valen minskade stödet. Fyra val säger inte vad som händer 2026.",
  ][step]);
</script>

<figure aria-label={status}>
  <div class="frame liberal" class:is-active={step === 0} aria-hidden={step !== 0}>
    <header><p>L-väljarna 2022</p><strong>Sex av tio bestämde sig sista veckan</strong></header>
    <div class="fact-grid">
      <div><strong>{strategicVoting2022.liberalVotersDecidedLastWeek}%</strong><span>bestämde sig sista veckan</span></div>
      <div><strong>{strategicVoting2022.liberalVotersOtherFirstChoice}%</strong><span>hade ett annat parti som förstahandsval</span></div>
      <div><strong>{strategicVoting2022.potentialStrategicFlowMtoL.toLocaleString("sv-SE")}%</strong><span>av de potentiellt strategiska rösterna gick från M till L</span></div>
    </div>
    <p class="source-note">Siffrorna beskriver valet 2022. De är ingen prognos för 2026.</p>
  </div>

  <div class="frame history" class:is-active={step === 1} aria-hidden={step !== 1}>
    <header><p>Sena mätningar och valresultat</p><strong>En sen mätning är inte facit</strong></header>
    <div class="poll-wrap"><PollReality /></div>
  </div>
  <p class="sr-only">{status}</p>
</figure>

<style>
  figure { position:relative; width:min(100%,1060px); min-height:min(790px,92svh); margin:0; overflow:hidden; color:var(--ink); background:#f8faff; border:1px solid var(--rule-strong); }
  .frame { position:absolute; inset:0; display:flex; flex-direction:column; padding:clamp(28px,4vw,46px); opacity:0; pointer-events:none; transform:translateY(10px); transition:opacity .42s ease,transform .55s cubic-bezier(.22,.72,.22,1); }
  .frame.is-active { opacity:1; pointer-events:auto; transform:none; }
  header p { margin:0 0 7px; color:var(--accent-dark); font-size:12px; font-weight:800; letter-spacing:.07em; text-transform:uppercase; }
  header strong { display:block; max-width:850px; font-family:var(--display); font-size:clamp(34px,4.3vw,50px); line-height:1.02; letter-spacing:-.035em; }
  .source-note { margin:16px 0 0; color:var(--muted); font-size:14px; }
  .fact-grid { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:1px; margin:auto 0; background:var(--rule-strong); border-block:1px solid var(--rule-strong); }
  .fact-grid > div { min-width:0; padding:27px 22px 29px; background:white; }
  .fact-grid strong,.fact-grid span { display:block; }
  .fact-grid strong { color:var(--accent); font-family:var(--display); font-size:clamp(43px,6vw,65px); line-height:1; letter-spacing:-.05em; }
  .fact-grid span { margin-top:13px; color:var(--muted); font-size:16px; line-height:1.5; }
  .poll-wrap { margin-top:20px; }
  .poll-wrap :global(figure) { border:0; padding:8px 0 0; background:transparent; }

  @media (max-width:820px) {
    figure { min-height:0; height:100%; border:0; }
    .frame { padding:15px 14px 13px; }
    header p { font-size:9px; }
    header strong { font-size:26px; }
    .source-note { font-size:10px; }
    .fact-grid { margin:25px 0 auto; }
    .fact-grid > div { padding:16px 10px 18px; }
    .fact-grid strong { font-size:35px; }
    .fact-grid span { margin-top:8px; font-size:9px; }
    .poll-wrap { margin-top:12px; }
  }

  @media (prefers-reduced-motion:reduce) { .frame { transition:none; } }
</style>
