<script>
  import { onMount } from "svelte";
  import ScrollyShell from "./lib/components/ScrollyShell.svelte";
  import ElectionMapJourney from "./lib/components/ElectionMapJourney.svelte";
  import GenderScene from "./lib/components/GenderScene.svelte";
  import PartyMandates from "./lib/components/PartyMandates.svelte";
  import PointFlowEnding from "./lib/components/PointFlowEnding.svelte";
  import { districts, districtWinnerCounts, national2022, parties, sources } from "./data/story.js";

  let mapStep = $state(0);
  let genderStep = $state(0);
  let progress = $state(0);

  const districtNotes = [
    "S fick mer än två tredjedelar av de giltiga rösterna.",
    "SD fick egen majoritet bland de giltiga rösterna.",
    "V var störst och MP fick 16,9 procent i samma distrikt.",
  ];

  const mapStatus = $derived([
    "Facit från riksdagsvalet 2022 omfattar Sveriges 6 264 valdistrikt.",
    "Kartan färgas efter största riksdagsparti i varje valdistrikt 2022.",
    `Kartan zoomar till ${districts[0].short} i ${districts[0].municipality}.`,
    `${districts[0].short} jämförs med hela landets valresultat.`,
    ...districts.slice(1).map((district) => `Kartan zoomar till ${district.short} i ${district.municipality}.`),
    "Kartan zoomar ut och visar de fyra redaktionellt valda kontrasterna.",
    "Samma 6 264 valdistrikt flyttar från sin geografiska position till en position efter andel 65 år eller äldre och andel med minst treårig eftergymnasial utbildning.",
  ][mapStep]);

  const genderStatus = $derived([
    "Hundra punkter visar partisympatins blandning bland kvinnor och män i SCB:s mätning i maj 2026.",
    "Socialdemokraterna och Sverigedemokraterna markeras eftersom skillnaderna är störst där.",
  ][genderStep]);

  function format(value) {
    return Number(value).toLocaleString("sv-SE", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  }

  function skipToStory(event) {
    event.preventDefault();
    const story = document.getElementById("story");
    if (!story) return;
    history.pushState(null, "", "#story");
    story.scrollIntoView();
    story.focus({ preventScroll: true });
  }

  onMount(() => {
    document.documentElement.classList.add("motion-ready");
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-revealed");
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: .08, rootMargin: "0px 0px -2%" });
    document.querySelectorAll("[data-reveal]").forEach((element) => revealObserver.observe(element));
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      progress = max > 0 ? Math.min(1, window.scrollY / max) : 0;
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      revealObserver.disconnect();
      document.documentElement.classList.remove("motion-ready");
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  });
</script>

