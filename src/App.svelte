<script>
  import { onMount } from "svelte";
  import ScrollyShell from "./lib/components/ScrollyShell.svelte";
  import ElectionMapJourney from "./lib/components/ElectionMapJourney.svelte";
  import GenderScene from "./lib/components/GenderScene.svelte";
  import SamplingStory from "./lib/components/SamplingStory.svelte";
  import PopulationIntro from "./lib/components/PopulationIntro.svelte";
  import PartyMandates from "./lib/components/PartyMandates.svelte";
  import DistrictDotProfiles from "./lib/components/DistrictDotProfiles.svelte";
  import PointFlowEnding from "./lib/components/PointFlowEnding.svelte";
  import { districts, districtWinnerCounts, parties, sources } from "./data/story.js";

  let mapStep = $state(0);
  let genderStep = $state(0);
  let samplingStep = $state(0);
  let progress = $state(0);

  const districtNotes = [
    "M fick egen majoritet bland de giltiga rösterna.",
    "S fick mer än två tredjedelar av de giltiga rösterna.",
    "SD fick egen majoritet bland de giltiga rösterna.",
    "V var störst och MP fick 16,9 procent i samma distrikt.",
  ];

  const mapStatus = $derived([
    "Sveriges 6 264 valdistrikt visas utan resultat.",
    "Kartan färgas efter största riksdagsparti i varje valdistrikt 2022.",
    "Valdistrikten visas som punkter vars storlek följer antalet giltiga röster.",
    ...districts.map((district) => `Kartan zoomar till ${district.short} i ${district.municipality}.`),
    "Kartan zoomar ut och visar alla fyra stoppen.",
  ][mapStep]);

  const genderStatus = $derived([
    "SCB:s partisympati i maj 2026 visas för alla åtta riksdagspartier, uppdelat på kvinnor och män.",
    "Fem partier med tydliga könsskillnader markeras.",
  ][genderStep]);

  const samplingStatus = $derived([
    "En fiktiv urvalsram med 10 000 personer visas efter ålder och typ av boendeort.",
    "Ett slumpmässigt urval på 1 000 personer markeras över hela urvalsramen.",
    "Urvalets fördelning av kön, ålder, boendeort och utbildning jämförs med populationen.",
    "Tjugo slumpurval ger närliggande men olika skattningar av ett fiktivt partistöd.",
    "Bortfall kan ändra sammansättningen bland de svarande. Viktning kan justera kända skillnader.",
  ][samplingStep]);

  function format(value) {
    return Number(value).toLocaleString("sv-SE", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
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
    }, { threshold: .16, rootMargin: "0px 0px -7%" });
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

