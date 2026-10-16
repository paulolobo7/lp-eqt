import type { ConsultaProximidade, CorrecaoQuiz, Nivel, PerguntaPublica, Resposta, ResultadoProximidade } from "./services/types";

/** Chamadas do navegador às rotas. Os componentes nunca falam com serviços diretamente. */

async function post<T>(url: string, corpo: unknown): Promise<T> {
  const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(corpo) });
  if (!res.ok) throw new Error(`Falha em ${url}: ${res.status}`);
  return res.json() as Promise<T>;
}

export const api = {
  proximidade: (c: ConsultaProximidade) => post<ResultadoProximidade>("/api/proximity", c),
  perguntas: async () => {
    const res = await fetch("/api/quiz");
    if (!res.ok) throw new Error("Falha em /api/quiz");
    return ((await res.json()) as { perguntas: PerguntaPublica[] }).perguntas;
  },
  corrigir: (corpo: { respostas: Resposta[]; primeiroNome?: string; bairroId?: string; nivel?: Nivel }) =>
    post<
      Omit<CorrecaoQuiz, "completo"> & {
        seloId?: string;
        selo?: { codigo: string; primeiroNome: string; bairro: string; data: string };
      }
    >("/api/quiz/submit", corpo),
};

/** Coordenadas arredondadas (~100 m) antes de sair do aparelho. */
export const arredondar = (n: number) => Math.round(n * 1000) / 1000;
