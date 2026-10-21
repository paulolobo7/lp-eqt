import {
  DISTANCIA_SEGURA,
  EQUATORIAL_MA,
  PERGUNTAS_QUIZ,
  TOPICOS_SEGURANCA,
  type TopicoSeguranca,
} from "./knowledge";
import { SELO_PADRAO } from "../constants";
import { getServices } from "../services";
import { linkDoSelo } from "../site";
import { normalizarTexto, primeiroNome } from "../texto";
import type { RespostaBot, SolicitacaoMensagem } from "./types";

interface SessaoUsuario {
  etapa: "inicio" | "duvidas" | "quiz" | "concluido";
  bairro?: string;
  nivelRisco?: "alto" | "medio" | "baixo";
  perguntaAtual: number;
  respostasQuiz: Record<string, string>;
  acertos: number;
  nome?: string;
  seloId?: string;
  historico: Array<{ de: "usuario" | "bot"; texto: string }>;
  bloqueadoParaHumanoAte?: number;
  ultimoAcesso: number;
}

const TTL_SESSAO_MS = 30 * 60 * 1000;
const MAX_SESSOES = 5_000;
const MAX_HISTORICO = 20;
const sessoes = new Map<string, SessaoUsuario>();
let ultimaLimpeza = 0;

function podarHistorico(sessao: SessaoUsuario): void {
  if (sessao.historico.length > MAX_HISTORICO) {
    sessao.historico.splice(0, sessao.historico.length - MAX_HISTORICO);
  }
}

/** Remove sessões antigas e limita o total para o processo não crescer sem fim. */
function limparSessoes(agora: number): void {
  if (agora - ultimaLimpeza < 60_000 && sessoes.size <= MAX_SESSOES) return;
  ultimaLimpeza = agora;

  for (const [chave, sessao] of sessoes) {
    if (agora - sessao.ultimoAcesso > TTL_SESSAO_MS) sessoes.delete(chave);
  }

  if (sessoes.size > MAX_SESSOES) {
    const maisAntigas = [...sessoes.entries()].sort((a, b) => a[1].ultimoAcesso - b[1].ultimoAcesso);
    const excedente = sessoes.size - MAX_SESSOES;
    for (const [chave] of maisAntigas.slice(0, excedente)) sessoes.delete(chave);
  }
}

function obterChaveSessao(req: SolicitacaoMensagem): string {
  const sessao = (req.sessao || "default").slice(0, 60);
  const telefone = (req.telefone || "anonimo").slice(0, 60);
  return `${sessao}:${telefone}`;
}

function obterOuCriarSessao(chave: string, nome?: string): SessaoUsuario {
  const agora = Date.now();
  const nomeLimpo = primeiroNome(nome ?? "") || undefined;
  let s = sessoes.get(chave);
  if (!s) {
    s = {
      etapa: "inicio",
      perguntaAtual: 0,
      respostasQuiz: {},
      acertos: 0,
      nome: nomeLimpo,
      historico: [],
      ultimoAcesso: agora,
    };
    sessoes.set(chave, s);
  } else {
    s.ultimoAcesso = agora;
    if (nomeLimpo && !s.nome) s.nome = nomeLimpo;
  }
  return s;
}

/** Formata e divide a resposta em mensagens legíveis e humanizadas para o WhatsApp. */
export function formatarMensagensWhatsApp(textoCompleto: string): string[] {
  const texto = textoCompleto.trim();
  if (!texto) return [];

  if (texto.length <= 320 && !texto.includes("\n\n")) {
    return [limparMarkdownWhatsApp(texto)];
  }

  const blocos = texto
    .split(/\n\s*\n/)
    .map((b) => b.trim())
    .filter((b) => b.length > 0);
  if (blocos.length <= 1) return [limparMarkdownWhatsApp(texto)];

  // Até 4 mensagens. Se houver mais parágrafos, o restante é anexado à última
  // em vez de ser descartado: em conteúdo de segurança, cortar o fim pode
  // apagar justamente os canais de emergência.
  const MAX_MENSAGENS = 4;
  const ALVO = 260;
  const mensagens: string[] = [];
  let buffer = "";

  for (const bloco of blocos) {
    const candidato = buffer ? `${buffer}\n\n${bloco}` : bloco;
    if (buffer && candidato.length > ALVO && mensagens.length < MAX_MENSAGENS - 1) {
      mensagens.push(limparMarkdownWhatsApp(buffer));
      buffer = bloco;
    } else {
      buffer = candidato;
    }
  }
  if (buffer) mensagens.push(limparMarkdownWhatsApp(buffer));

  return mensagens.length > 0 ? mensagens : [limparMarkdownWhatsApp(texto)];
}

