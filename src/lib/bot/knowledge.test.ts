import { describe, expect, it } from "vitest";
import { QUIZ } from "@/content/quiz";
import { PERGUNTAS_QUIZ } from "./knowledge";

describe("quiz do bot", () => {
  it("é derivado da mesma fonte do site, sem divergência de gabarito", () => {
    expect(PERGUNTAS_QUIZ).toHaveLength(QUIZ.length);
    QUIZ.forEach((pergunta, indice) => {
      const doBot = PERGUNTAS_QUIZ[indice];
      expect(doBot.id).toBe(pergunta.id);
      expect(doBot.numero).toBe(indice + 1);
      expect(doBot.opcoes.map((o) => o.id)).toEqual(pergunta.opcoes.map((o) => o.id));
      expect(doBot.opcoes.filter((o) => o.correta).map((o) => o.id)).toEqual([pergunta.correta]);
    });
  });
});
