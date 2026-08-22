<script>
  let { step = 0 } = $props();

  const AGE = [
    { key: "18–29", share: 18 },
    { key: "30–49", share: 32 },
    { key: "50–64", share: 25 },
    { key: "65+", share: 25 },
  ];
  const PLACE = [
    { key: "Storstad", share: 40 },
    { key: "Övrig stad", share: 35 },
    { key: "Landsbygd", share: 25 },
  ];
  const CELL_COUNTS = [
    [36, 32, 22],
    [64, 56, 40],
    [50, 44, 31],
    [50, 43, 32],
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

  function shuffledLabels(size, labels, seed) {
    const values = labels.flatMap(({ value, count }) => Array(count).fill(value));
    const rng = random(seed);
    for (let index = size - 1; index > 0; index -= 1) {
      const swap = Math.floor(rng() * (index + 1));
      [values[index], values[swap]] = [values[swap], values[index]];
    }
    return values;
  }

  const N = 10_000;
  const SAMPLE_N = 1_000;
  const gender = shuffledLabels(N, [{ value: "Kvinnor", count: 5100 }, { value: "Män", count: 4900 }], 71);
  const age = shuffledLabels(N, [
    { value: "18–29", count: 1800 },
    { value: "30–49", count: 3200 },
    { value: "50–64", count: 2500 },
    { value: "65+", count: 2500 },
  ], 82);
  const place = shuffledLabels(N, [
    { value: "Storstad", count: 4000 },
    { value: "Övrig stad", count: 3500 },
    { value: "Landsbygd", count: 2500 },
  ], 93);
  const education = shuffledLabels(N, [{ value: "Lång", count: 3600 }, { value: "Övrig", count: 6400 }], 104);
  const support = shuffledLabels(N, [{ value: true, count: 3000 }, { value: false, count: 7000 }], 115);
  const population = Array.from({ length: N }, (_, index) => ({
    index,
    gender: gender[index],
    age: age[index],
    place: place[index],
    education: education[index],
    support: support[index],
  }));

  function samplePopulation(seed, count = SAMPLE_N) {
    const rng = random(seed);
    const indices = Array.from({ length: N }, (_, index) => index);
    for (let index = 0; index < count; index += 1) {
      const swap = index + Math.floor(rng() * (N - index));
      [indices[index], indices[swap]] = [indices[swap], indices[index]];
    }
    return indices.slice(0, count).map((index) => population[index]);
  }

  const sample = samplePopulation(20260913);
  const share = (list, predicate) => list.filter(predicate).length / list.length * 100;
  const profiles = [
    { label: "Kvinnor", population: 51, sample: share(sample, (person) => person.gender === "Kvinnor") },
    { label: "18–29 år", population: 18, sample: share(sample, (person) => person.age === "18–29") },
    { label: "Landsbygd", population: 25, sample: share(sample, (person) => person.place === "Landsbygd") },
    { label: "Lång utbildning", population: 36, sample: share(sample, (person) => person.education === "Lång") },
  ];
  const draws = Array.from({ length: 20 }, (_, index) => share(samplePopulation(4103 + index * 1297), (person) => person.support));
  const margin = 1.96 * Math.sqrt(.3 * .7 / SAMPLE_N) * Math.sqrt((N - SAMPLE_N) / (N - 1)) * 100;
  const plotX = (value) => `${(value - 24) / 12 * 100}%`;
  const format = (value) => value.toLocaleString("sv-SE", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

  const fieldPoints = [];
  let pointIndex = 0;
  for (let ageIndex = 0; ageIndex < CELL_COUNTS.length; ageIndex += 1) {
    for (let placeIndex = 0; placeIndex < CELL_COUNTS[ageIndex].length; placeIndex += 1) {
      const count = CELL_COUNTS[ageIndex][placeIndex];
      const columns = Math.ceil(Math.sqrt(count * 1.65));
      const rows = Math.ceil(count / columns);
      for (let local = 0; local < count; local += 1) {
        fieldPoints.push({
          index: pointIndex,
          x: 92 + placeIndex * 225 + (local % columns) * (190 / Math.max(1, columns - 1)),
          y: 104 + ageIndex * 78 + Math.floor(local / columns) * (49 / Math.max(1, rows - 1)),
        });
        pointIndex += 1;
      }
    }
  }
  const pointOrder = Array.from({ length: fieldPoints.length }, (_, index) => index);
  const pointRng = random(9173);
  for (let index = pointOrder.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(pointRng() * (index + 1));
    [pointOrder[index], pointOrder[swap]] = [pointOrder[swap], pointOrder[index]];
  }
  const sampledPoints = new Set(pointOrder.slice(0, 50));

  const responseProfiles = [
    { label: "Kvinnor", target: 51, answer: 56, weighted: 51 },
    { label: "18–29 år", target: 18, answer: 13, weighted: 18 },
    { label: "Landsbygd", target: 25, answer: 19, weighted: 25 },
    { label: "Lång utbildning", target: 36, answer: 43, weighted: 36 },
  ];
</script>

<figure aria-label="Fiktivt exempel på hur ett sannolikhetsurval dras, hur dess sammansättning jämförs med populationen, hur skattningen varierar och hur bortfall kan ge nya skevheter">
  <div class="layer population" class:active={step <= 1} aria-hidden={step > 1}>
    <header>
      <p>Fiktiv population · 10 000 personer</p>
      <h3>{step === 0 ? "Urvalsramen behöver omfatta hela populationen" : "1 000 personer dras slumpmässigt"}</h3>
    </header>
    <svg viewBox="0 0 790 430" role="img" aria-label={step === 0 ? "Förenklad punktmatris över en population uppdelad efter ålder och boendeort" : "Samma matris där ett slumpmässigt urval är markerat i alla åldrar och typer av boendeort"}>
      {#each PLACE as item, index}
        <text class="column-label" x={187 + index * 225} y="77" text-anchor="middle">{item.key}</text>
      {/each}
      {#each AGE as item, index}
        <text class="row-label" x="73" y={132 + index * 78} text-anchor="end">{item.key}</text>
      {/each}
      {#each Array(3) as _, column}
        {#each Array(4) as _, row}
          <rect class="cell" x={82 + column * 225} y={92 + row * 78} width="210" height="65" rx="2" />
        {/each}
      {/each}
      {#each fieldPoints as point}
        <circle
          class="person"
          class:sampled={sampledPoints.has(point.index)}
          class:sample-active={step === 1}
          cx={point.x}
          cy={point.y}
          r="3.15"
        />
      {/each}
    </svg>
    <div class="field-reading">
      <span><i class="population-mark"></i>Population</span>
      {#if step === 1}<span class="selected-key"><i></i>Urval: 1 000 av 10 000</span>{/if}
      <small>Punktfältet förenklar proportionerna. Beräkningarna görs på 10 000 individer.</small>
    </div>
  </div>

  <div class="layer composition" class:active={step === 2} aria-hidden={step !== 2}>
    <header>
      <p>Ett slumpurval · n = 1 000</p>
      <h3>Urvalet ligger nära populationens sammansättning</h3>
    </header>
    <div class="profile-key" aria-hidden="true"><span><i></i>Population</span><span><b></b>Urval</span></div>
    <div class="profile-chart">
      {#each profiles as profile}
        <div class="profile-row">
          <strong>{profile.label}</strong>
          <div class="profile-track">
            <i class="population-line" style={`width:${profile.population}%`}></i>
            <i class="sample-line" style={`width:${profile.sample}%`}></i>
          </div>
          <div class="profile-values"><span>{format(profile.population)}%</span><b>{format(profile.sample)}%</b></div>
        </div>
      {/each}
    </div>
    <p class="reading">Det här enskilda urvalet träffar nära på fyra kända egenskaper. Ett annat slumpurval hade fått andra avvikelser.</p>
    <p class="note">Fördelningarna är konstruerade för att visa principen. De är inte skattningar av Sveriges väljarkår.</p>
  </div>

  <div class="layer variation" class:active={step === 3} aria-hidden={step !== 3}>
    <header>
      <p>20 oberoende slumpurval · n = 1 000</p>
      <h3>Samma metod ger inte exakt samma skattning</h3>
    </header>
    <div class="variation-chart" role="img" aria-label={`Tjugo slumpurval skattar ett fiktivt partistöd på 30 procent. Resultaten ligger nära men inte exakt på populationens värde.`}>
      <div class="confidence" style={`--left:${plotX(30 - margin)};--right:${plotX(30 + margin)}`}></div>
      <i class="truth" style={`--x:${plotX(30)}`}><span>Population<br><strong>30,0%</strong></span></i>
      {#each [24, 26, 28, 30, 32, 34, 36] as tick}
        <i class="tick" style={`--x:${plotX(tick)}`}><span>{tick}%</span></i>
      {/each}
      {#each draws as value, index}
        <b class="estimate" style={`--x:${plotX(value)};--row:${index % 5}`} title={`Urval ${index + 1}: ${format(value)} procent`}></b>
      {/each}
    </div>
    <div class="variation-reading">
      <div><span>Population</span><strong>30,0%</strong></div>
      <div><span>Teoretisk 95-procentsmarginal</span><strong>±{format(margin)} p</strong></div>
    </div>
    <p class="note">Marginalen visar enbart slumpvariation i det fiktiva exemplet. Den tar inte hänsyn till bortfall, mätfel eller frågeformulering.</p>
  </div>

  <div class="layer response" class:active={step === 4} aria-hidden={step !== 4}>
    <header>
      <p>Efter urvalet</p>
      <h3>De utvalda är inte samma sak som de som svarar</h3>
    </header>
    <div class="pipeline" aria-label="Urval, svar och viktning">
      <div><span>Slumpmässigt valda</span><strong>1 000</strong></div><i>→<small>bortfall</small></i>
      <div><span>Svarande</span><strong>642</strong></div><i>→<small>viktning</small></i>
      <div><span>Justerat resultat</span><strong>kända skillnader</strong></div>
    </div>
    <div class="response-chart">
      <div class="response-head"><span></span><b>Svar</b><b>Efter viktning</b></div>
      {#each responseProfiles as profile}
        <div class="response-row">
          <strong>{profile.label}</strong>
          <span class:below={profile.answer < profile.target} class:above={profile.answer > profile.target}>{format(profile.answer)}%</span>
          <span class="weighted">{format(profile.weighted)}%</span>
        </div>
      {/each}
    </div>
    <p class="reading">Viktning kan föra kända fördelningar tillbaka mot populationen. Den kan inte säkert rätta politiska skillnader som inte har mätts.</p>
    <p class="note">Bortfallet och de viktade värdena är illustrativa. Ett riktigt institut redovisar sin rekrytering, svarsfrekvens och viktning.</p>
  </div>
</figure>

<style>
  figure { position:relative; width:min(100%,900px); height:min(82svh,700px); min-height:620px; margin:0; overflow:hidden; color:var(--ink); background:var(--surface); border:1px solid var(--rule-strong); }
  .layer { position:absolute; inset:0; padding:clamp(25px,3.5vw,42px); opacity:0; pointer-events:none; transform:translateY(8px); transition:none; }
  .layer.active { opacity:1; pointer-events:auto; transform:none; transition:opacity .22s ease,transform .3s ease; }
  header p { margin:0 0 7px; color:var(--accent-dark); font-size:12px; font-weight:700; }
  header h3 { max-width:760px; margin:0; font-family:var(--display); font-size:clamp(31px,3.5vw,40px); font-weight:760; line-height:1.01; letter-spacing:-.035em; }
  svg { display:block; width:100%; height:auto; margin-top:12px; }
  .cell { fill:#f4f8f9; stroke:var(--rule); stroke-width:1; }
  .column-label,.row-label { fill:var(--muted); font:650 11px var(--sans); }
  .person { fill:#96aab1; opacity:.58; transition:fill .42s ease,opacity .42s ease,r .42s ease,stroke .42s ease; }
  .person.sampled.sample-active { fill:var(--accent-dark); opacity:1; r:4.5px; stroke:var(--surface); stroke-width:1.7px; }
  .population:has(.sample-active) .person:not(.sampled) { opacity:.18; }
  .field-reading { display:flex; align-items:center; gap:18px; padding-top:9px; border-top:1px solid var(--rule); color:var(--muted); font-size:10px; }
  .field-reading > span { display:flex; align-items:center; gap:6px; white-space:nowrap; }
  .field-reading i { display:inline-block; width:9px; height:9px; border-radius:50%; background:#96aab1; }
  .field-reading .selected-key i { background:var(--accent-dark); box-shadow:0 0 0 2px var(--surface),0 0 0 3px var(--accent-dark); }
  .field-reading small { margin-left:auto; max-width:310px; line-height:1.35; text-align:right; }
  .profile-key { display:flex; gap:19px; margin-top:24px; color:var(--muted); font-size:11px; }
  .profile-key span { display:flex; align-items:center; gap:6px; }
  .profile-key i,.profile-key b { width:20px; height:4px; }
  .profile-key i { background:#a7b6bc; }
  .profile-key b { background:var(--accent-dark); }
  .profile-chart { margin-top:16px; border-top:1px solid var(--rule-strong); }
  .profile-row { display:grid; grid-template-columns:150px minmax(0,1fr) 112px; gap:18px; align-items:center; min-height:70px; border-bottom:1px solid var(--rule); }
  .profile-row > strong { font-family:var(--display); font-size:19px; font-weight:720; }
  .profile-track { display:grid; align-content:center; gap:6px; height:34px; background-image:linear-gradient(90deg,var(--rule) 1px,transparent 1px); background-size:20% 100%; border-inline:1px solid var(--rule); }
  .profile-track i { display:block; height:4px; transform-origin:left; animation:line-in .58s both cubic-bezier(.22,.72,.22,1); }
  .population-line { background:#a7b6bc; }
  .sample-line { background:var(--accent-dark); }
  .profile-values { display:grid; grid-template-columns:1fr 1fr; gap:8px; text-align:right; font-size:12px; font-variant-numeric:tabular-nums; }
  .profile-values span { color:var(--muted); }
  .profile-values b { color:var(--accent-dark); }
  .reading { max-width:690px; margin:24px 0 0; color:var(--muted); font-size:15px; line-height:1.55; }
  .note { position:absolute; left:clamp(25px,3.5vw,42px); right:clamp(25px,3.5vw,42px); bottom:16px; margin:0; color:var(--muted-light); font-size:10px; line-height:1.45; }
  .variation-chart { position:relative; height:250px; margin:62px 15px 0; border-bottom:1px solid var(--ink); }
  .confidence { position:absolute; left:var(--left); right:calc(100% - var(--right)); bottom:0; height:100%; background:rgba(57,121,133,.09); border-inline:1px solid rgba(57,121,133,.22); }
  .truth { position:absolute; left:var(--x); bottom:0; width:2px; height:100%; transform:translateX(-50%); background:var(--accent); }
  .truth span { position:absolute; top:-37px; left:50%; transform:translateX(-50%); color:var(--accent-dark); font:10px/1.25 var(--sans); text-align:center; white-space:nowrap; }
  .truth strong { font-size:13px; }
  .tick { position:absolute; left:var(--x); bottom:-5px; width:1px; height:10px; background:var(--ink); }
  .tick span { position:absolute; top:14px; left:50%; transform:translateX(-50%); color:var(--muted); font-size:10px; }
  .estimate { position:absolute; left:var(--x); bottom:calc(22px + var(--row) * 36px); width:13px; height:13px; border-radius:50%; transform:translateX(-50%); background:var(--accent-dark); box-shadow:0 0 0 3px var(--surface),0 0 0 4px rgba(40,89,99,.17); animation:point-in .34s both cubic-bezier(.22,.72,.22,1); }
  .estimate:nth-of-type(3n) { animation-delay:.05s; }
  .estimate:nth-of-type(3n + 1) { animation-delay:.1s; }
  .variation-reading { display:flex; gap:45px; margin:36px 15px 0; }
  .variation-reading div { padding-left:12px; border-left:3px solid var(--accent); }
  .variation-reading span { display:block; color:var(--muted); font-size:10px; }
  .variation-reading strong { display:block; margin-top:3px; font-family:var(--display); font-size:24px; font-weight:600; font-variant-numeric:tabular-nums; }
  .pipeline { display:grid; grid-template-columns:minmax(0,1fr) auto minmax(0,1fr) auto minmax(0,1fr); align-items:center; gap:17px; margin-top:34px; }
  .pipeline > div { min-height:92px; padding:15px 16px; border-top:4px solid var(--accent); background:var(--paper-alt); }
  .pipeline span { display:block; color:var(--muted); font-size:10px; font-weight:700; }
  .pipeline strong { display:block; margin-top:8px; font-family:var(--display); font-size:29px; font-weight:600; line-height:1; }
  .pipeline div:last-child strong { font-family:var(--sans); font-size:14px; line-height:1.25; }
  .pipeline > i { display:grid; color:var(--accent-dark); font-size:22px; font-style:normal; text-align:center; }
  .pipeline > i small { color:var(--muted); font-size:8px; font-weight:500; }
  .response-chart { margin-top:24px; border-top:1px solid var(--rule-strong); }
  .response-head,.response-row { display:grid; grid-template-columns:minmax(130px,1fr) 105px 125px; gap:15px; align-items:center; min-height:45px; border-bottom:1px solid var(--rule); }
  .response-head { min-height:29px; color:var(--muted); font-size:9px; }
  .response-head b { font-weight:700; text-align:right; }
  .response-row strong { font-size:12px; }
  .response-row span { justify-self:end; min-width:66px; padding:3px 6px; color:var(--ink); background:var(--paper-alt); font-size:12px; font-weight:700; text-align:right; font-variant-numeric:tabular-nums; }
  .response-row span.above,.response-row span.below { color:#4d4176; background:#eeebfa; }
  .response-row span.weighted { color:var(--accent-dark); background:var(--accent-soft); }
  @keyframes line-in { from { transform:scaleX(0); } }
  @keyframes point-in { from { opacity:0; transform:translate(-50%,8px); } }
  @media (max-height:720px) and (min-width:821px) {
    header h3 { font-size:34px; }
    svg { width:92%; margin-inline:auto; }
    .profile-row { min-height:60px; }
    .variation-chart { height:205px; margin-top:48px; }
  }
  @media (max-width:820px) {
    figure { width:100%; height:100%; min-height:0; border:0; }
    .layer { padding:14px 12px; }
    header p { margin-bottom:4px; font-size:9px; }
    header h3 { font-size:clamp(23px,6.5vw,28px); line-height:1.03; }
    svg { margin-top:3px; }
    .column-label,.row-label { font-size:14px; }
    .field-reading { gap:10px; padding-top:5px; font-size:9.5px; }
    .field-reading small { display:none; }
    .profile-key { margin-top:12px; font-size:10px; }
    .profile-chart { margin-top:8px; }
    .profile-row { grid-template-columns:76px minmax(0,1fr) 66px; gap:7px; min-height:48px; }
    .profile-row > strong { font-family:var(--sans); font-size:10px; font-weight:700; }
    .profile-track { gap:4px; height:27px; }
    .profile-values { gap:3px; font-size:9.5px; }
    .reading { margin-top:13px; font-size:11px; line-height:1.4; }
    .note { left:12px; right:12px; bottom:7px; font-size:9px; line-height:1.3; }
    .variation-chart { height:205px; margin:47px 5px 0; }
    .estimate { width:10px; height:10px; bottom:calc(18px + var(--row) * 29px); }
    .tick span { font-size:9px; }
    .truth span { top:-34px; font-size:9px; }
    .variation-reading { gap:18px; margin:28px 5px 0; }
    .variation-reading div { padding-left:7px; border-left-width:2px; }
    .variation-reading span { font-size:9px; line-height:1.2; }
    .variation-reading strong { font-size:17px; }
    .pipeline { gap:5px; margin-top:18px; }
    .pipeline > div { min-height:68px; padding:9px 7px; border-top-width:3px; }
    .pipeline span { font-size:9px; line-height:1.2; }
    .pipeline strong { margin-top:5px; font-size:19px; }
    .pipeline div:last-child strong { font-size:10px; }
    .pipeline > i { font-size:12px; }
    .pipeline > i small { display:none; }
    .response-chart { margin-top:12px; }
    .response-head,.response-row { grid-template-columns:minmax(84px,1fr) 52px 64px; gap:5px; min-height:31px; }
    .response-head { min-height:22px; font-size:9px; }
    .response-row strong { font-size:9.5px; }
    .response-row span { min-width:0; padding:2px 3px; font-size:9.5px; }
    .response .reading { margin-top:9px; }
    .composition .reading,.response .reading { display:none; }
    .variation .note { display:none; }
  }
  @media (max-width:520px) {
    .column-label,.row-label { font-size:24px; }
  }
  @media (prefers-reduced-motion:reduce) {
    .layer,.person,.profile-track i,.estimate { transition:none; animation:none; }
  }
</style>
