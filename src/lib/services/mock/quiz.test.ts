import { describe, expect, it } from "vitest";
import { MockQuizService } from "./quiz";

const svc = new MockQuizService();
const certas = [
  { perguntaId: "cabo-caido", opcaoId: "b" },
  { perguntaId: "pipa-na-rede", opcaoId: "c" },
  { perguntaId: "furto-ou-invasao", opcaoId: "a" },
];

describe("MockQuizService", () => {
  it("devolve 3 perguntas com no máximo 3 opções e sem o gabarito", async () => {
    const ps = await svc.perguntas();
    expect(ps).toHaveLength(3);
    for (const p of ps) {
      expect(p.opcoes.length).toBeLessThanOrEqual(3);
      expect(p).not.toHaveProperty("correta");
      expect(p).not.toHaveProperty("explicacao");
    }
  });

  it("marca completo com 3 acertos", async () => {
    const r = await svc.corrigir(certas);
    expect(r).toMatchObject({ acertos: 3, erradas: [], completo: true });
  });

  it("lista as erradas com explicação", async () => {
    const r = await svc.corrigir([{ perguntaId: "pipa-na-rede", opcaoId: "a" }]);
    expect(r.acertos).toBe(0);
    expect(r.erradas).toEqual(["pipa-na-rede"]);
    expect(r.resultados[0].explicacao).toMatch(/cerol/);
    expect(r.completo).toBe(false);
  });

  it("não marca completo com respostas parciais certas", async () => {
    const r = await svc.corrigir(certas.slice(0, 2));
    expect(r.acertos).toBe(2);
    expect(r.completo).toBe(false);
  });

  it("não conta a mesma pergunta duas vezes", async () => {
    const r = await svc.corrigir([certas[0], certas[0], certas[0]]);
    expect(r.acertos).toBe(1);
    expect(r.completo).toBe(false);
  });

  it("trata pergunta desconhecida como errada", async () => {
    const r = await svc.corrigir([{ perguntaId: "inventada", opcaoId: "a" }]);
    expect(r.erradas).toEqual(["inventada"]);
  });
});
