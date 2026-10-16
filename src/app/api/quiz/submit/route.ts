import { chat } from "@/content/site";
import { lerJson, semCache } from "@/lib/http";
import { respostaDeErro, submitQuizSchema } from "@/lib/schemas";
import { getServices } from "@/lib/services";
import type { Nivel } from "@/lib/services";

const BAIRRO_PADRAO = "Minha vizinhança";

/**
 * POST { respostas[1..3], primeiroNome?, bairroId?, nivel? }
 *   -> { acertos, erradas[], resultados[], seloId?, selo? }
 * O selo só é emitido com as 3 perguntas certas.
 */
export async function POST(request: Request) {
  const corpo = await lerJson(request);
  if (!corpo.ok) return corpo.resposta;
  const entrada = submitQuizSchema.safeParse(corpo.dados);
  if (!entrada.success) return respostaDeErro(entrada.error);

  const { respostas, primeiroNome, bairroId, nivel } = entrada.data;
  const svc = getServices();
  const correcao = await svc.quiz.corrigir(respostas);
  const { completo, ...publico } = correcao;
  if (!completo) return Response.json(publico, { headers: semCache });

  // Com bairro conhecido, a faixa vem do servidor; sem ele (GPS fora da área), da resposta anterior.
  let bairro = BAIRRO_PADRAO;
  let faixa: Nivel = nivel ?? "baixo";
  if (bairroId) {
    try {
      const r = await svc.proximity.consultar({ bairroId });
      bairro = r.bairro?.nome ?? BAIRRO_PADRAO;
      faixa = r.nivel;
    } catch {
      // bairro desconhecido: mantém o padrão
    }
  }
  const selo = await svc.badge.emitir({ primeiroNome: primeiroNome ?? chat.nomePadrao, bairro, nivel: faixa });
  const { codigo, primeiroNome: nome, data } = selo;
  return Response.json({ ...publico, seloId: selo.id, selo: { codigo, primeiroNome: nome, bairro: selo.bairro, data } }, { headers: semCache });
}
