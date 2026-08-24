<script>
  import { genderParties, parties } from "../../data/story.js";

  let { step = 0 } = $props();

  const partyByCode = new Map(parties.map((party) => [party.code, party]));
  const format = (value) => value.toLocaleString("sv-SE", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  const rows = [
    ...genderParties,
    { code: "Övr", women: .9, men: 3.2, significant: false },
  ];
  const focus = new Set(["S", "SD"]);

  function allocate(key) {
    const exact = rows.map((row) => ({ code: row.code, value: row[key], floor: Math.floor(row[key]), rest: row[key] % 1 }));
    let left = 100 - exact.reduce((sum, row) => sum + row.floor, 0);
    for (const row of [...exact].sort((a, b) => b.rest - a.rest)) {
      if (left <= 0) break;
      row.floor += 1;
      left -= 1;
    }
    return exact.flatMap((row) => Array(row.floor).fill(row.code));
  }

  const waffles = [
    { label: "Kvinnor", key: "women", partyAnswer: "84,3% uppgav parti", dots: allocate("women") },
    { label: "Män", key: "men", partyAnswer: "86,1% uppgav parti", dots: allocate("men") },
  ];
</script>

<figure aria-label="Två diagram med hundra punkter vardera visar SCB:s partisympati bland kvinnor och män i maj 2026. Skillnaden är särskilt stor för Socialdemokraterna och Sverigedemokraterna.">
  <header>
    <p>SCB · partisympati · maj 2026</p>
    <h3>{step === 0 ? "Partisympati bland kvinnor och män" : "De två största skillnaderna"}</h3>
  </header>

  <div class="waffles" class:focus-view={step === 1}>
    {#each waffles as waffle}
      <section aria-label={`${waffle.label}: hundra symbolpunkter, ungefär en punkt per procentenhet`}>
        <div class="waffle-head"><h4>{waffle.label}</h4><span>{waffle.partyAnswer}</span></div>
        <div class="waffle" aria-hidden="true">
          {#each waffle.dots as code, index}
            <i class:focus={focus.has(code)} class:dim={step === 1 && !focus.has(code)} style={`--party:${partyByCode.get(code)?.color}`}>
            </i>
          {/each}
        </div>
      </section>
    {/each}
  </div>

  <div class="sr-only gender-data">
    <p>SCB:s partisympati i maj 2026 bland kvinnor och män som uppgav ett parti. Procent och 95-procentig osäkerhetsmarginal.</p>
    <ul>
      {#each rows as row}
        <li>{row.code}. Kvinnor: {format(row.women)} procent{row.womenMargin ? `, plus eller minus ${format(row.womenMargin)}` : ""}. Män: {format(row.men)} procent{row.menMargin ? `, plus eller minus ${format(row.menMargin)}` : ""}.</li>
      {/each}
    </ul>
  </div>

  {#if step === 0}
    <div class="legend" aria-hidden="true">
      {#each rows as row}<span><i style={`--party:${partyByCode.get(row.code)?.color}`}></i>{row.code}</span>{/each}
    </div>
  {:else}
    <div class="focus-reading">
      <div><b style={`--party:${partyByCode.get("S")?.color}`}>S</b><span>Kvinnor <strong>38,4% ±2,1</strong></span><span>Män <strong>28,7% ±1,9</strong></span></div>
      <div><b style={`--party:${partyByCode.get("SD")?.color}`}>SD</b><span>Kvinnor <strong>12,2% ±1,6</strong></span><span>Män <strong>24,6% ±1,8</strong></span></div>
    </div>
  {/if}
  <figcaption>Hundra punkter fördelas bland dem som uppgav ett parti. Vet ej och uppgift saknas visas inte. Fokusvärdena har SCB:s 95-procentiga osäkerhetsmarginal.</figcaption>
</figure>

<style>
  figure { position:relative; width:min(100%,900px); height:min(74svh,620px); min-height:560px; margin:0; overflow:hidden; color:var(--ink); background:#fff; border:1px solid var(--rule-strong); }
  header { padding:clamp(24px,3.5vw,40px) clamp(24px,4vw,48px) 0; }
  header p { margin:0 0 6px; color:var(--accent-dark); font-size:11px; font-weight:750; }
  header h3 { max-width:720px; margin:0; font-family:var(--display); font-size:clamp(30px,3.5vw,40px); font-weight:720; line-height:1.02; letter-spacing:-.035em; }
  .waffles { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:clamp(30px,6vw,72px); margin:clamp(28px,4vw,42px) clamp(24px,6vw,65px) 0; }
  .waffle-head { display:flex; align-items:baseline; justify-content:space-between; gap:15px; margin-bottom:12px; }
  .waffle-head h4 { margin:0; font-family:var(--display); font-size:24px; }
  .waffle-head span { color:var(--muted-light); font-size:9px; }
  .waffle { display:grid; grid-template-columns:repeat(10,1fr); gap:clamp(4px,.65vw,7px); }
  .waffle > i { display:block; aspect-ratio:1; min-width:0; border-radius:50%; background:var(--party); box-shadow:inset 1.5px 1.5px rgba(255,255,255,.35); transition:opacity .35s ease,transform .45s cubic-bezier(.22,.72,.22,1); }
  .focus-view .waffle > i.focus { transform:scale(1.09); }
  .waffle > i.dim { opacity:.11; transform:scale(.82); }
  .legend { display:flex; flex-wrap:wrap; justify-content:center; gap:7px 14px; margin:28px 30px 0; padding-top:13px; border-top:1px solid var(--rule); color:var(--muted); font-size:9px; }
  .legend span { display:flex; align-items:center; gap:5px; }
  .legend i { width:8px; height:8px; border-radius:50%; background:var(--party); }
  .focus-reading { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:1px; margin:27px clamp(24px,6vw,65px) 0; background:var(--rule); border-block:1px solid var(--rule); }
  .focus-reading > div { display:grid; grid-template-columns:auto 1fr 1fr; align-items:center; gap:10px 16px; padding:13px 15px; background:#f7f9fd; }
  .focus-reading b { display:grid; place-items:center; width:31px; height:27px; border-bottom:4px solid var(--party); font-size:12px; }
  .focus-reading span { color:var(--muted); font-size:9px; line-height:1.3; }
  .focus-reading strong { display:block; color:var(--ink); font-size:14px; font-variant-numeric:tabular-nums; }
  figcaption { position:absolute; left:clamp(24px,4vw,48px); right:clamp(24px,4vw,48px); bottom:13px; color:var(--muted-light); font-size:9.5px; line-height:1.4; }
  @media (max-height:720px) and (min-width:821px) {
    figure { min-height:530px; }
    .waffles { max-width:700px; margin:25px auto 0; }
    .waffle { gap:5px; }
  }
  @media (max-width:820px) {
    figure { width:100%; height:100%; min-height:0; border:0; }
    header { padding:13px 13px 0; }
    header p { font-size:9px; }
    header h3 { font-size:clamp(24px,7vw,29px); }
    .waffles { gap:22px; margin:24px 16px 0; }
    .waffle-head { margin-bottom:7px; }
    .waffle-head h4 { font-size:18px; }
    .waffle-head span { display:none; }
    .waffle { gap:3px; }
    .legend { gap:4px 9px; margin:17px 13px 0; padding-top:9px; font-size:8px; }
    .focus-reading { margin:17px 13px 0; }
    .focus-reading > div { display:grid; grid-template-columns:auto 1fr; gap:4px 9px; padding:8px 9px; }
    .focus-reading b { grid-row:1/3; width:25px; }
    .focus-reading span { font-size:8px; }
    .focus-reading strong { display:inline; font-size:10px; }
    figcaption { left:13px; right:13px; bottom:7px; font-size:8.5px; }
  }
  @media (prefers-reduced-motion:reduce) { .waffle > i { transition:none; } }
</style>
