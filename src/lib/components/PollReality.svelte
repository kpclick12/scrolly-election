<script>
  import { pollHistory } from "../../data/story.js";

  const min = 4;
  const max = 9;
  const width = 760;
  const height = 300;
  const left = 112;
  const right = 44;
  const x = (value) => left + (value - min) / (max - min) * (width - left - right);
  const y = (index) => 62 + index * 58;
  const format = (value) => value.toLocaleString("sv-SE", { minimumFractionDigits: 1, maximumFractionDigits: 2 });
</script>

<figure>
  <div class="legend" aria-hidden="true">
    <span><i class="poll-dot"></i>Mätning</span>
    <span><i class="result-dot"></i>Valresultat</span>
  </div>
  <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-labelledby="poll-title poll-desc">
    <title id="poll-title">Liberalernas mätning nära valdagen jämfört med valresultatet</title>
    <desc id="poll-desc">2010 ökade Liberalerna 0,31 procentenheter från mätningen till valet. 2014, 2018 och 2022 blev valresultatet lägre än mätningen.</desc>
    <line class="threshold" x1={x(4)} x2={x(4)} y1="28" y2={height - 28} />
    <text class="threshold-label" x={x(4) + 7} y="24">4%</text>
    {#each [5, 6, 7, 8, 9] as tick}
      <line class="grid" x1={x(tick)} x2={x(tick)} y1="34" y2={height - 28} />
      <text class="tick" x={x(tick)} y={height - 8} text-anchor="middle">{tick}%</text>
    {/each}

    {#each pollHistory as row, index}
      <text class="year" x="4" y={y(index) + 5}>{row.year}</text>
      <text class="days" x="4" y={y(index) + 20}>{row.days} dagar före</text>
      <line class="connector" x1={x(row.poll)} x2={x(row.result)} y1={y(index)} y2={y(index)} />
      <circle class="poll-point" cx={x(row.poll)} cy={y(index)} r="6" />
      <circle class="result-point" cx={x(row.result)} cy={y(index)} r="6" />
      <text class="value poll-value" x={x(row.poll)} y={y(index) - 12} text-anchor="middle">{format(row.poll)}</text>
      <text class="value result-value" x={x(row.result)} y={y(index) + 22} text-anchor="middle">{format(row.result)}</text>
    {/each}
  </svg>
  <figcaption>Fyra val räcker inte för en sannolikhetsmodell. Serien visar hur stödet har rört sig under de sista dagarna.</figcaption>
</figure>

<style>
  figure { margin:0; padding:clamp(20px,3vw,30px); background:var(--surface); border:1px solid var(--rule-strong); }
  .legend { display:flex; justify-content:flex-end; gap:20px; color:var(--muted); font-size:12px; }
  .legend span { display:flex; align-items:center; gap:6px; }
  .legend i { width:9px; height:9px; border-radius:50%; }
  .poll-dot { background:var(--point-dim); border:1px solid var(--muted); }
  .result-dot { background:var(--accent); }
  svg { display:block; width:100%; height:auto; }
  .grid { stroke:var(--rule); stroke-width:1; }
  .threshold { stroke:var(--ink); stroke-width:1.4; }
  .threshold-label { fill:var(--ink); font:700 12px var(--sans); }
  .tick { fill:var(--muted); font:12px var(--sans); }
  .year { fill:var(--ink); font:750 18px var(--sans); }
  .days { fill:var(--muted); font:11px var(--sans); }
  .connector { stroke:var(--rule-strong); stroke-width:2; }
  .poll-point { fill:var(--paper); stroke:var(--muted); stroke-width:1.5; }
  .result-point { fill:var(--accent); stroke:white; stroke-width:1.5; }
  .value { fill:var(--muted); font:700 12px var(--sans); font-variant-numeric:tabular-nums; }
  .result-value { fill:var(--accent-dark); }
  figcaption { max-width:760px; margin:14px 0 0; color:var(--muted); font-size:13px; line-height:1.5; }

  @media (max-width:620px) {
    figure { padding:15px 12px; }
    .legend { justify-content:flex-start; font-size:10px; }
    .threshold-label { font-size:10px; }
    .tick { font-size:10px; }
    .year { font-size:15px; }
    .days { font-size:9px; }
    .value { font-size:10px; }
    figcaption { font-size:10px; }
  }
</style>
