import { afterEach, describe, expect, it, vi } from "vitest";
import { getServices } from "../services";
import { ativarBloqueioHumano, formatarMensagensWhatsApp, processarMensagemBot } from "./engine";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

const iniciarQuiz = (sessao: string, telefone: string, nome?: string) =>
  processarMensagemBot({ mensagem: "quero fazer o quiz", sessao, telefone, nome });

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

  it("não deixa o reconhecimento de bairro engolir uma pergunta de risco", async () => {
    const res = await processarMensagemBot({
      mensagem: "moro no Cohatrac e caiu um cabo na minha rua",
      sessao: "test-bairro-risco",
      telefone: "5598999990010",
    });
    const texto = res.mensagens.join(" ");
    expect(texto).toContain("Cabo caído");
    expect(texto).not.toContain("Reconheci o seu bairro");
    expect(res.bairroReconhecido).toBe("Cohatrac");
  });

  it("reconhece tópicos com acento (faísca) sem cair em pipas por causa do poste", async () => {
    const res = await processarMensagemBot({
      mensagem: "tem faísca no poste da rua",
      sessao: "test-acento",
      telefone: "5598999990011",
    });
    expect(res.mensagens.join(" ")).toContain("Arcos elétricos");
  });

  it("trata 'oi, tudo bem?' como saudação", async () => {
    const res = await processarMensagemBot({ mensagem: "oi, tudo bem?", sessao: "test-oi-pontuacao", telefone: "5598999990013" });
    expect(res.mensagens[0]).toContain("EquaBot");
  });

  it("não trata 'oi, caiu a luz' como saudação e orienta os canais", async () => {
    const res = await processarMensagemBot({
      mensagem: "oi, caiu a luz",
      sessao: "test-luz",
      telefone: "5598999990012",
    });
    const texto = res.mensagens.join(" ");
    expect(texto).toContain("Canais Oficiais");
    expect(texto).not.toContain("assistente oficial do programa");
  });

  it("executa o fluxo do Quiz e gera selo ao acertar todas", async () => {
    const sessao = "quiz-test-sessao";
    const telefone = "5598988887777";

    const inicio = await iniciarQuiz(sessao, telefone, "Carlos");
    expect(inicio.mensagens.join(" ")).toContain("Pergunta 1 de 3");
    expect(inicio.mensagens.join(" ")).toContain("A, B ou C");

    // A fonte única do quiz (src/content/quiz.ts): Q1 = B, Q2 = C, Q3 = A.
    const resp1 = await processarMensagemBot({ mensagem: "B", sessao, telefone });
    expect(resp1.mensagens.join(" ")).toContain("Correto");
    expect(resp1.mensagens.join(" ")).toContain("Pergunta 2 de 3");

    const resp2 = await processarMensagemBot({ mensagem: "C", sessao, telefone });
    expect(resp2.mensagens.join(" ")).toContain("Correto");
    expect(resp2.mensagens.join(" ")).toContain("Pergunta 3 de 3");

    const resp3 = await processarMensagemBot({ mensagem: "A", sessao, telefone });
    expect(resp3.mensagens.join(" ")).toContain("PARABÉNS");
    expect(resp3.mensagens.join(" ")).toContain("Selo Oficial");
    expect(resp3.seloId).toBeDefined();
  });

  it("não aceita texto livre como resposta do quiz ('beleza' não vira B)", async () => {
    const sessao = "quiz-texto-livre";
    const telefone = "5598999990020";
    await iniciarQuiz(sessao, telefone);
    const res = await processarMensagemBot({ mensagem: "beleza", sessao, telefone });
    expect(res.mensagens.join(" ")).toContain("Por favor, responda");
    expect(res.mensagens.join(" ")).toContain("Pergunta 1 de 3");
  });

  it("não duplica o elogio nem chama de 'Correto' uma resposta errada", async () => {
    const sessao = "quiz-feedback";
    const telefone = "5598999990021";
    await iniciarQuiz(sessao, telefone);
    const res = await processarMensagemBot({ mensagem: "A", sessao, telefone });
    const texto = res.mensagens.join(" ");
    expect(texto).toContain("Quase lá");
    expect(texto).not.toContain("Correto!");
  });

  it("mostra só o primeiro nome no selo e não vaza o nome completo do perfil", async () => {
    const sessao = "quiz-nome";
    const telefone = "5598999990022";
    await iniciarQuiz(sessao, telefone, "João da Silva Santos");
    await processarMensagemBot({ mensagem: "B", sessao, telefone });
    await processarMensagemBot({ mensagem: "C", sessao, telefone });
    const res = await processarMensagemBot({ mensagem: "A", sessao, telefone });

    const texto = res.mensagens.join(" ");
    expect(texto).toContain("JOÃO");
    expect(texto).not.toContain("SILVA");
    expect(res.seloId).toBeDefined();
    const selo = await getServices().badge.ler(res.seloId!);
    expect(selo?.primeiroNome).toBe("João");
  });

  it("usa a URL pública configurada no link do selo", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://vizinho.teste");
    const sessao = "quiz-link";
    const telefone = "5598999990023";
    await iniciarQuiz(sessao, telefone);
    await processarMensagemBot({ mensagem: "B", sessao, telefone });
    await processarMensagemBot({ mensagem: "C", sessao, telefone });
    const res = await processarMensagemBot({ mensagem: "A", sessao, telefone });
    expect(res.mensagens.join(" ")).toContain("https://vizinho.teste/selo/");
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

  it("divide mensagens longas sem descartar o último parágrafo (máximo 4)", () => {
    const textoLongo = `Primeiro parágrafo de introdução sobre a alta tensão na comunidade.

Segundo parágrafo detalhando os cabos caídos e como proceder para não sofrer choques perigosos.

Terceiro parágrafo explicando as regras de proteção contra descargas atmosféricas e ressarcimento na Equatorial.

Quarto parágrafo com os canais de atendimento 116 e WhatsApp Clara.

Quinto parágrafo adicional para testar o limite de blocos.`;

    const msgs = formatarMensagensWhatsApp(textoLongo);
    expect(msgs.length).toBeLessThanOrEqual(4);
    expect(msgs.length).toBeGreaterThan(1);
    expect(msgs.join(" ")).toContain("Quinto parágrafo adicional");
  });

  it("usa a OpenAI sem o erro de variável e sem duplicar a mensagem atual", async () => {
    vi.stubEnv("OPENAI_API_KEY", "chave-de-teste");
    const chamadas: Array<{ body: unknown }> = [];
    vi.stubGlobal("fetch", async (_url: string, init?: RequestInit) => {
      chamadas.push({ body: init?.body ? JSON.parse(String(init.body)) : null });
      return Response.json({
        choices: [{ message: { content: "Resposta de teste. Veja https://exemplo-malicioso.com" } }],
      });
    });

    const res = await processarMensagemBot({
      mensagem: "qual a cor do céu?",
      sessao: "openai-test",
      telefone: "5598999990030",
    });

    expect(res.mensagens.join(" ")).toContain("Resposta de teste");
    expect(res.mensagens.join(" ")).toContain("(link removido)");
    expect(chamadas).toHaveLength(1);
    const corpo = chamadas[0].body as { messages: Array<{ role: string; content: string }> };
    expect(corpo.messages.filter((m) => m.content === "qual a cor do céu?")).toHaveLength(1);
  });
});
