import { beforeEach, describe, expect, it } from "vitest";
import { _resetarLimites, consumir } from "./rate-limit";

beforeEach(() => _resetarLimites());

describe("rate limit em memória", () => {
  it("permite até o máximo e bloqueia depois", () => {
    const limite = { max: 2, janelaMs: 1_000 };
    expect(consumir("chave", limite, 0).permitido).toBe(true);
    expect(consumir("chave", limite, 0).permitido).toBe(true);
    const bloqueado = consumir("chave", limite, 0);
    expect(bloqueado.permitido).toBe(false);
    expect(bloqueado.restante).toBe(0);
    expect(bloqueado.resetarEm).toBe(1_000);
  });

  it("libera depois da janela", () => {
    const limite = { max: 1, janelaMs: 1_000 };
    expect(consumir("chave", limite, 0).permitido).toBe(true);
    expect(consumir("chave", limite, 500).permitido).toBe(false);
    expect(consumir("chave", limite, 1_000).permitido).toBe(true);
  });

  it("isola chaves diferentes", () => {
    const limite = { max: 1, janelaMs: 1_000 };
    expect(consumir("a", limite, 0).permitido).toBe(true);
    expect(consumir("b", limite, 0).permitido).toBe(true);
  });
});
