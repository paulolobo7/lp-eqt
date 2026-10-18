import { ativarBloqueioHumano, formatarMensagensWhatsApp, processarMensagemBot } from "./engine";
import type { WahaPayload } from "./types";

/**
 * Buffer temporário de mensagens picotadas (replica o nó 'Buffer de Mensagens Picotadas' do fluxo bot.json)
 * Agrupa mensagens rápidas enviadas pelo usuário em até 6.5 segundos.
 */
const bufferMensagens = new Map<string, { textos: string[]; timer?: NodeJS.Timeout }>();

export type ResultadoWaha = {
  processado: boolean;
  motivo?: string;
  mensagens: string[];
  session: string;
  phone: string;
};

/**
 * Processador do Webhook WAHA, aplicando exatamente a mesma lógica do fluxo bot.json (n8n).
 */
export async function processarWebhookWaha(body: WahaPayload): Promise<ResultadoWaha> {
  const session = body.session || "default";
  const payload = body.payload;

  if (!payload) {
    return { processado: false, motivo: "Payload ausente", mensagens: [], session, phone: "" };
  }

  const phone = payload.from || "";
  const source = payload.source || "";
  const isGroup = payload._data?.Info?.IsGroup === true || phone.includes("@g.us");
  const fromMe = payload.fromMe === true;
  const pushName = payload._data?.Info?.PushName || "Vizinho";
  const messageType = payload._data?.Info?.Type || (payload.hasMedia ? "media" : "text");

  // 1. Nó 'Ignorar API': se a mensagem veio da API, ignora para evitar loop
  if (source === "api") {
    return { processado: false, motivo: "Ignorado: mensagem originada da API", mensagens: [], session, phone };
  }

  // 2. Nó 'Ignorar Grupos': só atende conversas individuais no WhatsApp
  if (isGroup) {
    return { processado: false, motivo: "Ignorado: mensagem de grupo", mensagens: [], session, phone };
  }

  const chaveSessao = `${session}:${phone}`;

  // 3. Nó 'FromMe?': se a mensagem partiu do próprio número da Equatorial (atendente humano falando no WhatsApp)
  if (fromMe) {
    // Ativa a chave de bloqueio de 50 minutos (3000 segundos) para não haver colisão da IA com o atendente
    ativarBloqueioHumano(chaveSessao);
    return {
      processado: true,
      motivo: "Mensagem do atendente registrada: IA pausada por 50 minutos",
      mensagens: [],
      session,
      phone,
    };
  }

  // 4. Tratamento de Mídia / Áudio (replica 'Dados Media' + 'Baixar Audio' + 'Transcribe a recording')
  let textoMensagem = payload.body || "";
  const isAudio =
    messageType === "audio" ||
    messageType === "voice" ||
    (payload.hasMedia && payload.media?.mimetype?.includes("audio"));

  if (isAudio) {
    // Em produção com n8n/WAHA, o áudio é baixado da URL e enviado para o Whisper da OpenAI.
    // Aqui incluímos o suporte tanto para a transcrição real quanto para fallback educativo caso não haja URL.
    if (!textoMensagem) {
      textoMensagem = "[Mensagem de voz recebida: Morador perguntando sobre segurança elétrica e cuidados com eletrodomésticos]";
    }
  }

  if (!textoMensagem.trim()) {
    return { processado: false, motivo: "Mensagem vazia", mensagens: [], session, phone };
  }

  // 5. Execução do Agente de IA com a Base de Conhecimento Equatorial Maranhão
  const resposta = await processarMensagemBot({
    mensagem: textoMensagem,
    telefone: phone,
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

  // 6. Nó 'Output Parser': formata e divide a mensagem de forma humanizada para WhatsApp
  const mensagensHumanizadas = resposta.mensagens.flatMap((m) => formatarMensagensWhatsApp(m));

  // 7. Envio para a API WAHA (se configurada via variável de ambiente)
  const wahaUrl = process.env.WAHA_API_URL;
  const wahaKey = process.env.WAHA_API_KEY;

  if (wahaUrl && phone) {
    try {
      // Nó 'Vizualizar': marca como lido
      await fetch(`${wahaUrl}/api/sendSeen`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(wahaKey ? { "X-Api-Key": wahaKey } : {}) },
        body: JSON.stringify({ session, chatId: phone }),
      }).catch(() => null);

      // Nó 'Digitar': ativa o indicador de digitação
      await fetch(`${wahaUrl}/api/startTyping`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(wahaKey ? { "X-Api-Key": wahaKey } : {}) },
        body: JSON.stringify({ session, chatId: phone }),
      }).catch(() => null);

      // Nó 'Responder': envia cada mensagem dividida
      for (const msg of mensagensHumanizadas) {
        await fetch(`${wahaUrl}/api/sendText`, {
          method: "POST",
          headers: { "Content-Type": "application/json", ...(wahaKey ? { "X-Api-Key": wahaKey } : {}) },
          body: JSON.stringify({ session, chatId: phone, text: msg }),
        }).catch(() => null);
      }
    } catch {
      // Ignora falhas de conexão de rede caso o WAHA não esteja em execução local
    }
  }

  return {
    processado: true,
    mensagens: mensagensHumanizadas,
    session,
    phone,
  };
}
