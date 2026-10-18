import { EQUATORIAL_MA, PERGUNTAS_QUIZ, TOPICOS_SEGURANCA, type TopicoSeguranca } from "./knowledge";
import { getServices } from "../services";
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
}

const sessoes = new Map<string, SessaoUsuario>();

function obterChaveSessao(req: SolicitacaoMensagem): string {
  const sessao = req.sessao || "default";
  const telefone = req.telefone || "anonimo";
  return `${sessao}:${telefone}`;
}

function obterOuCriarSessao(chave: string, nome?: string): SessaoUsuario {
  let s = sessoes.get(chave);
  if (!s) {
    s = {
      etapa: "inicio",
      perguntaAtual: 0,
      respostasQuiz: {},
      acertos: 0,
      nome,
      historico: [],
    };
    sessoes.set(chave, s);
  } else if (nome && !s.nome) {
    s.nome = nome;
  }
  return s;
}

/** Formata e divide a resposta em mensagens legíveis e humanizadas para o WhatsApp (máximo 4) */
export function formatarMensagensWhatsApp(textoCompleto: string): string[] {
  if (!textoCompleto.trim()) return [];

  // Se o texto já estiver curto, devolve diretamente
  if (textoCompleto.length <= 320 && !textoCompleto.includes("\n\n")) {
    return [limparMarkdownWhatsApp(textoCompleto)];
  }

  // Divide por quebra dupla de parágrafo
  const blocos = textoCompleto
    .split(/\n\s*\n/)
    .map((b) => b.trim())
    .filter((b) => b.length > 0);

  if (blocos.length > 1) {
    const mensagens: string[] = [];
    let buffer = "";

    for (const b of blocos) {
      if (!buffer) {
        buffer = b;
      } else if ((buffer + "\n\n" + b).length <= 260 && mensagens.length < 3) {
        buffer += "\n\n" + b;
      } else {
        mensagens.push(limparMarkdownWhatsApp(buffer));
        buffer = b;
        if (mensagens.length >= 3) break;
      }
    }

    if (buffer && mensagens.length < 4) {
      mensagens.push(limparMarkdownWhatsApp(buffer));
    }

    return mensagens.length > 0 ? mensagens.slice(0, 4) : [limparMarkdownWhatsApp(textoCompleto)];
  }

  return [limparMarkdownWhatsApp(textoCompleto)];
}

function limparMarkdownWhatsApp(texto: string): string {
  // Mantém formatação leve do WhatsApp (*negrito*, _itálico_) e remove hashes de títulos
  return texto
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\*\*(.*?)\*\*/g, "*$1*")
    .replace(/\[(.*?)\]\((https?:\/\/.*?)\)/g, "$1 ($2)")
    .trim();
}

/** Identifica o tópico de segurança mais relevante para a mensagem */
function encontrarTopico(texto: string): TopicoSeguranca | null {
  const t = texto.toLowerCase();
  let melhorTopico: TopicoSeguranca | null = null;
  let melhorPontuacao = 0;

  for (const topico of TOPICOS_SEGURANCA) {
    let pontuacao = 0;
    for (const kw of topico.palavrasChave) {
      if (t.includes(kw)) {
        // Palavras-chave específicas ou mais longas têm peso maior
        pontuacao += kw.length > 5 ? 4 : 2;
        // Se a palavra aparecer como token isolado
        if (new RegExp(`\\b${kw}\\b`, "i").test(t)) {
          pontuacao += 3;
        }
      }
    }

    if (pontuacao > melhorPontuacao) {
      melhorPontuacao = pontuacao;
      melhorTopico = topico;
    }
  }

  return melhorPontuacao > 0 ? melhorTopico : null;
}

