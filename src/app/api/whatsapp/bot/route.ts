import { z } from "zod";
import { lerJson } from "@/lib/http";
import { limitar } from "@/lib/rate-limit";
import { respostaDeErro } from "@/lib/schemas";
import { processarMensagemBot } from "@/lib/bot/engine";

const botRequestSchema = z.object({
  mensagem: z.string().min(1, "A mensagem não pode ser vazia.").max(2000),
  telefone: z.string().max(60).optional(),
  sessao: z.string().max(60).optional(),
  nome: z.string().max(40).optional(),
  eAudio: z.boolean().optional(),
  audioUrl: z.string().url().optional(),
});

export async function POST(request: Request) {
  const bloqueio = limitar(request, "bot", { max: 30, janelaMs: 60_000 });
  if (bloqueio) return bloqueio;

  const corpo = await lerJson(request);
  if (!corpo.ok) return corpo.resposta;

  const validado = botRequestSchema.safeParse(corpo.dados);
  if (!validado.success) return respostaDeErro(validado.error);

  const dados = validado.data;
  const resposta = await processarMensagemBot({
    mensagem: dados.mensagem,
    telefone: dados.telefone,
    sessao: dados.sessao,
    nome: dados.nome,
    eAudio: dados.eAudio,
    audioUrl: dados.audioUrl,
  });

  return Response.json({
    sucesso: true,
    mensagens: resposta.mensagens,
    seloId: resposta.seloId,
    bloqueadoParaHumano: resposta.bloqueadoParaHumano,
    bairroReconhecido: resposta.bairroReconhecido,
    nivelRisco: resposta.nivelRisco,
  });
}
