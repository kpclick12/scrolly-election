<script>
  const population = Array.from({ length: 96 });
  const sample = Array.from({ length: 24 });
  const answer = Array.from({ length: 12 });
</script>

<figure aria-label="SCB:s partisympatiundersökning i maj 2026 gick från målpopulationen till 9 260 utvalda, 4 542 svar och viktade skattningar. Bortfallet var 51 procent.">
  <div class="flow">
    <section>
      <div class="dots population" aria-hidden="true">
        {#each population as _}<i></i>{/each}
      </div>
      <p>Målpopulation</p>
      <strong>drygt 8 miljoner</strong>
    </section>
    <span class="arrow" aria-hidden="true">→</span>
    <section>
      <div class="dots sample" aria-hidden="true">
        {#each sample as _}<i></i>{/each}
      </div>
      <p>Slumpmässigt utvalda</p>
      <strong>9 260</strong>
    </section>
    <span class="arrow" aria-hidden="true">→</span>
    <section>
      <div class="dots response" aria-hidden="true">
        {#each answer as _, index}<i style={`--size:${index % 4 === 0 ? 1.45 : index % 5 === 0 ? .8 : 1}`}></i>{/each}
        {#each answer as _}<i class="missing"></i>{/each}
      </div>
      <p>Svar</p>
      <strong>4 542</strong>
      <small>51% bortfall</small>
    </section>
    <span class="arrow" aria-hidden="true">→</span>
    <section class="result">
      <div class="estimate" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div>
      <p>Viktad skattning</p>
      <strong>andel ± osäkerhet</strong>
    </section>
  </div>
  <figcaption>Vikterna tar hjälp av sådant SCB känner till, bland annat kön, ålder, region, utbildning och hur personen röstade 2022.</figcaption>
</figure>

<style>
  figure { margin:0; padding:clamp(26px,4vw,48px); color:var(--ink); background:#fff; border:1px solid var(--rule-strong); }
  .flow { display:grid; grid-template-columns:1.2fr auto .75fr auto .75fr auto .9fr; align-items:center; gap:clamp(12px,2.3vw,30px); }
  section { min-width:0; }
  .dots { display:grid; grid-template-columns:repeat(12,1fr); gap:4px; width:100%; min-height:73px; align-content:center; }
  .dots i { display:block; aspect-ratio:1; border-radius:50%; background:#bcc5d5; }
  .sample { grid-template-columns:repeat(6,1fr); }
  .sample i { background:var(--accent); }
  .response { grid-template-columns:repeat(6,1fr); }
  .response i { transform:scale(var(--size,1)); background:#008b95; }
  .response i.missing { background:transparent; border:1px solid #aeb8ca; }
  .estimate { display:flex; align-items:center; justify-content:center; gap:7px; min-height:73px; }
  .estimate i { width:14px; height:14px; border-radius:50%; background:#7457c9; }
  .estimate i:nth-child(2) { width:21px; height:21px; background:#008b95; }
  .estimate i:nth-child(3) { width:11px; height:11px; background:#4355d9; }
  .estimate i:nth-child(4) { width:18px; height:18px; background:#58a4c6; }
  .estimate i:nth-child(5) { width:13px; height:13px; background:#5d967c; }
  .arrow { color:var(--muted-light); font-size:24px; }
  p { margin:14px 0 2px; color:var(--muted); font-size:9px; font-weight:750; text-transform:uppercase; letter-spacing:.05em; }
  strong { display:block; font-family:var(--display); font-size:clamp(21px,2.4vw,30px); line-height:1.04; letter-spacing:-.03em; font-variant-numeric:tabular-nums; }
  small { display:block; margin-top:3px; color:#6652a6; font-size:10px; }
  figcaption { margin:30px 0 0; padding-top:15px; border-top:1px solid var(--rule); color:var(--muted); font-size:11px; line-height:1.5; }
  @media (max-width:820px) {
    figure { padding:23px 18px; }
    .flow { grid-template-columns:1fr; gap:13px; }
    .arrow { transform:rotate(90deg); justify-self:center; line-height:1; }
    .dots,.estimate { max-width:235px; min-height:0; }
    .dots { grid-template-columns:repeat(16,1fr); }
    .sample,.response { grid-template-columns:repeat(12,1fr); }
    section { display:grid; grid-template-columns:minmax(120px,235px) 1fr; column-gap:16px; align-items:center; }
    section p { align-self:end; margin:0; }
    section strong, section small { grid-column:2; }
    section strong { align-self:start; font-size:24px; }
    section small { margin-top:0; }
    figcaption { margin-top:22px; font-size:10px; }
  }
</style>
