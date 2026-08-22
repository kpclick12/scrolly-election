function walkCoordinates(geometry, visitor) {
  const polygons = geometry.type === "Polygon" ? [geometry.coordinates] : geometry.coordinates;
  for (const polygon of polygons) {
    for (const ring of polygon) {
      for (const point of ring) visitor(point);
    }
  }
}

export function boundsOf(features) {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const feature of features) {
    walkCoordinates(feature.geometry, ([x, y]) => {
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
    });
  }
  return { minX, minY, maxX, maxY };
}

export function projector(bounds, width, height, padding = 20) {
  // GeoJSON is stored as longitude/latitude. Scaling those degrees directly
  // makes Sweden far too wide because a degree of longitude covers much less
  // ground this far north. Web Mercator gives the national outline the same
  // proportions readers recognise from ordinary Swedish maps.
  const mercatorY = (latitude) => {
    const clamped = Math.max(-85, Math.min(85, latitude));
    const radians = clamped * Math.PI / 180;
    return Math.log(Math.tan(Math.PI / 4 + radians / 2)) * 180 / Math.PI;
  };
  const projected = {
    minX: bounds.minX,
    maxX: bounds.maxX,
    minY: mercatorY(bounds.minY),
    maxY: mercatorY(bounds.maxY),
  };
  const scale = Math.min(
    (width - padding * 2) / (projected.maxX - projected.minX),
    (height - padding * 2) / (projected.maxY - projected.minY),
  );
  const contentWidth = (projected.maxX - projected.minX) * scale;
  const contentHeight = (projected.maxY - projected.minY) * scale;
  const offsetX = (width - contentWidth) / 2;
  const offsetY = (height - contentHeight) / 2;
  return ([x, y]) => [
    offsetX + (x - projected.minX) * scale,
    offsetY + (projected.maxY - mercatorY(y)) * scale,
  ];
}
