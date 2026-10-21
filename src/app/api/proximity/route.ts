import { lerJson, semCache } from "@/lib/http";
import { limitar } from "@/lib/rate-limit";
import { consultaProximidadeSchema, respostaDeErro } from "@/lib/schemas";
import { getServices } from "@/lib/services";

/**
 * POST { lat, lng } | { bairroId } -> { nivel, ativoMaisProximo, cuidados, bairro?, simulacao }
 * As coordenadas são usadas só no cálculo e nunca são registradas nem devolvidas.
 */
export async function POST(request: Request) {
  const bloqueio = limitar(request, "proximity", { max: 60, janelaMs: 60_000 });
  if (bloqueio) return bloqueio;

  const corpo = await lerJson(request);
  if (!corpo.ok) return corpo.resposta;
  const consulta = consultaProximidadeSchema.safeParse(corpo.dados);
  if (!consulta.success) return respostaDeErro(consulta.error);
  try {
    const resultado = await getServices().proximity.consultar(consulta.data);
    return Response.json(resultado, { headers: semCache });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    if (msg === "Bairro não encontrado.") return Response.json({ erro: msg }, { status: 404 });
    return Response.json({ erro: "Não foi possível calcular agora." }, { status: 503 });
  }
}
