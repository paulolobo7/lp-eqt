import { z } from "zod";
import { lerJson } from "@/lib/http";
import { limitar } from "@/lib/rate-limit";
import { respostaDeErro } from "@/lib/schemas";
import { webhookAutorizado } from "@/lib/webhook-auth";
import { processarWebhookWaha } from "@/lib/bot/waha-handler";
import { processarMensagemBot } from "@/lib/bot/engine";
import type { WahaPayload } from "@/lib/bot/types";

/*
 * Webhook unificado do Bot Vizinho de Alta Tensão (Equatorial Maranhão).
 *
 * Suporta dois modos de integração:
 * 1. WAHA (WhatsApp HTTP API), seguindo rigorosamente a arquitetura do fluxo bot.json (n8n).
 * 2. Meta WhatsApp Business Cloud API (com verificação de webhook GET e eventos POST).
 */

export async function GET(request: Request) {
  const url = new URL(request.url);
  const esperado = process.env.WHATSAPP_VERIFY_TOKEN;
  const ok =
    !!esperado &&
    url.searchParams.get("hub.mode") === "subscribe" &&
    url.searchParams.get("hub.verify_token") === esperado;
  if (!ok) return new Response("Token de verificação inválido.", { status: 403 });
  return new Response(url.searchParams.get("hub.challenge") ?? "", { status: 200 });
}

// Validação para Meta WhatsApp Cloud API
const metaPayloadSchema = z.object({
  object: z.literal("whatsapp_business_account", { error: "Objeto do webhook inválido." }),
  entry: z.array(
    z.object({
      changes: z.array(
        z.object({
          value: z.object({
            messages: z
              .array(
                z
                  .object({
                    from: z.string().min(1).max(60),
                    type: z.string(),
                    text: z.object({ body: z.string().max(4096) }).optional(),
                  })
                  .passthrough(),
              )
              .optional(),
          }).passthrough(),
        }),
      ),
    }),
  ),
});

// Validação para WAHA (WhatsApp HTTP API / fluxo bot.json)
const wahaPayloadSchema = z.object({
  event: z.string(),
  session: z.string().optional(),
  payload: z.object({
    id: z.string().optional(),
    from: z.string().optional(),
    source: z.string().optional(),
    body: z.string().optional(),
    hasMedia: z.boolean().optional(),
    fromMe: z.boolean().optional(),
    media: z
      .object({
        mimetype: z.string().optional(),
        url: z.string().optional(),
      })
      .optional(),
    _data: z.any().optional(),
  }),
});

export async function POST(request: Request) {
  const bloqueio = limitar(request, "webhook", { max: 60, janelaMs: 60_000 });
  if (bloqueio) return bloqueio;

  if (!webhookAutorizado(request)) {
    if (!process.env.WHATSAPP_WEBHOOK_SECRET && process.env.NODE_ENV === "production") {
      return Response.json({ erro: "Webhook sem WHATSAPP_WEBHOOK_SECRET configurado." }, { status: 503 });
    }
    return Response.json({ erro: "Não autorizado." }, { status: 401 });
  }

  const corpo = await lerJson(request);
  if (!corpo.ok) return corpo.resposta;

  // 1. Identifica se é evento WAHA (fluxo bot.json)
  const parseWaha = wahaPayloadSchema.safeParse(corpo.dados);
  if (parseWaha.success) {
    const resultado = await processarWebhookWaha(parseWaha.data as WahaPayload);
    return Response.json({
      sucesso: true,
      tipo: "waha",
      processado: resultado.processado,
      motivo: resultado.motivo,
      mensagens: resultado.mensagens,
    });
  }

  // 2. Identifica se é Meta WhatsApp Cloud API
  const parseMeta = metaPayloadSchema.safeParse(corpo.dados);
  if (parseMeta.success) {
    const mensagensRecebidas = parseMeta.data.entry
      .flatMap((e) => e.changes)
      .flatMap((c) => c.value.messages ?? [])
      .filter((m) => m.type === "text" && m.text);

    // Eco mantido para o contrato de simulação.
    const respostas = mensagensRecebidas.map((m) => ({ eco: m.text!.body }));

    // Processa em ordem, com identidade por remetente: cada usuário tem sua sessão.
    const processamentos = [];
    for (const mensagem of mensagensRecebidas) {
      processamentos.push(
        await processarMensagemBot({
          mensagem: mensagem.text!.body,
          telefone: mensagem.from,
          sessao: "meta",
        }),
      );
    }
    const botMensagens = processamentos.flatMap((p) => p.mensagens);

    return Response.json({
      simulacao: true,
      respostas,
      mensagens: botMensagens,
    });
  }

  // 3. Formato desconhecido
  return respostaDeErro(parseMeta.error);
}
