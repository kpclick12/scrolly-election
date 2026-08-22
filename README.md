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

`pnpm check` förutsätter att preview-servern kör på port 4173. Testet går igenom berättelsens femton scrollsteg i 1440 px, ett kort desktopfönster, 820 px, 517 px, 390 px och 320 px. Det minsta läget använder reducerad rörelse. Testet kontrollerar kart-, köns- och urvalsövergångarna, mandatfigurens 349 punkter, konsolfel och horisontellt spill. Skärmbilder sparas i `/tmp/scrolly-election-shots-general`.

Berättelsen använder punkter som ett återkommande språk, men bara tre längre rörelsesekvenser. Mandatpunkterna ordnas från en gemensam mängd till åtta partirader. Kartan växlar en gång från färgad landyta till valdistriktspunkter och flyttar sedan kameran mellan fyra distrikt. Urvalssekvensen följer samma fiktiva population från urvalsram till slumpvariation, bortfall och viktning. Könsdiagrammet gör en kort fokusering och slutkedjan är medvetet stilla.

## Data

Källfiler och förbehandlade utdrag finns under `data/raw`, `data/processed`, `src/data` och `public/data`. Klientkartan innehåller 6 264 valdistriktsgränser, antal giltiga röster, valdeltagande, andel 65+, andel med lång utbildning samt andelar och topp-tvåplacering för de åtta partier som tog plats i riksdagen 2022. Råfilen innehåller även övriga partier. Den stora kartfilen innehåller bara de åtta riksdagspartierna, medan de fyra redaktionellt valda stoppen också redovisar övriga partier tillsammans. Berättelsen skiljer uttryckligen mellan 2022 års valresultat, 2026 års partisympati och den fiktiva simuleringen. Full metod- och källredovisning ligger i sidans avslutande avsnitt.

`scripts/fetch-district-geometry.sh` hämtar Valmyndighetens 21 länsvisa GIS-paket och slutliga resultatfil för riksdagsvalet 2022 samt enbart de områdesfält som används från SCB:s ArcGIS-lager. Skriptet verifierar resultatfilens SHA-256, extraherar valdeltagande och resultat för de åtta riksdagspartierna, gör en strikt join på åttasiffrig valdistriktskod, transformerar geometrin från SWEREF 99 TM till WGS84 och återskapar `public/data/districts-map.json`.

```sh
bash scripts/fetch-district-geometry.sh
```

Körningen kräver `curl`, `unzip`, `jq`, Python 3, Node.js och installerade projektberoenden. Exakta källor, bearbetningssteg och joinresultat beskrivs i [`data/README.md`](data/README.md).
