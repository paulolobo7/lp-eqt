import { describe, expect, it } from "vitest";
import { MockBadgeService } from "./badge";

const svc = new MockBadgeService("segredo-de-teste");
const agora = new Date("2026-10-15T15:00:00Z");

describe("MockBadgeService", () => {
  it("emite selo com primeiro nome, bairro, faixa, data e código curto", async () => {
    const s = await svc.emitir({ primeiroNome: "Ana", bairro: "Vila Esperança", nivel: "alto" }, agora);
    expect(s).toMatchObject({ primeiroNome: "Ana", bairro: "Vila Esperança", nivel: "alto", data: "2026-10-15" });
    expect(s.codigo).toMatch(/^VAT-[0-9A-Z]{4}$/);
    expect(s.id).toMatch(/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/);
  });

  it("lê de volta o selo emitido", async () => {
    const s = await svc.emitir({ primeiroNome: "Ana", bairro: "Vila Esperança", nivel: "alto" }, agora);
    expect(await svc.ler(s.id)).toEqual(s);
  });

  it("guarda só o primeiro nome", async () => {
    const s = await svc.emitir({ primeiroNome: "ana maria silva", bairro: "Vila Esperança", nivel: "alto" }, agora);
    expect(s.primeiroNome).toBe("Ana");
  });

  it("usa 'Vizinho' quando o nome fica vazio", async () => {
    const s = await svc.emitir({ primeiroNome: "123", bairro: "Vila Esperança", nivel: "alto" }, agora);
    expect(s.primeiroNome).toBe("Vizinho");
  });

  it("recusa id adulterado", async () => {
    const s = await svc.emitir({ primeiroNome: "Ana", bairro: "Vila Esperança", nivel: "alto" }, agora);
    const [dados, assinatura] = s.id.split(".");
    const outro = Buffer.from(JSON.stringify({ n: "Eva", b: "Vila Esperança", f: "alto", d: "2026-10-15" })).toString("base64url");
    expect(await svc.ler(`${outro}.${assinatura}`)).toBeNull();
    expect(await svc.ler(`${dados}.x${assinatura.slice(1)}`)).toBeNull();
  });

  it("recusa lixo", async () => {
    expect(await svc.ler("nada")).toBeNull();
    expect(await svc.ler("a.b.c")).toBeNull();
    expect(await svc.ler("")).toBeNull();
  });

  it("recusa selo assinado com outro segredo", async () => {
    const outro = new MockBadgeService("outro-segredo");
    const s = await outro.emitir({ primeiroNome: "Ana", bairro: "Vila Esperança", nivel: "alto" }, agora);
    expect(await svc.ler(s.id)).toBeNull();
  });
});
