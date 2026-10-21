import { chat } from "@/content/site";
import type { Nivel, PerguntaPublica, Resposta, ResultadoProximidade } from "@/lib/services/types";
import type { SeloObtido } from "../app-provider";
import type { NomeIcone } from "../icon";

export type Acao =
  | { t: "pedir-loc" }
  | { t: "escolher-bairro" }
  | { t: "bairro"; id: string; nome: string }
  | { t: "comecar-quiz" }
  | { t: "refazer"; indice: number }
  | { t: "compartilhar" }
  | { t: "ver-selo" };

export type RespostaRapida = { rotulo: string; icone: NomeIcone; acao: Acao };

type Audio = { titulo: string; src: string; duracao: string; transcricao: string };

export type MsgSemId =
  | { k: "eu"; texto: string }
  | { k: "eu-loc"; texto: string }
  | { k: "bot"; texto: string }
  | { k: "imagem"; icone: NomeIcone; legenda: string }
  | ({ k: "audio" } & Audio)
  | { k: "pedido-loc" }
  | { k: "resultado"; resultado: ResultadoProximidade; rotulo: string }
  | { k: "quiz"; indice: number; pergunta: PerguntaPublica; total?: number; respondida?: string; correta?: boolean }
  | { k: "feedback"; ok: boolean; texto: string }
  | { k: "selo"; selo: SeloObtido };

export type Msg = MsgSemId & { id: number };

export type Estado = {
  msgs: Msg[];
  fila: Msg[];
  respostas: RespostaRapida[];
  respostasApos: RespostaRapida[];
  digitando: boolean;
  passo: number;
  folha: boolean;
  entradaNome: boolean;
  bairro: { id: string; nome: string } | null;
  nivel: Nivel | null;
  perguntas: PerguntaPublica[] | null;
  certas: Resposta[];
  seq: number;
};

export type Evento =
  | { t: "falar"; itens: MsgSemId[]; respostas?: RespostaRapida[]; passo?: number }
  | { t: "entregar" }
  | { t: "usuario"; texto: string; loc?: boolean }
  | { t: "folha"; aberta: boolean }
  | { t: "resultado"; bairro: { id: string; nome: string } | null; nivel: Nivel }
  | { t: "perguntas"; perguntas: PerguntaPublica[] }
  | { t: "marcar-resposta"; msgId: number; opcaoId: string; correta: boolean }
  | { t: "acerto"; resposta: Resposta }
  | { t: "entrada-nome"; aberta: boolean }
  | { t: "respostas"; respostas: RespostaRapida[] }
  | { t: "reiniciar" };

export const respostasIniciais: RespostaRapida[] = [
  { rotulo: chat.respostas.compartilhar, icone: "pin", acao: { t: "pedir-loc" } },
  { rotulo: chat.respostas.escolherBairro, icone: "house", acao: { t: "escolher-bairro" } },
];

export function estadoInicial(): Estado {
  const iniciais: MsgSemId[] = [
    { k: "eu", texto: chat.boasVindasUsuario },
    { k: "bot", texto: chat.boasVindasBot },
    { k: "audio", ...chat.audioBoasVindas },
    { k: "pedido-loc" },
  ];
  return {
    msgs: iniciais.map((m, i) => ({ ...m, id: i + 1 })),
    fila: [],
    respostas: respostasIniciais,
    respostasApos: [],
    digitando: false,
    passo: 2,
    folha: false,
    entradaNome: false,
    bairro: null,
    nivel: null,
    perguntas: null,
    certas: [],
    seq: iniciais.length,
  };
}

export function reducer(e: Estado, ev: Evento): Estado {
  switch (ev.t) {
    case "falar": {
      const fila = ev.itens.map((m, i) => ({ ...m, id: e.seq + i + 1 }) as Msg);
      return {
        ...e,
        fila: [...e.fila, ...fila],
        seq: e.seq + fila.length,
        digitando: e.fila.length + fila.length > 0,
        respostas: e.fila.length + fila.length > 0 ? [] : (ev.respostas ?? []),
        respostasApos: ev.respostas ?? [],
        passo: Math.max(e.passo, ev.passo ?? 0),
      };
    }
    case "entregar": {
      if (e.fila.length === 0) return e;
      const [prox, ...resto] = e.fila;
      const fim = resto.length === 0;
      return {
        ...e,
        msgs: [...e.msgs, prox],
        fila: resto,
        digitando: !fim,
        respostas: fim ? e.respostasApos : [],
      };
    }
    case "usuario": {
      const msg: Msg = { k: ev.loc ? "eu-loc" : "eu", texto: ev.texto, id: e.seq + 1 };
      return { ...e, msgs: [...e.msgs, msg], seq: e.seq + 1, respostas: [] };
    }
    case "folha":
      return { ...e, folha: ev.aberta };
    case "resultado":
      return { ...e, bairro: ev.bairro, nivel: ev.nivel };
    case "perguntas":
      return { ...e, perguntas: ev.perguntas };
    case "marcar-resposta":
      return {
        ...e,
        msgs: e.msgs.map((m) => (m.id === ev.msgId && m.k === "quiz" ? { ...m, respondida: ev.opcaoId, correta: ev.correta } : m)),
      };
    case "acerto":
      return e.certas.some((c) => c.perguntaId === ev.resposta.perguntaId) ? e : { ...e, certas: [...e.certas, ev.resposta] };
    case "entrada-nome":
      return { ...e, entradaNome: ev.aberta };
    case "respostas":
      return { ...e, respostas: ev.respostas };
    case "reiniciar":
      return estadoInicial();
  }
}