/** Processa uma mensagem e devolve a resposta educativa para o usuário */
export async function processarMensagemBot(req: SolicitacaoMensagem): Promise<RespostaBot> {
  const chave = obterChaveSessao(req);
  const sessao = obterOuCriarSessao(chave, req.nome);
  const agora = Date.now();

  // Verifica bloqueio para atendimento humano (Handover / Anti-Colisão)
  if (sessao.bloqueadoParaHumanoAte && sessao.bloqueadoParaHumanoAte > agora) {
    sessao.historico.push({ de: "usuario", texto: req.mensagem });
    return {
      mensagens: [],
      bloqueadoParaHumano: true,
    };
  }

  const texto = req.mensagem.trim();
  const tLower = texto.toLowerCase();
  sessao.historico.push({ de: "usuario", texto });

  // 1. Comando explícito de reset ou início / saudação simples
  const saudacoes = ["oi", "olá", "ola", "comecar", "início", "inicio", "menu", "ajuda", "bom dia", "boa tarde", "boa noite"];
  const ehApenasSaudacao = saudacoes.includes(tLower) || (saudacoes.some((s) => tLower.startsWith(s)) && tLower.length < 25);

  if (ehApenasSaudacao && !tLower.includes("quiz") && !tLower.includes("selo") && !tLower.includes("cabo") && !tLower.includes("fio") && !tLower.includes("queim")) {
    sessao.etapa = "duvidas";
    const boasVindas = [
      `*Olá, vizinho!* Aqui é o *EquaBot*, assistente oficial do programa *Vizinho de Alta Tensão* da Equatorial Maranhão em São Luís! ⚡`,
      `Estou aqui para tirar suas dúvidas sobre como viver com total segurança perto da rede elétrica, proteger seus eletrodomésticos contra queimas e quedas de energia e garantir seu *Selo Oficial de Vizinho Consciente*! 🛡️`,
      `Você pode me perguntar sobre:\n• ⚡ Cabo caído no chão ou soltando faíscas\n• 🔌 Eletrodoméstico que queimou e ressarcimento de danos\n• 🪁 Pipas perto da fiação\n• 🏢 Obras, reformas e lajes sob a rede\n• 🏆 Fazer o *Quiz de Segurança* e emitir seu Selo Digital`,
    ];
    sessao.historico.push(...boasVindas.map((m) => ({ de: "bot" as const, texto: m })));
    return { mensagens: boasVindas };
  }

  // 2. Fluxo do Quiz do Vizinho Consciente
  if (tLower.includes("quiz") || tLower.includes("selo") || tLower.includes("teste") || sessao.etapa === "quiz") {
    return processarFluxoQuiz(sessao, texto, req.nome);
  }

  // 3. Reconhecimento de bairros de São Luís
  for (const b of EQUATORIAL_MA.bairrosSaoLuis) {
    if (tLower.includes(b.nome.toLowerCase())) {
      sessao.bairro = b.nome;
      sessao.nivelRisco = b.riscoPadrao as "alto" | "medio" | "baixo";

      const nivelDesc =
        b.riscoPadrao === "alto"
          ? "🚨 *Nível de Atenção: Alto!* O seu bairro possui corredores de linhas de transmissão ou subestação muito próximas das residências."
          : b.riscoPadrao === "medio"
          ? "⚠️ *Nível de Atenção: Médio.* Seu bairro está a uma distância intermediária de subestações e linhas de alta tensão."
          : "✅ *Nível de Atenção: Baixo.* Seu bairro está mais afastado de grandes linhas de alta tensão, mas os cuidados com a fiação da rua permanecem!";

      const msgBairro = [
        `Reconheci o seu bairro: *${b.nome}* (São Luís - MA)! 📍`,
        `${nivelDesc}\nAtivos na região: ${b.ativos}.`,
        `Para sua segurança no ${b.nome}, lembre-se: nunca encoste em cabos caídos, mantenha distância de faíscas e tire aparelhos sensíveis da tomada em tempestades.\n\nQuer responder 3 perguntinhas rápidas no *Quiz* para emitir seu *Selo de Vizinho de Alta Tensão*? Digite *Quiz*!`,
      ];
      sessao.historico.push(...msgBairro.map((m) => ({ de: "bot" as const, texto: m })));
      return {
        mensagens: msgBairro,
        bairroReconhecido: b.nome,
        nivelRisco: sessao.nivelRisco,
      };
    }
  }

  // 4. Reconhecimento por tópicos de segurança
  const topico = encontrarTopico(texto);
  if (topico) {
    const respostasTopico: string[] = [
      `*${topico.titulo}* ⚡\n\n${topico.resumo}`,
      `*O que fazer:*\n` + topico.oQueFazer.map((item) => (item.startsWith("-") || item.startsWith("1") ? item : `• ${item}`)).join("\n"),
      `*O que NUNCA fazer:*\n` + topico.oQueNaoFazer.map((item) => `❌ ${item}`).join("\n"),
      `*Canais de Emergência da Equatorial Maranhão:*\n` +
        `• 📞 Central Gratuita 24h: *${EQUATORIAL_MA.telefones.central24h}*\n` +
        `• 💬 WhatsApp da Clara: *${EQUATORIAL_MA.telefones.whatsappClara}*\n` +
        `• 🚒 Bombeiros: *${EQUATORIAL_MA.telefones.bombeiros}* (risco de vida ou fogo)`,
    ];

    sessao.historico.push(...respostasTopico.map((m) => ({ de: "bot" as const, texto: m })));
    return {
      mensagens: respostasTopico,
      bairroReconhecido: sessao.bairro,
      nivelRisco: sessao.nivelRisco,
    };
  }

  // 5. Canais de Atendimento ou Emergência
  if (tLower.includes("telefone") || tLower.includes("canal") || tLower.includes("contato") || tLower.includes("numero") || tLower.includes("ligar")) {
    const canais = [
      `*Canais Oficiais da Equatorial Maranhão em São Luís:* 📱`,
      `• *116*: Ligação gratuita 24h para emergências, falta de luz e cabos partidos.\n• *WhatsApp Clara*: (98) 2055-0116 para pedidos de ressarcimento, 2ª via e religação.\n• *App Equatorial Energia*: no Google Play e App Store.\n• *Site*: www.equatorialenergia.com.br`,
      `Em casos de perigo iminente de vida ou incêndio na rede, acione também o Corpo de Bombeiros no *193*!`,
    ];
    sessao.historico.push(...canais.map((m) => ({ de: "bot" as const, texto: m })));
    return { mensagens: canais };
  }

  // 6. Consulta opcional via OpenAI (se OPENAI_API_KEY estiver configurada)
  const respostaIA = await consultarOpenAI(texto, sessao.historico);
  if (respostaIA && respostaIA.length > 0) {
    sessao.historico.push(...respostaIA.map((m) => ({ de: "bot" as const, texto: m })));
    return {
      mensagens: respostaIA,
      bairroReconhecido: sessao.bairro,
      nivelRisco: sessao.nivelRisco,
    };
  }

  // 7. Resposta Geral Educativa (fallback determinístico)
  const padrao = [
    `Entendido, vizinho! Para garantir a sua segurança e a da sua família em São Luís perto de linhas e subestações da Equatorial:`,
    `1. *Cabos caídos*: Nunca toque e fique a mais de 10 metros de distância.\n2. *Pipas*: Jamais solte perto de fios e nunca tente resgatar pipa presa.\n3. *Eletrodomésticos*: Tire da tomada durante raios e peça ressarcimento em até 90 dias no 116 ou WhatsApp (98) 2055-0116 caso queimem por oscilação na rede.\n4. *Emergência*: Ligue imediatamente para o *116*.`,
    `Você gostaria de fazer o nosso *Quiz do Vizinho Consciente* e ganhar o Selo Digital para o seu WhatsApp? Digite *Quiz*!`,
  ];
  sessao.historico.push(...padrao.map((m) => ({ de: "bot" as const, texto: m })));
  return { mensagens: padrao };
}

