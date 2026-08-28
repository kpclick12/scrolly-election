<script>
  import { liberalHistory } from "../../data/story.js";

  const width = 820;
  const height = 310;
  const margin = { top: 20, right: 36, bottom: 35, left: 42 };
  const x = (year) => margin.left + (year - 1948) / (2026 - 1948) * (width - margin.left - margin.right);
  const y = (value) => margin.top + (26 - value) / 26 * (height - margin.top - margin.bottom);
  const path = liberalHistory.map((point, index) => `${index ? "L" : "M"} ${x(point.year).toFixed(1)} ${y(point.value).toFixed(1)}`).join(" ");
  const labels = liberalHistory.filter((point) => [1948, 2002, 2022, 2026].includes(point.year));
</script>

<figure>
  <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-labelledby="history-title history-desc">
    <title id="history-title">Liberalernas stöd i riksdagsval sedan 1948</title>
    <desc id="history-desc">Folkpartiet fick 22,8 procent 1948. Liberalerna fick 4,6 procent 2022 och ligger på 2,2 procent i Indikator Opinions mätning i augusti 2026.</desc>

    <line class="threshold" x1={margin.left} x2={width - margin.right} y1={y(4)} y2={y(4)} />
    <text class="threshold-label" x={margin.left} y={y(4) - 8}>4-procentsspärren</text>

    <path class="history-line" d={path} />

    {#each liberalHistory as point}
      <circle
        class:poll={point.poll}
        class="history-point"
        cx={x(point.year)}
        cy={y(point.value)}
        r={point.poll ? 7 : 3.5}
      />
    {/each}

    {#each labels as point}
      <g class:current={point.poll} class="label">
        <text x={x(point.year)} y={y(point.value) - 15} text-anchor={point.year === 1948 ? "start" : point.year === 2026 ? "end" : "middle"}>{point.value.toLocaleString("sv-SE", { minimumFractionDigits: 1 })}%</text>
        <text class="year" x={x(point.year)} y={y(point.value) + 22} text-anchor={point.year === 1948 ? "start" : point.year === 2026 ? "end" : "middle"}>{point.year}{point.poll ? " · mätning" : ""}</text>
      </g>
    {/each}
  </svg>
  <figcaption>Folkpartiet till 2015, därefter Liberalerna. Riksdagsval 1948–2022 och Indikator Opinion i augusti 2026.</figcaption>
</figure>

<style>
  figure { margin:0; min-width:0; }
  svg { display:block; width:100%; height:auto; overflow:visible; }
  .threshold { stroke:var(--rule-strong); stroke-width:1.25; stroke-dasharray:5 5; }
  .threshold-label { fill:var(--muted); font:650 11px var(--sans); letter-spacing:.02em; }
  .history-line { fill:none; stroke:var(--accent); stroke-width:3.5; stroke-linecap:round; stroke-linejoin:round; }
  .history-point { fill:var(--paper); stroke:var(--accent); stroke-width:2; }
  .history-point.poll { fill:var(--accent); stroke:white; stroke-width:2.5; }
  .label text { fill:var(--ink); font:720 14px var(--sans); font-variant-numeric:tabular-nums; }
  .label .year { fill:var(--muted); font-size:10px; font-weight:600; }
  .label.current text { fill:var(--accent-dark); }
  figcaption { margin-top:8px; color:var(--muted); font-size:11px; line-height:1.45; }

  @media (max-width:620px) {
    .threshold-label { font-size:10px; }
    .label text { font-size:13px; }
    figcaption { font-size:10px; }
  }

  @media (prefers-reduced-motion:no-preference) {
    .history-line { stroke-dasharray:1200; stroke-dashoffset:1200; animation:draw 1.35s .22s both ease-out; }
    .history-point, .label { opacity:0; animation:appear .35s 1.1s both ease-out; }
    .history-point.poll, .label.current { animation-delay:1.35s; }
    @keyframes draw { to { stroke-dashoffset:0; } }
    @keyframes appear { to { opacity:1; } }
  }
</style>
