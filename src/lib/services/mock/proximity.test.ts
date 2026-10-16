import { describe, expect, it } from "vitest";
import { MockProximityService } from "./proximity";

const svc = new MockProximityService();

describe("MockProximityService", () => {
  it("classifica Vila Esperança como alto, perto da linha de transmissão", async () => {
    const r = await svc.consultar({ bairroId: "vila-esperanca" });
    expect(r.nivel).toBe("alto");
    expect(r.ativoMaisProximo.tipo).toBe("linha_transmissao");
    expect(r.ativoMaisProximo.distanciaM).toBeLessThanOrEqual(300);
    expect(r.bairro).toEqual({ id: "vila-esperanca", nome: "Vila Esperança" });
    expect(r.simulacao).toBe(true);
  });

  it("classifica Jardim das Torres como médio, pela subestação", async () => {
    const r = await svc.consultar({ bairroId: "jardim-das-torres" });
    expect(r.nivel).toBe("medio");
    expect(r.ativoMaisProximo.tipo).toBe("subestacao");
  });

  it("classifica Parque das Águas como baixo", async () => {
    const r = await svc.consultar({ bairroId: "parque-das-aguas" });
    expect(r.nivel).toBe("baixo");
  });

  it("devolve 3 cuidados", async () => {
    const r = await svc.consultar({ bairroId: "vila-esperanca" });
    expect(r.cuidados).toHaveLength(3);
  });

  it("arredonda a distância para dezenas de metros", async () => {
    const r = await svc.consultar({ bairroId: "jardim-das-torres" });
    expect(r.ativoMaisProximo.distanciaM % 10).toBe(0);
  });

  it("calcula por coordenadas e reconhece o bairro mais próximo dentro do raio", async () => {
    const r = await svc.consultar({ lat: 0.0034, lng: -0.0021 });
    expect(r.nivel).toBe("alto");
    expect(r.bairro?.id).toBe("vila-esperanca");
  });

  it("responde baixo, sem bairro, para coordenadas fora da área fictícia", async () => {
    const r = await svc.consultar({ lat: -2.53, lng: -44.3 });
    expect(r.nivel).toBe("baixo");
    expect(r.bairro).toBeUndefined();
  });

  it("nunca devolve coordenadas", async () => {
    const r = await svc.consultar({ lat: 0.0034, lng: -0.0021 });
    expect(JSON.stringify(r)).not.toMatch(/"lat"|"lng"/);
  });

  it("falha com bairro desconhecido", async () => {
    await expect(svc.consultar({ bairroId: "nao-existe" })).rejects.toThrow("Bairro não encontrado.");
  });

  it("lista os bairros de demonstração com a faixa calculada", async () => {
    const bairros = await svc.listarBairros();
    expect(bairros.map((b) => [b.id, b.nivel])).toEqual([
      ["vila-esperanca", "alto"],
      ["jardim-das-torres", "medio"],
      ["parque-das-aguas", "baixo"],
    ]);
  });
});