/** Consulta OpenAI caso OPENAI_API_KEY esteja disponível no ambiente */
async function consultarOpenAI(
  texto: string,
  historico: Array<{ de: "usuario" | "bot"; texto: string }>
): Promise<string[] | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  try {
    const systemPrompt = `Você é o EquaBot, assistente virtual oficial e educador comunitário do programa 'Vizinho de Alta Tensão' da Equatorial Energia Maranhão em São Luís (Desafio #486 do Hackathon Equatorial).
Sua missão é educar a comunidade e empoderar os moradores que residem perto de linhas de transmissão e subestações.
Diretrizes de segurança:
- CABOS CAÍDOS: NUNCA toque, fique a mais de 10-15 metros, tensão de passo (pés juntos), ligue 116 e 193.
- RESSARCIMENTO DE APARELHOS: Prazo até 90 dias (Res. ANEEL 1.000/2021). NUNCA consertar nem jogar fora antes da vistoria da Equatorial! Ter Conta Contrato em mãos. Pedir pelo WhatsApp Clara ((98) 2055-0116), site ou 116.
- PIPAS: Proibido soltar perto da rede; nunca tentar tirar pipa presa em fios.
- OBRAS/LAJES: Cuidado com vergalhões de ferro (arco elétrico flashover); respeitar faixa de servidão.
- INVASÃO DE SUBESTAÇÃO: Proibido pular muros.
- CANAIS: Central 24h: 116. WhatsApp Clara: (98) 2055-0116. Bombeiros: 193.
Responda de forma acolhedora, humana e direta no estilo do WhatsApp (máximo 3 parágrafos curtos, emojis pontuais ⚡🔌🛡️).`;

    const mensagens = [
      { role: "system", content: systemPrompt },
      ...historico.slice(-4).map((h) => ({
        role: h.de === "usuario" ? ("user" as const) : ("assistant" as const),
        content: h.texto,
      })),
      { role: "user" as const, content: texto },
    ];

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages,
        temperature: 0.6,
        max_tokens: 400,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      const resposta = data.choices?.[0]?.message?.content?.trim();
      if (resposta) {
        return formatarMensagensWhatsApp(resposta);
      }
    }
  } catch {
    // Retorna null para cair no fallback determinístico
  }
  return null;
}

