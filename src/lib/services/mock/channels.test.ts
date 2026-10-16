import { describe, expect, it } from "vitest";
import { MockChannelsService } from "./channels";
import { MockCommunityService } from "./community";

describe("MockChannelsService", () => {
  it("devolve canais com placeholder, marcados como simulação", async () => {
    const r = await new MockChannelsService().listar();
    expect(r.simulacao).toBe(true);
    expect(r.canais.length).toBeGreaterThan(0);
    expect(r.canais.every((c) => c.valor.includes("{{"))).toBe(true);
  });
});

describe("MockCommunityService", () => {
  it("devolve contagem agregada, ordenada, sem dados pessoais", async () => {
    const r = await new MockCommunityService().contagemPorBairro();
    expect(r.map((c) => c.vizinhos)).toEqual([...r.map((c) => c.vizinhos)].sort((a, b) => b - a));
    for (const c of r) expect(Object.keys(c).sort()).toEqual(["id", "nome", "vizinhos"]);
  });
});
