import { PH } from "@/content/placeholders";

export function numeroWhatsAppValido(numero: string | undefined): numero is string {
  return !!numero && /^\d{10,15}$/.test(numero);
}

/** Link de entrada do bot. Sem número configurado, mantém o placeholder visível. */
export function linkWhatsApp(numero: string | undefined, mensagem: string): string {
  const limpo = numero?.replace(/[\s()+-]/g, "");
  const alvo = numeroWhatsAppValido(limpo) ? limpo : PH.numero;
  return `https://wa.me/${alvo}?text=${encodeURIComponent(mensagem)}`;
}
