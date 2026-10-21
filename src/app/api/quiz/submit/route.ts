import { lerJson, semCache } from "@/lib/http";
import { SELO_PADRAO } from "@/lib/constants";
import { respostaDeErro, submitQuizSchema } from "@/lib/schemas";
import { getServices } from "@/lib/services";
import type { Nivel } from "@/lib/services";

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

  try {
    const svc = getServices();
    const correcao = await svc.quiz.corrigir(respostas);
    const { completo, ...publico } = correcao;
    if (!completo) return Response.json(publico, { headers: semCache });

    // Com bairro conhecido, a faixa vem do servidor; sem ele, da resposta anterior.
    let bairro: string = SELO_PADRAO.bairro;
    let faixa: Nivel = nivel ?? SELO_PADRAO.nivel;
    if (bairroId) {
      try {
        const r = await svc.proximity.consultar({ bairroId });
        bairro = r.bairro?.nome ?? SELO_PADRAO.bairro;
        faixa = r.nivel;
      } catch {
        // bairro desconhecido: mantém o padrão
      }
    }
    const selo = await svc.badge.emitir({ primeiroNome: primeiroNome ?? SELO_PADRAO.nome, bairro, nivel: faixa });
    const { codigo, primeiroNome: nome, data } = selo;
    return Response.json(
      { ...publico, seloId: selo.id, selo: { codigo, primeiroNome: nome, bairro: selo.bairro, data } },
      { headers: semCache },
    );
  } catch {
    return Response.json({ erro: "Não foi possível corrigir o quiz agora." }, { status: 503, headers: semCache });
  }
}

