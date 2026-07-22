// Natural Earth I projection (Šavrič et al. 2011) — the same polynomial
// approximation d3-geo uses for geoNaturalEarth1, implemented standalone so
// both the build-time geometry generator (scripts/generate-map-geometry.mjs)
// and the runtime <ContributorMap /> component project coordinates
// identically without a d3 dependency.

const RAD = Math.PI / 180;

/**
 * Raw Natural Earth I forward projection.
 * @param {number} lambda longitude in radians
 * @param {number} phi latitude in radians
 * @returns {[number, number]} projected [x, y] in unit space (y up)
 */
export function naturalEarth1Raw(lambda, phi) {
  const phi2 = phi * phi;
  const phi4 = phi2 * phi2;
  return [
    lambda *
      (0.8707 -
        0.131979 * phi2 +
        phi4 * (-0.013791 + phi4 * (0.003971 * phi2 - 0.001529 * phi4))),
    phi *
      (1.007226 +
        phi2 * (0.015085 + phi4 * (-0.044475 + 0.028874 * phi2 - 0.005916 * phi4))),
  ];
}

/**
 * Project [lng, lat] in degrees to SVG pixel space using the fit parameters
 * computed at geometry-generation time ({scale, tx, ty} from
 * world-map-geometry.json). SVG y grows downward, hence the negation.
 * @param {number} lng longitude in degrees
 * @param {number} lat latitude in degrees
 * @param {{scale: number, tx: number, ty: number}} fit
 * @returns {[number, number]} [x, y] in SVG pixels
 */
export function projectLngLat(lng, lat, fit) {
  const [x, y] = naturalEarth1Raw(lng * RAD, lat * RAD);
  return [x * fit.scale + fit.tx, -y * fit.scale + fit.ty];
}
