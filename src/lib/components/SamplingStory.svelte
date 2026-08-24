<script>
  let { step = 0 } = $props();

  const groups = [
    { name: "Turkos", color: "#2f817d" },
    { name: "Gul", color: "#e0ad35" },
    { name: "Lila", color: "#7663a8" },
    { name: "Korall", color: "#d96f5d" },
    { name: "Grön", color: "#7c9854" },
  ];
  const titles = [
    "Hela blandningen",
    "En handfull från samma hörn",
    "Urval från hela påsen",
    "När svaren försvinner",
    "Vikter för det som saknas",
  ];

  function random(seed) {
    let value = seed >>> 0;
    return () => {
      value += 0x6d2b79f5;
      let result = value;
      result = Math.imul(result ^ (result >>> 15), result | 1);
      result ^= result + Math.imul(result ^ (result >>> 7), result | 61);
      return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
    };
  }

  const rng = random(20260913);
  const colors = groups.flatMap((_, color) => Array(40).fill(color));
  for (let index = colors.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(rng() * (index + 1));
    [colors[index], colors[swap]] = [colors[swap], colors[index]];
  }

  const tokens = Array.from({ length: 200 }, (_, index) => {
    const column = index % 20;
    const row = Math.floor(index / 20);
    return {
      index,
      column,
      row,
      x: 73 + column * 32.4 + (rng() - .5) * 7,
      y: 115 + row * 27.4 + (rng() - .5) * 7,
      r: 8.2 + rng() * 1.8,
      color: colors[index],
      corner: column < 5 && row > 4,
    };
  });

  const sampleOrder = [...tokens].sort((left, right) => ((left.index * 73 + 19) % 211) - ((right.index * 73 + 19) % 211));
  const selected = new Set(sampleOrder.slice(0, 40).map((token) => token.index));
  const ranks = new Map();
  for (const group of groups.keys()) {
    sampleOrder.filter((token) => selected.has(token.index) && token.color === group)
      .forEach((token, rank) => ranks.set(token.index, rank));
  }
  const missing = new Set(tokens.filter((token) => {
    if (!selected.has(token.index)) return false;
    const rank = ranks.get(token.index) ?? 0;
    return token.color === 2 ? rank < 3 : rank < 1;
  }).map((token) => token.index));

  function tokenClass(token) {
    if (step === 0) return "population";
    if (step === 1) return token.corner ? "corner" : "dim";
    if (step === 2) return selected.has(token.index) ? "selected" : "dim";
    if (!selected.has(token.index)) return "dim";
    if (missing.has(token.index)) return "missing";
    return step === 4 && token.color === 2 ? "answer weighted" : "answer";
  }

  const ariaLabels = [
    "En godisskål med fem färger som symboliserar olika grupper i en population.",
    "Godis från ett enda hörn markeras. Färgblandningen där skiljer sig från hela skålen.",
    "Godisbitar från alla delar av skålen markeras som ett sannolikhetsurval.",
    "Flera markerade godisbitar saknas. Ovanligt många av de saknade är lila och symboliserar skevt bortfall.",
    "De få lila godisbitar som finns kvar visas större för att symbolisera statistisk viktning.",
  ];
</script>

