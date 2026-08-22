import fs from "node:fs";
import path from "node:path";
import proj4 from "proj4";

const valJsonDir = "data/raw/valmyndigheten/2022/gis-json";
const scbPath = "data/processed/scb-2022-district-attributes.json";
const resultsPath = "data/processed/valmyndigheten-2022-district-results.json";
const outputPath = "public/data/districts-map.json";
const reportPath = "data/processed/district-map-join-report.json";
const simplifyToleranceMetres = 100;

proj4.defs(
  "EPSG:3006",
  "+proj=utm +zone=33 +ellps=GRS80 +units=m +no_defs +type=crs",
);

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function idSet(map) {
  return new Set(map.keys());
}

function difference(left, right) {
  return [...left].filter((value) => !right.has(value)).sort();
}

function mapUnique(items, getId, label) {
  const output = new Map();
  for (const item of items) {
    const id = String(getId(item) ?? "").trim();
    if (!/^\d{8}$/.test(id)) {
      throw new Error(`Invalid ${label} district id: ${JSON.stringify(id)}`);
    }
    if (output.has(id)) throw new Error(`Duplicate ${label} district id: ${id}`);
    output.set(id, item);
  }
  return output;
}

function sqSegmentDistance(point, start, end) {
  let x = start[0];
  let y = start[1];
  let dx = end[0] - x;
  let dy = end[1] - y;
  if (dx !== 0 || dy !== 0) {
    const position = ((point[0] - x) * dx + (point[1] - y) * dy) / (dx * dx + dy * dy);
    if (position > 1) {
      x = end[0];
      y = end[1];
    } else if (position > 0) {
      x += dx * position;
      y += dy * position;
    }
  }
  dx = point[0] - x;
  dy = point[1] - y;
  return dx * dx + dy * dy;
}

function simplifyStep(points, first, last, sqTolerance, kept) {
  let maxDistance = sqTolerance;
  let index = 0;
  for (let cursor = first + 1; cursor < last; cursor += 1) {
    const distance = sqSegmentDistance(points[cursor], points[first], points[last]);
    if (distance > maxDistance) {
      index = cursor;
      maxDistance = distance;
    }
  }
  if (maxDistance > sqTolerance) {
    if (index - first > 1) simplifyStep(points, first, index, sqTolerance, kept);
    kept.push(points[index]);
    if (last - index > 1) simplifyStep(points, index, last, sqTolerance, kept);
  }
}

function simplifyRing(ring) {
  if (ring.length <= 5) return ring;
  const open = ring.slice(0, -1);
  const kept = [open[0]];
  simplifyStep(
    open,
    0,
    open.length - 1,
    simplifyToleranceMetres ** 2,
    kept,
  );
  kept.push(open.at(-1));
  kept.push(kept[0]);
  return kept.length >= 4 ? kept : ring;
}

function transformPoint(point) {
  const [longitude, latitude] = proj4("EPSG:3006", "EPSG:4326", point);
  return [
    Number(longitude.toFixed(5)),
    Number(latitude.toFixed(5)),
  ];
}

function transformGeometry(geometry) {
  const transformPolygon = (polygon) => polygon.map((ring) =>
    simplifyRing(ring).map(transformPoint)
  );
  if (geometry.type === "Polygon") {
    return { type: "Polygon", coordinates: transformPolygon(geometry.coordinates) };
  }
  if (geometry.type === "MultiPolygon") {
    return {
      type: "MultiPolygon",
      coordinates: geometry.coordinates.map(transformPolygon),
    };
  }
  throw new Error(`Unsupported geometry type: ${geometry.type}`);
}

