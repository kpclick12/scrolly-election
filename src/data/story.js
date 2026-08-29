export const colors = {
  M: "#2f6fb2",
  C: "#4f8a63",
  L: "#3157c8",
  KD: "#5862a6",
  MP: "#27836d",
  S: "#d34c5d",
  V: "#a43d77",
  SD: "#d3a62c",
  "Övr": "#8a93a5",
};

export const partyNames = {
  M: "Moderaterna",
  C: "Centerpartiet",
  L: "Liberalerna",
  KD: "Kristdemokraterna",
  MP: "Miljöpartiet",
  S: "Socialdemokraterna",
  V: "Vänsterpartiet",
  SD: "Sverigedemokraterna",
  "Övr": "Övriga",
};

export const parties = Object.keys(partyNames).map((code) => ({
  code,
  name: partyNames[code],
  color: colors[code],
}));

// Demoskop, publicerad 27 augusti 2026. Fältarbete 13–24 augusti,
// 2 117 webbintervjuer i Iniziopanelen. De redovisade partisiffrorna
// summerar till exakt 100 procent.
export const pollSnapshot = {
  institute: "Demoskop",
  published: "27 augusti 2026",
  fieldwork: "13–24 augusti 2026",
  interviews: 2117,
};

export const demoskop2026 = {
  S: 30.4,
  SD: 18.3,
  M: 17.2,
  V: 6.8,
  MP: 6.8,
  C: 7.7,
  KD: 8.5,
  L: 2.0,
  "Övr": 2.3,
};

export const recentLPolls = [
  { institute: "Demoskop", published: "27 aug", value: 2.0, current: true },
  { institute: "Ipsos", published: "25 aug", value: 2.3 },
  { institute: "Indikator", published: "23 aug", value: 2.2 },
];

export const validVotes2022 = 6477970;
export const currentGapVoters = Math.round((4 - demoskop2026.L) / 100 * validVotes2022 / 1000) * 1000;

export const tidoParties = new Set(["M", "KD", "L", "SD"]);
export const opposition = new Set(["S", "V", "MP", "C"]);

const allocationOrder = ["S", "SD", "M", "V", "MP", "C", "KD", "L", "Övr"];

export function allocateSeats(shares, seats = 349) {
  const total = Object.values(shares).reduce((sum, value) => sum + value, 0);
  const eligible = allocationOrder.filter((code) => (shares[code] ?? 0) / total >= 0.04);
  const result = Object.fromEntries(allocationOrder.map((code) => [code, 0]));

  for (let seat = 0; seat < seats; seat += 1) {
    let winner = eligible[0];
    let best = -Infinity;
    for (const code of eligible) {
      const divisor = result[code] === 0 ? 1.2 : result[code] * 2 + 1;
      const quotient = shares[code] / divisor;
      if (quotient > best) {
        best = quotient;
        winner = code;
      }
    }
    result[winner] += 1;
  }
  return result;
}

export function scenarioForL(liberalShare, donor = "M") {
  const shares = { ...demoskop2026 };
  const transfer = liberalShare - demoskop2026.L;
  shares.L = liberalShare;
  shares[donor] -= transfer;
  const seats = allocateSeats(shares);
  const tidoSeats = [...tidoParties].reduce((sum, code) => sum + seats[code], 0);
  const oppositionSeats = [...opposition].reduce((sum, code) => sum + seats[code], 0);
  const tidoVoteShare = [...tidoParties].reduce((sum, code) => sum + shares[code], 0);
  return { liberalShare, donor, transfer, shares, seats, tidoSeats, oppositionSeats, tidoVoteShare, hypothetical: false };
}

// I det hypotetiskt jämna valet flyttas först 4,1 procentenheter från S till M.
// Tidöpartierna har då 50,1 procent i båda lägena. Därefter jämförs samma interna
// fördelning precis under och precis på L-spärren.
export function hypotheticalScenarioForL(liberalShare) {
  const shares = { ...demoskop2026 };
  shares.S -= 4.1;
  shares.M += 4.1;
  const transfer = liberalShare - demoskop2026.L;
  shares.L = liberalShare;
  shares.M -= transfer;
  const seats = allocateSeats(shares);
  const tidoSeats = [...tidoParties].reduce((sum, code) => sum + seats[code], 0);
  const oppositionSeats = [...opposition].reduce((sum, code) => sum + seats[code], 0);
  const tidoVoteShare = [...tidoParties].reduce((sum, code) => sum + shares[code], 0);
  return { liberalShare, donor: "M", transfer, shares, seats, tidoSeats, oppositionSeats, tidoVoteShare, hypothetical: true };
}

