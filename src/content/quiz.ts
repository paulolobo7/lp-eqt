import { PH } from "./placeholders";

/** Conteúdo de exemplo. {{A_VALIDAR}} até a revisão técnica da Equatorial. */
export type PerguntaQuiz = {
  id: string;
  pergunta: string;
  opcoes: { id: string; texto: string }[];
  correta: string;
  explicacao: string;
  audio: { src: string; duracao: string; transcricao: string };
};

export const QUIZ: PerguntaQuiz[] = [
  {
    id: "cabo-caido",
    pergunta: "Vi um cabo caído no chão. O que faço?",
    opcoes: [
      { id: "a", texto: "Afasto o cabo com um pedaço de madeira seca" },
      { id: "b", texto: "Não encosto, afasto as pessoas e aviso a Equatorial" },
      { id: "c", texto: "Espero um pouco para ver se ainda tem energia" },
    ],
    correta: "b",
    explicacao: `Um cabo no chão pode estar energizado, mesmo parado. Fique longe, afaste todos e avise pelo canal oficial ${PH.canal}.`,
    audio: {
      src: "/audio/quiz-1.wav",
      duracao: "0:08",
      transcricao: "Vi um cabo caído no chão. O que faço? A: afasto o cabo com um pedaço de madeira seca. B: não encosto, afasto as pessoas e aviso a Equatorial. C: espero um pouco para ver se ainda tem energia.",
    },
  },
  {
    id: "pipa-na-rede",
    pergunta: "A pipa prendeu na rede elétrica. Posso puxar a linha ou usar uma vara?",
    opcoes: [
      { id: "a", texto: "Posso, se a vara for de madeira" },
      { id: "b", texto: "Posso, se a linha não tiver cerol" },
      { id: "c", texto: "Não. Deixo a pipa lá e aviso a Equatorial" },
    ],
    correta: "c",
    explicacao: "Nunca tente soltar. Linha com cerol ou metal conduz energia até a sua mão. Deixe a pipa lá e avise a Equatorial.",
    audio: {
      src: "/audio/quiz-2.wav",
      duracao: "0:08",
      transcricao: "A pipa prendeu na rede elétrica. Posso puxar a linha ou usar uma vara? A: posso, se a vara for de madeira. B: posso, se a linha não tiver cerol. C: não, deixo a pipa lá e aviso a Equatorial.",
    },
  },
  {
    id: "furto-ou-invasao",
    pergunta: "Vi pessoas tentando furtar cabos ou entrar numa subestação. O que faço?",
    opcoes: [
      { id: "a", texto: "Não intervenho, mantenho distância e aviso os canais oficiais" },
      { id: "b", texto: "Tento impedir a pessoa" },
      { id: "c", texto: "Chego perto para filmar" },
    ],
    correta: "a",
    explicacao: "Chegar perto expõe você a choque e a violência. Distância e aviso pelos canais oficiais protegem todos.",
    audio: {
      src: "/audio/quiz-3.wav",
      duracao: "0:08",
      transcricao: "Vi pessoas tentando furtar cabos ou entrar numa subestação. O que faço? A: não intervenho, mantenho distância e aviso os canais oficiais. B: tento impedir a pessoa. C: chego perto para filmar.",
    },
  },
];
