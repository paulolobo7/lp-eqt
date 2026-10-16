import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { GET } from "./route";
import { getServices } from "@/lib/services";

const chamar = (id: string, qs = "") =>
  GET(new NextRequest(`http://localhost/api/badge/${id}${qs}`), { params: Promise.resolve({ id }) });

const tamanhoPng = async (res: Response) => {
  const buf = Buffer.from(await res.arrayBuffer());
  return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
};

describe("GET /api/badge/[id]", () => {
  it("gera PNG 1080x1350 por padrão", async () => {
    const s = await getServices().badge.emitir({ primeiroNome: "Ana", bairro: "Vila Esperança", nivel: "alto" });
    const res = await chamar(s.id);
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toBe("image/png");
    expect(await tamanhoPng(res)).toEqual({ w: 1080, h: 1350 });
  }, 20_000);

  it("gera PNG 1080x1080 com ?format=square", async () => {
    const s = await getServices().badge.emitir({ primeiroNome: "Ana", bairro: "Vila Esperança", nivel: "alto" });
    const res = await chamar(s.id, "?format=square");
    expect(await tamanhoPng(res)).toEqual({ w: 1080, h: 1080 });
  }, 20_000);

  it("oferece download com ?download=1", async () => {
    const s = await getServices().badge.emitir({ primeiroNome: "Ana", bairro: "Vila Esperança", nivel: "alto" });
    const res = await chamar(s.id, "?download=1");
    expect(res.headers.get("content-disposition")).toMatch(/attachment; filename="selo-vizinho-alta-tensao-VAT-/);
  }, 20_000);

  it("devolve 404 para selo inválido", async () => {
    const res = await chamar("invalido");
    expect(res.status).toBe(404);
  });
});
