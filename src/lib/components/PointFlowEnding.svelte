<script>
  let { step = 0 } = $props();

  const COUNT = 240;
  const selectedIndices = Array.from({ length: 60 }, (_, index) => (index * 37 + 11) % COUNT);
  const selected = new Set(selectedIndices);
  const answered = new Set(selectedIndices.slice(0, 29));
  const groups = ["Kön × ålder", "Region", "Utbildning", "Födelseland", "Val 2022"];
  const groupColors = ["#a8ecd2", "#82b7ff", "#d1a8ff", "#f5cb62", "#72d6df"];

  function jitter(index, salt) {
    const value = Math.sin(index * 91.173 + salt * 37.719) * 43758.5453;
    return value - Math.floor(value);
  }

  const points = Array.from({ length: COUNT }, (_, index) => {
    const sampleIndex = selectedIndices.indexOf(index);
    const responseIndex = sampleIndex >= 0 && sampleIndex < 29 ? sampleIndex : -1;
    const populationColumn = index % 24;
    const populationRow = Math.floor(index / 24);
    const sampleColumn = sampleIndex >= 0 ? sampleIndex % 12 : 0;
    const sampleRow = sampleIndex >= 0 ? Math.floor(sampleIndex / 12) : 0;
    const responseColumn = sampleIndex >= 0 ? sampleIndex % 10 : 0;
    const responseRow = sampleIndex >= 0 ? Math.floor(sampleIndex / 10) : 0;
    const weightedColumn = responseIndex >= 0 ? responseIndex % 8 : 0;
    const weightedRow = responseIndex >= 0 ? Math.floor(responseIndex / 8) : 0;
    return {
      index,
      sampleIndex,
      responseIndex,
      answered: answered.has(index),
      selected: selected.has(index),
      group: responseIndex >= 0 ? responseIndex % groups.length : 0,
      weight: responseIndex >= 0 ? .78 + (responseIndex % 5) * .13 : 1,
      positions: [
        [70 + populationColumn * 32.7 + (jitter(index, 1) - .5) * 5, 177 + populationRow * 32 + (jitter(index, 2) - .5) * 5],
        sampleIndex >= 0
          ? [258 + sampleColumn * 34 + (jitter(index, 3) - .5) * 4, 225 + sampleRow * 36 + (jitter(index, 4) - .5) * 4]
          : [70 + populationColumn * 32.7, 177 + populationRow * 32],
        sampleIndex >= 0
          ? [sampleIndex < 29 ? 164 + responseColumn * 28 : 530 + responseColumn * 28, 258 + responseRow * 39]
          : [70 + populationColumn * 32.7, 177 + populationRow * 32],
        responseIndex >= 0
          ? [315 + weightedColumn * 46, 245 + weightedRow * 51]
          : [70 + populationColumn * 32.7, 177 + populationRow * 32],
      ],
    };
  });

  const ariaLabels = [
    "SCB:s målpopulation är de röstberättigade. Punktfältet symboliserar hela väljarkåren.",
    "Ur målpopulationen drog SCB ett riksomfattande slumpmässigt urval på 9 260 personer.",
    "Av 9 260 utvalda svarade 4 542 personer. Bortfallet var 51 procent.",
    "De 4 542 svaren viktades med hjälpinformation och publicerades som skattningar med 95-procentiga osäkerhetsintervall.",
  ];

  function pointClass(point) {
    if (step === 0) return "population";
    if (step === 1) return point.selected ? "sampled" : "context";
    if (step === 2) {
      if (!point.selected) return "context";
      return point.answered ? "answered" : "missing";
    }
    return point.answered ? `weighted group-${point.group}` : "context";
  }
</script>

