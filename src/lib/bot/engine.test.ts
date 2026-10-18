import { describe, expect, it } from "vitest";
import { formatarMensagensWhatsApp, processarMensagemBot, ativarBloqueioHumano } from "./engine";

describe("Bot Engine - Vizinho de Alta Tensão (Equatorial Maranhão)", () => {
  it("responde com boas-vindas acolhedoras ao receber 'oi'", async () => {
    const res = await processarMensagemBot({ mensagem: "oi", sessao: "test-1", telefone: "5598999990001" });
    expect(res.mensagens.length).toBeGreaterThan(0);
    expect(res.mensagens[0]).toContain("EquaBot");
    expect(res.mensagens[0]).toContain("Vizinho de Alta Tensão");
    expect(res.mensagens[0]).toContain("Equatorial Maranhão");
  });

  it("orienta sobre cabo caído com distância de segurança e canais 116 e 193", async () => {
    const res = await processarMensagemBot({
      mensagem: "tem um cabo caído na minha rua perto de casa",
      sessao: "test-2",
      telefone: "5598999990002",
    });
    const textoCompleto = res.mensagens.join(" ");
    expect(textoCompleto).toContain("Cabo caído");
    expect(textoCompleto).toContain("10 a 15 metros");
    expect(textoCompleto).toContain("116");
    expect(textoCompleto).toContain("193");
    expect(textoCompleto).toContain("NUNCA");
  });

  it("orienta detalhadamente sobre eletrodomésticos queimados e ressarcimento na Equatorial MA", async () => {
    const res = await processarMensagemBot({
      mensagem: "minha geladeira e televisão queimaram na tempestade com a queda de energia, como peço ressarcimento?",
      sessao: "test-3",
      telefone: "5598999990003",
    });
    const textoCompleto = res.mensagens.join(" ");
    expect(textoCompleto).toContain("Ressarcimento");
    expect(textoCompleto).toContain("90");
    expect(textoCompleto).toContain("NÃO CONSERTE");
    expect(textoCompleto).toContain("Conta Contrato");
    expect(textoCompleto).toContain("2055-0116");
    expect(textoCompleto).toContain("116");
  });

  it("orienta sobre perigo de pipas e arcos elétricos", async () => {
    const res = await processarMensagemBot({
      mensagem: "meu filho prendeu uma pipa no fio de alta tensão, posso tirar com vara de bambu?",
      sessao: "test-4",
      telefone: "5598999990004",
    });
    const textoCompleto = res.mensagens.join(" ");
    expect(textoCompleto).toContain("Pipas");
    expect(textoCompleto).toContain("DEIXE LÁ");
    expect(textoCompleto).toContain("NUNCA");
  });

  it("reconhece bairros de São Luís (Cohatrac, Tirirical, Coroadinho)", async () => {
    const res = await processarMensagemBot({
      mensagem: "eu moro no bairro Cohatrac em São Luís",
      sessao: "test-5",
      telefone: "5598999990005",
    });
    expect(res.bairroReconhecido).toBe("Cohatrac");
    expect(res.mensagens.join(" ")).toContain("Cohatrac");
  });

  it("executa o fluxo do Quiz do Vizinho Consciente com 3 perguntas e gera selo ao acertar todas", async () => {
    const sessao = "quiz-test-sessao";
    const telefone = "5598988887777";

    // 1. Inicia o quiz
    const inicio = await processarMensagemBot({ mensagem: "quero fazer o quiz", sessao, telefone, nome: "Carlos" });
    expect(inicio.mensagens.join(" ")).toContain("Pergunta 1 de 3");

    // 2. Responde pergunta 1: correta é B
    const resp1 = await processarMensagemBot({ mensagem: "B", sessao, telefone, nome: "Carlos" });
    expect(resp1.mensagens.join(" ")).toContain("Correto");
    expect(resp1.mensagens.join(" ")).toContain("Pergunta 2 de 3");

    // 3. Responde pergunta 2: correta é C
    const resp2 = await processarMensagemBot({ mensagem: "C", sessao, telefone, nome: "Carlos" });
    expect(resp2.mensagens.join(" ")).toContain("Correto");
    expect(resp2.mensagens.join(" ")).toContain("Pergunta 3 de 3");

    // 4. Responde pergunta 3: correta é C
    const resp3 = await processarMensagemBot({ mensagem: "C", sessao, telefone, nome: "Carlos" });
    expect(resp3.mensagens.join(" ")).toContain("PARABÉNS");
    expect(resp3.mensagens.join(" ")).toContain("Selo Oficial");
    expect(resp3.seloId).toBeDefined();
  });

  it("respeita o bloqueio de atendimento humano (anti-colisão com atendente)", async () => {
    const sessaoKey = "handover-test:5598911112222";
    ativarBloqueioHumano(sessaoKey);

    const res = await processarMensagemBot({
      mensagem: "olá ainda tem alguém aí?",
      sessao: "handover-test",
      telefone: "5598911112222",
    });

    expect(res.bloqueadoParaHumano).toBe(true);
    expect(res.mensagens).toHaveLength(0);
  });

  it("divide mensagens longas no padrão humanizado do WhatsApp (máximo 4)", () => {
    const textoLongo = `Primeiro parágrafo de introdução sobre a alta tensão na comunidade.

Segundo parágrafo detalhando os cabos caídos e como proceder para não sofrer choques perigosos.

Terceiro parágrafo explicando as regras de proteção contra descargas atmosféricas e ressarcimento na Equatorial.

Quarto parágrafo com os canais de atendimento 116 e WhatsApp Clara.

Quinto parágrafo adicional para testar o limite de blocos.`;

    const msgs = formatarMensagensWhatsApp(textoLongo);
    expect(msgs.length).toBeLessThanOrEqual(4);
    expect(msgs.length).toBeGreaterThan(1);
  });
});
