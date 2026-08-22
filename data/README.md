# Kartdata 2022

## Råkällor

- `raw/valmyndigheten/2022/gis-zips`: Valmyndighetens 21 länsvisa GIS-paket för valdistrikten 2022, hämtade från [Rådata och statistik från tidigare val](https://www.val.se/valresultat-och-statistik/statistik-och-data/radata-fran-val-2002-2022). Filerna innehåller länsstyrelsernas geometrier i SWEREF 99 TM (EPSG:3006), distriktskod (`Lkfv`) och distriktsnamn (`Vdnamn`).
- `raw/valmyndigheten/2022/gis-json`: oförändrade JSON-filer extraherade ur de 21 paketen.
- `raw/valmyndigheten/2022/results`: Valmyndighetens Excel-fil *Röster per distrikt, slutligt antal röster, inklusive totalt valdeltagande, riksdagsvalet 2022*. Den förväntade SHA-256-summan är `02220e73a7f497d02e23e11cc0765b9891f3a11b3738a5750182ca0c2c58a04d`.
- `raw/scb/2022/district-attributes-pages`: paginerade svar utan geometri från [SCB:s exakta ArcGIS-lager](https://services8.arcgis.com/9CUL84k8apjo6IDh/ArcGIS/rest/services/Valdistrikt_SocEk_ValResult_2022/FeatureServer/0). Från SCB används kommun, antal 65+, åldersbas, antal med lång utbildning och utbildningsbas. Inga partifält hämtas i detta flöde.

`processed/source-sha256.txt` innehåller kontrollsummor för samtliga råfiler.

## Bearbetning

1. `scripts/extract-valmyndigheten-results.py` läser arbetsbladet `roster_RD`. Valdeltagandet räknas från raden `Parti = Valdeltagande` som `100 × Röster / Röstberättigade`. Partandelarna räknas som `100 × partiets Röster / Summa giltiga röster`. Utdraget behåller endast M, C, L, KD, MP, S, V och SD: de åtta partier som tog plats i riksdagen 2022. Övriga partirader finns kvar i råarbetsboken men förs inte till bearbetad data eller klienten.
2. `scripts/build-district-map.mjs` kräver exakt 21 GIS-filer och unika åttasiffriga koder i alla tre källmängder. Joinnyckeln är `Lkfv` (GIS) = `Valdistriktskod` (Excel) = `Valdistrik` (SCB). Namn används bara för diagnostik.
3. Valmyndighetens geometri generaliseras med 100 meters tolerans i källprojektionen och transformeras sedan till WGS84 (EPSG:4326).
4. Klientfilen `public/data/districts-map.json` tillåter egenskaperna `id`, `name`, `municipality`, `turnout`, `older`, `education`, `parties`, `leadingParty`, `leadingShare`, `runnerUpParty` och `runnerUpShare`. `parties` har exakt de åtta koderna ovan.

## Verifierad join

Körningen ger 6 264 geometrier, 6 264 distriktsresultat och 6 264 SCB-rader. Alla har unika koder; inga koder saknas i någon riktning och klientfilen innehåller 6 264 features. Största parti bland de åtta är S i 4 351 distrikt, SD i 1 048, M i 814, V i 46, KD i 3 och MP i 2. Summan är 6 264; C och L är inte största parti i något distrikt.

Det finns 450 rena textskillnader mellan källornas distriktsnamn, men bara fem kvarstår efter normalisering. En gäller att SCB har namnet `Nya Hovshaga` där Valmyndigheten och Excel har `Kronoberg` för kod `07802989`. Fyra gäller att GIS-filen har längre namn i Avesta än Excel och SCB. De påverkar inte resultatet eftersom joinen sker på kod. Den fullständiga diagnostiken finns i `processed/district-map-join-report.json`.

## Reproduktion

Kör från projektroten:

```sh
bash scripts/fetch-district-geometry.sh
```

Skriptet hämtar om råkällorna, verifierar Excel-filen, bygger de två bearbetade attributfilerna, skriver joinrapporten och ersätter klientkartan. Excel-filen innehåller alla partirader. Den bearbetade resultatfilen och klientkartan innehåller endast de åtta partier som tog plats i riksdagen 2022.
