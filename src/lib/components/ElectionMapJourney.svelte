<script>
  import { onMount } from "svelte";
  import { boundsOf, projector } from "../utils/geo.js";
  import { parties } from "../../data/story.js";

  let { step = 0 } = $props();

  const stops = [
    { id: "01620116", short: "Södra Djursholm" },
    { id: "20810124", short: "Tjärna Allé" },
    { id: "12750103", short: "Oderljunga" },
    { id: "12800222", short: "Möllevångstorget S" },
  ];
  const stepDistrict = [null, null, stops[0].id, stops[0].id, stops[1].id, stops[2].id, stops[3].id, null, null];
  const partyColors = Object.fromEntries(parties.map((party) => [party.code, party.color]));

  let wrapper;
  let canvas;
  let mapData = $state(null);
  let paths = [];
  let projectedBounds = [];
  let projectedCenters = [];
  let featureIndex = $state(new Map());
  let resizeObserver;
  let animationFrame;
  let reducedMotion = false;
  let currentView = { scale: 1, x: 0, y: 0 };
  let targetView = { scale: 1, x: 0, y: 0 };
  let currentColorMix = 0;
  let currentScatterMix = 0;

  let selectedId = $derived(stepDistrict[step] ?? null);
  let selectedFeature = $derived(selectedId ? mapData?.features[featureIndex.get(selectedId)] : null);
  let ariaLabel = $derived(selectedFeature
    ? `Kartan zoomar till ${selectedFeature.properties.name} i ${selectedFeature.properties.municipality}. ${selectedFeature.properties.leadingParty} var största riksdagsparti 2022 med ${format(selectedFeature.properties.leadingShare)} procent.`
    : step === 8
      ? "Samma 6 264 valdistrikt har lämnat kartan och placerats efter andel 65 år eller äldre och andel med minst treårig eftergymnasial utbildning. De fyra besökta distrikten är markerade."
      : step === 0
      ? "Neutral karta över Sveriges 6 264 valdistrikt vid riksdagsvalet 2022."
      : step === 1
        ? "Karta över största riksdagsparti i Sveriges 6 264 valdistrikt vid valet 2022. Kartytan visar mark, inte antal väljare."
        : "Sveriges 6 264 valdistrikt visas som punkter. Fyra redaktionellt valda distrikt används som kontraster i experimentet.");

  function pathFor(feature, project) {
    const path = new Path2D();
    const polygons = feature.geometry.type === "Polygon"
      ? [feature.geometry.coordinates]
      : feature.geometry.coordinates;
    for (const polygon of polygons) {
      for (const ring of polygon) {
        ring.forEach((point, index) => {
          const [x, y] = project(point);
          if (index === 0) path.moveTo(x, y);
          else path.lineTo(x, y);
        });
        path.closePath();
      }
    }
    return path;
  }

  function projectedBox(feature, project) {
    const bounds = boundsOf([feature]);
    const [left, bottom] = project([bounds.minX, bounds.minY]);
    const [right, top] = project([bounds.maxX, bounds.maxY]);
    return {
      minX: Math.min(left, right),
      maxX: Math.max(left, right),
      minY: Math.min(top, bottom),
      maxY: Math.max(top, bottom),
    };
  }

  function projectedCentroid(feature, project) {
    const polygons = feature.geometry.type === "Polygon"
      ? [feature.geometry.coordinates]
      : feature.geometry.coordinates;
    let weightedX = 0;
    let weightedY = 0;
    let totalArea = 0;
    for (const polygon of polygons) {
      for (const ring of polygon) {
        const points = ring.map(project);
        let crossSum = 0;
        let centroidX = 0;
        let centroidY = 0;
        for (let index = 0; index < points.length - 1; index += 1) {
          const [x1, y1] = points[index];
          const [x2, y2] = points[index + 1];
          const cross = x1 * y2 - x2 * y1;
          crossSum += cross;
          centroidX += (x1 + x2) * cross;
          centroidY += (y1 + y2) * cross;
        }
        const area = crossSum / 2;
        if (Math.abs(area) < 1e-6) continue;
        weightedX += centroidX / (6 * area) * area;
        weightedY += centroidY / (6 * area) * area;
        totalArea += area;
      }
    }
    if (Math.abs(totalArea) > 1e-6) return [weightedX / totalArea, weightedY / totalArea];
    const box = projectedBox(feature, project);
    return [(box.minX + box.maxX) / 2, (box.minY + box.maxY) / 2];
  }

  function overviewView(width, height) {
    if (width <= 820) {
      const scale = height <= 680 ? 0.56 : 0.62;
      return {
        scale,
        x: width * (1 - scale) / 2,
        y: height * 0.045,
      };
    }
    return { scale: 0.92, x: width * 0.13, y: height * 0.04 };
  }

  function viewForStep() {
    if (!wrapper || !mapData) return currentView;
    const { width, height } = wrapper.getBoundingClientRect();
    const index = selectedId ? featureIndex.get(selectedId) : -1;
    if (index === undefined || index < 0) return overviewView(width, height);
    const box = projectedBounds[index];
    const boxWidth = Math.max(1, box.maxX - box.minX);
    const boxHeight = Math.max(1, box.maxY - box.minY);
    const mobile = width <= 820;
    const scale = Math.min(
      mobile ? 22 : 30,
      Math.max(4.4, Math.min((width * (mobile ? 0.56 : 0.38)) / boxWidth, (height * 0.36) / boxHeight)),
    );
    const centerX = (box.minX + box.maxX) / 2;
    const centerY = (box.minY + box.maxY) / 2;
    const focusX = mobile ? width * 0.5 : width * 0.66;
    const focusY = mobile ? height * 0.31 : height * 0.53;
    return { scale, x: focusX - centerX * scale, y: focusY - centerY * scale };
  }

  function colorFor(feature, index) {
    if (currentColorMix <= 0) return "#c7cfd2";
    if (selectedId && feature.properties.id !== selectedId) return "#e5eaeb";
    const target = partyColors[feature.properties.leadingParty] ?? "#8a969c";
    if (selectedId || currentColorMix >= 1) return target;
    const from = [199, 207, 210];
    const value = Number.parseInt(target.slice(1), 16);
    const to = [(value >> 16) & 255, (value >> 8) & 255, value & 255];
    const rgb = from.map((channel, colorIndex) => Math.round(channel + (to[colorIndex] - channel) * currentColorMix));
    return `rgb(${rgb.join(",")})`;
  }

  function chartLayout(width, height) {
    const mobile = width <= 820;
    const left = mobile ? 49 : Math.max(78, width * .11);
    const right = mobile ? width - 20 : width - Math.max(54, width * .08);
    const top = mobile ? 126 : 112;
    const bottom = mobile ? height * .48 : height - 86;
    return {
      left,
      right,
      top,
      bottom,
      x: (value) => left + Math.max(0, Math.min(65, value)) / 65 * (right - left),
      y: (value) => bottom - Math.max(0, Math.min(80, value)) / 80 * (bottom - top),
    };
  }

  function drawScatterAxes(context, width, height, alpha) {
    if (alpha <= 0) return;
    const chart = chartLayout(width, height);
    context.save();
    context.globalAlpha = alpha;
    context.strokeStyle = "rgba(37,52,69,.22)";
    context.fillStyle = "#57656d";
    context.lineWidth = 1;
    context.font = `${width <= 820 ? 9 : 11}px ui-sans-serif, system-ui, sans-serif`;
    context.textAlign = "center";
    context.textBaseline = "top";
    for (const value of [0, 20, 40, 60]) {
      const x = chart.x(value);
      context.beginPath();
      context.moveTo(x, chart.top);
      context.lineTo(x, chart.bottom);
      context.stroke();
      context.fillText(`${value}%`, x, chart.bottom + 8);
    }
    context.textAlign = "right";
    context.textBaseline = "middle";
    for (const value of [0, 20, 40, 60, 80]) {
      const y = chart.y(value);
      context.beginPath();
      context.moveTo(chart.left, y);
      context.lineTo(chart.right, y);
      context.stroke();
      context.fillText(`${value}%`, chart.left - 8, y);
    }
    context.textAlign = "center";
    context.textBaseline = "alphabetic";
    context.font = `700 ${width <= 820 ? 10 : 12}px ui-sans-serif, system-ui, sans-serif`;
    context.fillStyle = "#273843";
    context.fillText("Andel 65 år eller äldre →", (chart.left + chart.right) / 2, chart.bottom + (width <= 820 ? 39 : 49));
    context.save();
    context.translate(width <= 820 ? 14 : 24, (chart.top + chart.bottom) / 2);
    context.rotate(-Math.PI / 2);
    context.fillText("Minst 3 års eftergymnasial utbildning →", 0, 0);
    context.restore();
    context.restore();
  }

  function draw(view = currentView) {
    if (!canvas || !wrapper || !mapData || paths.length === 0) return;
    const context = canvas.getContext("2d");
    const dpr = canvas.width / Math.max(1, canvas.clientWidth);
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const viewScale = Number.isFinite(view.scale) ? Math.max(0.05, view.scale) : 1;
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    context.clearRect(0, 0, width, height);
    const backgroundFrom = [231, 235, 245];
    const backgroundTo = [247, 245, 239];
    const background = backgroundFrom.map((channel, index) => Math.round(channel + (backgroundTo[index] - channel) * currentScatterMix));
    context.fillStyle = `rgb(${background.join(",")})`;
    context.fillRect(0, 0, width, height);

    const pointMode = step >= 2;

    if (currentScatterMix < .999) {
      context.setTransform(
        dpr * viewScale,
        0,
        0,
        dpr * viewScale,
        dpr * view.x,
        dpr * view.y,
      );
      mapData.features.forEach((feature, index) => {
        const isContext = selectedId && feature.properties.id !== selectedId;
        context.globalAlpha = 1 - currentScatterMix;
        context.fillStyle = pointMode ? (selectedId && !isContext ? "#ffffff" : "#f1f3f9") : colorFor(feature, index);
        context.fill(paths[index], "evenodd");
        context.strokeStyle = isContext
          ? "rgba(36,51,77,.08)"
          : step === 0
            ? "rgba(36,51,77,.28)"
            : pointMode
              ? "rgba(36,51,77,.14)"
              : "rgba(36,51,77,.42)";
        context.lineWidth = isContext ? 0.48 / viewScale : 0.42 / viewScale;
        context.stroke(paths[index]);
      });
    }
    context.globalAlpha = 1;

    if (pointMode) {
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      drawScatterAxes(context, width, height, currentScatterMix);
      const chart = chartLayout(width, height);
      mapData.features.forEach((feature, index) => {
        const isSelected = feature.properties.id === selectedId;
        const validVotes = feature.properties.validVotes ?? 1000;
        const mapX = projectedCenters[index][0] * viewScale + view.x;
        const mapY = projectedCenters[index][1] * viewScale + view.y;
        const scatterX = chart.x(feature.properties.older);
        const scatterY = chart.y(feature.properties.education);
        const x = mapX + (scatterX - mapX) * currentScatterMix;
        const y = mapY + (scatterY - mapY) * currentScatterMix;
        const isStop = stops.some((stop) => stop.id === feature.properties.id);
        const screenRadius = isSelected
          ? Math.min(14, 7 + Math.sqrt(validVotes / 1000) * 2.3)
          : isStop && currentScatterMix > .5
            ? 5.4
            : Math.max(1.05, Math.min(2.55, Math.sqrt(validVotes / 1000) * 1.35));
        context.beginPath();
        context.arc(x, y, screenRadius, 0, Math.PI * 2);
        context.fillStyle = selectedId && !isSelected
          ? "rgba(91,97,112,.17)"
          : partyColors[feature.properties.leadingParty] ?? "#8f999f";
        context.globalAlpha = selectedId && !isSelected ? 0.5 : currentScatterMix > 0 ? .32 + (isStop ? .68 : 0) : .9;
        context.fill();
        if (isSelected || (isStop && currentScatterMix > .5)) {
          context.strokeStyle = currentScatterMix > .5 ? "#1f3039" : "#ffffff";
          context.lineWidth = currentScatterMix > .5 ? 1.8 : 3.5;
          context.stroke();
        }
      });
      context.globalAlpha = 1;

      if (currentScatterMix > .72) {
        context.save();
        context.globalAlpha = (currentScatterMix - .72) / .28;
        context.font = `700 ${width <= 820 ? 8 : 10}px ui-sans-serif, system-ui, sans-serif`;
        context.textAlign = "left";
        context.textBaseline = "middle";
        context.fillStyle = "#1f3039";
        const offsets = [-11, 12, -11, 12];
        stops.forEach((stop, stopIndex) => {
          const feature = mapData.features[featureIndex.get(stop.id)];
          const x = chart.x(feature.properties.older);
          const y = chart.y(feature.properties.education) + offsets[stopIndex];
          context.fillText(stop.short, x + 8, y);
        });
        context.restore();
      }
    }

    if (selectedId) {
      const index = featureIndex.get(selectedId);
      const feature = mapData.features[index];
      const partyColor = partyColors[feature.properties.leadingParty] ?? "#56666e";
      context.setTransform(
        dpr * viewScale,
        0,
        0,
        dpr * viewScale,
        dpr * view.x,
        dpr * view.y,
      );
      context.strokeStyle = partyColor;
      context.lineWidth = 2.2 / viewScale;
      context.stroke(paths[index]);

      const center = projectedCenters[index];
      const markerX = center[0] * viewScale + view.x;
      const markerY = center[1] * viewScale + view.y;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (!pointMode) {
        context.beginPath();
        context.arc(markerX, markerY, 7.5, 0, Math.PI * 2);
        context.strokeStyle = "#ffffff";
        context.lineWidth = 4.5;
        context.stroke();
        context.strokeStyle = partyColor;
        context.lineWidth = 2.25;
        context.stroke();
      }
    }

    if (step === 7) {
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      for (const stop of stops) {
        const index = featureIndex.get(stop.id);
        const center = projectedCenters[index];
        const x = center[0] * viewScale + view.x;
        const y = center[1] * viewScale + view.y;
        const party = mapData.features[index].properties.leadingParty;
        context.beginPath();
        context.arc(x, y, 7, 0, Math.PI * 2);
        context.fillStyle = partyColors[party];
        context.fill();
        context.strokeStyle = "#ffffff";
        context.lineWidth = 2;
        context.stroke();
      }
    }
  }

  function animateToTarget() {
    cancelAnimationFrame(animationFrame);
    const startView = { ...currentView };
    const startColorMix = currentColorMix;
    const startScatterMix = currentScatterMix;
    const nextColorMix = step === 0 ? 0 : 1;
    const nextScatterMix = step === 8 ? 1 : 0;
    targetView = viewForStep();
    if (reducedMotion) {
      currentView = { ...targetView };
      currentColorMix = nextColorMix;
      currentScatterMix = nextScatterMix;
      draw();
      return;
    }
    const started = performance.now();
    const duration = 760;
    const tick = (now) => {
      const raw = Math.min(1, (now - started) / duration);
      const eased = 1 - Math.pow(1 - raw, 3);
      currentView = {
        scale: startView.scale + (targetView.scale - startView.scale) * eased,
        x: startView.x + (targetView.x - startView.x) * eased,
        y: startView.y + (targetView.y - startView.y) * eased,
      };
      currentColorMix = startColorMix + (nextColorMix - startColorMix) * eased;
      currentScatterMix = startScatterMix + (nextScatterMix - startScatterMix) * eased;
      draw();
      if (raw < 1) animationFrame = requestAnimationFrame(tick);
    };
    animationFrame = requestAnimationFrame(tick);
  }

  function rebuild() {
    if (!wrapper || !canvas || !mapData) return;
    const { width, height } = wrapper.getBoundingClientRect();
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.max(1, Math.round(width * dpr));
    canvas.height = Math.max(1, Math.round(height * dpr));
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    const project = projector(boundsOf(mapData.features), width, height, width <= 820 ? 28 : 46);
    paths = mapData.features.map((feature) => pathFor(feature, project));
    projectedBounds = mapData.features.map((feature) => projectedBox(feature, project));
    projectedCenters = mapData.features.map((feature) => projectedCentroid(feature, project));
    currentView = viewForStep();
    currentColorMix = step === 0 ? 0 : 1;
    currentScatterMix = step === 8 ? 1 : 0;
    targetView = { ...currentView };
    draw();
  }

  function format(value) {
    return Number(value).toLocaleString("sv-SE", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  }

  onMount(() => {
    reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    resizeObserver = new ResizeObserver(rebuild);
    resizeObserver.observe(wrapper);
    fetch(`${import.meta.env.BASE_URL}data/districts-map.json`)
      .then((response) => {
        if (!response.ok) throw new Error(`Kartan kunde inte läsas in (${response.status})`);
        return response.json();
      })
      .then((data) => {
        mapData = data;
        featureIndex = new Map(data.features.map((feature, index) => [feature.properties.id, index]));
        requestAnimationFrame(rebuild);
      })
      .catch((error) => console.error(error));
    return () => {
      resizeObserver?.disconnect();
      cancelAnimationFrame(animationFrame);
    };
  });

  $effect(() => {
    step;
    selectedId;
    if (mapData && paths.length) animateToTarget();
  });
</script>

<figure bind:this={wrapper} aria-label={ariaLabel}>
  <canvas bind:this={canvas} aria-hidden="true"></canvas>
  <header class="map-header">
    <span>Riksdagsvalet 2022</span>
    <strong>{step === 0 ? "6 264 valdistrikt" : step === 1 ? "Största parti per valdistrikt" : step === 8 ? "Samma distrikt, ny position" : selectedFeature ? selectedFeature.properties.name : "Valdistrikten som punkter"}</strong>
  </header>

  {#if !mapData}
    <p class="loading">Läser Valmyndighetens 21 länsfiler …</p>
  {/if}

  <div class="party-legend" class:visible={step >= 1} aria-label="Partifärger" aria-hidden={step < 1}>
    {#each parties.filter((party) => party.code !== "Övr") as party}
      <span><i style={`--party:${party.color}`} aria-hidden="true"></i><abbr title={party.name}>{party.code}</abbr></span>
    {/each}
  </div>

  {#if step === 7 && mapData}
    <div class="route-summary" aria-hidden="true">
      {#each stops as stop}
        {@const feature = mapData.features[featureIndex.get(stop.id)]}
        <span><i style={`--party:${partyColors[feature.properties.leadingParty]}`}></i>{feature.properties.leadingParty} {format(feature.properties.leadingShare)}%</span>
      {/each}
    </div>
  {/if}

  <figcaption>{step < 2 ? "Färgen visar största riksdagsparti 2022. Vid 16 delade förstaplatser används alfabetisk partikod. Kartytan visar mark, inte antal väljare." : step === 8 ? "En punkt är fortfarande ett valdistrikt. Positionen visar områdets andel 65+ och andel med minst treårig eftergymnasial utbildning. Färgen visar största parti 2022." : "En punkt motsvarar ett valdistrikt. Storleken följer antalet giltiga röster, med en minsta visningsstorlek. Färgen visar största parti 2022."}</figcaption>
</figure>

<style>
  figure { position:relative; width:100%; height:100%; margin:0; overflow:hidden; color:var(--ink); background:#e7ebf5; }
  canvas { position:absolute; inset:0; display:block; width:100%; height:100%; }
  .map-header { position:absolute; left:clamp(18px,3vw,46px); top:clamp(18px,3vw,38px); display:grid; gap:4px; padding-left:10px; border-left:3px solid var(--accent); font-size:11px; line-height:1.3; }
  .map-header span { color:var(--muted); }
  .map-header strong { color:var(--ink); font-size:13px; font-weight:700; }
  .loading { position:absolute; inset:0; display:grid; place-items:center; margin:0; color:var(--muted); font-size:12px; }
  .party-legend { position:absolute; right:clamp(15px,2.7vw,40px); top:clamp(18px,3vw,38px); display:flex; flex-wrap:wrap; justify-content:flex-end; gap:7px 12px; max-width:360px; color:var(--muted); font-size:10px; font-weight:700; opacity:0; visibility:hidden; }
  .party-legend.visible { opacity:1; visibility:visible; }
  .party-legend span { display:flex; align-items:center; gap:5px; }
  .party-legend abbr { text-decoration:none; }
  .party-legend i, .route-summary i { width:9px; height:9px; border-radius:50%; background:var(--party); }
  .route-summary { position:absolute; right:clamp(18px,4vw,64px); bottom:74px; display:grid; gap:7px; color:var(--ink); font-size:10px; font-weight:700; }
  .route-summary span { display:flex; align-items:center; gap:7px; }
  figcaption { position:absolute; right:clamp(18px,3vw,46px); bottom:20px; max-width:470px; color:var(--muted); font-size:9px; line-height:1.45; text-align:right; }
  @media (max-width:820px) {
    .map-header { top:15px; left:15px; }
    .party-legend { top:55px; right:14px; max-width:190px; gap:5px 8px; font-size:8px; }
    .route-summary { left:15px; right:auto; top:86px; bottom:auto; font-size:8px; }
    figcaption { left:15px; right:15px; bottom:10px; max-width:none; font-size:8px; text-align:left; }
  }
  @media (prefers-reduced-motion:no-preference) {
    .party-legend, .route-summary { animation:map-meta-enter .38s both ease; }
    @keyframes map-meta-enter { from { opacity:0; transform:translateY(-5px); } to { opacity:1; transform:none; } }
  }
</style>
