import { QUIZ } from "@/content/quiz";
import type { CorrecaoQuiz, PerguntaPublica, QuizService, Resposta } from "../types";

export class MockQuizService implements QuizService {
  async perguntas(): Promise<PerguntaPublica[]> {
    return QUIZ.map(({ id, pergunta, opcoes, audio }) => ({ id, pergunta, opcoes, audio }));
  }

  async corrigir(respostas: Resposta[]): Promise<CorrecaoQuiz> {
    const vistas = new Set<string>();
    const resultados: CorrecaoQuiz["resultados"] = [];
    for (const r of respostas) {
      if (vistas.has(r.perguntaId)) continue;
      vistas.add(r.perguntaId);
      const p = QUIZ.find((q) => q.id === r.perguntaId);
      resultados.push({
        perguntaId: r.perguntaId,
        correta: !!p && p.correta === r.opcaoId,
        explicacao: p?.explicacao ?? "Pergunta não encontrada.",
      });
    }
    const acertos = resultados.filter((r) => r.correta).length;
    return {
      acertos,
      erradas: resultados.filter((r) => !r.correta).map((r) => r.perguntaId),
      resultados,
      completo: acertos === QUIZ.length,
    };
  }
}
