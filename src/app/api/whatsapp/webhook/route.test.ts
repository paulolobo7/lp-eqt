import { afterEach, describe, expect, it, vi } from "vitest";
import { GET, POST } from "./route";

afterEach(() => vi.unstubAllEnvs());

describe("GET /api/whatsapp/webhook (verificação)", () => {
  it("devolve o desafio quando o token confere", async () => {
    vi.stubEnv("WHATSAPP_VERIFY_TOKEN", "token-certo");
    const res = await GET(new Request("http://x/api/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=token-certo&hub.challenge=123"));
    expect(res.status).toBe(200);
    expect(await res.text()).toBe("123");
  });

  it("recusa token errado", async () => {
    vi.stubEnv("WHATSAPP_VERIFY_TOKEN", "token-certo");
    const res = await GET(new Request("http://x/api/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=errado&hub.challenge=123"));
    expect(res.status).toBe(403);
  });

  it("recusa quando o token não está configurado", async () => {
    vi.stubEnv("WHATSAPP_VERIFY_TOKEN", "");
    const res = await GET(new Request("http://x/api/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=&hub.challenge=1"));
    expect(res.status).toBe(403);
  });
});

describe("POST /api/whatsapp/webhook (eco simulado)", () => {
  const payload = {
    object: "whatsapp_business_account",
    entry: [{ changes: [{ value: { messages: [{ from: "5598000000000", type: "text", text: { body: "Oi" } }] } }] }],
  };

  it("ecoa as mensagens de texto sem devolver o telefone", async () => {
    const res = await POST(new Request("http://x", { method: "POST", body: JSON.stringify(payload) }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toEqual({ simulacao: true, respostas: [{ eco: "Oi" }] });
    expect(JSON.stringify(json)).not.toContain("5598000000000");
  });

  it("devolve 400 para payload fora do formato", async () => {
    const res = await POST(new Request("http://x", { method: "POST", body: JSON.stringify({ object: "outro" }) }));
    expect(res.status).toBe(400);
  });
});