<figure aria-label={ariaLabels[step]}>
  <header>
    <p>Godispåsen som opinionsmätning</p>
    <h3>{titles[step]}</h3>
  </header>

  <svg viewBox="0 0 760 430" role="img" aria-hidden="true">
    <rect class="tray" x="40" y="72" width="680" height="330" rx="30" />
    {#each tokens as token}
      <g class={`sweet ${tokenClass(token)}`} style={`--sweet:${groups[token.color].color}`}>
        <circle cx={token.x} cy={token.y} r={token.r} />
        <circle class="shine" cx={token.x - token.r * .28} cy={token.y - token.r * .3} r={token.r * .19} />
        {#if step >= 3 && missing.has(token.index) && selected.has(token.index)}
          <path class="gone" d={`M${token.x - 4} ${token.y - 4} L${token.x + 4} ${token.y + 4} M${token.x + 4} ${token.y - 4} L${token.x - 4} ${token.y + 4}`} />
        {/if}
      </g>
    {/each}

    {#if step === 1}
      <ellipse class="scoop" cx="135" cy="280" rx="100" ry="118" />
      <text class="scoop-label" x="221" y="386">en bekväm handfull</text>
    {/if}

    {#if step === 3}
      <g class="callout">
        <path d="M451 79 C510 47 580 50 631 75" />
        <text x="637" y="78">lila svarar mer sällan</text>
      </g>
    {/if}
  </svg>

  <div class="key" aria-hidden="true">
    {#each groups as group}<span><i style={`--sweet:${group.color}`}></i>{group.name}</span>{/each}
  </div>

  {#if step === 4}
    <div class="weight-note"><i></i><span>Större punkt = ett svar får representera fler</span></div>
  {/if}
  <figcaption>Godiset är en analogi. Färgerna markerar fem konstruerade grupper.</figcaption>
</figure>

<style>
  figure { position:relative; width:min(100%,900px); height:min(74svh,620px); min-height:560px; margin:0; overflow:hidden; color:var(--ink); background:#fffdf8; border:1px solid var(--rule-strong); }
  header { position:absolute; z-index:3; left:clamp(22px,3.5vw,40px); top:clamp(20px,3vw,34px); }
  header p { margin:0 0 6px; color:var(--accent-dark); font-size:11px; font-weight:750; }
  header h3 { max-width:680px; margin:0; font-family:var(--display); font-size:clamp(30px,3.5vw,40px); font-weight:720; line-height:1.02; letter-spacing:-.035em; }
  svg { display:block; width:100%; height:auto; padding:54px 20px 0; }
  .tray { fill:#f4efe4; stroke:#d6cfc1; stroke-width:1.4; }
  .sweet { transform-box:fill-box; transform-origin:center; transition:opacity .35s ease,transform .5s cubic-bezier(.22,.72,.22,1); }
  .sweet circle:first-child { fill:var(--sweet); stroke:rgba(255,255,255,.9); stroke-width:1.4; transition:fill .3s ease,stroke .3s ease,r .45s ease; }
  .sweet .shine { fill:rgba(255,255,255,.56); stroke:0; }
  .sweet.dim { opacity:.1; transform:scale(.78); }
  .sweet.corner,.sweet.selected,.sweet.answer { opacity:1; transform:scale(1.12); }
  .sweet.selected circle:first-child { stroke:var(--ink); stroke-width:2.1; }
  .sweet.missing { opacity:.75; transform:scale(.98); }
  .sweet.missing circle:first-child { fill:transparent; stroke:var(--sweet); stroke-width:1.7; stroke-dasharray:3 2; }
  .sweet.missing .shine { opacity:0; }
  .sweet.weighted { transform:scale(1.75); }
  .gone { fill:none; stroke:var(--sweet); stroke-width:1.4; stroke-linecap:round; }
  .scoop { fill:rgba(255,255,255,.08); stroke:var(--ink); stroke-width:2; stroke-dasharray:7 5; }
  .scoop-label { fill:var(--ink); font:700 11px var(--sans); }
  .callout path { fill:none; stroke:#7663a8; stroke-width:1.5; }
  .callout text { fill:#66548f; font:700 10px var(--sans); text-anchor:end; }
  .key { display:flex; flex-wrap:wrap; gap:7px 15px; margin:0 clamp(22px,3.5vw,40px); padding-top:11px; border-top:1px solid var(--rule); color:var(--muted); font-size:10px; }
  .key span { display:flex; align-items:center; gap:5px; }
  .key i { width:9px; height:9px; border-radius:50%; background:var(--sweet); }
  .weight-note { display:flex; align-items:center; gap:8px; margin:13px clamp(22px,3.5vw,40px) 0; color:var(--muted); font-size:10px; }
  .weight-note i { width:17px; height:17px; border-radius:50%; background:#7663a8; box-shadow:inset 3px 3px rgba(255,255,255,.3); }
  figcaption { position:absolute; left:clamp(22px,3.5vw,40px); right:clamp(22px,3.5vw,40px); bottom:13px; color:var(--muted-light); font-size:9.5px; line-height:1.4; }
  @media (max-height:720px) and (min-width:821px) {
    figure { min-height:530px; }
    svg { width:88%; margin-inline:auto; padding-top:43px; }
  }
  @media (max-width:820px) {
    figure { width:100%; height:100%; min-height:0; border:0; }
    header { left:13px; top:12px; }
    header p { font-size:9px; }
    header h3 { font-size:clamp(24px,7vw,29px); }
    svg { width:100%; padding:57px 5px 0; }
    .key { margin-inline:13px; gap:5px 10px; font-size:8.5px; }
    .weight-note { margin:8px 13px 0; font-size:8.5px; }
    figcaption { left:13px; right:13px; bottom:7px; font-size:8.5px; }
  }
  @media (prefers-reduced-motion:reduce) { .sweet { transition:none; } }
</style>
