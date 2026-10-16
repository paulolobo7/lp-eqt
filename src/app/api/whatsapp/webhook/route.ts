import { z } from "zod";
import { lerJson } from "@/lib/http";
import { respostaDeErro } from "@/lib/schemas";

/*
 * Stub do webhook da WhatsApp Business Platform (Cloud API).
 *
 * TODO (integração real):
 * 1. Validar a assinatura X-Hub-Signature-256 (HMAC-SHA256 do corpo bruto com o
 *    App Secret) antes de ler o JSON; recusar com 401 se não conferir.
 * 2. Trocar o eco pela máquina de estados do bot (boas-vindas, localização,
 *    resultado, quiz, selo) usando os mesmos serviços de src/lib/services.
 * 3. Responder pela Graph API (POST /{phone-number-id}/messages) com token do
 *    sistema guardado em variável de ambiente; nunca registrar telefone em log.
 * 4. Responder 200 rápido e processar em segundo plano (a Meta reenvia em caso de erro).
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

const payload = z.object({
  object: z.literal("whatsapp_business_account", { error: "Objeto do webhook inválido." }),
  entry: z.array(
    z.object({
      changes: z.array(
        z.object({
          value: z.object({
            messages: z
              .array(z.object({ type: z.string(), text: z.object({ body: z.string().max(4096) }).optional() }).passthrough())
              .optional(),
          }).passthrough(),
        }),
      ),
    }),
  ),
});

export async function POST(request: Request) {
  const corpo = await lerJson(request);
  if (!corpo.ok) return corpo.resposta;
  const dados = payload.safeParse(corpo.dados);
  if (!dados.success) return respostaDeErro(dados.error);

  const respostas = dados.data.entry
    .flatMap((e) => e.changes)
    .flatMap((c) => c.value.messages ?? [])
    .filter((m) => m.type === "text" && m.text)
    .map((m) => ({ eco: m.text!.body }));

  return Response.json({ simulacao: true, respostas });
}
