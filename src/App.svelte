<script>
  import { onMount } from "svelte";
  import ScrollyShell from "./lib/components/ScrollyShell.svelte";
  import ElectionMapJourney from "./lib/components/ElectionMapJourney.svelte";
  import GenderScene from "./lib/components/GenderScene.svelte";
  import SamplingStory from "./lib/components/SamplingStory.svelte";
  import PopulationIntro from "./lib/components/PopulationIntro.svelte";
  import PartyMandates from "./lib/components/PartyMandates.svelte";
  import PointFlowEnding from "./lib/components/PointFlowEnding.svelte";
  import { districts, districtWinnerCounts, national2022, parties, sources } from "./data/story.js";

  let mapStep = $state(0);
  let genderStep = $state(0);
  let samplingStep = $state(0);
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
    "Samma 6 264 valdistrikt flyttar från sin geografiska position till en position efter andel 65 år eller äldre och andel med lång utbildning.",
  ][mapStep]);

  const genderStatus = $derived([
    "SCB:s partisympati i maj 2026 visas för alla åtta riksdagspartier, uppdelat på kvinnor och män.",
    "Fem partier med tydliga könsskillnader markeras.",
  ][genderStep]);

  const samplingStatus = $derived([
    "En behållare med färgade kulor visar en population med flera grupper.",
    "Ett urval från ett enda hörn av behållaren får en skev blandning av färger.",
    "Ett slumpmässigt urval på 1 000 personer markeras över hela en fiktiv urvalsram.",
    "Urvalets fördelning av kön, ålder, boendeort och utbildning jämförs med populationen.",
    "Tjugo slumpurval ger närliggande men olika skattningar av ett fiktivt partistöd.",
    "Ett skevt bortfall flyttar ett fiktivt partistöd. Viktning för kön rättar den kända skillnaden i exemplet.",
  ][samplingStep]);

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
    <p><span>Valdeltagande</span><strong>{format(district.turnout)}%</strong></p>
  </div>
{/snippet}

<a class="skip-link" href="#story" onclick={skipToStory}>Hoppa till berättelsen</a>
<div class="progress" aria-hidden="true"><i style={`transform:scaleX(${progress})`}></i></div>

