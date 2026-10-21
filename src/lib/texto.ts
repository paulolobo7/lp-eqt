const LIMITE = 20;

/** Minúsculas, sem acentos e com espaços normalizados. Usado para comparar texto livre. */
export function normalizarTexto(entrada: string): string {
  return entrada
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Só a primeira palavra, apenas letras (com acento), hífen ou apóstrofo internos,
 * até 20 letras. Nunca guardamos nome completo (LGPD).
 */
export function primeiroNome(entrada: string): string {
  const token = entrada.trim().split(/\s+/)[0] ?? "";
  const limpo = token
    .normalize("NFC")
    .replace(/[^\p{L}'-]/gu, "")
    .replace(/^['-]+|['-]+$/g, "")
    .slice(0, LIMITE);
  if (!limpo) return "";
  const minusculo = limpo.toLocaleLowerCase("pt-BR");
  return minusculo.charAt(0).toLocaleUpperCase("pt-BR") + minusculo.slice(1);
}

/** "2026-10-15" -> "15/10/2026" */
export function dataBR(iso: string): string {
  const [a, m, d] = iso.split("-");
  return `${d}/${m}/${a}`;
}