function limparMarkdownWhatsApp(texto: string): string {
  // Mantém formatação leve do WhatsApp (*negrito*, _itálico_) e remove hashes de títulos
  return texto
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\*\*(.*?)\*\*/g, "*$1*")
    .replace(/\[(.*?)\]\((https?:\/\/.*?)\)/g, "$1 ($2)")
    .trim();
}

function escaparRegex(texto: string): string {
  return texto.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Identifica o tópico de segurança mais relevante para a mensagem. */
function encontrarTopico(texto: string): TopicoSeguranca | null {
  const t = normalizarTexto(texto);
  let melhorTopico: TopicoSeguranca | null = null;
  let melhorPontuacao = 0;

  for (const topico of TOPICOS_SEGURANCA) {
    let pontuacao = 0;
    for (const palavra of topico.palavrasChave) {
      const chave = normalizarTexto(palavra);
      if (!chave || !t.includes(chave)) continue;
      // Palavras-chave específicas ou mais longas têm peso maior.
      pontuacao += chave.length > 5 ? 4 : 2;
      // Se aparecer como termo isolado, vale mais.
      if (new RegExp(`(^|\\s)${escaparRegex(chave)}(\\s|$)`).test(t)) pontuacao += 3;
    }
    if (pontuacao > melhorPontuacao) {
      melhorPontuacao = pontuacao;
      melhorTopico = topico;
    }
  }

  return melhorPontuacao > 0 ? melhorTopico : null;
}

type BairroConhecido = (typeof EQUATORIAL_MA.bairrosSaoLuis)[number];

/** Reconhece bairros por nome, ignorando acentos, e aceita as partes separadas por "/". */
function encontrarBairro(texto: string): BairroConhecido | null {
  const t = normalizarTexto(texto);
  for (const bairro of EQUATORIAL_MA.bairrosSaoLuis) {
    const nomes = bairro.nome.split("/").map(normalizarTexto).filter(Boolean);
    if (nomes.some((nome) => t.includes(nome))) return bairro;
  }
  return null;
}

function descricaoNivel(nivel: "alto" | "medio" | "baixo"): string {
  if (nivel === "alto") {
    return "🚨 *Nível de Atenção: Alto!* O seu bairro possui corredores de linhas de transmissão ou subestação muito próximas das residências.";
  }
  if (nivel === "medio") {
    return "⚠️ *Nível de Atenção: Médio.* Seu bairro está a uma distância intermediária de subestações e linhas de alta tensão.";
  }
  return "✅ *Nível de Atenção: Baixo.* Seu bairro está mais afastado de grandes linhas de alta tensão, mas os cuidados com a fiação da rua permanecem!";
}

const SAUDACOES = [
  "oi",
  "ola",
  "bom dia",
  "boa tarde",
  "boa noite",
  "menu",
  "ajuda",
  "iniciar",
  "inicio",
  "comecar",
  "quero comecar",
];

const RESETS = new Set(["menu", "reiniciar", "recomecar", "sair", "ajuda", "inicio", "comecar"]);

const SINAIS_DE_RISCO = [
  "cabo",
  "fio",
  "poste",
  "choque",
  "faisca",
  "queim",
  "luz",
  "energia",
  "pipa",
  "subestacao",
  "obra",
  "laje",
  "furto",
  "incendio",
  "fogo",
  "emergencia",
  "caiu",
  "sem luz",
  "sem energia",
  "falta de luz",
  "falta de energia",
];

function temSinalDeRisco(t: string): boolean {
  return SINAIS_DE_RISCO.some((sinal) => t.includes(sinal));
}

function ehSaudacao(t: string): boolean {
  const limpo = t.replace(/[.,!?;:]+/g, " ").replace(/\s+/g, " ").trim();
  return SAUDACOES.some((saudacao) => limpo === saudacao || (limpo.startsWith(`${saudacao} `) && limpo.length < 25));
}

function boasVindas(): string[] {
  return [
    `*Olá, vizinho!* Aqui é o *EquaBot*, assistente oficial do programa *Vizinho de Alta Tensão* da Equatorial Maranhão em São Luís! ⚡`,
    `Estou aqui para tirar suas dúvidas sobre como viver com total segurança perto da rede elétrica, proteger seus eletrodomésticos contra queimas e quedas de energia e garantir seu *Selo Oficial de Vizinho Consciente*! 🛡️`,
    `Você pode me perguntar sobre:\n• ⚡ Cabo caído no chão ou soltando faíscas\n• 🔌 Eletrodoméstico que queimou e ressarcimento de danos\n• 🪁 Pipas perto da fiação\n• 🏢 Obras, reformas e lajes sob a rede\n• 🏆 Fazer o *Quiz de Segurança* e emitir seu Selo Digital`,
  ];
}

function responder(sessao: SessaoUsuario, mensagens: string[], extra: Partial<RespostaBot> = {}): RespostaBot {
  sessao.historico.push(...mensagens.map((texto) => ({ de: "bot" as const, texto })));
  podarHistorico(sessao);
  return { mensagens, ...extra };
}

/** Processa uma mensagem e devolve a resposta educativa para o usuário. */
export async function processarMensagemBot(req: SolicitacaoMensagem): Promise<RespostaBot> {
  const agora = Date.now();
  limparSessoes(agora);

  const chave = obterChaveSessao(req);
  const sessao = obterOuCriarSessao(chave, req.nome);
  sessao.ultimoAcesso = agora;

  // Verifica bloqueio para atendimento humano (handover / anti-colisão).
  if (sessao.bloqueadoParaHumanoAte && sessao.bloqueadoParaHumanoAte > agora) {
    sessao.historico.push({ de: "usuario", texto: req.mensagem });
    podarHistorico(sessao);
    return { mensagens: [], bloqueadoParaHumano: true };
  }

  const texto = req.mensagem.trim();
  const tNorm = normalizarTexto(texto);
  sessao.historico.push({ de: "usuario", texto });
  podarHistorico(sessao);

  // 1. Quiz em andamento: só sai dele com um comando explícito de reset.
  if (sessao.etapa === "quiz") {
    if (RESETS.has(tNorm)) {
      sessao.etapa = "duvidas";
      return responder(sessao, boasVindas());
    }
    return processarFluxoQuiz(sessao, texto);
  }

  // 2. Intenção explícita de quiz/selo.
  if (tNorm.includes("quiz") || tNorm.includes("selo") || tNorm.includes("teste")) {
    return processarFluxoQuiz(sessao, texto);
  }

  // 3. Reconhece o bairro, mas não interrompe uma pergunta de risco.
  const bairro = encontrarBairro(texto);
  if (bairro) {
    sessao.bairro = bairro.nome;
    sessao.nivelRisco = bairro.riscoPadrao as "alto" | "medio" | "baixo";
  }

  // 4. Tópico de segurança tem prioridade sobre saudação e localização.
  const topico = encontrarTopico(texto);
  if (topico) {
    const fazer = topico.oQueFazer
      .map((item) => item.trim())
      .filter(Boolean)
      .map((item) => (/^(\d+[.)]|-)/.test(item) ? item : `• ${item}`));
    const respostas: string[] = [
      `*${topico.titulo}* ⚡\n\n${topico.resumo}`,
      `*O que fazer:*\n${fazer.join("\n")}`,
      `*O que NUNCA fazer:*\n${topico.oQueNaoFazer.map((item) => `❌ ${item}`).join("\n")}`,
      `*Canais de Emergência da Equatorial Maranhão:*\n` +
        `• 📞 Central Gratuita 24h: *${EQUATORIAL_MA.telefones.central24h}*\n` +
        `• 💬 WhatsApp da Clara: *${EQUATORIAL_MA.telefones.whatsappClara}*\n` +
        `• 🚒 Bombeiros: *${EQUATORIAL_MA.telefones.bombeiros}* (risco de vida ou fogo)`,
    ];
    return responder(sessao, respostas, {
      ...(sessao.bairro ? { bairroReconhecido: sessao.bairro } : {}),
      ...(sessao.nivelRisco ? { nivelRisco: sessao.nivelRisco } : {}),
    });
  }

  // 5. Bairro (quando a mensagem não trouxe um risco).
  if (bairro) {
    const nivel = sessao.nivelRisco ?? "baixo";
    const msgBairro = [
      `Reconheci o seu bairro: *${bairro.nome}* (São Luís - MA)! 📍`,
      `${descricaoNivel(nivel)}\nAtivos na região: ${bairro.ativos}.`,
      `Para sua segurança no ${bairro.nome}, lembre-se: nunca encoste em cabos caídos, mantenha distância de faíscas e tire aparelhos sensíveis da tomada em tempestades.\n\nQuer responder 3 perguntinhas rápidas no *Quiz* para emitir seu *Selo de Vizinho de Alta Tensão*? Digite *Quiz*!`,
    ];
    return responder(sessao, msgBairro, { bairroReconhecido: bairro.nome, nivelRisco: nivel });
  }

  // 6. Saudação simples (sem sinal de risco).
  if (ehSaudacao(tNorm) && !temSinalDeRisco(tNorm)) {
    sessao.etapa = "duvidas";
    return responder(sessao, boasVindas());
  }

  // 7. Canais de atendimento, emergência ou falta de energia.
  const pedeCanais = [
    "telefone",
    "canal",
    "contato",
    "numero",
    "ligar",
    "whatsapp",
    "clara",
    "central",
    "falta de luz",
    "sem luz",
    "caiu a luz",
    "falta de energia",
    "sem energia",
    "emergencia",
  ].some((chaveCanal) => tNorm.includes(chaveCanal));
  if (pedeCanais) {
    const canais = [
      `*Canais Oficiais da Equatorial Maranhão em São Luís:* 📱`,
      `• *${EQUATORIAL_MA.telefones.central24h}*: Ligação gratuita 24h para emergências, falta de luz e cabos partidos.\n• *WhatsApp Clara*: ${EQUATORIAL_MA.telefones.whatsappClara} para pedidos de ressarcimento, 2ª via e religação.\n• *App Equatorial Energia*: no Google Play e App Store.\n• *Site*: ${EQUATORIAL_MA.links.site.replace(/^https?:\/\//, "")}`,
      `Em casos de perigo iminente de vida ou incêndio na rede, acione também o Corpo de Bombeiros no *${EQUATORIAL_MA.telefones.bombeiros}*!`,
    ];
    return responder(sessao, canais, {
      ...(sessao.bairro ? { bairroReconhecido: sessao.bairro } : {}),
      ...(sessao.nivelRisco ? { nivelRisco: sessao.nivelRisco } : {}),
    });
  }

  // 8. Consulta opcional via OpenAI (se OPENAI_API_KEY estiver configurada).
  const respostaIA = await consultarOpenAI(texto, sessao.historico);
  if (respostaIA && respostaIA.length > 0) {
    return responder(sessao, respostaIA, {
      ...(sessao.bairro ? { bairroReconhecido: sessao.bairro } : {}),
      ...(sessao.nivelRisco ? { nivelRisco: sessao.nivelRisco } : {}),
    });
  }

  // 9. Resposta geral educativa (fallback determinístico).
  const padrao = [
    `Entendido, vizinho! Para garantir a sua segurança e a da sua família em São Luís perto de linhas e subestações da Equatorial:`,
    `1. *Cabos caídos*: Nunca toque e fique a mais de ${DISTANCIA_SEGURA} de distância.\n2. *Pipas*: Jamais solte perto de fios e nunca tente resgatar pipa presa.\n3. *Eletrodomésticos*: Tire da tomada durante raios e peça ressarcimento em até 90 dias no ${EQUATORIAL_MA.telefones.central24h} ou WhatsApp ${EQUATORIAL_MA.telefones.whatsappClara} caso queimem por oscilação na rede.\n4. *Emergência*: Ligue imediatamente para o *${EQUATORIAL_MA.telefones.central24h}*.`,
    `Você gostaria de fazer o nosso *Quiz do Vizinho Consciente* e ganhar o Selo Digital para o seu WhatsApp? Digite *Quiz*!`,
  ];
  return responder(sessao, padrao);
}

