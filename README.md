# Kan vi lita på valundersökningarna?

En svensk scrollytelling om hur några tusen svar kan användas för att beskriva drygt åtta miljoner väljare inför riksdagsvalet 2026.

## Utveckling

```sh
pnpm install
pnpm dev
```

Produktionsbygge och visuell kontroll:

```sh
pnpm build
pnpm preview
pnpm check
```

`pnpm check` förutsätter att preview-servern kör på port 4173. Testet går igenom berättelsens 16 scrollsteg i åtta fulla viewports: 1440, ett kort desktopfönster, brytpunkterna 902, 821 och 820 samt 517, 390 och 320 px. Därefter sveps varje tiotal pixlar från 300 till 1 000. Det minsta läget använder reducerad rörelse. Testet kontrollerar kartresan, könswafflarna, urvalsflödet, mandatfigurens 349 punkter, konsolfel, fokus, mobilkort, brytpunktsklippning och horisontellt spill. Skärmbilder sparas i `/tmp/scrolly-election-shots-general`.

Berättelsen använder punkter som ett återkommande språk utan att göra varje avsnitt till en effekt. Mandatpunkterna ordnas till en halvcirkel med riksdagens 349 mandat. Kartan växlar från färgad landyta till 6 264 valdistriktspunkter, flyttar kameran mellan fyra distrikt och låter därefter samma distrikt övergå till ett spridningsdiagram över utbildning och största partiets röstandel. Könsdiagrammet använder två hundrapunktsfält. Huvudförklaringen följer den verkliga vägen från målpopulation till viktad skattning i SCB:s undersökning i maj 2026.

## Data

Källfiler och förbehandlade utdrag finns under `data/raw`, `data/processed`, `src/data` och `public/data`. Klientkartan innehåller 6 264 valdistriktsgränser, antal giltiga röster, valdeltagande, andel 65+, andel röstberättigade med minst treårig eftergymnasial utbildning samt andelar och topp-tvåplacering för de åtta partier som tog plats i riksdagen 2022. Råfilen innehåller även övriga partier. Den stora kartfilen innehåller bara de åtta riksdagspartierna, medan de fyra redaktionellt valda stoppen också redovisar övriga partier tillsammans. Berättelsen skiljer uttryckligen mellan 2022 års valresultat och 2026 års partisympati. Full metod- och källredovisning ligger i sidans avslutande avsnitt.

`scripts/fetch-district-geometry.sh` hämtar Valmyndighetens 21 länsvisa GIS-paket och slutliga resultatfil för riksdagsvalet 2022 samt enbart de områdesfält som används från SCB:s ArcGIS-lager. Skriptet verifierar resultatfilens SHA-256, extraherar valdeltagande och resultat för de åtta riksdagspartierna, gör en strikt join på åttasiffrig valdistriktskod, transformerar geometrin från SWEREF 99 TM till WGS84 och återskapar `public/data/districts-map.json`.

```sh
bash scripts/fetch-district-geometry.sh
```

Körningen kräver `curl`, `unzip`, `jq`, Python 3, Node.js och installerade projektberoenden. Exakta källor, bearbetningssteg och joinresultat beskrivs i [`data/README.md`](data/README.md).