{#snippet districtResult(district)}
  <div class="local-result" aria-label={`Partifördelning och valdeltagande i ${district.short}`}>
    <div class="result-strip" aria-hidden="true">
      {#each parties as party}
        <i style={`--share:${district.result[party.code]};--party:${party.color}`}></i>
      {/each}
    </div>
    <dl>
      {#each parties as party}
        <div><dt style={`--party:${party.color}`}>{party.code}</dt><dd>{format(district.result[party.code])}</dd></div>
      {/each}
    </dl>
    <p><span>Valdeltagande</span><strong>{format(district.turnout)}%</strong></p>
  </div>
{/snippet}

<a class="skip-link" href="#story">Hoppa till berättelsen</a>
<div class="progress" aria-hidden="true"><i style={`transform:scaleX(${progress})`}></i></div>

<header class="hero">
  <div class="hero-inner">
    <div class="hero-copy">
      <p class="eyebrow">Riksdagsvalet 2026</p>
      <h1><span>Kan vi lita på</span>{" "}<span class="long-title">valundersökningarna?</span></h1>
      <p class="standfirst">Det är snart dags för riksdagsval. Debatten hårdnar och nya opinionsundersökningar publiceras löpande.</p>
      <p class="hero-question">Drygt åtta miljoner människor får rösta. De flesta undersökningar frågar bara några tusen. Hur kan deras svar säga något om hela väljarkåren?</p>
    </div>
    <PopulationIntro />
    <dl class="hero-facts">
      <div>
        <dt>Röstberättigade till riksdagen på kvalifikationsdagen 2026</dt>
        <dd>8&nbsp;046&nbsp;725</dd>
      </div>
      <div>
        <dt>Valdag</dt>
        <dd>13 september</dd>
      </div>
    </dl>
  </div>
</header>

<main id="story">
  <section class="party-intro" aria-labelledby="party-intro-title">
    <div class="party-intro-copy" data-reveal>
      <p class="section-index">Riksdagen efter valet 2022</p>
      <h2 id="party-intro-title">Åtta partier delade på 349 mandat</h2>
      <p>I valet 2022 fick Socialdemokraterna flest mandat, följt av Sverigedemokraterna och Moderaterna. Tillsammans fyllde de åtta partierna riksdagens 349 platser.</p>
    </div>
    <div class="party-intro-visual"><PartyMandates /></div>
  </section>

  <section class="map-opening prose-section" data-reveal aria-labelledby="map-title">
    <p class="section-index">Ett första tankeexperiment</p>
    <h2 id="map-title">Kan några platser representera Sverige?</h2>
    <div class="body-copy">
      <p>Vi skulle kunna resa till ett antal valdistrikt och fråga människor där. Det verkar rimligare än att stå på ett enda torg, men platsvalet styr fortfarande vilka vi möter.</p>
      <p>I valet 2022 tog åtta partier plats i riksdagen. Kartan visar vilket av dem som var störst i vart och ett av landets 6 264 valdistrikt och stannar vid fyra verkliga resultat.</p>
    </div>
  </section>

  <section class="map-act" aria-label="Scrollstyrd resa genom valresultatet 2022">
    <ScrollyShell variant="overlay" onStepChange={(index) => mapStep = index} label="Från hela Sverige till fyra kontrasterande valdistrikt" status={mapStatus}>
      {#snippet visual()}<ElectionMapJourney step={mapStep} />{/snippet}

      <article class="map-step" data-step>
        <p class="step-index">1 av 8 · Hela landet</p>
        <h3>Sverige hade 6 264 valdistrikt</h3>
        <p>Varje yta är ett valdistrikt från valet 2022. Distrikten är administrativa områden och innehåller inte lika många väljare.</p>
      </article>

      <article class="map-step" data-step>
        <p class="step-index">2 av 8 · Valresultatet</p>
        <h3>Olika partier var störst på olika håll</h3>
        <p>S var störst i {districtWinnerCounts.S.toLocaleString("sv-SE")} distrikt, SD i {districtWinnerCounts.SD.toLocaleString("sv-SE")} och M i {districtWinnerCounts.M.toLocaleString("sv-SE")}. V, KD och MP var störst i ytterligare 51.</p>
      </article>

      <article class="map-step map-reading-step" data-step>
        <p class="step-index">3 av 8 · Så läses kartan</p>
        <h3>Marken drar ihop sig till väljarnas distrikt</h3>
        <p>Nu blir varje valdistrikt en punkt. Punktens yta följer antalet giltiga röster och färgen visar största parti. Stora landområden får inte längre automatiskt störst plats. Mark röstar inte. Människor gör det.</p>
      </article>

      {#each districts as district, index}
        <article class="map-step district-step" data-step>
          <p class="step-index">{index + 4} av 8 · {district.municipality}</p>
          <h3>{district.short}</h3>
          {@render districtResult(district)}
          <p>{districtNotes[index]}</p>
        </article>
      {/each}

      <article class="map-step conclusion-step" data-step>
        <p class="step-index">8 av 8 · Hela landet igen</p>
        <h3>Ingen av platserna beskriver landet som helhet</h3>
        <p>Alla fyra resultaten är korrekta. Hur vanligt varje mönster är i väljarkåren går inte att avgöra från stoppen. En opinionsundersökning kan därför inte bygga på handplockade platser.</p>
      </article>
    </ScrollyShell>
  </section>

  <section class="profiles profiles-compact" aria-labelledby="profiles-title">
    <div class="profiles-head" data-reveal>
      <p class="section-index">Skillnader mellan platser</p>
      <h2 id="profiles-title">Vilka vi möter beror på var vi frågar</h2>
      <p>Ålder, utbildning och boendeort hänger på gruppnivå ihop med partisympatier. Därför kan platsen påverka vilka svar en undersökare får.</p>
    </div>
    <div data-reveal><DistrictDotProfiles {districts} /></div>
    <div class="profiles-notes" data-reveal>
      <p><strong>Stad och land.</strong> En studie av valen 1976–2022 finner att skillnaden överlag har minskat, samtidigt som SD i de senaste valen haft tydligt starkare stöd på landsbygden.</p>
      <p><strong>Områdesdata.</strong> Uppgifterna beskriver distrikten. De visar inte varför en enskild väljare röstade på ett visst parti.</p>
    </div>
  </section>

  <section class="gender-act" aria-labelledby="gender-title">
    <div class="act-head" data-reveal>
      <p class="section-index">Kön och politiska preferenser</p>
      <h2 id="gender-title">Kvinnor och män uppger olika partisympatier</h2>
      <p>I SCB:s partisympatiundersökning från maj 2026 fanns tydliga skillnader mellan kvinnor och män för fem partier. Det spelar roll även i ett urval som är väl spritt över landet.</p>
      <p class="measure-note">SCB frågar vilket parti man tycker bäst om. Det är inte samma sak som frågan vilket parti man skulle rösta på om det vore val i dag.</p>
    </div>
    <ScrollyShell onStepChange={(index) => genderStep = index} label="Det politiska könsgapet" status={genderStatus}>
      {#snippet visual()}<GenderScene step={genderStep} />{/snippet}
      <article class="gender-step" data-step>
        <p class="step-index">1 av 2 · Partisympati i maj 2026</p>
        <h3>Skillnaderna måste jämföras med osäkerheten</h3>
        <p>Punkterna visar SCB:s skattningar bland kvinnor och män. De tunna linjerna visar publicerade osäkerhetstal. Undergrupperna bygger på 2 201 respektive 2 340 svar.</p>
      </article>
      <article class="gender-step" data-step>
        <p class="step-index">2 av 2 · Tydliga skillnader</p>
        <h3>Skillnaden går åt olika håll mellan partierna</h3>
        <p>S, V och MP hade högre sympati bland kvinnor. M och SD hade högre sympati bland män. För C, L och KD redovisade SCB ingen tydlig könsskillnad.</p>
      </article>
    </ScrollyShell>
  </section>

  <section class="sampling-act" aria-labelledby="sample-title">
    <div class="act-head" data-reveal>
      <p class="section-index">Sannolikhetsurval</p>
      <h2 id="sample-title">Urvalet ska ge alla en känd chans att komma med</h2>
      <p>En undersökare börjar med en urvalsram som så långt som möjligt täcker väljarkåren. Sedan dras personer slumpmässigt. Det gör inte varje urval perfekt, men det gör slumpvariationen möjlig att beräkna.</p>
    </div>
    <ScrollyShell onStepChange={(index) => samplingStep = index} label="Så fungerar ett sannolikhetsurval" status={samplingStatus}>
      {#snippet visual()}<SamplingStory step={samplingStep} />{/snippet}
      <article class="sampling-step" data-step>
        <p class="step-index">1 av 5 · Urvalsramen</p>
        <h3>Först bestäms vilka som kan väljas</h3>
        <p>Den fiktiva populationen innehåller 10 000 personer. Punktfältet ordnar dem efter ålder och boendeort. I beräkningen har varje person också kön och utbildningsnivå.</p>
      </article>
      <article class="sampling-step" data-step>
        <p class="step-index">2 av 5 · Slumpdragningen</p>
        <h3>Urvalet hämtas från hela ramen</h3>
        <p>Här dras 1 000 personer utan återläggning. Markeringarna sprids över åldrar och boendeorter eftersom varje person hade samma chans att väljas.</p>
      </article>
      <article class="sampling-step" data-step>
        <p class="step-index">3 av 5 · Sammansättningen</p>
        <h3>Urvalet liknar helheten, men inte exakt</h3>
        <p>Fördelningen av kön, ålder, boendeort och utbildning hamnar nära populationens. Skillnaderna är små i just den här dragningen. Ett nytt urval skulle avvika på andra sätt.</p>
      </article>
      <article class="sampling-step" data-step>
        <p class="step-index">4 av 5 · Slumpvariationen</p>
        <h3>Varje urval ger en ny skattning</h3>
        <p>I populationen är det fiktiva partistödet exakt 30 procent. Tjugo urval hamnar omkring det värdet, inte på samma decimal. Det är den variation som felmarginalen beskriver.</p>
      </article>
      <article class="sampling-step" data-step>
        <p class="step-index">5 av 5 · Bortfall och viktning</p>
        <h3>Slumpen löser inte allt</h3>
        <p>De som svarar kan skilja sig från dem som valdes. Viktning kan korrigera kända obalanser i exempelvis kön, ålder, utbildning och region. Skillnader som inte har mätts kan finnas kvar.</p>
      </article>
    </ScrollyShell>
  </section>

  <section class="poll-reading" aria-labelledby="poll-reading-title">
    <div class="poll-reading-head" data-reveal>
      <p class="section-index">Tillbaka genom hela berättelsen</p>
      <h2 id="poll-reading-title">Följ punkterna bakåt</h2>
      <p>En publicerad procentsiffra är den sista länken i en kedja. För att bedöma den behöver vi gå åt andra hållet, från estimatet tillbaka till människorna som undersökningen vill beskriva.</p>
    </div>
    <div data-reveal><PointFlowEnding /></div>
    <div class="ending-reading" data-reveal>
      <section>
        <p class="section-index">Det slumpen kan beskriva</p>
        <h3>Hur mycket ett nytt urval skulle kunna flytta siffran</h3>
        <p>Vid ett sannolikhetsurval går slumpvariationen att beräkna. Det är den del av osäkerheten som felmarginalen fångar.</p>
      </section>
      <section>
        <p class="section-index">Det som kan ligga kvar</p>
        <h3>Vilka som saknas, avstår eller missförstår frågan</h3>
        <p>Täckningsfel, bortfall och mätfel försvinner inte för att urvalet är stort. Viktning hjälper mot kända skillnader, men inte mot allt som aldrig mättes.</p>
      </section>
    </div>
  </section>

  <section class="closing prose-section" data-reveal aria-labelledby="closing-title">
    <p class="section-index">Slutsats</p>
    <h2 id="closing-title">Tillit sitter i hela kedjan</h2>
    <div class="body-copy">
      <p>En välgjord valundersökning kan ge en användbar bild av opinionen när intervjuerna genomfördes. Tilliten kommer inte från en enskild decimal. Den kommer från en transparent väg mellan väljarkåren och resultatet.</p>
      <p>Fråga vilka som kunde väljas, vilka som svarade och hur svaren justerades. Titta sedan på flera mätningar över tid. En mätning är ett ögonblick, inte valdagen i förväg.</p>
    </div>
  </section>

  <section class="method" aria-labelledby="method-title">
    <div>
      <p class="section-index">Metod och källor</p>
      <h2 id="method-title" data-reveal>Vad siffrorna betyder</h2>
      <ul>
        <li><strong>Valet 2026.</strong> Valdagen är 13 september. Antalet 8 046 725 gäller röstberättigade till riksdagen på kvalifikationsdagen 14 augusti 2026. Valmyndigheten kan rätta röstlängden fram till valdagen. <a href={sources.election2026}>Valmyndighetens rådata 2026</a>.</li>
        <li><strong>Riksdagens 349 mandat.</strong> Mandatfördelningen efter valet 2022 var S 107, SD 73, M 68, V 24, C 24, KD 19, MP 18 och L 16. <a href={sources.election2022Summary}>Valmyndighetens valresultat 2022</a>.</li>
        <li><strong>Distriktskartan.</strong> Geometrin kommer från Valmyndighetens <a href={sources.election2022}>21 länsvisa GIS-filer</a>. Partandel, giltiga röster och valdeltagande räknas från myndighetens <a href={sources.election2022DistrictResults}>slutliga distriktsfil</a>. Samtliga 6 264 geometrier har matchats mot resultatfilen. Kartan använder Web Mercator. Först fylls hela distriktet med färgen för största parti, vilket ger stora landområden stor visuell vikt. Därefter blir varje distrikt en punkt vars yta följer antalet giltiga röster. Punktens läge är distriktets geometriska mitt och ska läsas som en nationell översikt, inte som en exakt befolkningsadress. Principen bakom skillnaden mellan landyta och väljare illustreras också i <a href={sources.cartogramPrinciple}>ArcGIS StoryMaps genomgång av valkartor och befolkning</a>. Kortens lokala fördelning redovisar även övriga partier tillsammans.</li>
        <li><strong>Områdesprofiler.</strong> Andel 65+ är <code>A_65__år / A_TOTålde</code> och lång utbildning <code>UTB_Lång_ / UTB_TOTutb</code> från <a href={sources.scbDistrictTool}>SCB:s valanalysverktyg</a> och dess <a href={sources.districtProfiles}>ArcGIS-lager</a>. Baserna är fältspecifika. Områdesdata får inte tolkas som egenskaper hos enskilda väljare.</li>
        <li><strong>Stad och land.</strong> Öhrvall, Ó Erlingsson och Wittberg analyserar svenska riksdagsval 1976–2022. De finner ett överlag minskat stad–land-gap men tydligt starkare SD-stöd på landsbygden i de senaste valen. <a href={sources.ruralResearch}>Statsvetenskaplig tidskrift</a>.</li>
        <li><strong>SCB:s partisympati.</strong> Värden och osäkerhetstal för kvinnor och män kommer från SCB:s tabell för maj 2026. Undergrupperna hade 2 201 respektive 2 340 svar. Måttet är partisympati och skiljer sig från frågan hur man skulle rösta om det vore val i dag. <a href={sources.scb2026}>SCB, maj 2026</a>.</li>
        <li><strong>Urvalsexemplet.</strong> Populationen är fiktiv och fast: 10 000 personer med konstruerade fördelningar av kön, ålder, boendeort och utbildning. Ett obundet slumpmässigt urval på 1 000 personer dras utan återläggning. I delen om slumpvariation har exakt 30 procent i populationen ett fiktivt partistöd. 95-procentsmarginalen är <code>1,96 × √(0,3 × 0,7/n) × √((N−n)/(N−1))</code>. Den illustrativa bortfallsdelen visar bara principen för viktning och är inte en skattning av en verklig väljargrupp. <a href={sources.aapor}>AAPOR</a> och <a href={sources.caltech}>Caltech Science Exchange</a> förklarar urval, viktning och felkällor.</li>
        <li><strong>Rörelsereferenser.</strong> Kartans sekvens använder samma metodiska ordning som <a href={sources.gsfReference}>Göteborgs kartberättelse</a>: helhet, färgläggning, kameraflytt, kontrast, utzoomning. Återanvändningen av samma punkter genom olika tillstånd är inspirerad av <a href={sources.puddingReference}>The Puddings demokratiberättelse</a>, medan avsnittsentréerna har <a href={sources.motionReference}>NetMotions rapport</a> som rörelsereferens. Form och kod är projektets egna.</li>
      </ul>
    </div>
  </section>
</main>

<footer>
  <p>Om opinionsundersökningar inför riksdagsvalet 2026.</p>
  <a href="https://plainx.dev/">Fler berättelser på (<i>x</i>)plain</a>
</footer>
