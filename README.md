# Vad är en taktikröst på Liberalerna värd?

En svensk scrollytelling om fyraprocentsspärren, stödröster och Liberalernas läge inför riksdagsvalet 2026.

Berättelsen utgår från Demoskops mätning publicerad den 27 augusti 2026 och är uppdelad i fyra scrollakter. Först flyttas röster från Moderaterna till Liberalerna och riksdagens 349 mandat räknas om, både i den daterade mätningen och i ett uttryckligen hypotetiskt jämnt val. Sedan behandlas taktikröstningen som ett samordningsspel och samma stöd prövas med M, SD respektive KD som avsändare. Den sista akten undersöker om ett sent mätvärde kan förändras tillräckligt före valdagen, med L-väljarnas sena beslut 2022, ett surveyexperiment och sena mätningar från fyra val.

Målet är att visa vilka villkor som måste vara uppfyllda för att en stödröst på L ska bidra till en majoritet för Tidöpartierna, utan att göra berättelsen till ett råd om hur någon ska rösta.

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

`pnpm check` förutsätter att preview-servern kör på port 4173. Testet går igenom berättelsens 16 steg i fyra akter och sju viewports från 1 440 till 320 px. Därefter sveper det varje tiotal pixlar från 300 till 1 000. Det kontrollerar mandatfördelningen, stegens aktivering, konsolfel, fokus, reducerad rörelse och horisontellt spill. Skärmbilder sparas i `/tmp/scrolly-election-shots-tactical`.

## Modell och källor

Mandaten fördelas nationellt med fyraprocentsspärren och jämkade uddatalsmetoden. Huvudscenariot håller Tidöpartiernas totala stöd konstant genom att flytta röster från M till L. Ett separat exempel jämför vad som händer när samma röster i stället kommer från SD eller KD. Modellen är ett pedagogiskt tankeexperiment, inte en prognos över faktiska väljarflöden eller regeringsbildning.

Alla använda källor, antaganden och avgränsningar redovisas i berättelsens metodavsnitt. Historiska valresultat kommer från SCB och Valmyndigheten. Opinionsdata kommer från Demoskop, Ipsos, Indikator Opinion och SVT/Verian. Forskningsdelen använder svenska valundersökningar samt studier av försäkringsröstning, opinionsmätningar och samordning.
