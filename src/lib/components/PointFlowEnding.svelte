<script>
  const N = 64;
  const selected = new Set([2, 7, 13, 19, 27, 34, 41, 48, 55, 61]);
  const answered = new Set([2, 13, 27, 41, 48, 61]);
  const uncovered = new Set([5, 16, 29, 38, 52, 63]);
  const weights = new Map([[2, .78], [13, 1.18], [27, .9], [41, 1.34], [48, 1.08], [61, .72]]);

  const stages = [
    {
      key: "population",
      number: "1",
      title: "Målpopulation",
      text: "Vilka människor vill undersökningen säga något om?",
    },
    {
      key: "frame",
      number: "2",
      title: "Urvalsram",
      text: "Vilka av dem kunde faktiskt bli valda?",
    },
    {
      key: "sample",
      number: "3",
      title: "Utvalda",
      text: "Drogs de med en känd sannolikhet?",
    },
    {
      key: "response",
      number: "4",
      title: "Svarande",
      text: "Vilka svarade, och vilka föll bort?",
    },
    {
      key: "weight",
      number: "5",
      title: "Viktat estimat",
      text: "Hur mycket fick varje svar påverka resultatet?",
    },
  ];

  function pointClass(stage, index) {
    if (stage === "population") return "population";
    if (stage === "frame") return uncovered.has(index) ? "uncovered" : "population";
    if (stage === "sample") return selected.has(index) ? "selected" : "dim";
    if (stage === "response") {
      if (answered.has(index)) return "answered";
      if (selected.has(index)) return "no-answer";
      return "dim";
    }
    if (answered.has(index)) return "weighted";
    return "dim";
  }
</script>

<figure aria-label="En konceptuell kedja från målpopulation till viktat estimat. Figuren visar att tilliten till en valundersökning beror på vilka som kunde väljas, vilka som drogs, vilka som svarade och hur svaren viktades.">
  <div class="flow">
    {#each stages as stage, stageIndex}
      <section>
        <div class="stage-head"><span>{stage.number}</span><h3>{stage.title}</h3></div>
        <div class="dot-field" aria-hidden="true">
          {#each Array(N) as _, index}
            <i
              class={pointClass(stage.key, index)}
              style={stage.key === "weight" && weights.has(index) ? `--weight:${weights.get(index)}` : undefined}
            ></i>
          {/each}
        </div>
        <p>{stage.text}</p>
      </section>
      {#if stageIndex < stages.length - 1}<i class="connector" aria-hidden="true"></i>{/if}
    {/each}
  </div>
  <figcaption>Prickarna visar principen, inte storleken på en viss publicerad undersökning.</figcaption>
</figure>

<style>
  figure { margin:clamp(44px,6vw,72px) 0 0; }
  .flow { display:grid; grid-template-columns:minmax(0,1fr) 22px minmax(0,1fr) 22px minmax(0,1fr) 22px minmax(0,1fr) 22px minmax(0,1fr); align-items:center; }
  section { min-width:0; align-self:stretch; padding:18px 14px 19px; background:var(--surface); border:1px solid var(--rule-strong); }
  .stage-head { display:flex; align-items:center; gap:8px; min-height:38px; }
  .stage-head span { display:grid; place-items:center; width:24px; height:24px; flex:0 0 auto; border-radius:50%; color:#ffffff; background:var(--ink); font-size:11px; font-weight:800; }
  h3 { margin:0; font-family:var(--display); font-size:clamp(17px,1.7vw,22px); font-weight:760; line-height:1.02; }
  .dot-field { display:grid; grid-template-columns:repeat(8,1fr); gap:4px; margin:18px 0 16px; }
  .dot-field i { display:block; width:100%; aspect-ratio:1; border-radius:50%; background:var(--point-dim); transform:scale(.8); }
  .dot-field .population { background:var(--point-population); transform:scale(.8); }
  .dot-field .uncovered { background:transparent; border:1.5px solid var(--point-dim); }
  .dot-field .dim { opacity:.25; }
  .dot-field .selected { background:var(--point-selected); box-shadow:0 0 0 1.5px var(--surface),0 0 0 3px var(--point-selected); transform:scale(.62); }
  .dot-field .answered { background:var(--point-answer); transform:scale(.92); }
  .dot-field .no-answer { background:transparent; border:1.5px solid var(--point-selected); transform:scale(.78); }
  .dot-field .weighted { background:var(--point-answer); transform:scale(var(--weight,.8)); }
  section p { margin:0; color:var(--muted); font-size:11px; line-height:1.45; }
  .connector { display:block; height:1px; background:var(--accent); position:relative; }
  .connector::after { content:""; position:absolute; right:-1px; top:50%; width:6px; height:6px; border-top:1.5px solid var(--accent); border-right:1.5px solid var(--accent); transform:translateY(-50%) rotate(45deg); }
  figcaption { margin-top:12px; color:var(--muted-light); font-size:10px; }
  @media (max-width:850px) {
    .flow { grid-template-columns:1fr; }
    section { display:grid; grid-template-columns:minmax(115px,.72fr) minmax(150px,1fr); grid-template-rows:auto auto; gap:0 16px; align-items:center; padding:14px; }
    .stage-head { grid-column:1; grid-row:1; }
    .dot-field { grid-column:2; grid-row:1/3; width:128px; max-width:100%; margin:0; gap:3px; justify-self:end; }
    section p { grid-column:1; grid-row:2; margin-top:8px; }
    .connector { width:1px; height:18px; margin-left:26px; background:var(--accent); }
    .connector::after { right:auto; left:50%; top:auto; bottom:-1px; transform:translateX(-50%) rotate(135deg); }
  }
</style>
