<script>
  import { onMount } from "svelte";
  import { parties } from "../../data/story.js";

  const groups = [...parties]
    .filter((party) => party.seats2022)
    .sort((left, right) => right.seats2022 - left.seats2022);
  const points = groups.flatMap((party, group) =>
    Array.from({ length: party.seats2022 }, (_, index) => ({ party, group, index })),
  );

  let wrapper;
  let canvas;
  let observer;
  let resizeObserver;
  let animationFrame;
  let progress = 0;
  let settled = $state(false);
  let reducedMotion = false;

  function hexToRgb(hex) {
    const value = Number.parseInt(hex.slice(1), 16);
    return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
  }

  function mixColor(hex, amount) {
    const from = [184, 191, 210];
    const to = hexToRgb(hex);
    const values = from.map((value, index) => Math.round(value + (to[index] - value) * amount));
    return `rgb(${values.join(",")})`;
  }

  function ease(value) {
    return 1 - Math.pow(1 - value, 3);
  }

  function draw(value = progress) {
    if (!wrapper || !canvas) return;
    const { width, height } = wrapper.getBoundingClientRect();
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.max(1, Math.round(width * dpr));
    canvas.height = Math.max(1, Math.round(height * dpr));
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const context = canvas.getContext("2d");
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    context.clearRect(0, 0, width, height);

    const compact = width < 620;
    const labelWidth = compact ? 40 : 172;
    const countWidth = compact ? 28 : 48;
    const left = labelWidth;
    const right = width - countWidth;
    const top = compact ? 26 : 34;
    const bottom = height - (compact ? 36 : 48);
    const rowGap = (bottom - top) / (groups.length - 1);
    const maxSeats = Math.max(...groups.map((group) => group.seats2022));
    const gridColumns = compact ? 25 : 31;
    const gridRows = Math.ceil(points.length / gridColumns);
    const gridLeft = left + (right - left) * .08;
    const gridRight = right - (right - left) * .08;
    const gridTop = top - 3;
    const gridBottom = bottom + 3;
    const eased = ease(value);
    const radius = compact ? 1.65 : 2.55;

    points.forEach((point, pointIndex) => {
      const column = pointIndex % gridColumns;
      const row = Math.floor(pointIndex / gridColumns);
      const startX = gridLeft + column / Math.max(1, gridColumns - 1) * (gridRight - gridLeft);
      const startY = gridTop + row / Math.max(1, gridRows - 1) * (gridBottom - gridTop);
      const endX = left + point.index / Math.max(1, maxSeats - 1) * (right - left);
      const endY = top + point.group * rowGap;
      const x = startX + (endX - startX) * eased;
      const y = startY + (endY - startY) * eased;
      context.beginPath();
      context.arc(x, y, radius, 0, Math.PI * 2);
      context.fillStyle = mixColor(point.party.color, Math.max(0, (value - .12) / .72));
      context.fill();
    });
  }

  function animate() {
    if (reducedMotion) {
      progress = 1;
      settled = true;
      draw();
      return;
    }
    cancelAnimationFrame(animationFrame);
    const started = performance.now();
    const duration = 1100;
    const tick = (now) => {
      progress = Math.min(1, (now - started) / duration);
      draw(progress);
      if (progress < 1) animationFrame = requestAnimationFrame(tick);
      else settled = true;
    };
    animationFrame = requestAnimationFrame(tick);
  }

  onMount(() => {
    reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    resizeObserver = new ResizeObserver(() => draw());
    resizeObserver.observe(wrapper);
    observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !settled) {
        animate();
        observer.disconnect();
      }
    }, { threshold: .38 });
    observer.observe(wrapper);
    draw();
    return () => {
      observer?.disconnect();
      resizeObserver?.disconnect();
      cancelAnimationFrame(animationFrame);
    };
  });
</script>

<figure class:settled bind:this={wrapper} aria-label="Riksdagens 349 mandat efter valet 2022, fördelade på åtta partier">
  <canvas bind:this={canvas} aria-hidden="true"></canvas>
  <div class="labels" aria-hidden="true">
    {#each groups as party}
      <div><span><i style={`--party:${party.color}`}></i><b>{party.code}</b><em>{party.name}</em></span><strong>{party.seats2022}</strong></div>
    {/each}
  </div>
  <figcaption>En punkt motsvarar ett mandat. Punkterna ordnas efter partiernas mandat i valet 2022.</figcaption>
</figure>

<style>
  figure { position:relative; height:410px; margin:0; overflow:hidden; background:var(--surface); border:1px solid var(--rule-strong); }
  canvas { position:absolute; inset:0; display:block; width:100%; height:100%; }
  .labels { position:absolute; inset:34px 20px 48px 18px; display:grid; grid-template-rows:repeat(8,1fr); align-items:center; pointer-events:none; }
  .labels div { display:flex; justify-content:space-between; align-items:center; opacity:0; transform:translateY(4px); transition:opacity .28s ease,transform .36s ease; }
  figure.settled .labels div { opacity:1; transform:none; }
  .labels div:nth-child(2) { transition-delay:.02s; }
  .labels div:nth-child(3) { transition-delay:.04s; }
  .labels div:nth-child(4) { transition-delay:.06s; }
  .labels div:nth-child(5) { transition-delay:.08s; }
  .labels div:nth-child(6) { transition-delay:.10s; }
  .labels div:nth-child(7) { transition-delay:.12s; }
  .labels div:nth-child(8) { transition-delay:.14s; }
  .labels span { display:flex; align-items:center; gap:7px; color:var(--ink); font-size:12px; font-weight:750; }
  .labels span b { min-width:23px; font-size:12px; }
  .labels span em { overflow:hidden; color:var(--muted); font-size:10px; font-style:normal; font-weight:500; text-overflow:ellipsis; white-space:nowrap; }
  .labels i { width:8px; height:8px; border-radius:50%; background:var(--party); }
  .labels strong { min-width:34px; color:var(--ink); font-family:var(--display); font-size:18px; text-align:right; }
  figcaption { position:absolute; left:18px; right:18px; bottom:10px; padding-top:7px; border-top:1px solid var(--rule); color:var(--muted); font-size:11.5px; line-height:1.35; }
  @media (max-width:620px) {
    figure { height:350px; }
    .labels { inset:26px 9px 36px 8px; }
    .labels span { gap:4px; font-size:10px; }
    .labels span b { min-width:0; font-size:10px; }
    .labels span em { display:none; }
    .labels i { width:6px; height:6px; }
    .labels strong { min-width:24px; font-size:14px; }
    figcaption { left:8px; right:8px; bottom:6px; padding-top:5px; font-size:10px; }
  }
  @media (prefers-reduced-motion:reduce) {
    .labels div { transition:none; }
  }
</style>
