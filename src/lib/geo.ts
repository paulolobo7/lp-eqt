export type Coordenada = { lat: number; lng: number };

const RAIO_TERRA_M = 6_371_008.8;
const rad = (g: number) => (g * Math.PI) / 180;

/** Distância em metros sobre a esfera (fórmula de haversine). */
export function haversineM(a: Coordenada, b: Coordenada): number {
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * RAIO_TERRA_M * Math.asin(Math.min(1, Math.sqrt(h)));
}

/**
 * Distância de um ponto a um trecho de linha. Projeta em plano local
 * (equiretangular), suficiente para trechos de poucos quilômetros, e mede o
 * resultado com haversine.
 */
export function distanciaAteSegmentoM(p: Coordenada, a: Coordenada, b: Coordenada): number {
  const k = Math.cos(rad(p.lat));
  const ax = a.lng * k, ay = a.lat;
  const bx = b.lng * k, by = b.lat;
  const px = p.lng * k, py = p.lat;
  const dx = bx - ax, dy = by - ay;
  const len2 = dx * dx + dy * dy;
  const t = len2 === 0 ? 0 : Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / len2));
  const proj = { lat: ay + t * dy, lng: (ax + t * dx) / k };
  return haversineM(p, proj);
}

export function distanciaAteLinhaM(p: Coordenada, linha: Coordenada[]): number {
  if (linha.length === 0) throw new Error("Linha sem pontos");
  if (linha.length === 1) return haversineM(p, linha[0]);
  let min = Infinity;
  for (let i = 0; i < linha.length - 1; i++) min = Math.min(min, distanciaAteSegmentoM(p, linha[i], linha[i + 1]));
  return min;
}
