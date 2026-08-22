<script>
  let { districts = [] } = $props();

  const CELLS = 25;
  const filled = (value) => Math.round(value / 4);
  const format = (value) => Number(value).toLocaleString("sv-SE", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
</script>

<figure aria-label="Andel 65 år eller äldre och andel med lång utbildning i fyra valdistrikt. Varje rad har 25 punkter och varje punkt motsvarar ungefär fyra procentenheter.">
  <figcaption>
    <span><i class="older-key"></i>65+ år</span>
    <span><i class="education-key"></i>Lång utbildning</span>
    <small>25 punkter per rad · 1 punkt ≈ 4 procentenheter</small>
  </figcaption>

  <div class="district-grid">
    {#each districts as district}
      <section>
        <header>
          <h3>{district.short}</h3>
          <p>{district.municipality}</p>
        </header>

        <div class="measure older">
          <div class="measure-head"><span>65+ år</span><strong>{format(district.profile.older)}%</strong></div>
          <div class="dots" aria-hidden="true">
            {#each Array(CELLS) as _, index}<i class:filled={index < filled(district.profile.older)}></i>{/each}
          </div>
        </div>

        <div class="measure education">
          <div class="measure-head"><span>Lång utbildning</span><strong>{format(district.profile.longEducation)}%</strong></div>
          <div class="dots" aria-hidden="true">
            {#each Array(CELLS) as _, index}<i class:filled={index < filled(district.profile.longEducation)}></i>{/each}
          </div>
        </div>
      </section>
    {/each}
  </div>
</figure>

<style>
  figure { margin:clamp(36px,5vw,54px) 0 0; }
  figcaption { display:flex; flex-wrap:wrap; align-items:center; gap:9px 20px; padding:0 0 14px; border-bottom:1px solid var(--rule-strong); color:var(--muted); font-size:11px; }
  figcaption span { display:flex; align-items:center; gap:7px; font-weight:700; }
  figcaption i { display:block; width:9px; height:9px; border-radius:50%; }
  .older-key { background:var(--accent); }
  .education-key { background:var(--teal); }
  figcaption small { margin-left:auto; color:var(--muted-light); font-size:10px; }
  .district-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:1px; background:var(--rule-strong); border-bottom:1px solid var(--rule-strong); }
  section { min-width:0; padding:24px clamp(18px,3vw,30px) 27px; background:var(--surface); }
  header { display:flex; align-items:baseline; justify-content:space-between; gap:12px; padding-bottom:14px; border-bottom:1px solid var(--rule); }
  h3 { margin:0; font-family:var(--display); font-size:clamp(20px,2.2vw,28px); font-weight:760; letter-spacing:-.035em; }
  header p { margin:0; color:var(--muted-light); font-size:10px; }
  .measure { margin-top:17px; }
  .measure-head { display:flex; justify-content:space-between; gap:12px; margin-bottom:8px; color:var(--muted); font-size:10px; }
  .measure-head strong { color:var(--ink); font-size:12px; font-variant-numeric:tabular-nums; }
  .dots { display:grid; grid-template-columns:repeat(25,minmax(0,1fr)); gap:clamp(2px,.45vw,5px); }
  .dots i { display:block; aspect-ratio:1; border-radius:50%; background:var(--point-dim); opacity:.64; }
  .older .dots i.filled { background:var(--accent); opacity:1; }
  .education .dots i.filled { background:var(--teal); opacity:1; }
  @media (max-width:720px) {
    figcaption small { width:100%; margin-left:0; }
    .district-grid { grid-template-columns:1fr; }
    section { padding:19px 14px 22px; }
    .dots { gap:3px; }
  }
</style>