function normalizedName(value) {
  return String(value ?? "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/m\.fl\./g, "m fl")
    .replace(/[^a-z0-9åäö]+/g, " ")
    .trim();
}

const valFiles = fs.readdirSync(valJsonDir)
  .filter((filename) => filename.endsWith(".json"))
  .sort();
if (valFiles.length !== 21) {
  throw new Error(`Expected 21 county GIS JSON files, found ${valFiles.length}`);
}

const valFeatures = valFiles.flatMap((filename) => {
  const payload = readJson(path.join(valJsonDir, filename));
  if (!Array.isArray(payload.features)) {
    throw new Error(`Missing features in ${filename}`);
  }
  return payload.features.map((feature) => ({ ...feature, sourceFile: filename }));
});
const geometryById = mapUnique(
  valFeatures,
  (feature) => feature.properties?.Lkfv,
  "Valmyndigheten geometry",
);

const scbPayload = readJson(scbPath);
const scbById = mapUnique(
  scbPayload.features,
  (feature) => feature.attributes?.Valdistrik,
  "SCB attribute",
);

const resultsPayload = readJson(resultsPath);
const resultsById = mapUnique(
  resultsPayload.districts,
  (district) => district.id,
  "Valmyndigheten district result",
);

const geometryIds = idSet(geometryById);
const scbIds = idSet(scbById);
const resultIds = idSet(resultsById);
const geometryMissingScb = difference(geometryIds, scbIds);
const scbMissingGeometry = difference(scbIds, geometryIds);
const geometryMissingResult = difference(geometryIds, resultIds);
const resultMissingGeometry = difference(resultIds, geometryIds);

const exactNameMismatches = [];
const normalizedNameMismatches = [];
for (const [id, feature] of geometryById) {
  const geometryName = String(feature.properties.Vdnamn ?? "").trim();
  const resultName = String(resultsById.get(id)?.name ?? "").trim();
  const scbName = String(scbById.get(id)?.attributes?.Valdistr_1 ?? "").trim();
  if (geometryName !== resultName || geometryName !== scbName) {
    exactNameMismatches.push({ id, geometryName, resultName, scbName });
  }
  if (
    normalizedName(geometryName) !== normalizedName(resultName)
    || normalizedName(geometryName) !== normalizedName(scbName)
  ) {
    normalizedNameMismatches.push({ id, geometryName, resultName, scbName });
  }
}

const joinFailures = [
  ...geometryMissingScb,
  ...scbMissingGeometry,
  ...geometryMissingResult,
  ...resultMissingGeometry,
];
if (joinFailures.length > 0) {
  throw new Error(`District join is incomplete; see counts after fixing source inputs`);
}

const outputFeatures = [...geometryById.entries()]
  .sort(([left], [right]) => left.localeCompare(right))
  .map(([id, feature]) => {
    const scb = scbById.get(id).attributes;
    const result = resultsById.get(id);
    if (!(scb.A_TOTålde > 0) || !(scb.UTB_TOTutb > 0)) {
      throw new Error(`Missing SCB denominator for ${id}`);
    }
    return {
      type: "Feature",
      geometry: transformGeometry(feature.geometry),
      properties: {
        id,
        name: String(feature.properties.Vdnamn).trim(),
        municipality: String(scb.KommunNamn).trim(),
        validVotes: result.validVotes,
        turnout: result.turnout,
        older: 100 * scb["A_65__år"] / scb["A_TOTålde"],
        education: 100 * scb["UTB_Lång_"] / scb["UTB_TOTutb"],
        parties: result.parties,
        leadingParty: result.leadingParty,
        leadingShare: result.leadingShare,
        runnerUpParty: result.runnerUpParty,
        runnerUpShare: result.runnerUpShare,
      },
    };
  });

const report = {
  sources: {
    geometry: "Valmyndigheten, 21 county GIS JSON files for election 2022, SWEREF99 TM",
    districtResults: "Valmyndigheten, final district votes and total turnout, parliamentary election 2022",
    socioeconomic: "SCB district analysis ArcGIS attributes, 2022",
  },
  counts: {
    valCountyFiles: valFiles.length,
    geometryFeatures: valFeatures.length,
    uniqueGeometryIds: geometryById.size,
    scbAttributeRows: scbPayload.features.length,
    uniqueScbIds: scbById.size,
    districtResultRows: resultsPayload.districts.length,
    uniqueDistrictResultIds: resultsById.size,
    clientFeatures: outputFeatures.length,
  },
  join: {
    key: "8-digit district code: Valmyndigheten Lkfv = Excel Valdistriktskod = SCB Valdistrik",
    geometryMissingScb,
    scbMissingGeometry,
    geometryMissingResult,
    resultMissingGeometry,
    exactNameMismatchCount: exactNameMismatches.length,
    exactNameMismatches,
    normalizedNameMismatchCount: normalizedNameMismatches.length,
    normalizedNameMismatches,
  },
  client: {
    geometryCrs: "WGS84 (EPSG:4326)",
    sourceGeometryCrs: "SWEREF99 TM (EPSG:3006)",
    simplifyToleranceMetres,
    coordinateDecimals: 5,
    properties: ["id", "name", "municipality", "validVotes", "turnout", "older", "education", "parties", "leadingParty", "leadingShare", "runnerUpParty", "runnerUpShare"],
    partyScope: "Eight parties seated in the Riksdag after the 2022 election",
  },
};

const output = {
  type: "FeatureCollection",
  metadata: {
    geometrySource: "Valmyndigheten 2022 county GIS JSON",
    districtResultSource: "Valmyndigheten final parliamentary-election district workbook 2022",
    socioeconomicSource: "SCB district attributes 2022",
    sourceCrs: "EPSG:3006",
    clientCrs: "EPSG:4326",
    generalizedMetres: simplifyToleranceMetres,
  },
  features: outputFeatures,
};

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.mkdirSync(path.dirname(reportPath), { recursive: true });
fs.writeFileSync(outputPath, JSON.stringify(output));
fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);

console.log(JSON.stringify(report.counts));
console.log(JSON.stringify({
  geometryMissingScb: geometryMissingScb.length,
  scbMissingGeometry: scbMissingGeometry.length,
  geometryMissingResult: geometryMissingResult.length,
  resultMissingGeometry: resultMissingGeometry.length,
  exactNameMismatchCount: exactNameMismatches.length,
  normalizedNameMismatchCount: normalizedNameMismatches.length,
}));
