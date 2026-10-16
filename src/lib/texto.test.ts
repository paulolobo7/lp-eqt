import { describe, expect, it } from "vitest";
import { dataBR, primeiroNome } from "./texto";

describe("primeiroNome", () => {
  it("fica só com a primeira palavra", () => {
    expect(primeiroNome("Ana Maria da Silva")).toBe("Ana");
  });

  it("ajusta maiúsculas e minúsculas", () => {
    expect(primeiroNome("  jOÃO ")).toBe("João");
  });

  it("remove números, emojis e símbolos", () => {
    expect(primeiroNome("Zé123!")).toBe("Zé");
    expect(primeiroNome("Lúcia🎉")).toBe("Lúcia");
  });

  it("mantém hífen e apóstrofo internos", () => {
    expect(primeiroNome("ana-clara")).toBe("Ana-clara");
    expect(primeiroNome("D'ávila")).toBe("D'ávila");
  });

  it("limita a 20 letras", () => {
    expect(primeiroNome("a".repeat(40))).toHaveLength(20);
  });

  it("devolve vazio quando não sobra nada", () => {
    expect(primeiroNome("123 !!!")).toBe("");
  });
});

describe("dataBR", () => {
  it("formata AAAA-MM-DD como DD/MM/AAAA", () => {
    expect(dataBR("2026-10-15")).toBe("15/10/2026");
  });
});
