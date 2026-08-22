import fs from "node:fs";

const [input, output, toleranceArg = "0.01"] = process.argv.slice(2);
if (!input || !output) {
  throw new Error("Usage: node scripts/simplify-geo.mjs input output tolerance");
}

const tolerance = Number(toleranceArg);
const sqTolerance = tolerance * tolerance;

function sqSegmentDistance(point, start, end) {
  let x = start[0];
  let y = start[1];
  let dx = end[0] - x;
  let dy = end[1] - y;
  if (dx !== 0 || dy !== 0) {
    const t = ((point[0] - x) * dx + (point[1] - y) * dy) / (dx * dx + dy * dy);
    if (t > 1) {
      x = end[0];
      y = end[1];
    } else if (t > 0) {
      x += dx * t;
      y += dy * t;
    }
  }
  dx = point[0] - x;
  dy = point[1] - y;
  return dx * dx + dy * dy;
}

function simplifyStep(points, first, last, kept) {
  let maxDistance = sqTolerance;
  let index = 0;
  for (let i = first + 1; i < last; i += 1) {
    const distance = sqSegmentDistance(points[i], points[first], points[last]);
    if (distance > maxDistance) {
      index = i;
      maxDistance = distance;
    }
  }
  if (maxDistance > sqTolerance) {
    if (index - first > 1) simplifyStep(points, first, index, kept);
    kept.push(points[index]);
    if (last - index > 1) simplifyStep(points, index, last, kept);
  }
}

function simplifyRing(ring) {
  if (ring.length <= 5) return ring;
  const open = ring.slice(0, -1);
  const kept = [open[0]];
  simplifyStep(open, 0, open.length - 1, kept);
  kept.push(open.at(-1));
  kept.push(kept[0]);
  return kept.length >= 4 ? kept : ring;
}

function simplifyGeometry(geometry) {
  if (geometry.type === "Polygon") {
    return { ...geometry, coordinates: geometry.coordinates.map(simplifyRing) };
  }
  if (geometry.type === "MultiPolygon") {
    return {
      ...geometry,
      coordinates: geometry.coordinates.map((polygon) => polygon.map(simplifyRing)),
    };
  }
  return geometry;
}

const source = JSON.parse(fs.readFileSync(input, "utf8"));
source.features = source.features.map((feature) => ({
  ...feature,
  geometry: simplifyGeometry(feature.geometry),
}));
fs.writeFileSync(output, `${JSON.stringify(source)}\n`);