{#snippet districtResult(district, compareWithCountry = false)}
  <div class="local-result" aria-label={`Partifördelning och valdeltagande i ${district.short}`}>
    <div class="result-strip" aria-hidden="true">
      {#each parties as party}
        <i style={`--share:${district.result[party.code]};--party:${party.color}`}></i>
      {/each}
    </div>
    <dl>
      {#each parties as party}
        <div><dt style={`--party:${party.color}`}>{party.code}</dt><dd>{format(district.result[party.code])}%</dd></div>
      {/each}
    </dl>
    {#if compareWithCountry}
      <div class="experiment-compare">
        <div><span>M i distriktet</span><strong>{format(district.result.M)}%</strong></div>
        <div><span>M i hela landet</span><strong>{format(national2022.M)}%</strong></div>
        <div class="miss"><span>Skillnad</span><strong>+{format(district.result.M - national2022.M)} p</strong></div>
      </div>
    {/if}
    <p><span>{district.validVotes.toLocaleString("sv-SE")} giltiga röster</span><span>Valdeltagande <strong>{format(district.turnout)}%</strong></span></p>
  </div>
{/snippet}

<a class="skip-link" href="#story" onclick={skipToStory}>Hoppa till berättelsen</a>
<div class="progress" aria-hidden="true"><i style={`transform:scaleX(${progress})`}></i></div>

<header class="hero">
  <div class="hero-inner">
    <div class="hero-copy">
      <p class="eyebrow">Riksdagsvalet 2026</p>
      <p class="campaign-line">Valrörelsen är igång. Debatter, utspel och snart nya opinionsmätningar.</p>
      <h1>Kan några tusen tala för åtta miljoner?</h1>
      <p class="standfirst">Vi provar på ett val där vi redan vet svaret.</p>
      <p class="hero-question">Hur en valundersökning fungerar, varför den ibland missar och vad det betyder inför den 13 september.</p>
    </div>
    <dl class="hero-facts">
      <div>
        <dt>Valdag</dt>
        <dd>13 september</dd>
      </div>
    </dl>
  </div>
</header>

<main id="story" tabindex="-1">
  <section class="party-intro" aria-labelledby="party-intro-title">
    <div class="party-intro-copy" data-reveal>
      <p class="section-index">Ett val med facit</p>
      <h2 id="party-intro-title">Vi börjar 2022</h2>
      <p>Varje punkt är ett mandat. Tillsammans vet vi exakt hur det gick. Nu låtsas vi att svaret fortfarande är okänt.</p>
    </div>
    <div class="party-intro-visual"><PartyMandates /></div>
  </section>

  <section class="map-opening prose-section" data-reveal aria-labelledby="map-title">
    <p class="section-index">Experimentet</p>
    <h2 id="map-title">Det borde väl räcka att fråga några?</h2>
    <div class="body-copy">
      <p>Vi tar ett valdistrikt och låter rösterna där tala för Sverige. Testet är förenklat, men vi har facit i hand.</p>
    </div>
  </section>

  <section class="map-act" aria-label="Scrollstyrd resa genom valresultatet 2022">
    <ScrollyShell variant="overlay" onStepChange={(index) => mapStep = index} label="Ett experiment från hela Sverige till ett distrikt och tillbaka" status={mapStatus}>
      {#snippet visual()}<ElectionMapJourney step={mapStep} />{/snippet}

      <article class="map-step" data-step>
        <p class="step-index">1 av 9 · Ny enhet</p>
        <h3>Hela landet består av 6 264 valdistrikt</h3>
        <p>Varje yta är ett valdistrikt i riksdagsvalet 2022. Tillsammans innehåller de svaret som vårt experiment ska försöka återskapa.</p>
      </article>

      <article class="map-step" data-step>
        <p class="step-index">2 av 9 · Hela resultatet</p>
        <h3>Valet såg olika ut över landet</h3>
        <p>S var störst i {districtWinnerCounts.S.toLocaleString("sv-SE")} distrikt, SD i {districtWinnerCounts.SD.toLocaleString("sv-SE")}, M i {districtWinnerCounts.M.toLocaleString("sv-SE")}, V i {districtWinnerCounts.V}, KD i {districtWinnerCounts.KD} och MP i {districtWinnerCounts.MP}. I {districtWinnerCounts.ties} distrikt delade två partier förstaplatsen.</p>
      </article>

      <article class="map-step map-reading-step" data-step>
        <p class="step-index">3 av 9 · Vårt urval</p>
        <h3>Vi frågar i Södra Djursholm</h3>
        <p>Nu blir varje distrikt en punkt vars storlek följer antalet giltiga röster. Mark röstar inte. I Södra Djursholm avgavs 904 röster, varav 902 var giltiga. Vi jämför partifördelningen bland de giltiga rösterna med facit.</p>
      </article>

      <article class="map-step district-step surprise-step" data-step>
        <p class="step-index">4 av 9 · Experimentets svar</p>
        <h3>Vårt svar missar med 39,3 procentenheter</h3>
        {@render districtResult(districts[0], true)}
        <p>M fick 58,4 procent här men 19,1 procent i hela landet. Ett lokalt resultat blev ett dåligt svar på den nationella frågan.</p>
      </article>

      {#each districts.slice(1) as district, index}
        <article class="map-step district-step" data-step>
          <p class="step-index">{index + 5} av 9 · Fler platser · {district.municipality}</p>
          <h3>{district.short}</h3>
          {@render districtResult(district)}
          <p>{districtNotes[index]}</p>
        </article>
      {/each}

      <article class="map-step conclusion-step" data-step>
        <p class="step-index">8 av 9 · Hela landet igen</p>
        <h3>Fyra lokala svar pekar åt olika håll</h3>
        <p>Stoppen är medvetet valda som kontraster. De visar inte hur vanliga resultaten är. I ett sannolikhetsurval behöver människor över hela målpopulationen kunna dras med en känd sannolikhet.</p>
      </article>

      <article class="map-step scatter-step" data-step>
        <p class="step-index">9 av 9 · Samma distrikt, ny position</p>
        <h3>Geografin blir en demografisk karta</h3>
        <p>Varje punkt är fortfarande samma valdistrikt. Nu visar positionen andelen 65 år eller äldre och andelen med minst treårig eftergymnasial utbildning. De fyra stoppen hamnar på olika platser även här.</p>
      </article>
    </ScrollyShell>
  </section>

  <section class="gender-act" aria-labelledby="gender-title">
    <div class="act-head" data-reveal>
      <p class="section-index">Vilka som ingår spelar roll</p>
      <h2 id="gender-title">Kvinnor och män har olika partisympatier</h2>
      <p>I SCB:s mätning i maj skilde sig blandningen mellan könen. Det visar varför sammansättningen i ett urval spelar roll.</p>
    </div>
    <ScrollyShell onStepChange={(index) => genderStep = index} label="Partisympatins blandning bland kvinnor och män" status={genderStatus}>
      {#snippet visual()}<GenderScene step={genderStep} />{/snippet}
      <article class="gender-step" data-step>
        <p class="step-index">1 av 2 · Två blandningar</p>
        <h3>Hundra punkter på varje sida</h3>
        <p>Varje punkt är ungefär en procentenhet. Samma partifärger, men inte samma proportioner.</p>
      </article>
      <article class="gender-step" data-step>
        <p class="step-index">2 av 2 · De största skillnaderna</p>
        <h3>S och SD drar åt varsitt håll</h3>
        <p>S hade högre sympati bland kvinnor och SD bland män. Skillnader fanns också för M, V och MP. Om den ena gruppen blir överrepresenterad måste det hanteras i beräkningen.</p>
      </article>
    </ScrollyShell>
  </section>

  <section class="poll-reading" aria-labelledby="poll-reading-title">
    <div class="poll-reading-head" data-reveal>
      <p class="section-index">Så gör man i verkligheten</p>
      <h2 id="poll-reading-title">Från åtta miljoner till några tusen</h2>
      <p>SCB:s mätning i maj visar både att det går och varför det fortfarande är klurigt.</p>
    </div>
    <PointFlowEnding />
    <div class="poll-coda" data-reveal>
      <p><strong>Först urvalet.</strong> Personerna dras ur hela målpopulationen. Då får inte ett enskilt distrikt, en viss ålder eller ett kön dominera bara för att de råkar vara lättast att nå.</p>
      <p><strong>Sedan bortfallet.</strong> 4 542 av 9 260 utvalda svarade. SCB viktar svaren med hjälp av kända skillnader, men en vikt kan inte berätta exakt vad de andra skulle ha svarat.</p>
    </div>
  </section>

  <section class="closing prose-section" data-reveal aria-labelledby="closing-title">
    <p class="section-index">Valnatten</p>
    <h2 id="closing-title">Blir det spännande ändå?</h2>
    <div class="body-copy">
      <p>Ja. Om flera bra mätningar pekar åt samma håll kan vi vara ganska trygga med riktningen. Men mätningarna visar läget när frågan ställdes, inte hur valresultatet måste bli.</p>
      <p>När skillnaderna är små finns spänningen kvar. Den 13 september räknas röster i stället för svar.</p>
    </div>
  </section>

  <section class="method" aria-labelledby="method-title">
    <div>
      <p class="section-index">Metod och källor</p>
      <h2 id="method-title" data-reveal>Vad siffrorna betyder</h2>
      <ul>
        <li><strong>Valet 2026.</strong> Valdagen är 13 september. Antalet 8 046 725 gäller röstberättigade till riksdagen på kvalifikationsdagen 14 augusti 2026. Rättelser fram till valdagen kan påverka den slutliga statistiken. <a href={sources.election2026}>Valmyndighetens rådata</a> och <a href={sources.election2026Press}>pressmeddelande om röstlängden</a>.</li>
        <li><strong>Valet 2022 som experiment.</strong> Hela landets röstandelar var S 30,33, SD 20,54, M 19,10, V 6,75, C 6,71, KD 5,34, MP 5,08, L 4,61 och övriga 1,54 procent. Mandatfördelningen var S 107, SD 73, M 68, V 24, C 24, KD 19, MP 18 och L 16. Distriktsstoppen är redaktionellt valda kontraster, inte ett urval. <a href={sources.election2022Summary}>Valmyndighetens valresultat 2022</a>.</li>
        <li><strong>Distriktskartan.</strong> Geometrin kommer från Valmyndighetens <a href={sources.election2022}>21 länsvisa GIS-filer</a>. Partandel, giltiga röster och valdeltagande räknas från myndighetens <a href={sources.election2022DistrictResults}>slutliga distriktsfil</a>. Samtliga 6 264 geometrier har matchats mot resultatfilen. Kartan använder Web Mercator. Först fylls distriktet med färgen för största parti, därefter blir varje distrikt en punkt vars yta följer antalet giltiga röster. Punktens läge är polygonens ytcentroid. Sexton distrikt hade delad förstaplats; där väljs kartfärgen deterministiskt efter alfabetisk partikod. Principen bakom skillnaden mellan landyta och väljare illustreras också i <a href={sources.cartogramPrinciple}>ArcGIS StoryMaps genomgång av valkartor och befolkning</a>.</li>
        <li><strong>Karta till spridningsdiagram.</strong> Samma 6 264 distrikt behåller sin identitet i övergången. Andel 65+ är <code>A_65__år / A_TOTålde</code>. Utbildningsmåttet är andelen röstberättigade med minst treårig eftergymnasial utbildning, <code>UTB_Lång_ / UTB_TOTutb</code>, från <a href={sources.scbDistrictTool}>SCB:s valanalysverktyg</a> och dess <a href={sources.districtProfiles}>ArcGIS-lager</a>. Baserna är fältspecifika. Diagrammet beskriver områden och visar inte hur en enskild person röstade eller att ålder och utbildning orsakar ett valresultat.</li>
        <li><strong>SCB:s partisympati och bortfall.</strong> Värden och osäkerhetstal för kvinnor och män kommer från SCB:s tabell för maj 2026 och gäller bland dem som uppgav en partisympati. Undersökningen drog 9 260 röstberättigade och fick 4 542 svar, ett individbortfall på 51,0 procent. Bortfallet varierade mellan grupper, bland annat 62,4 procent bland 18–24-åringar och 43,8 procent bland 65–74-åringar. I skattningen använde SCB kön gånger ålder, region, utbildning, födelseland och partival 2022 som hjälpinformation. Måttet skiljer sig från frågan hur man skulle rösta om det vore val i dag. Slutfigurens ”drygt 8 miljoner” beskriver målpopulationens storleksordning vid mättillfället; Valmyndighetens exakta 8 046 725 gäller först kvalifikationsdagen i augusti. <a href={sources.scb2026}>SCB, maj 2026</a>. SCB beskriver också hur bortfallet har ökat över tid och hur viktning kompenserar för en del av skevheten i sina <a href={sources.scbFaq}>frågor och svar om PSU</a>.</li>
        <li><strong>Sannolikhetsurval och paneler.</strong> Berättelsens designbaserade exempel kräver en känd urvalssannolikhet. Icke-sannolikhetsurval, som opt-in-paneler, kan också ge användbara och ibland jämförbara resultat. Då kan en vanlig urvalsfelmarginal inte beräknas på samma sätt; bedömningen vilar i stället på rekrytering, statistisk modellering, viktning och transparent metodredovisning. <a href={sources.aapor}>AAPOR:s metodöversikt</a>.</li>
      </ul>
    </div>
  </section>
</main>

<footer>
  <p>Om opinionsundersökningar inför riksdagsvalet 2026.</p>
  <a href="https://plainx.dev/">Fler berättelser på (<i>x</i>)plain</a>
</footer>
