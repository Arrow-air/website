export interface ProjectionFit {
  scale: number;
  tx: number;
  ty: number;
}

export function naturalEarth1Raw(
  lambda: number,
  phi: number,
): [number, number];

export function projectLngLat(
  lng: number,
  lat: number,
  fit: ProjectionFit,
): [number, number];
