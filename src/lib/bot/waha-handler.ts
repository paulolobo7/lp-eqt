import { ativarBloqueioHumano, formatarMensagensWhatsApp, processarMensagemBot } from "./engine";
import { agrupar } from "./buffer";
import { transcreverAudio } from "./transcricao";
import type { WahaPayload } from "./types";

const TEXTO_AUDIO_FALLBACK =
  "[Mensagem de voz recebida: Morador perguntando sobre segurança elétrica e cuidados com eletrodomésticos]";

export type ResultadoWaha = {
  processado: boolean;
  motivo?: string;
  mensagens: string[];
  session: string;
  phone: string;
};

async function enviarWaha(wahaUrl: string, wahaKey: string | undefined, caminho: string, corpo: unknown): Promise<boolean> {
  try {
    const res = await fetch(`${wahaUrl}${caminho}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(wahaKey ? { "X-Api-Key": wahaKey } : {}) },
      body: JSON.stringify(corpo),
      signal: AbortSignal.timeout(8_000),
    });
    return res.ok;
  } catch {
    // WAHA local pode não estar rodando; o webhook ainda devolve as mensagens.
    return false;
  }
}

/**
 * Processador do Webhook WAHA, seguindo o fluxo do bot.json (n8n):
 * ignora API/grupos, pausa em atendimento humano, transcreve áudio, agrupa
 * mensagens picotadas e formata a saída para o WhatsApp.
 */
export async function processarWebhookWaha(body: WahaPayload): Promise<ResultadoWaha> {
  const session = body.session || "default";
  const payload = body.payload;

  if (body.event !== "message") {
    return { processado: false, motivo: `Evento ignorado: ${body.event}`, mensagens: [], session, phone: "" };
  }

  if (!payload) {
    return { processado: false, motivo: "Payload ausente", mensagens: [], session, phone: "" };
  }

  const phone = payload.from || "";
  const source = payload.source || "";
  const isGroup = payload._data?.Info?.IsGroup === true || phone.includes("@g.us");
  const fromMe = payload.fromMe === true;
  const pushName = payload._data?.Info?.PushName || undefined;
  const messageType = payload._data?.Info?.Type || (payload.hasMedia ? "media" : "text");

  // 1. Nó 'Ignorar API': se a mensagem veio da API, ignora para evitar loop.
  if (source === "api") {
    return { processado: false, motivo: "Ignorado: mensagem originada da API", mensagens: [], session, phone };
  }

  // 2. Nó 'Ignorar Grupos': só atende conversas individuais.
  if (isGroup) {
    return { processado: false, motivo: "Ignorado: mensagem de grupo", mensagens: [], session, phone };
  }

  // 3. Nó 'FromMe?': atendente humano falando no WhatsApp pausa a IA.
  // Em mensagens de saída, `from` costuma ser o número da própria sessão;
  // a conversa com o cliente está em `to`/`Info.Chat`.
  if (fromMe) {
    const conversa = payload.to || payload._data?.Info?.Chat || phone;
    ativarBloqueioHumano(`${session}:${conversa}`);
    return {
      processado: true,
      motivo: "Mensagem do atendente registrada: IA pausada por 50 minutos",
      mensagens: [],
      session,
      phone: conversa,
    };
  }

  const conversa = phone;

  // 4. Áudio: tenta transcrever; sem chave/URL, usa o fallback educativo.
  let textoMensagem = payload.body || "";
  const isAudio =
    messageType === "audio" ||
    messageType === "voice" ||
    (payload.hasMedia && payload.media?.mimetype?.includes("audio"));

  if (isAudio) {
    const transcricao = payload.media?.url
      ? await transcreverAudio(payload.media.url, { nomeArquivo: payload.media.filename })
      : null;
    textoMensagem = (transcricao || textoMensagem).trim();
    if (!textoMensagem) textoMensagem = TEXTO_AUDIO_FALLBACK;
  }

  if (!textoMensagem.trim()) {
    return { processado: false, motivo: "Mensagem vazia", mensagens: [], session, phone };
  }

  // 5. Buffer de mensagens picotadas (padrão 6,5s; WAHA_BUFFER_MS=0 desliga).
  const agrupada = await agrupar(`${session}:${conversa}`, textoMensagem);
  if (!agrupada.lider) {
    return { processado: false, motivo: "Mensagem agrupada com a anterior", mensagens: [], session, phone };
  }

  // 6. Execução do agente com a base de conhecimento.
  const resposta = await processarMensagemBot({
    mensagem: agrupada.texto,
    telefone: conversa,
    sessao: session,
    nome: pushName,
    eAudio: isAudio,
    audioUrl: payload.media?.url,
  });

  if (resposta.bloqueadoParaHumano) {
    return {
      processado: false,
      motivo: "Em atendimento humano: resposta automática suprimida",
      mensagens: [],
      session,
      phone,
    };
  }

  // 7. Output parser: formata e divide de forma humanizada para WhatsApp.
  const mensagensHumanizadas = resposta.mensagens.flatMap((mensagem) => formatarMensagensWhatsApp(mensagem));

  // 8. Envio via WAHA (se configurado).
  const wahaUrl = process.env.WAHA_API_URL;
  const wahaKey = process.env.WAHA_API_KEY;

  if (wahaUrl && conversa) {
    await enviarWaha(wahaUrl, wahaKey, "/api/sendSeen", { session, chatId: conversa });
    await enviarWaha(wahaUrl, wahaKey, "/api/startTyping", { session, chatId: conversa });
    for (const mensagem of mensagensHumanizadas) {
      await enviarWaha(wahaUrl, wahaKey, "/api/sendText", { session, chatId: conversa, text: mensagem });
    }
  }

  return {
    processado: true,
    mensagens: mensagensHumanizadas,
    session,
    phone,
  };
}
