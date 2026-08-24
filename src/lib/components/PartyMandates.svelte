<script>
  import { parties } from "../../data/story.js";

  const order = ["V", "S", "MP", "C", "L", "KD", "M", "SD"];
  const groups = order.map((code) => parties.find((party) => party.code === code));
  const centerX = 380;
  const baseY = 382;
  const radii = Array.from({ length: 12 }, (_, index) => 126 + index * 18);
  const rawTotal = radii.reduce((sum, value) => sum + value, 0);
  const counts = radii.map((value) => Math.floor(value / rawTotal * 349));
  let remainder = 349 - counts.reduce((sum, value) => sum + value, 0);
  for (let index = counts.length - 1; remainder > 0; index = (index - 1 + counts.length) % counts.length) {
    counts[index] += 1;
    remainder -= 1;
  }

  const positions = radii.flatMap((radius, ring) =>
    Array.from({ length: counts[ring] }, (_, index) => {
      const padding = .035;
      const angle = Math.PI - padding - index / Math.max(1, counts[ring] - 1) * (Math.PI - padding * 2);
      return {
        angle,
        x: centerX + Math.cos(angle) * radius,
        y: baseY - Math.sin(angle) * radius,
      };
    }),
  ).sort((left, right) => right.angle - left.angle);

  const seatParties = groups.flatMap((party) => Array(party.seats2022).fill(party));
  const seats = positions.map((position, index) => {
    const startColumn = index % 25;
    const startRow = Math.floor(index / 25);
    return {
      ...position,
      party: seatParties[index],
      dx: 254 + startColumn * 10.5 - position.x,
      dy: 210 + startRow * 9.4 - position.y,
      delay: Math.min(420, index * 1.2),
    };
  });
</script>

<figure aria-label="Riksdagens 349 mandat efter valet 2022, fördelade på åtta partier">
  <div class="chart">
    <svg viewBox="0 0 760 430" role="img" aria-labelledby="mandate-title mandate-desc">
      <title id="mandate-title">Facit från riksdagsvalet 2022</title>
      <desc id="mandate-desc">Varje punkt motsvarar ett av riksdagens 349 mandat. Punkterna är grupperade efter parti.</desc>
      {#each seats as seat}
        <circle
          class="seat"
          cx={seat.x}
          cy={seat.y}
          r="5.1"
          fill={seat.party.color}
          style={`--dx:${seat.dx}px;--dy:${seat.dy}px;--delay:${seat.delay}ms`}
        >
          <title>{seat.party.name}, ett mandat</title>
        </circle>
      {/each}
      <text class="total" x="380" y="340" text-anchor="middle">349</text>
      <text class="total-label" x="380" y="363" text-anchor="middle">mandat</text>
    </svg>
  </div>
  <div class="legend" aria-hidden="true">
    {#each groups as party}
      <span><i style={`--party:${party.color}`}></i><b>{party.code}</b> {party.seats2022}</span>
    {/each}
  </div>
  <p class="unit"><strong>1 punkt = 1 mandat.</strong> I nästa scen byter vi enhet till Sveriges 6&nbsp;264 valdistrikt.</p>
  <p class="sr-only">Mandatfördelning efter riksdagsvalet 2022: {groups.map((party) => `${party.name} ${party.seats2022}`).join(", ")}.</p>
</figure>

<style>
  figure { margin:0; padding:20px 22px 18px; overflow:hidden; color:var(--ink); background:var(--surface); border:1px solid var(--rule-strong); }
  .chart { min-width:0; }
  svg { display:block; width:100%; height:auto; overflow:visible; }
  .seat { stroke:rgba(255,255,255,.72); stroke-width:.8; }
  .total { fill:var(--ink); font-family:var(--display); font-size:58px; font-weight:760; letter-spacing:-.04em; }
  .total-label { fill:var(--muted); font:700 12px var(--sans); letter-spacing:.08em; text-transform:uppercase; }
  .legend { display:flex; flex-wrap:wrap; justify-content:center; gap:7px 15px; padding-top:14px; border-top:1px solid var(--rule); color:var(--muted); font-size:10px; }
  .legend span { display:flex; align-items:center; gap:4px; }
  .legend i { width:8px; height:8px; border-radius:50%; background:var(--party); }
  .legend b { color:var(--ink); }
  .unit { margin:14px 0 0; color:var(--muted); font-size:10px; line-height:1.45; text-align:center; }
  .unit strong { color:var(--ink); }
  @media (max-width:620px) {
    figure { padding:14px 12px 13px; }
    .legend { gap:6px 10px; }
    .unit { font-size:9px; }
  }
  @media (prefers-reduced-motion:no-preference) {
    .seat { transform:translate(var(--dx),var(--dy)); transform-box:fill-box; transform-origin:center; opacity:.2; animation:seat-settle 780ms var(--delay) both cubic-bezier(.22,.72,.22,1); }
    @keyframes seat-settle { to { transform:none; opacity:1; } }
  }
</style>
