import { describe, expect, it } from "vitest";
import { POST } from "./route";
import { getServices } from "@/lib/services";

const req = (body: unknown) => new Request("http://localhost/api/quiz/submit", { method: "POST", body: JSON.stringify(body) });
const certas = [
  { perguntaId: "cabo-caido", opcaoId: "b" },
  { perguntaId: "pipa-na-rede", opcaoId: "c" },
  { perguntaId: "furto-ou-invasao", opcaoId: "a" },
];

describe("POST /api/quiz/submit", () => {
  it("corrige uma resposta errada sem emitir selo", async () => {
    const res = await POST(req({ respostas: [{ perguntaId: "cabo-caido", opcaoId: "a" }] }));
    const json = await res.json();
    expect(json).toMatchObject({ acertos: 0, erradas: ["cabo-caido"] });
    expect(json.seloId).toBeUndefined();
  });

  it("emite o selo com 3 acertos, usando o bairro e a faixa calculados no servidor", async () => {
    const res = await POST(req({ respostas: certas, primeiroNome: "Ana Maria", bairroId: "jardim-das-torres", nivel: "alto" }));
    const json = await res.json();
    expect(json.acertos).toBe(3);
    const selo = await getServices().badge.ler(json.seloId);
    expect(selo).toMatchObject({ primeiroNome: "Ana", bairro: "Jardim das Torres", nivel: "medio" });
    expect(json.selo).toEqual({ codigo: selo!.codigo, primeiroNome: "Ana", bairro: "Jardim das Torres", data: selo!.data });
  });

  it("sem bairro, usa 'Minha vizinhança' e a faixa enviada", async () => {
    const res = await POST(req({ respostas: certas, nivel: "baixo" }));
    const selo = await getServices().badge.ler((await res.json()).seloId);
    expect(selo).toMatchObject({ primeiroNome: "Vizinho", bairro: "Minha vizinhança", nivel: "baixo" });
  });

  it("devolve 400 para lista vazia", async () => {
    const res = await POST(req({ respostas: [] }));
    expect(res.status).toBe(400);
    expect((await res.json()).detalhes).toContain("Envie pelo menos uma resposta.");
  });
});
