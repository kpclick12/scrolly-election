<script>
  import { onMount } from "svelte";
  import ScrollyShell from "./lib/components/ScrollyShell.svelte";
  import LiberalHistory from "./lib/components/LiberalHistory.svelte";
  import SeatCliff from "./lib/components/SeatCliff.svelte";
  import CoordinationGame from "./lib/components/CoordinationGame.svelte";
  import EvidenceJourney from "./lib/components/EvidenceJourney.svelte";
  import { scenarioForL, sources } from "./data/story.js";

  let seatStep = $state(0);
  let gameStep = $state(0);
  let evidenceStep = $state(0);
  let progress = $state(0);

  const seatStatus = $derived([
    "Med Liberalernas stöd på 2,2 procent får de inga mandat. Blågula får 162 mandat och oppositionen 187.",
    "När röster flyttas från Moderaterna tills Liberalerna når 3,5 procent får L fortfarande inga mandat. Blågula får 159 mandat.",
    "Vid 3,9 procent får Liberalerna fortfarande inga mandat. Blågula får 159 mandat och oppositionen 190.",
    "Vid 4,0 procent får Liberalerna 14 mandat. Blågula får 166 mandat och oppositionen 183.",
    "Vid 4,5 procent får Liberalerna 16 mandat. Blågula ligger kvar på 166 eftersom rösterna har flyttats inom samma sida.",
    "Ett räddat Liberalerna ger 166 blågula mandat. Det saknas fortfarande tio till egen majoritet.",
  ][seatStep]);

  const gameStatus = $derived([
    "Från 2,2 procent saknas omkring 117 000 väljare till spärren.",
    "Från 3,5 procent saknas omkring 32 000 väljare till spärren.",
    "Utfallet beror på både det egna valet och vad andra väljare gör.",
    "Opinionsmätningen blir en gemensam signal som kan hjälpa väljarna att samordna sig.",
    "Varje väljare kan hoppas att andra tar risken. Om många gör det faller samordningen.",
  ][gameStep]);

  const evidenceStatus = $derived([
    "Sexton procent röstade 2022 på ett annat parti än sitt tydliga förstahandsval.",
    "Bland Liberalernas väljare bestämde sig 60 procent sista veckan och 32 procent föredrog ett annat parti.",
    "Det svenska experimentet gav ett svagt och statistiskt osäkert stöd för en försäkringseffekt för Liberalerna.",
    "I tre av de fyra senaste valen backade Liberalerna från den sena mätningen till valresultatet.",
    "Från 2,2 krävs en ökning på 1,8 procentenheter. Från 3,5 krävs 0,5.",
  ][evidenceStep]);

  const fromM = scenarioForL(4.0, "M");
  const fromKD = scenarioForL(4.0, "KD");
  const overFromKD = scenarioForL(4.5, "KD");

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
      document.documentElement.classList.remove("motion-ready");
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
    };
  });
</script>

<a class="skip-link" href="#story" onclick={skipToStory}>Hoppa till berättelsen</a>
<div class="progress" aria-hidden="true"><i style={`transform:scaleX(${progress})`}></i></div>

<header class="hero">
  <div class="hero-copy">
    <p class="eyebrow">Riksdagsvalet 2026</p>
    <h1>Vad är en taktikröst på Liberalerna värd?</h1>
    <p class="standfirst">Liberalerna ligger långt under spärren och ber andra blågula väljare om hjälp. Hur nära måste partiet vara för att den hjälpen ska löna sig?</p>
    <div class="hero-facts" aria-label="Två avgörande tal">
      <div><span>Indikator, augusti</span><strong>2,2%</strong></div>
      <div><span>Riksdagsspärren</span><strong>4,0%</strong></div>
    </div>
  </div>
  <div class="hero-chart"><LiberalHistory /></div>
</header>

