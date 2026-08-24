<script>
  import { genderParties, parties } from "../../data/story.js";

  let { step = 0 } = $props();

  const partyByCode = new Map(parties.map((party) => [party.code, party]));
  const x = (value) => `${value / 45 * 100}%`;
  const width = (margin) => `${margin / 45 * 100}%`;
  const gapLeft = (women, men) => `${Math.min(women, men) / 45 * 100}%`;
  const gapWidth = (women, men) => `${Math.abs(women - men) / 45 * 100}%`;
  const format = (value) => value.toLocaleString("sv-SE", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
</script>

<figure aria-label="SCB:s partisympati i maj 2026 bland kvinnor och män som uppgav ett parti. Fem av de åtta visade riksdagspartierna har en statistiskt tydlig skillnad. Övriga partier visas inte.">
  <div class="layer party-view active" class:focus={step === 1}>
    <header>
      <p>SCB · Partisympati · maj 2026</p>
      <h3>{step === 0 ? "Partisympati bland kvinnor och män" : "Fem tydliga könsskillnader"}</h3>
      <div class="gender-key" aria-hidden="true"><span><i class="women"></i>Kvinnor</span><span><i class="men"></i>Män</span></div>
    </header>
    <div class="party-chart">
      {#each genderParties as party}
        <div class="party-row" class:significant={party.significant} style={`--party:${partyByCode.get(party.code)?.color}`}>
          <strong>{party.code}</strong>
          <div class="track">
            <i class="difference-line" style={`left:${gapLeft(party.women, party.men)};width:${gapWidth(party.women, party.men)}`}></i>
            <i class="uncertainty women" style={`left:${x(party.women)};width:${width(party.womenMargin * 2)};transform:translateX(-50%)`}></i>
            <i class="uncertainty men" style={`left:${x(party.men)};width:${width(party.menMargin * 2)};transform:translateX(-50%)`}></i>
            <span class="point women" role="img" style={`left:${x(party.women)}`} aria-label={`Kvinnor ${format(party.women)} procent`}><b aria-hidden="true">{format(party.women)}</b></span>
            <span class="point men" role="img" style={`left:${x(party.men)}`} aria-label={`Män ${format(party.men)} procent`}><b aria-hidden="true">{format(party.men)}</b></span>
          </div>
          <em>{party.significant ? "tydlig skillnad" : "ingen tydlig skillnad"}</em>
        </div>
      {/each}
      <div class="axis">
        {#each [0, 10, 20, 30, 40] as tick}<span style={`left:${x(tick)}`}>{tick}{tick === 40 ? "%" : ""}</span>{/each}
      </div>
    </div>
    <p class="note">Andel bland dem som uppgav ett parti. Linjerna är SCB:s osäkerhetstal. Övriga visas inte.</p>
  </div>

</figure>

<style>
  figure { position:relative; width:min(100%,900px); height:min(82svh,700px); min-height:620px; margin:0; overflow:hidden; color:var(--ink); background:var(--surface); border:1px solid var(--rule-strong); }
  .layer { position:absolute; inset:0; padding:clamp(25px,3.5vw,42px); opacity:0; pointer-events:none; transform:translateY(10px); transition:none; }
  .layer.active { opacity:1; pointer-events:auto; transform:none; transition:opacity .2s ease,transform .24s ease; }
  header { position:relative; z-index:2; }
  header p { margin:0 0 7px; color:var(--accent-dark); font-size:12px; font-weight:700; }
  header h3 { max-width:720px; margin:0; font-family:var(--display); font-size:clamp(31px,3.5vw,39px); font-weight:760; line-height:1.01; letter-spacing:-.035em; }
  .gender-key { display:flex; gap:20px; margin-top:14px; color:var(--muted); font-size:12px; }
  .gender-key span { display:flex; align-items:center; gap:6px; }
  .gender-key i, .point { display:block; width:11px; height:11px; }
  .gender-key i.women, .point.women { border:2px solid var(--accent); border-radius:50%; background:var(--surface); }
  .gender-key i.men, .point.men { background:var(--ink); }
  .note { position:absolute; left:clamp(25px,3.5vw,42px); right:clamp(25px,3.5vw,42px); bottom:16px; margin:0; color:var(--muted); font-size:11px; line-height:1.45; }
  .party-chart { display:grid; margin-top:19px; }
  .party-row { display:grid; grid-template-columns:34px minmax(0,1fr) 118px; align-items:center; gap:12px; min-height:49px; border-top:1px solid var(--rule); transition:opacity .28s ease; }
  .party-row > strong { display:grid; place-items:center; width:31px; height:25px; border-bottom:3px solid var(--party); font-size:12px; }
  .party-row > em { color:var(--muted); font-size:10px; font-style:normal; line-height:1.2; }
  .track { position:relative; height:34px; background-image:linear-gradient(90deg,var(--rule) 1px,transparent 1px); background-size:22.222% 100%; border-inline:1px solid var(--rule); }
  .difference-line { position:absolute; top:15px; height:5px; min-width:2px; border-radius:3px; background:color-mix(in srgb,var(--party) 32%,#e7eaf2); transform:scaleX(0); transform-origin:left; transition:transform .68s cubic-bezier(.22,.72,.22,1); }
  .layer.active .difference-line { transform:scaleX(1); }
  .uncertainty { position:absolute; height:2px; }
  .uncertainty.women { top:12px; background:var(--accent); }
  .uncertainty.men { top:22px; background:var(--ink); }
  .point { position:absolute; transform:translate(-50%,-50%); }
  .track .point.women, .track .point.men { top:17px; }
  .point b { position:absolute; left:50%; padding:1px 3px; color:var(--ink); background:var(--surface); font-size:10px; line-height:1; font-variant-numeric:tabular-nums; white-space:nowrap; }
  .point.women b { top:-14px; transform:translateX(-50%); }
  .point.men b { top:13px; transform:translateX(-50%); }
  .party-view.focus .party-row:not(.significant) { opacity:.28; }
  .party-view:not(.focus) .party-row > em { visibility:hidden; }
  .axis { position:relative; height:14px; margin:5px 130px 0 46px; color:var(--muted-light); font-size:10px; }
  .axis span { position:absolute; transform:translateX(-50%); }
  @media (max-height:720px) and (min-width:821px) {
    header h3 { font-size:34px; }
    .party-row { min-height:43px; }
    .note { font-size:10px; }
  }
  @media (max-width:820px) {
    figure { width:100%; height:100%; min-height:0; border:0; }
    .layer { padding:14px 12px; }
    header p { margin-bottom:4px; font-size:10px; }
    header h3 { font-size:clamp(24px,6.8vw,29px); line-height:1.03; }
    .gender-key { margin-top:7px; font-size:10px; }
    .gender-key i, .point { width:9px; height:9px; }
    .note { left:12px; right:12px; bottom:7px; font-size:9.5px; line-height:1.35; }
    .party-chart { margin-top:7px; }
    .party-row { grid-template-columns:27px minmax(0,1fr); gap:6px; min-height:29px; }
    .party-row > strong { width:25px; height:21px; font-size:10.5px; }
    .party-row > em { display:none; }
    .party-view.focus .party-row:not(.significant) { display:none; }
    .track { height:27px; }
    .difference-line { top:11px; height:4px; }
    .uncertainty.women { top:8px; }
    .uncertainty.men { top:17px; }
    .track .point.women, .track .point.men { top:13px; }
    .point b { padding-inline:1px; font-size:9.5px; }
    .point.women b { top:-11px; }
    .point.men b { top:10px; }
    .axis { margin:3px 0 0 33px; font-size:9px; }
  }
  @media (prefers-reduced-motion:reduce) { .layer { transition:none; } }
</style>