export const seatScenarios = [
  scenarioForL(2.0),
  scenarioForL(3.9),
  scenarioForL(4.0),
  hypotheticalScenarioForL(3.9),
  hypotheticalScenarioForL(4.0),
];

export const liberalHistory = [
  { year: 1948, value: 22.8 },
  { year: 1952, value: 24.4 },
  { year: 1956, value: 23.8 },
  { year: 1958, value: 18.2 },
  { year: 1960, value: 17.5 },
  { year: 1964, value: 17.0 },
  { year: 1968, value: 14.3 },
  { year: 1970, value: 16.2 },
  { year: 1973, value: 9.4 },
  { year: 1976, value: 11.1 },
  { year: 1979, value: 10.6 },
  { year: 1982, value: 5.9 },
  { year: 1985, value: 14.2 },
  { year: 1988, value: 12.2 },
  { year: 1991, value: 9.1 },
  { year: 1994, value: 7.2 },
  { year: 1998, value: 4.7 },
  { year: 2002, value: 13.4 },
  { year: 2006, value: 7.5 },
  { year: 2010, value: 7.1 },
  { year: 2014, value: 5.4 },
  { year: 2018, value: 5.5 },
  { year: 2022, value: 4.6 },
  { year: 2026, value: 2.0, poll: true },
];

export const pollHistory = [
  { year: 2010, days: 18, poll: 6.75, result: 7.06 },
  { year: 2014, days: 13, poll: 8.43, result: 5.42 },
  { year: 2018, days: 8, poll: 6.0, result: 5.49 },
  { year: 2022, days: 10, poll: 5.6, result: 4.61 },
];

export const strategicVoting2022 = {
  strictAllVoters: 16,
  broadAllVoters: 20,
  liberalVotersOtherFirstChoice: 32,
  liberalVotersDecidedLastWeek: 60,
  potentialStrategicFlowMtoL: 5.5,
};

export const insuranceExperiment = [
  { shownPoll: 2.5, liberalVote: 6.78 },
  { shownPoll: 4.0, liberalVote: 4.80 },
  { shownPoll: 5.5, liberalVote: 4.93 },
];

export const supportVoteThresholds = {
  wasteMedian: 3.0,
  dareMedian: 3.5,
  wasteMean: 2.9,
  dareMean: 3.6,
  interviews: 1461,
  fieldwork: "11–23 augusti 2026",
};

export const sources = {
  scbHistory: "https://www.scb.se/hitta-statistik/statistik-efter-amne/demokrati/allmanna-val/allmanna-val-valresultat/pong/tabell-och-diagram/historisk-valstatistik/historisk-statistik-over-valaren-19102022.-procentuell-fordelning-av-giltiga-valsedlar-efter-parti-och-typ-av-val",
  indicator: "https://www.sverigesradio.se/artikel/tido-partierna-knappar-in-pa-oppositionens-ledning",
  indicatorMethod: "https://www.indikator.org/opinion-sr/",
  demoskop: "https://demoskop.se/extra-valjarbarometer-augusti-2026/",
  ipsos: "https://www.svd.se/a/0p33lG/valet-2026-sverige-live-senaste-nytt?pinnedEntry=76534",
  pollMisses: "https://www.aftonbladet.se/nyheter/a/XMpdEB/partierna-som-opinionsmatningar-brukar-missa",
  svtPoll: "https://www.svt.se/nyheter/inrikes/kristersson-pressas-ny-matning-visar-stort-gap",
  svtHistory: "https://www.svt.se/special/valjarbarometern/",
  akesson: "https://www.svt.se/nyheter/inrikes/akessons-skarpa-grans-for-l-tio-dagar",
  mohamsson: "https://www.aftonbladet.se/nyheter/a/e7yAoQ/mohamssons-vadjan-ber-om-stodroster",
  electionMethod: "https://www.val.se/det-svenska-valsystemet/rostrakning-och-mandatfordelning/sa-fordelas-mandaten",
  election2022: "https://www.val.se/valresultat-och-statistik/riksdags--region--och-kommunval/valresultat-2022",
  insuranceVoting: "https://research.chalmers.se/publication/542435/file/542435_Fulltext.pdf",
  strategicVoting2022: "https://www.gu.se/sites/default/files/2024-05/VoV_kap26.pdf",
  liberalVoters2022: "https://www.gu.se/sites/default/files/2025-09/R2025_4_Liberalerna.pdf",
  coordinationStudy: "https://journals.sagepub.com/doi/10.1177/1065912913520573",
  pollsAndCoalitions: "https://journals.sagepub.com/doi/10.1177/0951629813505722",
  dnSupportVoting: "https://www.dn.se/sverige/har-gar-gransen-da-dumpar-stodrostarna-mohamsson/",
};
