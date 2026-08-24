<script>
  let { step = 0 } = $props();

  const people = Array.from({ length: 96 }, (_, index) => index);
  const selected = new Set([1, 4, 8, 11, 13, 17, 20, 23, 26, 30, 34, 37, 40, 44, 48, 51, 55, 59, 63, 67, 72, 78, 85, 91]);
  const answered = new Set([1, 8, 13, 20, 26, 34, 40, 48, 55, 63, 72, 85]);
  const weights = new Map([...answered].map((index, order) => [index, [.82, 1.18, .94, 1.34, .88, 1.48, 1.06, .9, 1.27, .84, 1.4, 1.12][order]]));

  const titles = [
    "Alla vi vill säga något om",
    "Ett urval ur hela populationen",
    "Svar och bortfall",
    "Svaren får olika vikt",
    "En skattning med osäkerhet",
  ];

  const metrics = [
    { value: "drygt 8 miljoner", label: "i målpopulationen" },
    { value: "9 260", label: "slumpmässigt utvalda" },
    { value: "4 542", label: "svar · 51% bortfall" },
    { value: "olika vikt", label: "kända skevheter justeras" },
    { value: "andel ± osäkerhet", label: "den färdiga skattningen" },
  ];

  const descriptions = [
    "Ett punktfält representerar målpopulationen på drygt åtta miljoner röstberättigade.",
    "Tjugofyra utspridda punkter markeras som en illustration av SCB:s 9 260 slumpmässigt utvalda.",
    "Hälften av de markerade punkterna visas som svar och hälften som bortfall, motsvarande ett bortfall på 51 procent.",
    "Svarspunkterna får olika storlek för att visa hur kända skillnader används i en viktad skattning.",
    "De viktade svaren blir en skattning med statistisk osäkerhet och en kvarvarande risk för skevt bortfall.",
  ];
</script>

<figure class={`stage-${step}`} aria-label={descriptions[step]}>
  <header>
    <p>SCB · partisympati · maj 2026</p>
    <h3>{titles[step]}</h3>
  </header>

  <div class="population" aria-hidden="true">
    {#each people as person}
      <i
        class:selected={selected.has(person)}
        class:answered={answered.has(person)}
        class:missing={selected.has(person) && !answered.has(person)}
        style={`--delay:${(person % 12) * 8}ms;--weight:${weights.get(person) ?? 1}`}
      ></i>
    {/each}
  </div>

  <div class="metric" aria-hidden="true">
    <strong>{metrics[step].value}</strong>
    <span>{metrics[step].label}</span>
  </div>

  <div class="stage-line" aria-hidden="true">
    {#each titles as _, index}<i class:active={index <= step}></i>{/each}
  </div>

  <figcaption>{step >= 3 ? "Vikterna tar hjälp av kön, ålder, region, utbildning, födelseland och partival 2022." : "Punkterna visar flödet. De motsvarar inte en person var."}</figcaption>
</figure>

<style>
  figure { position:relative; width:min(100%,760px); height:min(74svh,620px); min-height:510px; margin:0; padding:clamp(25px,4vw,48px); overflow:hidden; color:var(--ink); background:#fff; border:1px solid var(--rule-strong); }
  header p { margin:0 0 7px; color:var(--accent-dark); font-size:10px; font-weight:780; letter-spacing:.04em; text-transform:uppercase; }
  header h3 { max-width:590px; margin:0; font-family:var(--display); font-size:clamp(29px,3.5vw,42px); line-height:1.03; letter-spacing:-.035em; }
  .population { display:grid; grid-template-columns:repeat(12,minmax(0,1fr)); gap:clamp(5px,.7vw,8px); width:min(100%,580px); margin:clamp(34px,5vw,54px) auto 0; }
  .population i { display:block; aspect-ratio:1; border-radius:50%; background:#b9c3d5; box-shadow:inset 1px 1px rgba(255,255,255,.5); transition:opacity .34s ease,background-color .38s ease,transform .46s cubic-bezier(.22,.72,.22,1),border-color .34s ease; transition-delay:var(--delay); }
  .stage-1 .population i, .stage-2 .population i, .stage-3 .population i, .stage-4 .population i { opacity:.12; transform:scale(.72); }
  .stage-1 .population i.selected { opacity:1; transform:scale(1); background:var(--violet); }
  .stage-2 .population i.selected, .stage-3 .population i.selected, .stage-4 .population i.selected { opacity:1; transform:scale(1); }
  .stage-2 .population i.answered { background:var(--teal); }
  .stage-2 .population i.missing, .stage-3 .population i.missing, .stage-4 .population i.missing { background:transparent; border:1.5px solid #9ba7bb; box-shadow:none; opacity:.45; transform:scale(.88); }
  .stage-3 .population i.answered, .stage-4 .population i.answered { background:var(--teal); opacity:1; transform:scale(var(--weight)); }
  .metric { display:grid; justify-items:center; gap:2px; margin:clamp(29px,4vw,43px) auto 0; text-align:center; }
  .metric strong { font-family:var(--display); font-size:clamp(28px,4vw,45px); line-height:1; letter-spacing:-.035em; font-variant-numeric:tabular-nums; }
  .metric span { color:var(--muted); font-size:10px; font-weight:750; letter-spacing:.045em; text-transform:uppercase; }
  .stage-line { display:grid; grid-template-columns:repeat(5,1fr); gap:5px; max-width:320px; margin:24px auto 0; }
  .stage-line i { height:3px; background:var(--rule); }
  .stage-line i.active { background:var(--accent); }
  figcaption { position:absolute; left:clamp(25px,4vw,48px); right:clamp(25px,4vw,48px); bottom:16px; color:var(--muted-light); font-size:9.5px; line-height:1.45; text-align:center; }
  @media (max-width:820px) {
    figure { width:100%; height:100%; min-height:0; padding:18px 16px 12px; border:0; }
    header p { font-size:8px; }
    header h3 { font-size:clamp(23px,6.6vw,29px); }
    .population { gap:4px; width:min(100%,360px); margin-top:23px; }
    .metric { margin-top:20px; }
    .metric strong { font-size:clamp(26px,8vw,35px); }
    .stage-line { margin-top:16px; }
    figcaption { left:16px; right:16px; bottom:7px; font-size:8px; }
  }
  @media (max-height:680px) and (max-width:820px) {
    .population { width:min(100%,310px); margin-top:15px; }
    .metric { margin-top:12px; }
    .stage-line { margin-top:10px; }
  }
  @media (prefers-reduced-motion:reduce) {
    .population i { transition:none; }
  }
</style>
