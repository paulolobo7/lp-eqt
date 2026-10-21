import { describe, expect, it, vi } from "vitest";
import { transcreverAudio } from "./transcricao";

describe("transcreverAudio", () => {
  it("baixa o áudio e devolve o texto da OpenAI", async () => {
    const chamadas: string[] = [];
    const fetchMock = vi.fn(async (url: string | URL | Request) => {
      chamadas.push(String(url));
      if (String(url).includes("audio.ogg")) {
        return new Response(new Uint8Array([1, 2, 3]), { status: 200, headers: { "content-type": "audio/ogg" } });
      }
      return Response.json({ text: "  caiu um cabo na rua  " });
    });

    const texto = await transcreverAudio("https://waha.local/audio.ogg", {
      apiKey: "chave",
      fetchImpl: fetchMock as unknown as typeof fetch,
    });

    expect(texto).toBe("caiu um cabo na rua");
    expect(chamadas).toHaveLength(2);
    expect(chamadas[1]).toContain("/v1/audio/transcriptions");
  });

  it("devolve null sem chave", async () => {
    const fetchMock = vi.fn();
    const texto = await transcreverAudio("https://waha.local/audio.ogg", {
      apiKey: "",
      fetchImpl: fetchMock as unknown as typeof fetch,
    });
    expect(texto).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("devolve null quando o download falha", async () => {
    const fetchMock = vi.fn(async () => new Response("erro", { status: 404 }));
    const texto = await transcreverAudio("https://waha.local/audio.ogg", {
      apiKey: "chave",
      fetchImpl: fetchMock as unknown as typeof fetch,
    });
    expect(texto).toBeNull();
  });
});
