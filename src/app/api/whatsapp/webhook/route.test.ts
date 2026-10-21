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

  it("ecoa as mensagens de texto e devolve a resposta do bot", async () => {
    const res = await POST(new Request("http://x", { method: "POST", body: JSON.stringify(payload) }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.simulacao).toBe(true);
    expect(json.respostas).toEqual([{ eco: "Oi" }]);
    expect(json.mensagens.length).toBeGreaterThan(0);
    expect(JSON.stringify(json)).not.toContain("5598000000000");
  });

  it("devolve 400 para payload fora do formato", async () => {
    const res = await POST(new Request("http://x", { method: "POST", body: JSON.stringify({ object: "outro" }) }));
    expect(res.status).toBe(400);
  });
});

describe("POST /api/whatsapp/webhook (autenticação)", () => {
  it("recusa sem o token quando WHATSAPP_WEBHOOK_SECRET está definido", async () => {
    vi.stubEnv("WHATSAPP_WEBHOOK_SECRET", "segredo-webhook");
    const res = await POST(new Request("http://x", { method: "POST", body: JSON.stringify({}) }));
    expect(res.status).toBe(401);
  });

  it("aceita com o header x-webhook-token correto", async () => {
    vi.stubEnv("WHATSAPP_WEBHOOK_SECRET", "segredo-webhook");
    const res = await POST(
      new Request("http://x", {
        method: "POST",
        headers: { "x-webhook-token": "segredo-webhook" },
        body: JSON.stringify({
          event: "message",
          session: "default",
          payload: { from: "5598988880001@c.us", body: "Oi", fromMe: false },
        }),
      }),
    );
    expect(res.status).toBe(200);
  });
});

describe("POST /api/whatsapp/webhook (WAHA - fluxo bot.json)", () => {
  it("processa evento de mensagem de texto do WAHA", async () => {
    const wahaMsg = {
      event: "message",
      session: "default",
      payload: {
        id: "msg-1",
        from: "5598988880000@c.us",
        source: "web",
        body: "Oi",
        fromMe: false,
        _data: { Info: { Type: "text", IsGroup: false, PushName: "João" } },
      },
    };

    const res = await POST(new Request("http://x", { method: "POST", body: JSON.stringify(wahaMsg) }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.sucesso).toBe(true);
    expect(json.tipo).toBe("waha");
    expect(json.processado).toBe(true);
    expect(json.mensagens.length).toBeGreaterThan(0);
  });

  it("ignora mensagens de grupo no WAHA conforme nó 'Ignorar Grupos'", async () => {
    const wahaGroup = {
      event: "message",
      session: "default",
      payload: {
        id: "msg-2",
        from: "123456@g.us",
        body: "Mensagem no grupo",
        fromMe: false,
        _data: { Info: { IsGroup: true } },
      },
    };

    const res = await POST(new Request("http://x", { method: "POST", body: JSON.stringify(wahaGroup) }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.processado).toBe(false);
    expect(json.motivo).toContain("grupo");
  });

  it("registra mensagem do atendente humano (fromMe: true) ativando bloqueio da IA", async () => {
    const wahaAttendant = {
      event: "message",
      session: "default",
      payload: {
        id: "msg-3",
        from: "5598988881111@c.us",
        body: "Olá, sou o atendente humano da Equatorial.",
        fromMe: true,
      },
    };

    const res = await POST(new Request("http://x", { method: "POST", body: JSON.stringify(wahaAttendant) }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.processado).toBe(true);
    expect(json.motivo).toContain("atendente");
  });
});

