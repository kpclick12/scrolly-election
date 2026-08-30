<script>
  import { onMount } from "svelte";
  import ScrollyShell from "./lib/components/ScrollyShell.svelte";
  import LiberalHistory from "./lib/components/LiberalHistory.svelte";
  import SeatCliff from "./lib/components/SeatCliff.svelte";
  import CoordinationGame from "./lib/components/CoordinationGame.svelte";
  import DonorJourney from "./lib/components/DonorJourney.svelte";
  import EvidenceJourney from "./lib/components/EvidenceJourney.svelte";
  import { recentLPolls, sources } from "./data/story.js";

  let seatStep = $state(0);
  let gameStep = $state(0);
  let donorStep = $state(0);
  let evidenceStep = $state(0);
  let progress = $state(0);
  let introEngaged = $state(false);
  let heroElement;

  const partyMarks = {
    L: `${import.meta.env.BASE_URL}parties/liberalerna-mark.png`,
    SD: `${import.meta.env.BASE_URL}parties/sd-mark.png`,
  };

  const seatStatus = $derived([
    "Med Liberalernas stöd på 2,0 procent får de inga mandat. Tidöpartierna får 161 mandat och oppositionen 188. Liberalernas röster påverkar inte mandatfördelningen.",
    "Vid 3,9 procent får Liberalerna fortfarande inga mandat. Röster har lämnat Moderaterna utan att rädda Liberalerna, och Tidöpartierna får fyra mandat färre än från början.",
    "Vid 4,0 procent får Liberalerna 14 mandat. Stödrösten räddar partiet, men Tidöpartiernas 164 mandat räcker inte till egen majoritet.",
    "I ett hypotetiskt jämnt val får Tidöpartierna 50,1 procent av rösterna men bara 172 mandat när Liberalerna ligger på 3,9. En röstmajoritet blir ingen mandatmajoritet.",
    "I samma hypotetiska val får Tidöpartierna 179 mandat när Liberalerna når 4,0 procent. När Liberalerna passerar spärren avgör stödrösterna majoriteten.",
  ][seatStep]);

  const gameStatus = $derived([
    "Från 2,0 procent saknas omkring 130 000 väljare till spärren.",
    "Från 3,5 procent saknas omkring 32 000 väljare till spärren.",
    "Utfallet beror på både det egna valet och vad andra väljare gör.",
    "I DN och Ipsos undersökning beskrev de svarande sina egna gränser. Medianen var 3,0 procent för när en stödröst känns bortkastad och 3,5 procent för när de vågar stödrösta.",
    "Den som stannar kvar förlitar sig på att andra byter. Om många resonerar så passerar Liberalerna inte fyraprocentsspärren.",
  ][gameStep]);

  const donorStatus = $derived([
    "När 2,0 procentenheter flyttas från Moderaterna till Liberalerna har M 15,2 procent, SD 18,3 och L 4,0.",
    "När 2,0 procentenheter flyttas från Sverigedemokraterna till Liberalerna har SD 16,3 procent, M 17,2 och L 4,0.",
    "När 2,0 procentenheter flyttas från Kristdemokraterna till Liberalerna har KD 6,5 procent och L 4,0. KD ligger då 2,5 procentenheter över spärren.",
  ][donorStep]);

  const evidenceStatus = $derived([
    "Bland Liberalernas väljare bestämde sig 60 procent sista veckan och 32 procent föredrog ett annat parti.",
    "En sen mätning är inte ett facit. Liberalerna ökade något 2010 men fick ett lägre valresultat än mätningen 2014, 2018 och 2022. Fyra val säger inte vad som händer 2026.",
  ][evidenceStep]);

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
    }, { threshold: .08, rootMargin: "0px 0px -3%" });
    document.querySelectorAll("[data-reveal]").forEach((element) => revealObserver.observe(element));

    let introTimer;
    let heroObserver;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      introEngaged = true;
    } else {
      heroObserver = new IntersectionObserver(([entry]) => {
        if (!entry?.isIntersecting || introEngaged) return;
        heroObserver.disconnect();
        introTimer = window.setTimeout(() => {
          introEngaged = true;
        }, 300);
      }, { threshold: .15 });
      if (heroElement) heroObserver.observe(heroElement);
    }

    let ticking = false;
    const update = () => {
      ticking = false;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      progress = max > 0 ? Math.min(1, window.scrollY / max) : 0;
    };
    const requestUpdate = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    return () => {
      revealObserver.disconnect();
      heroObserver?.disconnect();
      if (introTimer) window.clearTimeout(introTimer);
      document.documentElement.classList.remove("motion-ready");
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
    };
  });
