import { describe, expect, it } from "vitest";
import { distanciaAteLinhaM, distanciaAteSegmentoM, haversineM } from "./geo";

describe("haversineM", () => {
  it("é zero para o mesmo ponto", () => {
    expect(haversineM({ lat: -2.5, lng: -44.3 }, { lat: -2.5, lng: -44.3 })).toBe(0);
  });

  it("mede 1 grau de latitude em cerca de 111,2 km", () => {
    const d = haversineM({ lat: 0, lng: 0 }, { lat: 1, lng: 0 });
    expect(d).toBeGreaterThan(111_000);
    expect(d).toBeLessThan(111_400);
  });

  it("é simétrica", () => {
    const a = { lat: -2.52, lng: -44.28 };
    const b = { lat: -2.55, lng: -44.31 };
    expect(haversineM(a, b)).toBeCloseTo(haversineM(b, a), 6);
  });
});

describe("distanciaAteSegmentoM", () => {
  const a = { lat: 0, lng: 0 };
  const b = { lat: 0, lng: 0.01 };

  it("usa a perpendicular quando a projeção cai dentro do segmento", () => {
    const p = { lat: 0.001, lng: 0.005 };
    expect(distanciaAteSegmentoM(p, a, b)).toBeCloseTo(haversineM(p, { lat: 0, lng: 0.005 }), 0);
  });

  it("usa a ponta mais próxima quando a projeção cai fora", () => {
    const p = { lat: 0, lng: 0.02 };
    expect(distanciaAteSegmentoM(p, a, b)).toBeCloseTo(haversineM(p, b), 0);
  });

  it("aceita segmento degenerado (dois pontos iguais)", () => {
    const p = { lat: 0.001, lng: 0 };
    expect(distanciaAteSegmentoM(p, a, a)).toBeCloseTo(haversineM(p, a), 0);
  });

  it("não devolve NaN nos polos", () => {
    const d = distanciaAteSegmentoM({ lat: 90, lng: 0 }, a, b);
    expect(Number.isFinite(d)).toBe(true);
    expect(d).toBeGreaterThan(0);
  });
});

describe("distanciaAteLinhaM", () => {
  it("devolve a menor distância entre todos os trechos", () => {
    const linha = [
      { lat: 0, lng: 0 },
      { lat: 0, lng: 0.01 },
      { lat: 0.01, lng: 0.01 },
    ];
    const p = { lat: 0.005, lng: 0.0105 };
    expect(distanciaAteLinhaM(p, linha)).toBeCloseTo(haversineM(p, { lat: 0.005, lng: 0.01 }), 0);
  });

  it("rejeita linha sem pontos", () => {
    expect(() => distanciaAteLinhaM({ lat: 0, lng: 0 }, [])).toThrow();
  });
});