const DOMINIOS_PERMITIDOS = ["equatorialenergia.com.br", "wa.me", "whatsapp.com", "gov.br"];

function filtrarLinks(texto: string): string {
  return texto.replace(/https?:\/\/[^\s)>\]]+/gi, (url) => {
    try {
      const host = new URL(url).hostname.toLowerCase();
      return DOMINIOS_PERMITIDOS.some((dominio) => host === dominio || host.endsWith(`.${dominio}`)) ? url : "(link removido)";
    } catch {
      return "(link removido)";
    }
  });
}

function baseDeConhecimento(): string {
  return TOPICOS_SEGURANCA.map(
    (topico) =>
      `- ${topico.titulo}: ${topico.resumo} Ação imediata: ${topico.oQueFazer[0] ?? ""} Canais: ${topico.canaisAcionamento.join(", ")}`,
  ).join("\n");
}

/** Consulta OpenAI caso OPENAI_API_KEY esteja disponível no ambiente. */
async function consultarOpenAI(
  texto: string,
  historico: Array<{ de: "usuario" | "bot"; texto: string }>,
): Promise<string[] | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const systemPrompt = `Você é o EquaBot, assistente virtual oficial e educador comunitário do programa 'Vizinho de Alta Tensão' da Equatorial Energia Maranhão em São Luís (Desafio #486 do Hackathon Equatorial).
Sua missão é educar a comunidade e empoderar os moradores que residem perto de linhas de transmissão e subestações.
Diretrizes de segurança:
- CABOS CAÍDOS: NUNCA toque, fique a mais de ${DISTANCIA_SEGURA}, tensão de passo (pés juntos), ligue ${EQUATORIAL_MA.telefones.central24h} e ${EQUATORIAL_MA.telefones.bombeiros}.
- RESSARCIMENTO DE APARELHOS: Prazo até 90 dias (Res. ANEEL 1.000/2021). NUNCA consertar nem jogar fora antes da vistoria da Equatorial! Ter Conta Contrato em mãos. Pedir pelo WhatsApp Clara (${EQUATORIAL_MA.telefones.whatsappClara}), site ou ${EQUATORIAL_MA.telefones.central24h}.
- PIPAS: Proibido soltar perto da rede; nunca tentar tirar pipa presa em fios.
- OBRAS/LAJES: Cuidado com vergalhões de ferro (arco elétrico flashover); respeitar faixa de servidão.
- INVASÃO DE SUBESTAÇÃO: Proibido pular muros.
- CANAIS: Central 24h: ${EQUATORIAL_MA.telefones.central24h}. WhatsApp Clara: ${EQUATORIAL_MA.telefones.whatsappClara}. Bombeiros: ${EQUATORIAL_MA.telefones.bombeiros}.
Regras: se houver risco iminente, oriente primeiro a se afastar e ligar ${EQUATORIAL_MA.telefones.central24h}/${EQUATORIAL_MA.telefones.bombeiros}. Nunca invente telefones, prazos, normas ou links. Use apenas os canais oficiais acima. Responda de forma acolhedora, humana e direta no estilo do WhatsApp (máximo 3 parágrafos curtos, emojis pontuais ⚡🔌🛡️).

Base de conhecimento resumida:
${baseDeConhecimento()}`;

    // O histórico já contém a mensagem atual (foi adicionada antes da consulta).
    const mensagens = [
      { role: "system", content: systemPrompt },
      ...historico.slice(-4).map((h) => ({
        role: h.de === "usuario" ? ("user" as const) : ("assistant" as const),
        content: h.texto,
      })),
    ];

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: mensagens,
        temperature: 0.3,
        max_tokens: 400,
      }),
      signal: controller.signal,
    });

    if (!res.ok) return null;
    const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
    const resposta = data.choices?.[0]?.message?.content?.trim();
    if (!resposta) return null;
    return formatarMensagensWhatsApp(filtrarLinks(resposta));
  } catch {
    // Cai no fallback determinístico.
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

function listarLetras(opcoes: Array<{ id: string }>): string {
  const letras = opcoes.map((opcao) => opcao.id.toUpperCase());
  if (letras.length <= 1) return letras.join("");
  return `${letras.slice(0, -1).join(", ")} ou ${letras.at(-1)}`;
}

/**
 * Extrai a opção escolhida sem aceitar texto livre por acidente.
 * Aceita "b", "B)", "alternativa b" ou o texto completo da alternativa.
 */
function extrairOpcao(texto: string, opcoes: Array<{ id: string; texto: string }>): string | null {
  const t = normalizarTexto(texto)
    .replace(/[.,!?;:]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!t) return null;

  const letra = t.match(/^(?:alternativa|opcao|letra)?\s*([a-d])(?:\s|$)/);
  if (letra) {
    const id = letra[1];
    return opcoes.some((opcao) => opcao.id === id) ? id : null;
  }

  const exata = opcoes.find((opcao) => normalizarTexto(opcao.texto) === t);
  if (exata) return exata.id;

  // Prefixo longo da alternativa (ex.: pessoa colou quase todo o texto).
  const prefixo = opcoes.find((opcao) => {
    const alternativa = normalizarTexto(opcao.texto);
    return t.length >= 20 && alternativa.startsWith(t);
  });
  return prefixo?.id ?? null;
}

function explicacaoSemElogio(explicacao: string): string {
  return explicacao.replace(/^(correto|isso mesmo|perfeito|exato|muito bem)!?\s*/i, "").trim();
}

/** Fluxo de perguntas do quiz e emissão de selo digital. */
async function processarFluxoQuiz(sessao: SessaoUsuario, texto: string): Promise<RespostaBot> {
  const total = PERGUNTAS_QUIZ.length;

  // Se ainda não estava no quiz, inicia.
  if (sessao.etapa !== "quiz") {
    const primeira = PERGUNTAS_QUIZ[0];
    if (!primeira) {
      sessao.etapa = "duvidas";
      return responder(sessao, ["O quiz está indisponível no momento."]);
    }
    sessao.etapa = "quiz";
    sessao.perguntaAtual = 0;
    sessao.acertos = 0;
    sessao.respostasQuiz = {};

    const opcoesTexto = primeira.opcoes.map((o) => `*${o.id.toUpperCase()}*) ${o.texto}`).join("\n");
    const letras = listarLetras(primeira.opcoes);
    return responder(sessao, [
      `*Quiz do Vizinho de Alta Tensão* 🏆\nSão apenas ${total} perguntas rápidas sobre segurança elétrica. Acerte todas e ganhe seu *Selo Oficial*!`,
      `*Pergunta ${primeira.numero} de ${total}:*\n${primeira.pergunta}\n\n${opcoesTexto}\n\n_Responda apenas com a letra correspondente (${letras}):_`,
    ]);
  }

  const perguntaAtual = PERGUNTAS_QUIZ[sessao.perguntaAtual];
  if (!perguntaAtual) {
    sessao.etapa = "duvidas";
    return responder(sessao, ["O quiz já foi concluído! Se quiser recomeçar, digite *Quiz*."]);
  }

  const opcaoId = extrairOpcao(texto, perguntaAtual.opcoes);
  const opcaoEscolhida = opcaoId ? perguntaAtual.opcoes.find((opcao) => opcao.id === opcaoId) : undefined;

  if (!opcaoEscolhida) {
    const opcoesTexto = perguntaAtual.opcoes.map((o) => `*${o.id.toUpperCase()}*) ${o.texto}`).join("\n");
    return responder(sessao, [
      `Por favor, responda com a letra da sua alternativa (${listarLetras(perguntaAtual.opcoes)}):`,
      `*Pergunta ${perguntaAtual.numero} de ${total}:*\n${perguntaAtual.pergunta}\n\n${opcoesTexto}`,
    ]);
  }

  const correta = opcaoEscolhida.correta === true;
  if (correta) sessao.acertos += 1;

  const explicacao = explicacaoSemElogio(perguntaAtual.explicacao).replace(
    /\{\{CANAL_EQUATORIAL\}\}/g,
    EQUATORIAL_MA.telefones.central24h,
  );
  const feedback = correta ? `✅ *Correto!* ${explicacao}` : `❌ *Quase lá!* ${explicacao}`;

  sessao.perguntaAtual += 1;

  if (sessao.perguntaAtual < total) {
    const proxima = PERGUNTAS_QUIZ[sessao.perguntaAtual];
    const opcoesTexto = proxima.opcoes.map((o) => `*${o.id.toUpperCase()}*) ${o.texto}`).join("\n");
    return responder(sessao, [
      feedback,
      `*Pergunta ${proxima.numero} de ${total}:*\n${proxima.pergunta}\n\n${opcoesTexto}\n\n_Responda com ${listarLetras(proxima.opcoes)}:_`,
    ]);
  }

  // Concluiu o quiz.
  sessao.etapa = "concluido";

  if (sessao.acertos === total) {
    const nome = sessao.nome || SELO_PADRAO.nome;
    const bairro = sessao.bairro || SELO_PADRAO.bairro;
    const nivel = sessao.nivelRisco ?? SELO_PADRAO.nivel;
    try {
      const selo = await getServices().badge.emitir({ primeiroNome: nome, bairro, nivel });
      sessao.seloId = selo.id;

      return responder(sessao, [
        feedback,
        `🎉 *PARABÉNS, ${selo.primeiroNome.toUpperCase()}!* Você acertou todas as ${total} perguntas e conquistou o *Selo Oficial de Vizinho de Alta Tensão*! 🛡️⚡`,
        `Seu selo digital foi emitido com sucesso:\n🔗 *Acesse seu selo:* ${linkDoSelo(selo.id)}\n\nCompartilhe no seu *Status do WhatsApp* e mostre para seus vizinhos que você protege a comunidade!`,
        `Se precisar de mais alguma orientação sobre segurança na rede ou cuidados com eletrodomésticos, basta mandar uma mensagem!`,
      ], { seloId: selo.id });
    } catch {
      return responder(sessao, [
        feedback,
        `🎉 *Parabéns!* Você acertou todas as ${total} perguntas do Quiz! 🛡️⚡`,
        `Você agora é um *Vizinho de Alta Tensão* capacitado para proteger a sua família e seus vizinhos em São Luís.`,
      ]);
    }
  }

  return responder(sessao, [
    feedback,
    `Você acertou *${sessao.acertos} de ${total}* perguntas! Quase conseguiu o selo.\n\nPara garantir seu *Selo Oficial*, você precisa acertar todas. Digite *Quiz* para tentar novamente! ⚡`,
  ]);
}

/** Ativa bloqueio de atendimento humano por 50 minutos (anti-colisão com atendente). */
export function ativarBloqueioHumano(sessaoChave: string): void {
  const sessao = obterOuCriarSessao(sessaoChave);
  sessao.ultimoAcesso = Date.now();
  sessao.bloqueadoParaHumanoAte = Date.now() + 50 * 60 * 1000;
}
