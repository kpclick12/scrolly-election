<script>
  let { step = 0 } = $props();

  const dots = Array.from({ length: 100 }, (_, index) => index);
  const shownSupport = $derived(step === 0 ? 2.2 : 3.5);
  const filledDots = $derived(Math.round(shownSupport / 5 * 100));
  const status = $derived([
    "Liberalerna har 2,2 procent. För att nå spärren saknas omkring 117 000 röster, räknat med valdeltagandet 2022.",
    "Vid 3,5 procent saknas omkring 32 000 röster till spärren.",
    "Utfallet av en strategisk röst beror både på det egna valet och på om tillräckligt många andra väljare hjälper Liberalerna.",
    "En opinionsmätning ger väljarna en gemensam signal om hur många som kan tänkas hjälpa Liberalerna.",
    "Den enskilt bekväma utvägen är att låta andra ta risken. Om många resonerar så misslyckas samordningen.",
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
      <strong>{step === 0 ? "≈ 117 000" : "≈ 32 000"}</strong>
      <small>ytterligare väljare, beräknat med antalet giltiga röster 2022</small>
    </div>
  </div>

  <div class="frame matrix" class:is-active={step === 2 || step === 4} class:free-rider={step === 4} aria-hidden={step !== 2 && step !== 4}>
    <header>
      <p>Ett samordningsspel</p>
      <strong>Du väljer. Andra väljer.</strong>
    </header>
    <div class="matrix-grid">
      <div class="empty"></div>
      <div class="column-head">Tillräckligt många hjälper L</div>
      <div class="column-head">För få hjälper L</div>
      <div class="row-head">Du väljer L</div>
      <div class="cell joint"><b>L passerar</b><span>Din röst bidrar till räddningen.</span></div>
      <div class="cell risk"><b>L missar</b><span>Rösten deltar inte i den nationella mandatfördelningen.</span></div>
      <div class="row-head">Du stannar</div>
      <div class="cell ride"><b>Andra tar risken</b><span>L passerar utan din hjälp.</span></div>
      <div class="cell safe"><b>L faller ur</b><span>Din röst ligger kvar hos ditt förstahandsval.</span></div>
    </div>
    <p class="matrix-note">{step === 4 ? "Den bekväma rutan fungerar bara så länge tillräckligt många andra lämnar den." : "Din bästa handling beror på vad du tror att de andra väljarna kommer att göra."}</p>
  </div>

  <div class="frame signal" class:is-active={step === 3} aria-hidden={step !== 3}>
    <header>
      <p>Opinionsmätningen</p>
      <strong>En siffra som alla ser</strong>
    </header>
    <div class="signal-stage" aria-hidden="true">
      <div class="poll-card"><span>L</span><b>3,5%</b><small>tio dagar kvar</small></div>
      {#each Array.from({ length: 12 }) as _, index}
        <i style={`--angle:${index * 30}deg;--delay:${index * .025}s`}></i>
      {/each}
    </div>
    <div class="signal-copy">
      <span>En offentlig mätning ger väljarna samma utgångspunkt</span>
      <div><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div>
    </div>
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
  .funding-scale b { color:var(--teal); }
  .distance { margin-top:auto; padding-top:24px; border-top:1px solid var(--rule-strong); }
  .distance span,.distance small { display:block; color:var(--muted); font-size:13px; line-height:1.45; }
  .distance strong { display:block; margin:4px 0 6px; color:var(--ink); font-family:var(--display); font-size:clamp(35px,5vw,54px); line-height:1; letter-spacing:-.04em; }
  .matrix-grid { display:grid; grid-template-columns:120px repeat(2,minmax(0,1fr)); margin-top:clamp(28px,5vh,48px); border:1px solid var(--rule-strong); }
  .matrix-grid > div { min-width:0; padding:15px 16px; border-right:1px solid var(--rule); border-bottom:1px solid var(--rule); }
  .matrix-grid > div:nth-child(3n) { border-right:0; }
  .matrix-grid > div:nth-last-child(-n+3) { border-bottom:0; }
  .empty { background:var(--paper-alt); }
  .column-head,.row-head { display:flex; align-items:center; color:var(--muted); background:var(--paper-alt); font-size:12px; font-weight:750; line-height:1.35; }
  .cell { min-height:118px; background:white; transition:background .35s ease,box-shadow .35s ease; }
  .cell b,.cell span { display:block; }
  .cell b { font-size:16px; }
  .cell span { margin-top:8px; color:var(--muted); font-size:13px; line-height:1.45; }
  .matrix:not(.free-rider) .joint { background:var(--accent-soft); box-shadow:inset 0 0 0 2px var(--accent); }
  .matrix:not(.free-rider) .risk { background:#f6f0f5; }
  .matrix.free-rider .ride { background:#e3f2f2; box-shadow:inset 0 0 0 2px var(--teal); }
  .matrix-note { margin:auto 0 0; padding-top:20px; color:var(--muted); font-size:15px; line-height:1.55; }
  .signal-stage { position:relative; min-height:330px; flex:1; display:grid; place-items:center; }
  .poll-card { position:relative; z-index:2; display:grid; place-items:center; width:180px; height:180px; border-radius:50%; color:white; background:var(--accent); box-shadow:0 0 0 18px var(--accent-soft); }
  .poll-card span,.poll-card small { font-size:11px; font-weight:750; }
  .poll-card b { font-family:var(--display); font-size:48px; line-height:1; letter-spacing:-.05em; }
  .signal-stage > i { position:absolute; left:50%; top:50%; width:16px; height:16px; margin:-8px; border-radius:50%; background:var(--teal); transform:rotate(var(--angle)) translateX(clamp(125px,18vw,195px)); transition:transform .55s var(--delay) ease; }
  .signal-copy { padding-top:18px; border-top:1px solid var(--rule-strong); }
  .signal-copy > span { color:var(--muted); font-size:14px; }
  .signal-copy > div { display:flex; gap:7px; margin-top:12px; }
  .signal-copy i { width:11px; height:11px; border-radius:50%; background:var(--accent); }

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
    .signal-stage { min-height:250px; }
    .poll-card { width:125px; height:125px; box-shadow:0 0 0 12px var(--accent-soft); }
    .poll-card b { font-size:34px; }
    .signal-stage > i { width:11px; height:11px; margin:-5.5px; transform:rotate(var(--angle)) translateX(105px); }
    .signal-copy { padding-top:10px; }
    .signal-copy > span { font-size:9px; }
  }

  @media (prefers-reduced-motion:reduce) {
    .frame,.dot-field i,.signal-stage > i { transition:none; }
  }
</style>
