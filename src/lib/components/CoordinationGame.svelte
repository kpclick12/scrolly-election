<script>
  import { supportVoteThresholds } from "../../data/story.js";

  let { step = 0 } = $props();

  const dots = Array.from({ length: 100 }, (_, index) => index);
  const shownSupport = $derived(step === 0 ? 2.0 : 3.5);
  const filledDots = $derived(Math.round(shownSupport / 5 * 100));
  const status = $derived([
    "Liberalerna har 2,0 procent. För att nå spärren saknas omkring 130 000 röster, räknat med valdeltagandet 2022.",
    "Vid 3,5 procent saknas omkring 32 000 röster till spärren.",
    "Utfallet av en strategisk röst beror både på det egna valet och på om tillräckligt många andra väljare hjälper Liberalerna.",
    "I DN och Ipsos undersökning beskrev de svarande sina egna gränser. Medianen var 3,0 procent för när en stödröst känns bortkastad och 3,5 procent för när de vågar stödrösta. Det är inte ett test av hur en mätning ändrar rösten.",
    "Den som stannar kvar förlitar sig på att andra byter. Om många resonerar så passerar Liberalerna inte fyraprocentsspärren.",
  ][step]);
</script>

<figure aria-label={status}>
  <div class="frame funding" class:is-active={step <= 1} aria-hidden={step > 1}>
    <header>
      <p>Avstånd till riksdagsspärren</p>
      <strong>{shownSupport.toLocaleString("sv-SE", { minimumFractionDigits: 1 })}%</strong>
    </header>
    <div class="dot-field" aria-hidden="true">
      {#each dots as dot}
        <i class:filled={dot < filledDots} class:threshold={dot === 79}></i>
      {/each}
    </div>
    <div class="funding-scale" aria-hidden="true">
      <span>0%</span><b>4% · spärren</b><span>5%</span>
    </div>
    <div class="distance">
      <span>För att nå 4 procent behövs</span>
      <strong>{step === 0 ? "≈ 130 000" : "≈ 32 000"}</strong>
      <small>ytterligare väljare, beräknat med antalet giltiga röster 2022</small>
    </div>
  </div>

  <div class="frame matrix" class:is-active={step === 2 || step === 4} class:free-rider={step === 4} aria-hidden={step !== 2 && step !== 4}>
    <header>
      <p>Ett samordningsspel</p>
      <strong>Din röst räcker inte ensam</strong>
    </header>
    <div class="matrix-grid">
      <div class="empty"></div>
      <div class="column-head helps">Tillräckligt många hjälper L</div>
      <div class="column-head too-few">För få hjälper L</div>
      <div class="row-head row-choice">Du väljer L</div>
      <div class="cell joint"><b>L passerar</b><span>Din röst bidrar till räddningen.</span></div>
      <div class="cell risk"><b>L missar</b><span>Rösten deltar inte i den nationella mandatfördelningen.</span></div>
      <div class="row-head row-stay">Du stannar</div>
      <div class="cell ride"><b>Andra byter</b><span>L passerar utan din hjälp.</span></div>
      <div class="cell safe"><b>L faller ur</b><span>Din röst ligger kvar hos ditt förstahandsval.</span></div>
    </div>
    <p class="matrix-note">{step === 4 ? "Det utfallet uppstår om för få andra byter." : "Din bästa handling beror på vad du tror att de andra väljarna kommer att göra."}</p>
  </div>

  <div class="frame signal" class:is-active={step === 3} aria-hidden={step !== 3}>
    <header>
      <p>DN/Ipsos · 29 augusti</p>
      <strong>Var går väljarnas egen gräns?</strong>
    </header>
    <div class="signal-axis" aria-hidden="true">
      <i></i>
      <div class="signal-point current" style="--position:0%"><b>2,0%</b><span>L i Demoskop</span></div>
      <div class="signal-point waste" style="--position:50%"><b>{supportVoteThresholds.wasteMedian.toLocaleString("sv-SE", { minimumFractionDigits: 1 })}%</b><span>stödrösten känns bortkastad</span></div>
      <div class="signal-point dare" style="--position:75%"><b>{supportVoteThresholds.dareMedian.toLocaleString("sv-SE", { minimumFractionDigits: 1 })}%</b><span>vågar stödrösta</span></div>
      <div class="signal-point threshold" style="--position:100%"><b>4,0%</b><span>riksdagsspärren</span></div>
    </div>
    <div class="signal-findings">
      <p><strong>3,0 procent</strong><span>Medianen för när en stödröst upplevs som bortkastad.</span></p>
      <p><strong>3,5 procent</strong><span>Medianen för när väljaren säger att den vågar stödrösta.</span></p>
    </div>
    <p class="signal-note">Svar på hypotetiska frågor. De visar hur väljarna resonerar, inte hur de kommer att rösta.</p>
  </div>
  <p class="sr-only">{status}</p>
</figure>

<style>
  figure { position:relative; width:min(100%,980px); min-height:min(740px,90svh); margin:0; overflow:hidden; color:var(--ink); background:#f8faff; border:1px solid var(--rule-strong); }
  .frame { position:absolute; inset:0; display:flex; flex-direction:column; padding:clamp(24px,4vw,42px); opacity:0; pointer-events:none; transform:translateY(10px); transition:opacity .42s ease,transform .55s cubic-bezier(.22,.72,.22,1); }
  .frame.is-active { opacity:1; pointer-events:auto; transform:none; }
  header p { margin:0 0 7px; color:var(--accent-dark); font-size:12px; font-weight:800; letter-spacing:.07em; text-transform:uppercase; }
  header strong { display:block; max-width:720px; font-family:var(--display); font-size:clamp(31px,4vw,46px); line-height:1.02; letter-spacing:-.035em; }
  .funding header { display:flex; align-items:end; justify-content:space-between; gap:20px; }
  .funding header > strong { color:var(--accent); font-size:clamp(46px,7vw,76px); line-height:.85; }
  .dot-field { display:grid; grid-template-columns:repeat(20,1fr); gap:clamp(5px,1vw,10px); margin-top:clamp(42px,7vh,72px); }
  .dot-field i { aspect-ratio:1; border-radius:50%; background:var(--point-dim); transition:background .4s ease,transform .4s ease; }
  .dot-field i.filled { background:var(--accent); }
  .dot-field i.threshold { outline:2px solid var(--teal); outline-offset:3px; }
  .funding-scale { display:flex; justify-content:space-between; margin-top:14px; color:var(--muted); font-size:10px; }
  .funding-scale b { color:var(--teal-text); }
  .distance { margin-top:auto; padding-top:24px; border-top:1px solid var(--rule-strong); }
  .distance span,.distance small { display:block; color:var(--muted); font-size:13px; line-height:1.45; }
  .distance strong { display:block; margin:4px 0 6px; color:var(--ink); font-family:var(--display); font-size:clamp(35px,5vw,54px); line-height:1; letter-spacing:-.04em; }
  .matrix-grid { display:grid; grid-template-columns:120px repeat(2,minmax(0,1fr)); margin-top:clamp(28px,5vh,48px); border:1px solid var(--rule-strong); transition:transform .62s cubic-bezier(.22,.72,.22,1); }
  .matrix-grid > div { min-width:0; padding:15px 16px; border-right:1px solid var(--rule); border-bottom:1px solid var(--rule); transition:opacity .4s ease; }
  .matrix-grid > div:nth-child(3n) { border-right:0; }
  .matrix-grid > div:nth-last-child(-n+3) { border-bottom:0; }
  .empty { background:var(--paper-alt); }
  .column-head,.row-head { display:flex; align-items:center; color:var(--muted); background:var(--paper-alt); font-size:12px; font-weight:750; line-height:1.35; }
  .cell { min-height:118px; background:white; transition:background .35s ease,box-shadow .35s ease,opacity .4s ease; }
  .cell b,.cell span { display:block; }
  .cell b { font-size:16px; }
  .cell span { margin-top:8px; color:var(--muted); font-size:13px; line-height:1.45; }
  .matrix:not(.free-rider) .joint { background:var(--accent-soft); box-shadow:inset 0 0 0 2px var(--accent); }
  .matrix .risk { background:#f6f0f5; }
  .matrix.free-rider .safe { background:var(--accent-soft); box-shadow:inset 0 0 0 2px var(--accent); }
  .matrix-note { margin:auto 0 0; padding-top:20px; color:var(--muted); font-size:15px; line-height:1.55; }
  .signal-axis { position:relative; height:185px; margin:clamp(70px,11vh,110px) 28px 0; }
  .signal-axis > i { position:absolute; left:0; right:0; top:52px; height:3px; background:linear-gradient(90deg,var(--accent),var(--teal)); transform:scaleX(0); transform-origin:left; transition:transform .85s .08s cubic-bezier(.22,.72,.22,1); }
  .signal.is-active .signal-axis > i { transform:scaleX(1); }
  .signal-point { position:absolute; left:var(--position); top:41px; width:22px; height:22px; border:4px solid white; border-radius:50%; background:var(--accent); box-shadow:0 0 0 2px var(--accent); opacity:0; transform:translate(-50%,8px); transition:opacity .24s .12s ease,transform .34s .12s cubic-bezier(.22,.72,.22,1); }
  .signal.is-active .signal-point { opacity:1; transform:translate(-50%,0); }
  .signal-point b,.signal-point span { position:absolute; left:50%; width:155px; text-align:center; transform:translateX(-50%); }
  .signal-point b { bottom:29px; color:var(--ink); font-family:var(--display); font-size:27px; letter-spacing:-.035em; }
  .signal-point span { top:31px; color:var(--muted); font-size:11px; line-height:1.3; }
  .signal-point.current { transform:translate(0,8px); }
  .signal.is-active .signal-point.current { transform:none; }
  .signal-point.current b,.signal-point.current span { left:0; text-align:left; transform:none; }
  .signal-point.threshold { background:var(--teal); box-shadow:0 0 0 2px var(--teal); transform:translate(-100%,8px); }
  .signal.is-active .signal-point.threshold { transform:translateX(-100%); }
  .signal-point.threshold b,.signal-point.threshold span { left:auto; right:0; text-align:right; transform:none; }
  .signal-point.waste { background:var(--violet); box-shadow:0 0 0 2px var(--violet),0 0 0 9px rgba(112,88,189,.12); transition-delay:.2s; }
  .signal-point.dare { background:#d3a62c; box-shadow:0 0 0 2px #9b7615,0 0 0 9px rgba(211,166,44,.13); transition-delay:.28s; }
  .signal-findings { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:1px; margin-top:auto; background:var(--rule-strong); border-block:1px solid var(--rule-strong); }
  .signal-findings p { margin:0; padding:19px 20px; background:white; }
  .signal-findings strong,.signal-findings span { display:block; }
  .signal-findings strong { color:var(--ink); font-family:var(--display); font-size:22px; }
  .signal-findings span { margin-top:5px; color:var(--muted); font-size:13px; line-height:1.4; }
  .signal-note { margin:15px 0 0; color:var(--muted); font-size:12px; line-height:1.45; }

  @media (max-width:820px) {
    figure { min-height:0; height:100%; border:0; }
    .frame { padding:15px 14px 13px; }
    header p { font-size:8px; }
    header strong { font-size:25px; }
    .funding header > strong { font-size:42px; }
    .dot-field { gap:4px; margin-top:26px; }
    .dot-field i.threshold { outline-width:1px; outline-offset:2px; }
    .distance { padding-top:14px; }
    .distance strong { font-size:31px; }
    .distance span,.distance small { font-size:9px; }
    .matrix-grid { grid-template-columns:70px repeat(2,minmax(0,1fr)); margin-top:20px; }
    .matrix-grid > div { padding:8px; }
    .column-head,.row-head { font-size:8px; }
    .cell { min-height:88px; }
    .cell b { font-size:11px; }
    .cell span { margin-top:4px; font-size:8px; line-height:1.35; }
    .matrix-note { padding-top:10px; font-size:9px; }
    .signal-axis { height:148px; margin:39px 8px 0; }
    .signal-axis > i { top:42px; height:2px; }
    .signal-point { top:34px; width:17px; height:17px; border-width:3px; }
    .signal-point b { bottom:22px; font-size:18px; }
    .signal-point span { top:24px; width:78px; font-size:7px; }
    .signal-point.waste b,.signal-point.threshold b { top:27px; bottom:auto; }
    .signal-point.waste span,.signal-point.threshold span { top:49px; }
    .signal-findings,.signal-note { display:none; }
  }

  @media (prefers-reduced-motion:reduce) {
    .frame,.dot-field i,.signal-axis > i,.signal-point,.matrix-grid,.matrix-grid > div { transition:none; }
    .signal-axis > i { transform:none; }
    .signal-point,.signal-point.current,.signal-point.threshold { opacity:1; transform:translateX(-50%); }
    .signal-point.current { transform:none; }
    .signal-point.threshold { transform:translateX(-100%); }
  }
</style>
