import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { agrupar, limparBuffers } from "./buffer";

beforeEach(() => vi.useFakeTimers());
afterEach(() => {
  limparBuffers();
  vi.useRealTimers();
});

describe("buffer de mensagens picotadas", () => {
  it("agrupa mensagens rápidas e deixa a última como líder", async () => {
    const primeira = agrupar("sessao", "Oi", 6_500);
    const segunda = agrupar("sessao", "caiu um fio na rua", 6_500);

    await vi.advanceTimersByTimeAsync(6_500);

    await expect(primeira).resolves.toEqual({ lider: false, texto: "Oi\ncaiu um fio na rua" });
    await expect(segunda).resolves.toEqual({ lider: true, texto: "Oi\ncaiu um fio na rua" });
  });

  it("processa imediatamente quando o debounce é 0", async () => {
    await expect(agrupar("outra", "Oi", 0)).resolves.toEqual({ lider: true, texto: "Oi" });
  });

  it("não mistura conversas diferentes", async () => {
    const a = agrupar("a", "Oi", 100);
    const b = agrupar("b", "Tudo bem?", 100);
    await vi.advanceTimersByTimeAsync(100);
    await expect(a).resolves.toEqual({ lider: true, texto: "Oi" });
    await expect(b).resolves.toEqual({ lider: true, texto: "Tudo bem?" });
  });
});
