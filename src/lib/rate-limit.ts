import { semCache } from "./http";

type Balde = { inicio: number; contagem: number };

const MAX_BALDES = 10_000;
const baldes = new Map<string, Balde>();

export type Limite = { max: number; janelaMs: number };
export type ResultadoLimite = { permitido: boolean; restante: number; resetarEm: number };

function limpar(agora: number): void {
  for (const [chave, balde] of baldes) {
    if (agora - balde.inicio > 10 * 60_000) baldes.delete(chave);
  }
  if (baldes.size < MAX_BALDES) return;
  const antigos = [...baldes.entries()].sort((a, b) => a[1].inicio - b[1].inicio);
  for (const [chave] of antigos.slice(0, baldes.size - MAX_BALDES + 1)) baldes.delete(chave);
}

/**
 * Janela fixa em memória. É uma mitigação por instância, não um limitador
 * distribuído; para várias réplicas, troque por Redis/Upstash.
 */
export function consumir(chave: string, limite: Limite, agora = Date.now()): ResultadoLimite {
  const atual = baldes.get(chave);

  if (!atual || agora - atual.inicio >= limite.janelaMs) {
    if (baldes.size >= MAX_BALDES) limpar(agora);
    baldes.set(chave, { inicio: agora, contagem: 1 });
    return { permitido: true, restante: limite.max - 1, resetarEm: agora + limite.janelaMs };
  }

  if (atual.contagem >= limite.max) {
    return { permitido: false, restante: 0, resetarEm: atual.inicio + limite.janelaMs };
  }

  atual.contagem += 1;
  return { permitido: true, restante: limite.max - atual.contagem, resetarEm: atual.inicio + limite.janelaMs };
}

export function ipDaRequisicao(request: Request): string {
  const encaminhado = request.headers.get("x-forwarded-for");
  if (encaminhado) return encaminhado.split(",")[0]?.trim() || "local";
  return request.headers.get("x-real-ip") ?? "local";
}

/** Devolve uma Response 429 quando o limite estourou; null quando pode seguir. */
export function limitar(request: Request, escopo: string, limite: Limite): Response | null {
  const resultado = consumir(`${escopo}:${ipDaRequisicao(request)}`, limite);
  if (resultado.permitido) return null;

  const retry = Math.max(1, Math.ceil((resultado.resetarEm - Date.now()) / 1000));
  return Response.json(
    { erro: "Muitas requisições. Tente novamente em instantes." },
    { status: 429, headers: { ...semCache, "Retry-After": String(retry) } },
  );
}

export function _resetarLimites(): void {
  baldes.clear();
}