<header class="hero">
  <div class="hero-inner">
    <div class="hero-copy">
      <p class="eyebrow">Riksdagsvalet 2026</p>
      <p class="campaign-line" aria-label="Debatter, utspel, valfjäsk och nya mätningar"><span>Debatter.</span><span>Utspel.</span><span>Valfjäsk.</span><span>Nya mätningar.</span></p>
      <h1><span>Kan några tusen</span>{" "}<span class="long-title">tala för åtta miljoner?</span></h1>
      <p class="standfirst">Varje ny valundersökning påstår sig säga något om hela Sverige. Vi testar hur det är möjligt, och vad som händer när fel människor hamnar i urvalet.</p>
      <p class="hero-question"><strong>Kan vi lita på valundersökningarna?</strong> Först använder vi valet 2022 som ett experiment. Där känner vi redan facit.</p>
    </div>
    <PopulationIntro />
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
      <p class="section-index">Experiment · ett val med facit</p>
      <h2 id="party-intro-title">Vi vet hur Sverige röstade 2022</h2>
      <p>De 349 punkterna visar mandatfördelningen efter valet. Det är vårt facit. Nu gör vi ett medvetet dåligt experiment och försöker återskapa hela landet genom att bara fråga på en plats.</p>
    </div>
    <div class="party-intro-visual"><PartyMandates /></div>
  </section>

  <section class="map-opening prose-section" data-reveal aria-labelledby="map-title">
    <p class="section-index">Vår förutsägelse</p>
    <h2 id="map-title">Vi börjar med ett valdistrikt</h2>
    <div class="body-copy">
      <p>Tänk att rösterna i ett distrikt vore svaren i vår undersökning. Det är ingen riktig opinionsmätning, men ett kontrollerat test: vi känner redan resultatet i hela landet.</p>
      <p>Mandatpunkterna stannar i facit. Här byter vi enhet: varje ny punkt är nu ett av Sveriges 6 264 valdistrikt.</p>
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
        <p>S var störst i {districtWinnerCounts.S.toLocaleString("sv-SE")} distrikt, SD i {districtWinnerCounts.SD.toLocaleString("sv-SE")} och M i {districtWinnerCounts.M.toLocaleString("sv-SE")}. V, KD och MP var störst i ytterligare 51.</p>
      </article>

      <article class="map-step map-reading-step" data-step>
        <p class="step-index">3 av 9 · Vårt urval</p>
        <h3>Vi frågar i Södra Djursholm</h3>
        <p>Nu blir varje distrikt en punkt vars storlek följer antalet giltiga röster. Mark röstar inte. Vi väljer de 904 röstande i Södra Djursholm och jämför deras resultat med facit.</p>
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
        <h3>Fyra korrekta svar pekar åt olika håll</h3>
        <p>Stoppen är medvetet valda som kontraster. De visar inte hur vanliga resultaten är. För att beskriva Sverige måste urvalet hämtas från hela väljarkåren med en känd sannolikhet.</p>
      </article>

      <article class="map-step scatter-step" data-step>
        <p class="step-index">9 av 9 · Samma distrikt, ny position</p>
        <h3>Geografin blir en demografisk karta</h3>
        <p>Varje punkt är fortfarande samma valdistrikt. Nu visar positionen andelen 65 år eller äldre och andelen med lång utbildning. De fyra stoppen hamnar på olika platser även här.</p>
      </article>
    </ScrollyShell>
  </section>

  <section class="gender-act" aria-labelledby="gender-title">
    <div class="act-head" data-reveal>
      <p class="section-index">En annan möjlig skevhet</p>
      <h2 id="gender-title">Ett spritt urval kan ändå bli skevt</h2>
      <p>I SCB:s partisympatiundersökning från maj 2026 skilde sig svaren mellan kvinnor och män för fem partier. Om den ena gruppen blir överrepresenterad bland de svarande kan även partisiffran flytta sig.</p>
      <p class="measure-note">Andelarna gäller bland dem som uppgav ett parti. Övriga partier, 0,9 procent bland kvinnor och 3,2 bland män, visas inte. Av hela urvalet svarade 49 procent; osäkerhetstalen fångar inte systematiska bortfallsfel.</p>
    </div>
    <ScrollyShell onStepChange={(index) => genderStep = index} label="Det politiska könsgapet" status={genderStatus}>
      {#snippet visual()}<GenderScene step={genderStep} />{/snippet}
      <article class="gender-step" data-step>
        <p class="step-index">1 av 2 · Partisympati i maj 2026</p>
        <h3>Skillnaderna måste jämföras med osäkerheten</h3>
        <p>Punkterna visar andelen bland kvinnor respektive män som uppgav ett parti. De tunna linjerna är SCB:s publicerade osäkerhetstal. Undergrupperna bygger på 2 201 respektive 2 340 svar.</p>
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
      <p class="section-index">Så fungerar urvalet</p>
      <h2 id="sample-title">En handfull räcker, om den dras rätt</h2>
      <p>En liten del kan säga något om helheten. Men då måste hela populationen kunna bli vald, och vi måste skilja vanlig slumpvariation från ett systematiskt skevt urval.</p>
    </div>
    <ScrollyShell onStepChange={(index) => samplingStep = index} label="Så fungerar ett sannolikhetsurval" status={samplingStatus}>
      {#snippet visual()}<SamplingStory step={samplingStep} />{/snippet}
      <article class="sampling-step" data-step>
        <p class="step-index">1 av 6 · Hela blandningen</p>
        <h3>Populationen innehåller flera grupper</h3>
        <p>Kulorna är en analogi för väljarkåren. Färgerna är inte partier. De visar bara att populationen består av grupper som kan svara olika.</p>
      </article>
      <article class="sampling-step" data-step>
        <p class="step-index">2 av 6 · Ett hörn</p>
        <h3>En handfull kan bli systematiskt skev</h3>
        <p>Om vi bara tar kulor från ena sidan får alla inte samma chans att komma med. Det liknar att låta ett enda valdistrikt tala för hela landet.</p>
      </article>
      <article class="sampling-step" data-step>
        <p class="step-index">3 av 6 · Slumpdragningen</p>
        <h3>Urvalet hämtas från hela ramen</h3>
        <p>Nu lämnar vi analogin. I den fiktiva urvalsramen dras 1 000 personer utan återläggning. Markeringarna sprids över åldrar och boendeorter eftersom varje person hade samma chans att väljas.</p>
      </article>
      <article class="sampling-step" data-step>
        <p class="step-index">4 av 6 · Sammansättningen</p>
        <h3>Urvalet hamnar nära helheten</h3>
        <p>Fördelningen av kön, ålder, boendeort och utbildning hamnar nära populationens. Skillnaderna är små i just den här dragningen. Ett nytt urval skulle avvika på andra sätt.</p>
      </article>
      <article class="sampling-step" data-step>
        <p class="step-index">5 av 6 · Slumpvariationen</p>
        <h3>Varje urval ger en ny skattning</h3>
        <p>I populationen är det fiktiva partistödet exakt 30 procent. Tjugo urval hamnar omkring det värdet, inte på samma decimal. Det är den variation som felmarginalen beskriver.</p>
      </article>
      <article class="sampling-step" data-step>
        <p class="step-index">6 av 6 · Bortfall och viktning</p>
        <h3>Skevheten flyttar partisiffran</h3>
        <p>I exemplet skiljer sig stödet mellan kvinnor och män. När kvinnor blir överrepresenterade bland de svarande sjunker skattningen från populationens 30,0 till 27,3 procent. Viktning för kön rättar just den kända skillnaden.</p>
      </article>
    </ScrollyShell>
  </section>

  <section class="poll-reading" aria-labelledby="poll-reading-title">
    <div class="poll-reading-head" data-reveal>
      <p class="section-index">När du läser en mätning</p>
      <h2 id="poll-reading-title">Så bedömer du en publicerad mätning</h2>
      <p>Kartan visade varför platsvalet kan ge fel svar. Könsskillnaden visade varför geografisk spridning inte räcker. Nu följer vi den publicerade siffran tillbaka genom hela urvalskedjan.</p>
    </div>
    <div data-reveal><PointFlowEnding /></div>
    <div class="ending-reading" data-reveal>
      <section>
        <p class="section-index">Det slumpen kan beskriva</p>
        <h3>Hur mycket ett nytt slumpurval kan flytta siffran</h3>
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
    <p class="section-index">Svar på frågan</p>
    <h2 id="closing-title">Ja, om vägen från väljare till siffra håller</h2>
    <div class="body-copy">
      <p>En välgjord undersökning kan säga något om hur väljarkåren ser på partierna inför den 13 september. Den behöver börja i hela målpopulationen, dra ett känt urval och redovisa bortfall och viktning.</p>
      <p>Den beskriver opinionen när frågorna ställdes. Händelser fram till valdagen kan fortfarande ändra resultatet, därför är flera mätningar över tid mer användbara än en ensam decimal.</p>
    </div>
  </section>

  <section class="method" aria-labelledby="method-title">
    <div>
      <p class="section-index">Metod och källor</p>
      <h2 id="method-title" data-reveal>Vad siffrorna betyder</h2>
      <ul>
        <li><strong>Valet 2026.</strong> Valdagen är 13 september. Antalet 8 046 725 gäller röstberättigade till riksdagen på kvalifikationsdagen 14 augusti 2026. Valmyndigheten kan rätta röstlängden fram till valdagen. <a href={sources.election2026}>Valmyndighetens rådata 2026</a>.</li>
        <li><strong>Valet 2022 som experiment.</strong> Hela landets röstandelar var S 30,33, SD 20,54, M 19,10, V 6,75, C 6,71, KD 5,34, MP 5,08, L 4,61 och övriga 1,54 procent. Mandatfördelningen var S 107, SD 73, M 68, V 24, C 24, KD 19, MP 18 och L 16. Distriktsstoppen är redaktionellt valda kontraster, inte ett urval. <a href={sources.election2022Summary}>Valmyndighetens valresultat 2022</a>.</li>
        <li><strong>Distriktskartan.</strong> Geometrin kommer från Valmyndighetens <a href={sources.election2022}>21 länsvisa GIS-filer</a>. Partandel, giltiga röster och valdeltagande räknas från myndighetens <a href={sources.election2022DistrictResults}>slutliga distriktsfil</a>. Samtliga 6 264 geometrier har matchats mot resultatfilen. Kartan använder Web Mercator. Först fylls hela distriktet med färgen för största parti, därefter blir varje distrikt en punkt vars yta följer antalet giltiga röster. Punktens läge är distriktets geometriska mitt. Principen bakom skillnaden mellan landyta och väljare illustreras också i <a href={sources.cartogramPrinciple}>ArcGIS StoryMaps genomgång av valkartor och befolkning</a>.</li>
        <li><strong>Karta till spridningsdiagram.</strong> Samma 6 264 distrikt behåller sin identitet i övergången. Andel 65+ är <code>A_65__år / A_TOTålde</code> och lång utbildning <code>UTB_Lång_ / UTB_TOTutb</code> från <a href={sources.scbDistrictTool}>SCB:s valanalysverktyg</a> och dess <a href={sources.districtProfiles}>ArcGIS-lager</a>. Baserna är fältspecifika. Diagrammet beskriver områden och visar inte hur en enskild person röstade eller att ålder och utbildning orsakar ett valresultat.</li>
        <li><strong>SCB:s partisympati och bortfall.</strong> Värden och osäkerhetstal för kvinnor och män kommer från SCB:s tabell för maj 2026 och gäller bland dem som uppgav en partisympati. Undersökningen drog 9 260 röstberättigade och fick 4 542 svar, ett individbortfall på 51,0 procent. Bortfallet varierade mellan grupper, bland annat 62,4 procent bland 18–24-åringar och 43,8 procent bland 65–74-åringar. I skattningen använde SCB kön gånger ålder, region, utbildning, födelseland och partival 2022 som hjälpinformation. Måttet skiljer sig från frågan hur man skulle rösta om det vore val i dag. <a href={sources.scb2026}>SCB, maj 2026</a>. SCB beskriver också hur bortfallet har ökat över tid och hur viktning kompenserar för en del av skevheten i sina <a href={sources.scbFaq}>frågor och svar om PSU</a>.</li>
        <li><strong>Urvalsexemplet.</strong> Kulorna och populationen är fiktiva. Kulornas färger betyder grupper, inte partier. Beräkningen använder 10 000 konstruerade personer och ett obundet slumpmässigt urval på 1 000 utan återläggning. Exakt 30 procent stöder det fiktiva partiet, men stödet är konstruerat till 18,0 procent bland kvinnor och 42,5 bland män. I bortfallsexemplet utgör kvinnor 62 procent av de svarande. Den oviktade skattningen blir då 27,3 procent och återgår till 30,0 när den enda inbyggda skevheten viktas efter kön. Verkliga vikter kan inte rätta okända skillnader. Punktfältet använder 500 symbolpunkter där varje punkt motsvarar ungefär 20 personer. 95-procentsmarginalen är <code>1,96 × √(0,3 × 0,7/n) × √((N−n)/(N−1))</code>. <a href={sources.aapor}>AAPOR</a> och <a href={sources.caltech}>Caltech Science Exchange</a> förklarar urval, viktning och felkällor.</li>
        <li><strong>Rörelsereferenser.</strong> Kartans sekvens använder samma metodiska ordning som <a href={sources.gsfReference}>Göteborgs kartberättelse</a>: helhet, färgläggning, kameraflytt, kontrast, utzoomning. Återanvändningen av samma punkter genom olika tillstånd är inspirerad av <a href={sources.puddingReference}>The Puddings demokratiberättelse</a>, medan avsnittsentréerna har <a href={sources.motionReference}>NetMotions rapport</a> som rörelsereferens. Form och kod är projektets egna.</li>
      </ul>
    </div>
  </section>
</main>

<footer>
  <p>Om opinionsundersökningar inför riksdagsvalet 2026.</p>
  <a href="https://plainx.dev/">Fler berättelser på (<i>x</i>)plain</a>
</footer>
