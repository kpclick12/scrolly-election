# Vad är en taktikröst på Liberalerna värd?

En svensk scrollytelling om fyraprocentsspärren, stödröster och Liberalernas läge inför riksdagsvalet 2026.

Berättelsen utgår från Indikator Opinions mätning i augusti 2026 och är uppdelad i tre scrollakter. Först flyttas röster från Moderaterna till Liberalerna och riksdagens 349 mandat räknas om. Sedan behandlas taktikröstningen som ett samordningsspel. Den sista akten prövar resonemanget mot svenska valundersökningar, ett surveyexperiment och sena mätningar från fyra val.

Målet är att förklara vad som förändras mellan 2,2 och 3,5 procent utan att låtsas veta exakt hur stor Liberalernas chans är.

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

`pnpm check` förutsätter att preview-servern kör på port 4173. Testet går igenom berättelsens 16 steg i tre akter och sju viewports från 1 440 till 320 px. Därefter sveper det varje tiotal pixlar från 300 till 1 000. Det kontrollerar mandatfördelningen, stegens aktivering, konsolfel, fokus, reducerad rörelse och horisontellt spill. Skärmbilder sparas i `/tmp/scrolly-election-shots-tactical`.

## Modell och källor

Mandaten fördelas nationellt med fyraprocentsspärren och jämkade uddatalsmetoden. Huvudscenariot håller det blågula röstetalet konstant genom att flytta stöd från M till L. Ett separat exempel visar risken med att ta samma röster från KD. Modellen är ett pedagogiskt tankeexperiment, inte en prognos över faktiska väljarflöden eller regeringsbildning.

Alla använda källor, antaganden och avgränsningar redovisas i berättelsens metodavsnitt. Historiska valresultat kommer från SCB och Valmyndigheten. Opinionsdata kommer från Indikator Opinion/Sveriges Radio och SVT/Verian. Forskningsdelen använder svenska valundersökningar samt studier av försäkringsröstning, opinionsmätningar och samordning.
