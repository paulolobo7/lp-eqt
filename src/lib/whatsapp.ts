import { PH } from "@/content/placeholders";

export function numeroWhatsAppValido(numero: string | undefined): numero is string {
  return !!numero && /^\d{10,15}$/.test(numero);
}

/** Formata um número com DDI/DDD para exibição, sem inventar dígitos. */
export function formatarNumeroWhatsApp(numero: string): string {
  const d = numero.replace(/\D/g, "");
  if (d.length === 13) return `+${d.slice(0, 2)} (${d.slice(2, 4)}) ${d.slice(4, 9)}-${d.slice(9)}`;
  if (d.length === 12) return `+${d.slice(0, 2)} (${d.slice(2, 4)}) ${d.slice(4, 8)}-${d.slice(8)}`;
  return `+${d}`;
}

/** Link de entrada do bot. Sem número configurado, mantém o placeholder visível. */
export function linkWhatsApp(numero: string | undefined, mensagem: string): string {
  const limpo = numero?.replace(/[\s()+-]/g, "");
  const alvo = numeroWhatsAppValido(limpo) ? limpo : PH.numero;
  return `https://wa.me/${alvo}?text=${encodeURIComponent(mensagem)}`;
}
