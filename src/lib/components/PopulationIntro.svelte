<script>
  const dots = Array.from({ length: 360 }, (_, index) => ({
    selected: [16, 57, 104, 173, 218, 271, 316].includes(index),
  }));
</script>

<figure class="population-intro" aria-label="Illustration av en stor väljarkår där ett litet antal personer väljs ut till en undersökning">
  <header>
    <span>Väljarkåren 2026</span>
    <strong>8&nbsp;046&nbsp;725</strong>
    <small>röstberättigade till riksdagen på kvalifikationsdagen</small>
  </header>
  <div class="field" aria-hidden="true">
    {#each dots as dot}<i class:selected={dot.selected}></i>{/each}
  </div>
  <figcaption><i></i> Några tusen svar ska säga något om drygt åtta miljoner väljare. Punktfältet är en illustration och inte skalenligt.</figcaption>
</figure>

<style>
  figure { margin:0; padding:clamp(22px,3vw,34px); color:var(--ink); background:transparent; border-block:1px solid var(--rule-strong); }
  header { display:grid; padding-bottom:18px; border-bottom:1px solid var(--rule); }
  header span { color:var(--accent-dark); font-size:11px; font-weight:750; letter-spacing:.035em; }
  header strong { margin-top:5px; font-family:var(--display); font-size:clamp(42px,5vw,62px); font-weight:700; line-height:1; letter-spacing:-.025em; font-variant-numeric:tabular-nums; }
  header small { max-width:310px; margin-top:7px; color:var(--muted); font-size:10px; line-height:1.45; }
  .field { display:grid; grid-template-columns:repeat(24,1fr); gap:5px; padding:27px 0 25px; }
  .field i { aspect-ratio:1; border-radius:50%; background:color-mix(in srgb,var(--muted) 30%,transparent); }
  .field i.selected { background:var(--accent); box-shadow:0 0 0 2px var(--surface),0 0 0 3px var(--accent); }
  figcaption { margin:0; padding-top:15px; border-top:1px solid var(--rule); color:var(--muted); font-size:10px; line-height:1.5; }
  figcaption i { display:inline-block; width:8px; height:8px; margin-right:6px; border-radius:50%; background:var(--accent); }
  @media (max-width:820px) {
    figure { margin-top:38px; padding:20px 16px; }
    .field { gap:4px; padding-block:22px; }
  }
</style>
