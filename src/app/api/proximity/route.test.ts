import { describe, expect, it } from "vitest";
import { POST } from "./route";

const req = (body: unknown) =>
  new Request("http://localhost/api/proximity", { method: "POST", body: typeof body === "string" ? body : JSON.stringify(body) });

describe("POST /api/proximity", () => {
  it("responde nível, ativo mais próximo e cuidados para um bairro", async () => {
    const res = await POST(req({ bairroId: "vila-esperanca" }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toMatchObject({ nivel: "alto", ativoMaisProximo: { tipo: "linha_transmissao" }, simulacao: true });
    expect(json.cuidados).toHaveLength(3);
  });

  it("aceita coordenadas", async () => {
    const res = await POST(req({ lat: 0.0034, lng: -0.0021 }));
    expect((await res.json()).nivel).toBe("alto");
  });

  it("devolve 400 com mensagem em pt-BR para entrada inválida", async () => {
    const res = await POST(req({ lat: "x" }));
    expect(res.status).toBe(400);
    expect((await res.json()).erro).toBe("Dados inválidos.");
  });

  it("devolve 400 para JSON malformado", async () => {
    const res = await POST(req("{"));
    expect(res.status).toBe(400);
    expect((await res.json()).erro).toBe("JSON inválido.");
  });

  it("devolve 404 para bairro desconhecido", async () => {
    const res = await POST(req({ bairroId: "nao-existe" }));
    expect(res.status).toBe(404);
    expect((await res.json()).erro).toBe("Bairro não encontrado.");
  });
});