</script>

<a class="skip-link" href="#story" onclick={skipToStory}>Hoppa till berättelsen</a>
<div class="progress" aria-hidden="true"><i style={`transform:scaleX(${progress})`}></i></div>

<header class="hero" class:intro-engaged={introEngaged} bind:this={heroElement}>
  <div class="hero-copy">
    <p class="eyebrow">Riksdagsvalet 2026</p>
    <h1>Vad är en taktikröst på Liberalerna värd?</h1>
    <p class="standfirst">Liberalerna har haft en tydlig trend <span class="trend-down">nedåt<span class="trend-down-arrow" aria-hidden="true">↓</span></span> under lång tid. I den senaste mätningen får partiet <strong class="current-number number-mark">2,0 procent</strong>, klart under riksdagsspärren på <strong class="threshold-number number-mark">4,0 procent</strong>. Från Liberalerna och Sverigedemokraterna kommer två olika råd.</p>
    <div class="poll-strip" aria-label="Tre aktuella mätningar av Liberalernas stöd">
      {#each recentLPolls as poll}
        <div class:current={poll.current}>
          <span>{poll.institute} · {poll.published}</span>
          <strong>{poll.value.toLocaleString("sv-SE", { minimumFractionDigits: 1 })}%</strong>
        </div>
      {/each}
      <p>Tre mätningar samma vecka. Alla placerar L tydligt under spärren.</p>
    </div>
  </div>
  <div class="hero-chart"><LiberalHistory active={introEngaged} /></div>
</header>

<main id="story" tabindex="-1">
  <section class="duel prose-section" aria-labelledby="duel-title">
    <div class="section-heading" data-reveal>
      <p class="section-index">Två råd</p>
      <h2 id="duel-title">Samma väljare får två olika besked</h2>
      <p>Frågan gäller den som vill att Tidöpartierna ska få egen majoritet men som helst röstar på ett annat parti än L.</p>
    </div>
    <div class="duel-grid">
      <article class="party-card party-l" data-reveal>
        <img class="party-mark" src={partyMarks.L} alt="Liberalernas partimärke" width="180" height="180" />
        <span class="speaker">Simona Mohamsson</span>
        <h3>Hjälp L över spärren</h3>
        <p>L-ledaren ber väljare som vill att Tidöpartierna ska få egen majoritet att rösta på L.</p>
        <a href={sources.mohamsson}>Aftonbladet, 26 augusti</a>
      </article>
      <article class="party-card party-sd" data-reveal>
        <img class="party-mark" src={partyMarks.SD} alt="Sverigedemokraternas partimärke" width="120" height="128" />
        <span class="speaker">Jimmie Åkesson</span>
        <h3>Avstå om L ligger under 3,5</h3>
        <p>SD-ledaren sätter en gräns tio dagar före valet. Ligger L fortfarande lägre bör väljarna välja ett annat Tidöparti.</p>
        <a href={sources.akesson}>SVT, 23 augusti</a>
      </article>
    </div>
    <p class="duel-question" data-reveal>När lönar sig en stödröst?</p>
  </section>

  <section class="experiment-intro prose-section" data-reveal aria-labelledby="experiment-title">
    <p class="section-index">Räkneförsöket</p>
    <h2 id="experiment-title">Stödrösten kan sluta på flera sätt</h2>
    <div class="body-copy">
      <p>Vi börjar i Demoskops mätning från den 27 augusti. Tidöpartierna har tillsammans 46,0 procent, oppositionen 51,7 och L 2,0. I de tre första lägena flyttar vi röster från M till L.</p>
      <p>Sedan gör vi valet jämnt. Tidöpartierna får 50,1 procent av rösterna. Efter varje förflyttning räknar vi om riksdagens 349 mandat.</p>
    </div>
  </section>

  <section class="seat-act" aria-label="Scrollstyrd simulering av stödröster till Liberalerna">
    <ScrollyShell onStepChange={(index) => seatStep = index} label="Fem möjliga utfall för en stödröst på Liberalerna" status={seatStatus} mobileTargetRatio={0.68}>
      {#snippet visual()}<SeatCliff step={seatStep} />{/snippet}

      <article class="seat-step" data-step>
        <p class="step-index">Utgångsläge · Demoskop 27 augusti</p>
        <h3>L hamnar utanför</h3>
        <p class="scenario-detail">På 2,0 procent får L inga mandat i modellen. Tidöpartierna får 161 platser och oppositionen 188.</p>
        <p class="scenario-reading">L:s röster påverkar inte mandatfördelningen, och Tidöpartierna är långt från egen majoritet.</p>
      </article>
      <article class="seat-step" data-step>
        <p class="step-index">Hypotetiskt valresultat · L på 3,9%</p>
        <h3>Rösterna tar inte L över spärren</h3>
        <p class="scenario-detail">Röster har lämnat M men L missar spärren. Tidöpartierna får 157 mandat, fyra färre än från början.</p>
        <p class="scenario-reading">Stödrösterna har försvagat M utan att ge L några mandat.</p>
      </article>
      <article class="seat-step threshold-step" data-step>
        <p class="step-index">Hypotetiskt valresultat · L på 4,0%</p>
        <h3>Vid fyra procent kommer L in</h3>
        <p class="scenario-detail">L får 14 mandat. Tidöpartierna når 164, tolv mandat från egen majoritet.</p>
        <p class="scenario-reading">Stödrösterna räddar L, men de ger inte Tidöpartierna egen majoritet.</p>
      </article>
      <article class="seat-step" data-step>
        <p class="step-index">Hypotetiskt jämnt val · L på 3,9%</p>
        <h3>En röstmajoritet blir ingen mandatmajoritet</h3>
        <p class="scenario-detail">Tidöpartierna har 50,1 procent av rösterna. När L hamnar utanför stannar de ändå på 172 mandat.</p>
        <p class="scenario-reading">Sidan får flest röster, men inte flest mandat när L:s röster blir utan representation.</p>
      </article>
      <article class="seat-step conclusion-step" data-step>
        <p class="step-index">Samma hypotetiska val · L på 4,0%</p>
        <h3>Spärren avgör majoriteten</h3>
        <p class="scenario-detail">Med samma röstandel men L över spärren får Tidöpartierna 179 mandat.</p>
        <p class="scenario-reading">När L passerar spärren får sidan sju mandat till. I det här scenariot avgör stödrösterna majoriteten.</p>
      </article>
    </ScrollyShell>
  </section>

  <section class="game-intro prose-section" data-reveal aria-labelledby="game-title">
    <p class="section-index">Spelteorin</p>
    <h2 id="game-title">En enskild röst räcker inte</h2>
    <div class="body-copy">
      <p>Den som funderar på en stödröst vet inte hur nära L är spärren, hur många andra som tänker likadant eller om Tidöpartierna ens är nära 176 mandat.</p>
      <p>För att stödrösten ska fungera måste många fatta samma beslut. Det är ett samordningsproblem.</p>
    </div>
  </section>

  <section class="game-act scrolly-act" aria-label="Scrollstyrd förklaring av taktikröstning som samordningsspel">
    <ScrollyShell onStepChange={(index) => gameStep = index} label="Taktikröstning som samordningsspel" status={gameStatus} mobileTargetRatio={0.68}>
      {#snippet visual()}<CoordinationGame step={gameStep} />{/snippet}

      <article class="story-step" data-step>
        <p class="step-index">Dagens avstånd</p>
        <h3>Förflyttningen kräver en stor grupp</h3>
        <p>Från 2,0 till 4 procent behövs omkring 130&nbsp;000 ytterligare väljare, räknat med antalet giltiga röster 2022. Det krävs alltså en stor grupp.</p>
      </article>
      <article class="story-step" data-step>
        <p class="step-index">Vid 3,5%</p>
        <h3>Gruppen blir betydligt mindre</h3>
        <p>Nu behövs omkring 32&nbsp;000 väljare. Om L ändå missar spärren ger de rösterna inga mandat i den här modellen.</p>
      </article>
      <article class="story-step" data-step>
        <p class="step-index">Samordningsspelet</p>
        <h3>Utfallet beror på hur många som byter</h3>
        <p>Om tillräckligt många hjälper L får partiet mandat. Om gruppen blir för liten har väljarna lämnat partier över spärren för ett parti som ändå hamnar utanför.</p>
      </article>
      <article class="story-step" data-step>
        <p class="step-index">Den gemensamma signalen</p>
        <h3>Var går väljarnas egen gräns?</h3>
        <p>DN/Ipsos frågade var de svarandes egen gräns går. Medianen var 3,0 procent för när en stödröst känns bortkastad och 3,5 för när de vågar stödrösta. Det visar hur de resonerar, inte hur en mätning ändrar deras röst.</p>
      </article>
      <article class="story-step" data-step>
        <p class="step-index">Samordningsproblemet</p>
        <h3>Om alla väntar på de andra</h3>
        <p>En M-väljare kan tro att andras byten räcker och själv stanna kvar. Om många resonerar så passerar L inte fyraprocentsspärren.</p>
      </article>
    </ScrollyShell>
  </section>

  <section class="preference-section prose-section" aria-labelledby="preference-title">
    <div class="section-heading" data-reveal>
      <p class="section-index">Efter spärren</p>
      <h2 id="preference-title">Rösten flyttar också makt mellan Tidöpartierna</h2>
    </div>
    <div class="body-copy" data-reveal>
      <p>De väljare vi räknar på är beredda att stödrösta på L för att Tidöpartierna ska få egen majoritet. Men partiet de lämnar blir mindre, och balansen mellan Tidöpartierna kan förändras.</p>
      <p>En M-röst på L ökar SD:s försprång över M. En SD-röst på L kan i stället göra M störst av Tidöpartierna. Röster från ett mindre parti blir känsligare först när även det partiet närmar sig spärren.</p>
    </div>
  </section>

  <section class="donor-act scrolly-act" aria-label="Scrollstyrd jämförelse av stödröster från Moderaterna, Sverigedemokraterna och Kristdemokraterna">
    <ScrollyShell onStepChange={(index) => donorStep = index} label="Varifrån stödrösten till Liberalerna kommer" status={donorStatus} mobileTargetRatio={0.68}>
      {#snippet visual()}<DonorJourney step={donorStep} />{/snippet}

      <article class="story-step" data-step>
        <p class="step-index">Stödröster från M till L</p>
        <h3>SD:s försprång växer</h3>
        <p>När L når fyra sjunker M från 17,2 till 15,2 procent. SD ligger kvar på 18,3. Avståndet mellan partierna ökar från 1,1 till 3,1 procentenheter.</p>
      </article>
      <article class="story-step" data-step>
        <p class="step-index">Stödröster från SD till L</p>
        <h3>M blir störst av Tidöpartierna</h3>
        <p>Om samma stöd kommer från SD sjunker partiet till 16,3 procent. M ligger kvar på 17,2 och passerar SD.</p>
      </article>
      <article class="story-step" data-step>
        <p class="step-index">Stödröster från KD till L</p>
        <h3>KD ligger kvar över spärren</h3>
        <p>Om 2,0 procentenheter flyttas från KD till L sjunker KD från 8,5 till 6,5 procent. KD ligger då fortfarande 2,5 procentenheter över spärren.</p>
      </article>
    </ScrollyShell>
  </section>

  <section class="evidence-intro prose-section" data-reveal aria-labelledby="evidence-title">
    <p class="section-index">Efter sista mätningen</p>
    <h2 id="evidence-title">Kan L gå från två till fyra?</h2>
    <div class="body-copy">
      <p>Den som överväger en stödröst måste också bedöma vad som kan hända på valdagen.</p>
      <p>Två procent är en mätning, inte ett facit. Många L-väljare bestämde sig sent 2022. Men hur mycket säger det om L:s chanser i år?</p>
    </div>
  </section>

  <section class="evidence-act scrolly-act" aria-label="Scrollstyrd genomgång av sena L-röster, experiment och valresultat">
    <ScrollyShell onStepChange={(index) => evidenceStep = index} label="Vad som kan hända efter en sen mätning" status={evidenceStatus} mobileTargetRatio={0.68}>
      {#snippet visual()}<EvidenceJourney step={evidenceStep} />{/snippet}

      <article class="story-step" data-step>
        <p class="step-index">L-väljarna · 2022</p>
        <h3>Sex av tio bestämde sig sista veckan</h3>
        <p>Dessutom hade 32 procent ett annat förstahandsval. M till L stod för 5,5 procent av de potentiellt strategiska rösterna. Det lämnar utrymme för sena förflyttningar, men säger inte hur stora de blir.</p>
      </article>
      <article class="story-step" data-step>
        <p class="step-index">Fyra sena mätningar</p>
        <h3>En sen mätning är inte ett valresultat</h3>
        <p>L ökade något 2010 men backade från den sena mätningen 2014, 2018 och 2022. Det visar att mätningen inte är ett facit. Fyra val säger inget säkert om 2026 och ger heller inget stöd för att räkna med ett lyft från 2,0 till 4,0.</p>
      </article>
    </ScrollyShell>
  </section>

  <section class="closing" aria-labelledby="closing-title">
    <div class="closing-inner" data-reveal>
      <p class="section-index">Avslutning</p>
      <h2 id="closing-title">Så vad är stödrösten värd?</h2>
      <div class="closing-copy">
        <p>Vi har följt en väljare som vill att Tidöpartierna ska få egen majoritet och är beredd att rösta på L, trots att ett annat Tidöparti är förstahandsvalet.</p>
        <p>I Demoskop ligger L på 2,0 procent. För att stödrösten ska ge mandat måste partiet först få hjälp över spärren. Från 2,0 procent kräver det omkring 130&nbsp;000 ytterligare väljare.</p>
        <p>Men 2,0 procent är inte ett facit. Många L-väljare bestämde sig sent 2022, och valresultatet kan bli ett annat än vad den sista opinionsundersökningen visar. För den som överväger en stödröst kan den osäkerheten vara ett skäl att inte räkna bort L, utan att veta hur stor chansen faktiskt är.</p>
        <p>Även om L når fyra får Tidöpartierna bara 164 mandat i vårt första exempel. Det spelar också roll vad andra väljare gör och varifrån stödrösterna kommer. Partiet som väljarna lämnar blir mindre, och maktbalansen mellan Tidöpartierna kan förändras.</p>
        <p>Den här kalkylen utgår dessutom från att väljaren väger spärren, mandaten och andras beteende mot varandra. Så resonerar inte alla. För en del kan det också kännas ideologiskt fel att byta parti även om det skulle öka möjligheten för Tidöpartierna att få egen majoritet.</p>
      </div>
      <p class="final-line">Det går att räkna länge på spärren, mandaten och vad andra tänker göra. Till slut kan man också lägga kalkylen åt sidan och rösta på det parti man helst vill se starkare.</p>
    </div>
  </section>

  <section class="method" aria-labelledby="method-title">
    <div>
      <p class="section-index">Metod och källor</p>
      <h2 id="method-title">Så har vi räknat</h2>
      <ul>
        <li><strong>Opinionsläget.</strong> Grundscenariot använder Demoskops mätning publicerad 27 augusti 2026, med 2&nbsp;117 webbintervjuer genomförda 13–24 augusti. L fick 2,0 procent, Tidöpartierna 46,0 och oppositionen 51,7. Urvalet är förstratifierat och vägt efter ålder, kön, region och parti i föregående val. Demoskop redovisar ingen vanlig felmarginal eftersom mätningen inte bygger på ett renodlat slumpmässigt befolkningsurval. <a href={sources.demoskop}>Demoskops resultat och metod</a>. Introts två övriga punkter kommer från <a href={sources.ipsos}>Ipsos</a> och <a href={sources.indicator}>Indikator</a>.</li>
        <li><strong>Mandatsimuleringen.</strong> Mandaten fördelas nationellt med riksdagsspärren på 4 procent och den jämkade uddatalsmetoden, först 1,2 och sedan 3, 5, 7 och vidare. Modellen återskapar den officiella totalfördelningen 2022. Tolvprocentsspärren för fasta mandat i en valkrets modelleras inte eftersom scenarierna gäller nationellt L-stöd. De två sista lägena är ett hypotetiskt jämnt val: 4,1 procentenheter flyttas först från S till M så att Tidöpartierna får 50,1 procent. Sedan jämförs L på 3,9 och 4,0. <a href={sources.electionMethod}>Valmyndighetens regler</a> och <a href={sources.election2022}>valresultatet 2022</a>.</li>
        <li><strong>Stödrösterna.</strong> I huvudscenariot flyttas röster från M till L medan Tidöpartiernas totala stöd ligger kvar. Donatorexemplen visar vad som händer om rösterna i stället kommer från SD eller KD. Det är tankeexperiment där alla andra partier står still.</li>
        <li><strong>Antalet röster.</strong> 32&nbsp;000 och 130&nbsp;000 är avrundade storleksordningar baserade på 6&nbsp;477&nbsp;970 giltiga röster i riksdagsvalet 2022. Antalet giltiga röster 2026 blir ett annat.</li>
        <li><strong>Strategisk röstning.</strong> Uppgifterna om L-väljarnas andra förstahandsval och väljarflödet M till L kommer från kapitel 26 i <a href={sources.strategicVoting2022}>Väljarna och valet 2022</a>.</li>
        <li><strong>L-väljarnas beslut.</strong> Uppgiften att 60 procent bestämde sig sista veckan kommer från Valforskningsprogrammets partirapport. Skattningen bygger på 364–367 svar och är viktad mot partival och validerat valdeltagande. <a href={sources.liberalVoters2022}>Valet 2022: Liberalerna</a>.</li>
        <li><strong>Väljarnas upplevda gränser.</strong> I DN/Ipsos undersökning var medianen 3,0 procent för när en stödröst känns bortkastad och 3,5 procent för när väljaren vågar stödrösta. Medelvärdena var 2,9 respektive 3,6. Ipsos intervjuade 1&nbsp;461 röstberättigade den 11–23 augusti. Svaren gäller hypotetiska frågor och är ingen prognos för L:s valresultat. <a href={sources.dnSupportVoting}>DN/Ipsos</a>.</li>
        <li><strong>Spelteorin.</strong> Samordningsförklaringen bygger på forskning om strategisk röstning i proportionella valsystem med koalitioner, spärrar och opinionsmätningar. <a href={sources.coordinationStudy}>Blais, Erisen och Rheault</a> samt <a href={sources.pollsAndCoalitions}>Herrmann</a>.</li>
        <li><strong>Historiken.</strong> Valresultaten 1948–2022 kommer från SCB och följer Folkpartiet/Liberalerna. Punkten för 2026 är en mätning. <a href={sources.scbHistory}>SCB:s historiska valstatistik</a>.</li>
        <li><strong>Mätning mot val.</strong> Punkterna nära valen 2010–2022 är hämtade ur SVT/Verians historiska serie och ligger 8–18 dagar före respektive val. Fyra observationer används för att ge historisk orientering, inte för att räkna fram en sannolikhet. <a href={sources.svtHistory}>SVT:s Väljarbarometer</a>.</li>
        <li><strong>Majoriteten.</strong> Berättelsen räknar en egen majoritet för Tidöpartierna, alltså M, KD, L och SD. Vilken regering som sedan kan bildas beror också på vilka partier som tolererar en statsminister.</li>
      </ul>
    </div>
  </section>
</main>

<footer>
  <p>Om taktikröstning inför riksdagsvalet 2026.</p>
  <a href="https://plainx.dev/">Fler berättelser på (<i>x</i>)plain</a>
</footer>
