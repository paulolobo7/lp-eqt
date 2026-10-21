import { timingSafeEqual } from "node:crypto";

/**
 * Valida o segredo compartilhado do webhook (header `x-webhook-token` ou
 * `?token=`). Em produção, sem segredo configurado, o webhook falha fechado.
 * Em desenvolvimento/teste, sem segredo, segue aberto para facilitar o uso local.
 */
export function webhookAutorizado(request: Request): boolean {
  const esperado = process.env.WHATSAPP_WEBHOOK_SECRET;
  if (!esperado) return process.env.NODE_ENV !== "production";

  const recebido =
    request.headers.get("x-webhook-token") ??
    new URL(request.url).searchParams.get("token") ??
    "";

  if (!recebido || recebido.length !== esperado.length) return false;
  return timingSafeEqual(Buffer.from(recebido), Buffer.from(esperado));
}