<figure aria-label={ariaLabels[step]}>
  <div class="kicker">SCB · Partisympatiundersökningen · maj 2026</div>
  <svg viewBox="0 0 900 610" role="img" aria-hidden="true">
    <path class="thread" d="M68 144 C250 91 641 91 832 144" />
    {#each points as point}
      {@const position = point.positions[step]}
      <circle
        class={`point ${pointClass(point)}`}
        cx={position[0]}
        cy={position[1]}
        r={step === 3 && point.answered ? 5.4 * point.weight : 4.7}
        style={`--group:${groupColors[point.group]}`}
      />
    {/each}

    {#if step === 0}
      <g class="label">
        <text x="450" y="84" text-anchor="middle">Målpopulation</text>
        <text class="number broad-number" x="450" y="132" text-anchor="middle">drygt 8 miljoner</text>
        <text class="caption" x="450" y="157" text-anchor="middle">röstberättigade vid undersökningstillfället</text>
      </g>
    {:else if step === 1}
      <g class="label">
        <text x="450" y="112" text-anchor="middle">Riksomfattande sannolikhetsurval</text>
        <text class="number" x="450" y="169" text-anchor="middle">9 260</text>
        <text class="caption" x="450" y="194" text-anchor="middle">personer kunde dras med känd sannolikhet</text>
      </g>
    {:else if step === 2}
      <g class="label">
        <text x="287" y="160" text-anchor="middle">Svarade</text>
        <text class="number" x="287" y="208" text-anchor="middle">4 542</text>
        <text class="caption" x="287" y="232" text-anchor="middle">49,0 procent</text>
        <text x="653" y="160" text-anchor="middle">Bortfall</text>
        <text class="number" x="653" y="208" text-anchor="middle">4 718</text>
        <text class="caption" x="653" y="232" text-anchor="middle">51,0 procent</text>
      </g>
    {:else}
      <g class="label">
        <text x="450" y="104" text-anchor="middle">Svaren får olika statistisk vikt</text>
        <text class="result-number" x="450" y="169" text-anchor="middle">skattning ± osäkerhet</text>
      </g>
      <g class="weight-key">
        {#each groups as group, index}
          <circle cx={170 + index * 140} cy="535" r="5" fill={groupColors[index]} />
          <text x={182 + index * 140} y="539">{group}</text>
        {/each}
      </g>
    {/if}
  </svg>
  <figcaption>
    {#if step === 0}
      En symbolpunkt motsvarar inte ett bestämt antal väljare.
    {:else if step === 1}
      Urvalet drogs slumpmässigt över hela landet, inte från ett enda distrikt.
    {:else if step === 2}
      Bortfallet var större än gruppen som svarade. Det är här representativiteten prövas på nytt.
    {:else}
      SCB använde kön × ålder, region, utbildning, födelseland och partival 2022 som hjälpinformation. Vikter minskar kända skevheter men kan inte ta bort okända fel.
    {/if}
  </figcaption>
</figure>

<style>
  figure { position:relative; width:min(100%,920px); height:min(82svh,700px); min-height:610px; margin:0; overflow:hidden; color:#f8f4ea; background:radial-gradient(circle at 50% 44%,rgba(69,85,171,.29),transparent 45%),#11162d; border:1px solid rgba(255,255,255,.18); }
  .kicker { position:absolute; z-index:2; left:clamp(18px,3vw,36px); top:clamp(17px,3vw,31px); color:#a8ecd2; font-size:10px; font-weight:760; letter-spacing:.055em; text-transform:uppercase; }
  svg { display:block; width:100%; height:100%; }
  .thread { fill:none; stroke:rgba(168,236,210,.3); stroke-width:1.3; stroke-dasharray:2 8; }
  .point { fill:#78829e; opacity:.72; transition:cx .72s cubic-bezier(.22,.72,.22,1),cy .72s cubic-bezier(.22,.72,.22,1),r .55s ease,opacity .38s ease,fill .38s ease,stroke .38s ease; }
  .point.context { opacity:.055; }
  .point.sampled { fill:#a8ecd2; opacity:.96; }
  .point.answered { fill:#f5cb62; opacity:1; }
  .point.missing { fill:transparent; stroke:#8e98b5; stroke-width:1.7; opacity:.82; }
  .point.weighted { fill:var(--group); opacity:1; }
  .label text { fill:#f8f4ea; font:700 17px var(--sans); letter-spacing:.015em; }
  .label .number { font:730 54px/1 var(--display); letter-spacing:-.035em; }
  .label .broad-number { font-size:45px; }
  .label .caption { fill:#b8bed0; font:500 12px var(--sans); }
  .label .result-number { fill:#f5cb62; font:720 38px/1 var(--display); letter-spacing:-.025em; }
  .weight-key text { fill:#b8bed0; font:560 9px var(--sans); }
  figcaption { position:absolute; left:clamp(18px,3vw,36px); right:clamp(18px,3vw,36px); bottom:18px; max-width:720px; margin:0; color:#c4c9d8; font-size:11px; line-height:1.5; }
  @media (max-height:720px) and (min-width:821px) { figure { min-height:560px; } }
  @media (max-width:820px) {
    figure { width:100%; height:100%; min-height:0; border:0; }
    .kicker { top:13px; left:13px; font-size:8px; }
    .label text { font-size:16px; }
    .label .number { font-size:47px; }
    .label .broad-number { font-size:38px; }
    .label .result-number { font-size:31px; }
    .weight-key text { font-size:8px; }
    figcaption { left:13px; right:13px; bottom:9px; font-size:9.5px; line-height:1.35; }
  }
  @media (max-width:360px) {
    .label .number { font-size:43px; }
    .label .broad-number { font-size:34px; }
    .label .result-number { font-size:28px; }
  }
  @media (prefers-reduced-motion:reduce) { .point { transition:none; } }
</style>
