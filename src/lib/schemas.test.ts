import { describe, expect, it } from "vitest";
import { consultaProximidadeSchema, emitirSeloSchema, submitQuizSchema, mensagensDeErro } from "./schemas";

describe("consultaProximidadeSchema", () => {
  it("aceita coordenadas válidas", () => {
    expect(consultaProximidadeSchema.safeParse({ lat: -2.53, lng: -44.3 }).success).toBe(true);
  });

  it("aceita bairroId", () => {
    expect(consultaProximidadeSchema.safeParse({ bairroId: "vila-esperanca" }).success).toBe(true);
  });

  it("recusa latitude fora da faixa com mensagem em pt-BR", () => {
    const r = consultaProximidadeSchema.safeParse({ lat: 120, lng: 0 });
    expect(r.success).toBe(false);
    expect(mensagensDeErro(r.error!)).toContain("A latitude deve estar entre -90 e 90.");
  });

  it("recusa corpo vazio", () => {
    const r = consultaProximidadeSchema.safeParse({});
    expect(r.success).toBe(false);
    expect(mensagensDeErro(r.error!).join(" ")).toMatch(/Envie a localização \(lat e lng\) ou o bairro/);
  });

  it("recusa bairroId com caracteres estranhos", () => {
    expect(consultaProximidadeSchema.safeParse({ bairroId: "<script>" }).success).toBe(false);
  });
});

describe("submitQuizSchema", () => {
  it("aceita de 1 a 3 respostas", () => {
    expect(submitQuizSchema.safeParse({ respostas: [{ perguntaId: "cabo-caido", opcaoId: "b" }] }).success).toBe(true);
  });

  it("recusa lista vazia", () => {
    const r = submitQuizSchema.safeParse({ respostas: [] });
    expect(r.success).toBe(false);
    expect(mensagensDeErro(r.error!)).toContain("Envie pelo menos uma resposta.");
  });

  it("recusa mais de 3 respostas", () => {
    const um = { perguntaId: "x", opcaoId: "a" };
    expect(submitQuizSchema.safeParse({ respostas: [um, um, um, um] }).success).toBe(false);
  });

  it("aceita primeiro nome e bairro opcionais", () => {
    const r = submitQuizSchema.safeParse({
      respostas: [{ perguntaId: "cabo-caido", opcaoId: "b" }],
      primeiroNome: "Ana",
      bairroId: "vila-esperanca",
      nivel: "alto",
    });
    expect(r.success).toBe(true);
  });
});

describe("emitirSeloSchema", () => {
  it("recusa nível desconhecido", () => {
    const r = emitirSeloSchema.safeParse({ primeiroNome: "Ana", bairro: "Vila", nivel: "altíssimo" });
    expect(r.success).toBe(false);
  });
});