<main id="story" tabindex="-1">
  <section class="duel prose-section" aria-labelledby="duel-title">
    <div class="section-heading" data-reveal>
      <p class="section-index">Två råd</p>
      <h2 id="duel-title">Samma väljare får två olika besked</h2>
      <p>Frågan gäller de väljare som helst vill ha ett blågult regeringsunderlag men som inte har L som förstahandsval.</p>
    </div>
    <div class="duel-grid">
      <article data-reveal>
        <span class="speaker">Simona Mohamsson</span>
        <h3>Hjälp L över spärren</h3>
        <p>L-ledaren ber väljare som vill behålla det blågula samarbetet att lägga sin röst på Liberalerna.</p>
        <a href={sources.mohamsson}>Aftonbladet, 26 augusti</a>
      </article>
      <article data-reveal>
        <span class="speaker">Jimmie Åkesson</span>
        <h3>Avstå om L ligger under 3,5</h3>
        <p>SD-ledaren sätter en gräns tio dagar före valet. Om L fortfarande ligger lägre bör väljarna välja ett annat blågult parti.</p>
        <a href={sources.akesson}>SVT, 23 augusti</a>
      </article>
    </div>
    <p class="duel-question" data-reveal>Vad är det som händer vid 3,5?</p>
  </section>

  <section class="experiment-intro prose-section" data-reveal aria-labelledby="experiment-title">
    <p class="section-index">Räkneförsöket</p>
    <h2 id="experiment-title">Vi flyttar röster från M till L</h2>
    <div class="body-copy">
      <p>Startpunkten är Indikator Opinions mätning från augusti. Blågula har tillsammans 46,6 procent och oppositionen 51,3. L ligger på 2,2.</p>
      <p>Efter varje förflyttning räknar vi om riksdagens 349 mandat. Beräkningen visar mekaniken i valsystemet. Väljarnas faktiska rörelser kan förstås bli helt andra.</p>
    </div>
  </section>

  <section class="seat-act" aria-label="Scrollstyrd simulering av stödröster till Liberalerna">
    <ScrollyShell onStepChange={(index) => seatStep = index} label="Från 2,2 till 4,5 procent för Liberalerna" status={seatStatus}>
      {#snippet visual()}<SeatCliff step={seatStep} />{/snippet}

      <article class="seat-step" data-step>
        <p class="step-index">Utgångsläget · 2,2%</p>
        <h3>L får inga mandat</h3>
        <p>När L hamnar under spärren används deras röster inte i den nationella mandatfördelningen. Blågula får 162 platser och oppositionen 187.</p>
      </article>
      <article class="seat-step" data-step>
        <p class="step-index">Åkessons gräns · 3,5%</p>
        <h3>1,3 procentenheter har flyttats</h3>
        <p>L är fortfarande utanför. Eftersom rösterna har lämnat M tappar blågula tre mandat jämfört med utgångsläget.</p>
      </article>
      <article class="seat-step" data-step>
        <p class="step-index">Nära · 3,9%</p>
        <h3>En tiondel återstår</h3>
        <p>Alla L-röster står ännu utanför mandatfördelningen. I modellen får blågula 159 mandat och oppositionen 190.</p>
      </article>
      <article class="seat-step threshold-step" data-step>
        <p class="step-index">Spärren · 4,0%</p>
        <h3>L får 14 mandat</h3>
        <p>Andra blågula partier blir samtidigt mindre. Nettot för hela sidan är därför sju nya mandat jämfört med läget vid 3,9.</p>
      </article>
      <article class="seat-step" data-step>
        <p class="step-index">Lite över · 4,5%</p>
        <h3>L växer, blocket står kvar</h3>
        <p>L får 16 mandat. De extra rösterna kommer fortfarande från M, så den blågula summan ligger kvar på 166.</p>
      </article>
      <article class="seat-step conclusion-step" data-step>
        <p class="step-index">Mandatläget</p>
        <h3>Det fattas fortfarande tio</h3>
        <p>Oppositionens ledning i mätningen är större än de sju mandat som ett räddat L tillför. Stödrösterna kan förbättra läget utan att ge egen majoritet.</p>
      </article>
    </ScrollyShell>
  </section>

  <section class="game-intro prose-section" data-reveal aria-labelledby="game-title">
    <p class="section-index">Spelteorin</p>
    <h2 id="game-title">Din bedömning handlar om de andra väljarna</h2>
    <div class="body-copy">
      <p>En strategisk väljare försöker påverka det politiska utfallet och kan därför lämna sitt favoritparti. För en M-väljare kan en L-röst vara rimlig om den ökar chansen för ett önskat regeringsunderlag.</p>
      <p>Problemet är att utfallet avgörs gemensamt. En person vet inte hur många andra som gör samma byte.</p>
    </div>
  </section>

  <section class="game-act scrolly-act" aria-label="Scrollstyrd förklaring av taktikröstning som samordningsspel">
    <ScrollyShell onStepChange={(index) => gameStep = index} label="Taktikröstning som samordningsspel" status={gameStatus}>
      {#snippet visual()}<CoordinationGame step={gameStep} />{/snippet}

      <article class="story-step" data-step>
        <p class="step-index">Dagens avstånd</p>
        <h3>Räddningen kräver en stor grupp</h3>
        <p>Från 2,2 till 4 procent behövs omkring 117&nbsp;000 ytterligare väljare, räknat med antalet giltiga röster 2022. En enskild röst förändrar knappast oddsen.</p>
      </article>
      <article class="story-step" data-step>
        <p class="step-index">Vid 3,5%</p>
        <h3>Gruppen blir betydligt mindre</h3>
        <p>Nu behövs omkring 32&nbsp;000 väljare. Fyraprocentsspärren fungerar lite som ett finansieringsmål, med skillnaden att rösterna inte återlämnas om målet missas.</p>
      </article>
      <article class="story-step" data-step>
        <p class="step-index">Samordningsspelet</p>
        <h3>Din röst får sitt värde tillsammans med andras</h3>
        <p>Om tillräckligt många hjälper L kan gruppen vinna mandat åt hela sidan. Om för få gör det har de lämnat säkra partier för ett parti som ändå hamnar utanför.</p>
      </article>
      <article class="story-step" data-step>
        <p class="step-index">Den gemensamma signalen</p>
        <h3>Mätningen hjälper väljarna att hitta varandra</h3>
        <p>Alla ser samma 3,5. Siffran kan få väljare att tro att räddningen är möjlig och därmed göra den mer möjlig. Forskningen kallar detta samordning genom opinionsmätningar.</p>
      </article>
      <article class="story-step" data-step>
        <p class="step-index">Fripassageraren</p>
        <h3>Det är bekvämt att låta andra ta risken</h3>
        <p>En M-väljare kan hoppas att andra räddar L och själv stanna kvar. Om många gör samma kalkyl når L aldrig fram. Där ligger samordningsproblemet.</p>
      </article>
    </ScrollyShell>
  </section>

  <section class="preference-section prose-section" aria-labelledby="preference-title">
    <div class="section-heading" data-reveal>
      <p class="section-index">Vad räknas som en vinst?</p>
      <h2 id="preference-title">Mandaten är bara ena halvan av kalkylen</h2>
    </div>
    <div class="body-copy" data-reveal>
      <p>Väljare som vill ha samma statsminister kan ändå värdera partierna olika. Den som lämnar M för L hjälper samtidigt L att få större tyngd inom samarbetet. För en väljare som står långt från L i sakfrågorna kan den kostnaden väga tyngre än blockets mandatvinst.</p>
      <p>Det syns också i forskningen. I experimentet från 2022 var M-väljare mer benägna att hjälpa L och KD än SD-väljare. Försäkringsröstandet var tydligast för KD, som länge haft en stabil plats i det borgerliga regeringsalternativet. L:s blocktillhörighet hade varit mer omstridd under mandatperioden.</p>
      <p>Det finns alltså inget råd som passar alla blågula väljare. Kalkylen rymmer tre saker: chansen att L klarar spärren, värdet av de extra mandaten och priset för att stärka ett parti längre ned i den egna preferensordningen.</p>
    </div>
  </section>

  <section class="donor-section" aria-labelledby="donor-title">
    <div class="section-heading" data-reveal>
      <p class="section-index">Varifrån kommer rösten?</p>
      <h2 id="donor-title">Det spelar roll vilket parti som avstår</h2>
      <p>Huvudräkningen tar röster från M. Samma förflyttning blir känsligare om den börjar hos ett annat småparti.</p>
    </div>
    <div class="donor-grid">
      <article data-reveal>
        <div class="donor-head"><span>Från M till L</span><strong>Stor marginal</strong></div>
        <div class="party-balance">
          <div style="--party:var(--m-color);--width:85.5%"><b>M</b><i></i><span>{fromM.shares.M.toLocaleString("sv-SE", { minimumFractionDigits: 1 })}%</span></div>
          <div style="--party:var(--l-color);--width:20%"><b>L</b><i></i><span>4,0%</span></div>
        </div>
        <p>M ligger kvar långt över spärren.</p>
      </article>
      <article data-reveal>
        <div class="donor-head"><span>Från KD till L</span><strong>Båda vid fyra</strong></div>
        <div class="party-balance">
          <div style="--party:var(--kd-color);--width:20%"><b>KD</b><i></i><span>{fromKD.shares.KD.toLocaleString("sv-SE", { minimumFractionDigits: 1 })}%</span></div>
          <div style="--party:var(--l-color);--width:20%"><b>L</b><i></i><span>4,0%</span></div>
        </div>
        <p>Den förflyttningen placerar båda partierna på spärren.</p>
      </article>
      <article class="donor-warning" data-reveal>
        <div class="donor-head"><span>Mer från KD</span><strong>KD hamnar utanför</strong></div>
        <div class="party-balance">
          <div style="--party:var(--kd-color);--width:17.5%"><b>KD</b><i></i><span>{overFromKD.shares.KD.toLocaleString("sv-SE", { minimumFractionDigits: 1 })}%</span></div>
          <div style="--party:var(--l-color);--width:22.5%"><b>L</b><i></i><span>4,5%</span></div>
        </div>
        <p>L får sina mandat men KD förlorar sina. Blocket har flyttat risken mellan två partier.</p>
      </article>
    </div>
  </section>

  <section class="evidence-intro prose-section" data-reveal aria-labelledby="evidence-title">
    <p class="section-index">Vad väljarna faktiskt gör</p>
    <h2 id="evidence-title">Svenska val ger några ledtrådar</h2>
    <div class="body-copy">
      <p>Taktikröstning går att se i svenska valundersökningar. Det betyder inte att väljare alltid lyckas samordna sig eller att en viss opinionsnivå leder till ett bestämt resultat.</p>
      <p>Tre resultat hjälper oss att bedöma Liberalernas läge.</p>
    </div>
  </section>

  <section class="evidence-act scrolly-act" aria-label="Scrollstyrd genomgång av svensk forskning om strategisk röstning">
    <ScrollyShell onStepChange={(index) => evidenceStep = index} label="Svensk forskning och Liberalernas chanser" status={evidenceStatus}>
      {#snippet visual()}<EvidenceJourney step={evidenceStep} />{/snippet}

      <article class="story-step" data-step>
        <p class="step-index">Alla väljare · 2022</p>
        <h3>Var sjätte valde bort sitt tydliga favoritparti</h3>
        <p>Valforskningsprogrammets strikta mått ger 16 procent potentiellt strategiska röster. Med den klassiska definitionen blir andelen 20 procent.</p>
      </article>
      <article class="story-step" data-step>
        <p class="step-index">L-väljarna · 2022</p>
        <h3>Sex av tio bestämde sig sista veckan</h3>
        <p>32 procent hade ett annat parti som förstahandsval. Bland de vanligaste strategiska flödena fanns M-väljare som till slut lade sin röst på L.</p>
      </article>
      <article class="story-step" data-step>
        <p class="step-index">Ett svenskt experiment</p>
        <h3>L fick mer stöd när mätningen visade 2,5</h3>
        <p>Deltagarna såg L på 2,5, 4,0 eller 5,5 procent. Mönstret liknar försäkringsröstning, men L-grupperna var för små för att skillnaderna skulle bli statistiskt säkerställda. För KD var effekten tydligare.</p>
      </article>
      <article class="story-step" data-step>
        <p class="step-index">Fyra sena mätningar</p>
        <h3>Historiken lovar ingen slutspurt</h3>
        <p>L ökade lite 2010. I valen 2014, 2018 och 2022 blev valresultatet lägre än den sena mätningen. Fyra val är få, men de ger inget historiskt stöd för en automatisk slutspurt.</p>
      </article>
      <article class="story-step" data-step>
        <p class="step-index">Åkessons 3,5</p>
        <h3>En hanterbar uppgift, fortfarande osäker</h3>
        <p>Vid 3,5 behöver ungefär en halv procentenhet samordna sig. Dagens 2,2 kräver 1,8. Simuleringen förklarar skillnaden mellan nivåerna. Forskningen kan inte peka ut exakt var hoppet bör överges.</p>
      </article>
    </ScrollyShell>
  </section>

  <section class="chance-section prose-section" aria-labelledby="chance-title">
    <div class="section-heading" data-reveal>
      <p class="section-index">Chansen</p>
      <h2 id="chance-title">Vad 2,2 procent faktiskt berättar</h2>
    </div>
    <div class="body-copy" data-reveal>
      <p>Indikator uppskattar L till 2,2 procent. SVT/Verian har partiet på 1,9. Båda mätningarna beskriver stödet när intervjuerna gjordes. Valresultatet påverkas dessutom av mätfel, fortsatt kampanj, valdeltagande och väljare som bestämmer sig under de sista dagarna.</p>
      <p>En sannolikhet för att L klarar spärren kräver antaganden om alla dessa delar. Fyra sena L-mätningar från tidigare val räcker inte för att skatta dem på ett trovärdigt sätt. Därför anger berättelsen ingen exakt procentsats.</p>
      <p>Vi kan däremot jämföra uppgifternas storlek. Dagens nivå kräver omkring 117&nbsp;000 nya väljare. Vid 3,5 återstår ungefär 32&nbsp;000. Därför är det rimligt att bedöma nivåerna olika.</p>
    </div>
  </section>

  <section class="closing" aria-labelledby="closing-title">
    <div class="closing-inner" data-reveal>
      <p class="section-index">Bedömningen</p>
      <h2 id="closing-title">Vad kan en taktikröst åstadkomma?</h2>
      <div class="closing-copy">
        <p>Vid 2,2 procent behöver Liberalerna omkring 117&nbsp;000 ytterligare väljare. De måste lämna andra partier trots att L fortfarande kan missa spärren. De fyra senaste valen visar ingen slutspurt i den storleken.</p>
        <p>Vid 3,5 återstår omkring 32&nbsp;000 väljare. Då ligger målet närmare, och en offentlig siffra kan hjälpa en större grupp att fatta samma beslut. Svenska valundersökningar visar att många L-väljare bestämmer sig sent och att strategiska partibyten förekommer.</p>
        <p>Även en lyckad räddning har gränser. Röster från KD kan slå ut KD, och dagens blockskillnad är större än de sju mandat som L tillför när partiet passerar spärren.</p>
      </div>
      <div class="closing-grid">
        <article><span>1</span><h3>Hur långt är det kvar?</h3><p>Avståndet avgör hur många väljare som måste samordna sig.</p></article>
        <article><span>2</span><h3>Vilket parti lämnar de?</h3><p>Ett annat småparti kan hamna under spärren.</p></article>
        <article><span>3</span><h3>Vad händer med majoriteten?</h3><p>Sju extra mandat hjälper bara om blockskillnaden är tillräckligt liten.</p></article>
      </div>
      <p class="final-line">Beräkningen visar varför 3,5 är en mer realistisk utgångspunkt än 2,2. Om de andra väljarna verkligen kommer att samordna sig får vi veta först när rösterna räknas.</p>
    </div>
  </section>

  <section class="method" aria-labelledby="method-title">
    <div>
      <p class="section-index">Metod och källor</p>
      <h2 id="method-title">Så har vi räknat</h2>
      <ul>
        <li><strong>Opinionsläget.</strong> Grundscenariot använder Indikator Opinions mätning för Ekot, insamlad 6–23 augusti 2026. L fick 2,2 procent, blågula 46,6 och oppositionen 51,3. De publicerade partisiffrorna summerar till 99,8 på grund av avrundning. I simuleringen läggs resterande 0,2 på Övriga. <a href={sources.indicator}>Sveriges Radio</a> och <a href={sources.indicatorMethod}>Indikators metod</a>.</li>
        <li><strong>Mandatsimuleringen.</strong> Mandaten fördelas nationellt med riksdagsspärren på 4 procent och den jämkade uddatalsmetoden, först 1,2 och sedan 3, 5, 7 och vidare. Modellen återskapar den officiella totalfördelningen 2022. Tolvprocentsspärren för fasta mandat i en valkrets modelleras inte eftersom scenarierna gäller nationellt L-stöd. <a href={sources.electionMethod}>Valmyndighetens regler</a> och <a href={sources.election2022}>valresultatet 2022</a>.</li>
        <li><strong>Stödrösterna.</strong> I huvudscenariot flyttas röster från M till L medan det blågula röstetalet hålls konstant. Donatorexemplet visar vad som händer om rösterna i stället kommer från KD. Detta är ett tankeexperiment med fasta övriga partier.</li>
        <li><strong>Antalet röster.</strong> 32&nbsp;000 och 117&nbsp;000 är avrundade storleksordningar baserade på 6&nbsp;479&nbsp;401 giltiga röster i riksdagsvalet 2022. Antalet giltiga röster 2026 blir ett annat.</li>
        <li><strong>Strategisk röstning.</strong> Uppgifterna om 16 och 20 procent, L-väljarnas andra förstahandsval och väljarflödet M till L kommer från kapitel 26 i <a href={sources.strategicVoting2022}>Väljarna och valet 2022</a>. Sexton procent följer författarnas striktare definition och ska beskrivas som potentiellt strategiska röster.</li>
        <li><strong>L-väljarnas beslut.</strong> Uppgiften att 60 procent bestämde sig sista veckan kommer från Valforskningsprogrammets partirapport. Skattningen bygger på 364–367 svar och är viktad mot partival och validerat valdeltagande. <a href={sources.liberalVoters2022}>Valet 2022: Liberalerna</a>.</li>
        <li><strong>Surveyexperimentet.</strong> 3&nbsp;259 deltagare lottades till mätningar där L, KD eller MP visades på 2,5, 4,0 eller 5,5 procent. För L var skillnaderna mellan nivåerna inte statistiskt säkerställda. Den tydligaste försäkringseffekten gällde KD. <a href={sources.insuranceVoting}>Insurance Voting in the Centre</a>.</li>
        <li><strong>Spelteorin.</strong> Samordningsförklaringen bygger på forskning om strategisk röstning i proportionella valsystem med koalitioner, spärrar och opinionsmätningar. <a href={sources.coordinationStudy}>Blais, Erisen och Rheault</a> samt <a href={sources.pollsAndCoalitions}>Herrmann</a>.</li>
        <li><strong>Historiken.</strong> Valresultaten 1948–2022 kommer från SCB och följer Folkpartiet/Liberalerna. Punkten för 2026 är en mätning. <a href={sources.scbHistory}>SCB:s historiska valstatistik</a>.</li>
        <li><strong>Mätning mot val.</strong> Punkterna nära valen 2010–2022 är hämtade ur SVT/Verians historiska serie och ligger 8–18 dagar före respektive val. Fyra observationer används för att ge historisk orientering, inte för att räkna fram en sannolikhet. <a href={sources.svtHistory}>SVT:s Väljarbarometer</a>.</li>
        <li><strong>Majoriteten.</strong> Berättelsen räknar en egen blågul riksdagsmajoritet. Regeringsbildning avgörs också av vilka partier som tolererar en statsminister.</li>
      </ul>
    </div>
  </section>
</main>

<footer>
  <p>Om taktikröstning inför riksdagsvalet 2026.</p>
  <a href="https://plainx.dev/">Fler berättelser på (<i>x</i>)plain</a>
</footer>
