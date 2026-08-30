<script>
  import { liberalHistory } from "../../data/story.js";

  let { active = false } = $props();

  const width = 820;
  const height = 310;
  const margin = { top: 20, right: 36, bottom: 35, left: 42 };
  const x = (year) => margin.left + (year - 1948) / (2026 - 1948) * (width - margin.left - margin.right);
  const y = (value) => margin.top + (26 - value) / 26 * (height - margin.top - margin.bottom);
  const path = liberalHistory.map((point, index) => `${index ? "L" : "M"} ${x(point.year).toFixed(1)} ${y(point.value).toFixed(1)}`).join(" ");
  const labels = liberalHistory.filter((point) => [1948, 2002, 2022, 2026].includes(point.year));
</script>

<figure class:active>
  <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-labelledby="history-title history-desc">
    <title id="history-title">Liberalernas stöd i riksdagsval sedan 1948</title>
    <desc id="history-desc">Folkpartiet fick 22,8 procent 1948. Liberalerna fick 4,6 procent 2022 och ligger på 2,0 procent i Demoskops mätning publicerad den 27 augusti 2026.</desc>

    <line class="threshold" x1={margin.left} x2={width - margin.right} y1={y(4)} y2={y(4)} />
    <text class="threshold-label" x={margin.left} y={y(4) - 8}>4-procentsspärren</text>

    <path class="history-line" d={path} pathLength="1" />

    {#each liberalHistory as point}
      <circle
        class:poll={point.poll}
        class="history-point"
        style={`--point-delay:${(.18 + (point.year - 1948) / (2026 - 1948) * 1.25).toFixed(2)}s`}
        cx={x(point.year)}
        cy={y(point.value)}
        r={point.poll ? 7 : 3.5}
      />
    {/each}

    {#each labels as point}
      <g class:current={point.poll} class="label" style={`--label-delay:${(.24 + (point.year - 1948) / (2026 - 1948) * 1.25).toFixed(2)}s`}>
        <text x={x(point.year)} y={y(point.value) - 15} text-anchor={point.year === 1948 ? "start" : point.year === 2026 ? "end" : "middle"}>{point.value.toLocaleString("sv-SE", { minimumFractionDigits: 1 })}%</text>
        <text class="year" x={x(point.year)} y={y(point.value) + 22} text-anchor={point.year === 1948 ? "start" : point.year === 2026 ? "end" : "middle"}>{point.year}{point.poll ? " · mätning" : ""}</text>
      </g>
    {/each}
  </svg>
  <figcaption>Folkpartiet till 2015, därefter Liberalerna. Riksdagsval 1948–2022 och Demoskop den 27 augusti 2026.</figcaption>
</figure>

<style>
  figure { margin:0; min-width:0; }
  svg { display:block; width:100%; height:auto; overflow:visible; }
  .threshold { stroke:var(--rule-strong); stroke-width:1.25; stroke-dasharray:5 5; }
  .threshold-label { fill:var(--muted); font:650 13px var(--sans); letter-spacing:.02em; paint-order:stroke; stroke:var(--surface); stroke-width:4px; }
  .history-line { fill:none; stroke:var(--accent); stroke-width:5; stroke-linecap:round; stroke-linejoin:round; }
  .history-point { fill:var(--paper); stroke:var(--accent); stroke-width:2; }
  .history-point.poll { fill:var(--accent); stroke:white; stroke-width:2.5; }
  .label text { fill:var(--ink); font:720 18px var(--sans); font-variant-numeric:tabular-nums; paint-order:stroke; stroke:var(--surface); stroke-width:4px; stroke-linejoin:round; }
  .label .year { fill:var(--muted); font-size:12px; font-weight:600; }
  .label.current text { fill:var(--accent-dark); }
  figcaption { margin-top:8px; color:var(--muted); font-size:11px; line-height:1.45; }

  @media (max-width:620px) {
    .threshold-label { font-size:13px; }
    .label text { font-size:20px; }
    .label .year { font-size:13px; }
    figcaption { font-size:10px; }
  }

  @media (prefers-reduced-motion:no-preference) {
    .threshold,.threshold-label { opacity:0; transition:opacity .3s .12s ease-out; }
    .history-line { stroke-dasharray:1; stroke-dashoffset:1; }
    .history-point, .label { opacity:0; transform:translateY(3px); transition:opacity .24s var(--point-delay, .3s) ease-out,transform .3s var(--point-delay, .3s) ease-out; }
    .label { transition-delay:var(--label-delay, .35s); }
    figure.active .threshold, figure.active .threshold-label { opacity:1; }
    figure.active .history-line { animation:draw 1.55s .12s both cubic-bezier(.2,.65,.25,1); }
    figure.active .history-point, figure.active .label { opacity:1; transform:none; }
    @keyframes draw { to { stroke-dashoffset:0; } }
  }

  @media (prefers-reduced-motion:reduce) {
    .history-line { stroke-dasharray:none; stroke-dashoffset:0; }
  }
</style>