/** Fluxo de perguntas do quiz e emissão de selo digital */
async function processarFluxoQuiz(sessao: SessaoUsuario, texto: string, nomeInformado?: string): Promise<RespostaBot> {
  const tLower = texto.toLowerCase();

  // Se ainda não estava no quiz, inicia
  if (sessao.etapa !== "quiz") {
    sessao.etapa = "quiz";
    sessao.perguntaAtual = 0;
    sessao.acertos = 0;
    sessao.respostasQuiz = {};

    const p = PERGUNTAS_QUIZ[0];
    const opcoesTexto = p.opcoes.map((o) => `*${o.id.toUpperCase()}*) ${o.texto}`).join("\n");
    const msgs = [
      `*Quiz do Vizinho de Alta Tensão* 🏆\nSão apenas 3 perguntas rápidas sobre segurança elétrica. Acerte todas e ganhe seu *Selo Oficial*!`,
      `*Pergunta 1 de 3:*\n${p.pergunta}\n\n${opcoesTexto}\n\n_Responda apenas com a letra correspondente (A, B, C ou D):_`,
    ];
    return { mensagens: msgs };
  }

  const pAtual = PERGUNTAS_QUIZ[sessao.perguntaAtual];
  if (!pAtual) {
    sessao.etapa = "duvidas";
    return { mensagens: ["O quiz já foi concluído! Se quiser recomeçar, digite *Quiz*."] };
  }

  // Identifica a opção escolhida
  const letra = tLower.replace(/[^abcd]/g, "").slice(0, 1);
  const opcaoEscolhida = pAtual.opcoes.find((o) => o.id === letra || tLower.includes(o.texto.toLowerCase().slice(0, 15)));

  if (!opcaoEscolhida) {
    const opcoesTexto = pAtual.opcoes.map((o) => `*${o.id.toUpperCase()}*) ${o.texto}`).join("\n");
    return {
      mensagens: [
        `Por favor, responda com a letra da sua alternativa (*A, B, C ou D*):`,
        `*Pergunta ${pAtual.numero} de 3:*\n${pAtual.pergunta}\n\n${opcoesTexto}`,
      ],
    };
  }

  const correta = (opcaoEscolhida as { correta?: boolean }).correta === true;
  if (correta) {
    sessao.acertos += 1;
  }

  const feedback = correta
    ? `✅ *Correto!* ${pAtual.explicacao}`
    : `❌ *Quase lá!* ${pAtual.explicacao}`;

  sessao.perguntaAtual += 1;

  // Próxima pergunta
  if (sessao.perguntaAtual < PERGUNTAS_QUIZ.length) {
    const proxP = PERGUNTAS_QUIZ[sessao.perguntaAtual];
    const opcoesTexto = proxP.opcoes.map((o) => `*${o.id.toUpperCase()}*) ${o.texto}`).join("\n");
    return {
      mensagens: [
        feedback,
        `*Pergunta ${proxP.numero} de 3:*\n${proxP.pergunta}\n\n${opcoesTexto}\n\n_Responda com A, B, C ou D:_`,
      ],
    };
  }

  // Concluiu o Quiz!
  sessao.etapa = "concluido";

  if (sessao.acertos === PERGUNTAS_QUIZ.length) {
    try {
      const services = getServices();
      const primeiroNomeUsuario = nomeInformado || sessao.nome || "Vizinho";
      const bairroUsuario = sessao.bairro || "São Luís";
      const selo = await services.badge.emitir({
        primeiroNome: primeiroNomeUsuario,
        bairro: bairroUsuario,
        nivel: sessao.nivelRisco || "alto",
      });

      sessao.seloId = selo.id;
      const linkSelo = `https://vizinho.equatorial.com.br/selo/${selo.id}`;

      return {
        mensagens: [
          feedback,
          `🎉 *PARABÉNS, ${primeiroNomeUsuario.toUpperCase()}!* Você acertou todas as 3 perguntas e conquistou o *Selo Oficial de Vizinho de Alta Tensão*! 🛡️⚡`,
          `Seu selo digital foi emitido com sucesso:\n🔗 *Acesse seu selo:* ${linkSelo}\n\nCompartilhe no seu *Status do WhatsApp* e mostre para seus vizinhos que você protege a comunidade!`,
          `Se precisar de mais alguma orientação sobre segurança na rede ou cuidados com eletrodomésticos, basta mandar uma mensagem!`,
        ],
        seloId: selo.id,
      };
    } catch {
      return {
        mensagens: [
          feedback,
          `🎉 *Parabéns!* Você acertou todas as 3 perguntas do Quiz! 🛡️⚡`,
          `Você agora é um *Vizinho de Alta Tensão* capacitado para proteger a sua família e seus vizinhos em São Luís.`,
        ],
      };
    }
  } else {
    return {
      mensagens: [
        feedback,
        `Você acertou *${sessao.acertos} de 3* perguntas! Quase conseguiu o selo.\n\nPara garantir seu *Selo Oficial*, você precisa acertar as 3. Digite *Quiz* para tentar novamente! ⚡`,
      ],
    };
  }
}

/** Ativa bloqueio de atendimento humano por 50 minutos (anti-colisão com atendente) */
export function ativarBloqueioHumano(sessaoChave: string): void {
  const s = obterOuCriarSessao(sessaoChave);
  s.bloqueadoParaHumanoAte = Date.now() + 50 * 60 * 1000;
}
