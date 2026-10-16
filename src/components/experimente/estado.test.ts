import { describe, expect, it } from "vitest";
import { estadoInicial, reducer, type Estado } from "./estado";

const aplicar = (e: Estado, ...acoes: Parameters<typeof reducer>[1][]) => acoes.reduce(reducer, e);

describe("reducer do simulador", () => {
  it("começa com a conversa de boas-vindas, o pedido de localização e o passo 2 ativo", () => {
    const e = estadoInicial();
    expect(e.msgs.map((m) => m.k)).toEqual(["eu", "bot", "audio", "pedido-loc"]);
    expect(e.respostas.map((r) => r.acao.t)).toEqual(["pedir-loc", "escolher-bairro"]);
    expect(e.passo).toBe(2);
  });

  it("enfileira a fala do bot, mostra 'digitando' e esconde as respostas", () => {
    const e = aplicar(estadoInicial(), {
      t: "falar",
      itens: [{ k: "bot", texto: "a" }, { k: "bot", texto: "b" }],
      respostas: [{ rotulo: "ok", icone: "check", acao: { t: "comecar-quiz" } }],
    });
    expect(e.digitando).toBe(true);
    expect(e.fila).toHaveLength(2);
    expect(e.respostas).toEqual([]);
  });

  it("entrega uma mensagem por vez e só mostra as respostas no fim", () => {
    let e = aplicar(estadoInicial(), {
      t: "falar",
      itens: [{ k: "bot", texto: "a" }, { k: "bot", texto: "b" }],
      respostas: [{ rotulo: "ok", icone: "check", acao: { t: "comecar-quiz" } }],
    });
    const antes = e.msgs.length;
    e = reducer(e, { t: "entregar" });
    expect(e.msgs).toHaveLength(antes + 1);
    expect(e.digitando).toBe(true);
    expect(e.respostas).toEqual([]);
    e = reducer(e, { t: "entregar" });
    expect(e.digitando).toBe(false);
    expect(e.respostas.map((r) => r.rotulo)).toEqual(["ok"]);
  });

  it("dá ids únicos às mensagens", () => {
    const e = aplicar(estadoInicial(), { t: "usuario", texto: "x" }, { t: "falar", itens: [{ k: "bot", texto: "y" }] }, { t: "entregar" });
    const ids = e.msgs.map((m) => m.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("nunca volta o passo", () => {
    const e = aplicar(estadoInicial(), { t: "falar", itens: [], passo: 5 }, { t: "falar", itens: [], passo: 3 });
    expect(e.passo).toBe(5);
  });

  it("a mensagem do usuário limpa as respostas rápidas", () => {
    const e = reducer(estadoInicial(), { t: "usuario", texto: "Escolher meu bairro" });
    expect(e.respostas).toEqual([]);
    expect(e.msgs.at(-1)).toMatchObject({ k: "eu", texto: "Escolher meu bairro" });
  });

  it("marca a opção escolhida na pergunta", () => {
    let e = aplicar(estadoInicial(), {
      t: "falar",
      itens: [{ k: "quiz", indice: 0, pergunta: { id: "p", pergunta: "?", opcoes: [], audio: { src: "", duracao: "", transcricao: "" } } }],
    });
    e = reducer(e, { t: "entregar" });
    const id = e.msgs.at(-1)!.id;
    e = reducer(e, { t: "marcar-resposta", msgId: id, opcaoId: "b", correta: false });
    expect(e.msgs.at(-1)).toMatchObject({ respondida: "b", correta: false });
  });

  it("guarda cada acerto uma vez só", () => {
    const r = { perguntaId: "p1", opcaoId: "a" };
    const e = aplicar(estadoInicial(), { t: "acerto", resposta: r }, { t: "acerto", resposta: r });
    expect(e.certas).toEqual([r]);
  });

  it("abre e fecha a folha de localização", () => {
    const e = reducer(estadoInicial(), { t: "folha", aberta: true });
    expect(e.folha).toBe(true);
    expect(reducer(e, { t: "folha", aberta: false }).folha).toBe(false);
  });

  it("reinicia tudo", () => {
    const e = aplicar(estadoInicial(), { t: "usuario", texto: "x" }, { t: "acerto", resposta: { perguntaId: "p", opcaoId: "a" } }, { t: "reiniciar" });
    expect(e.certas).toEqual([]);
    expect(e.msgs).toHaveLength(4);
  });
});
