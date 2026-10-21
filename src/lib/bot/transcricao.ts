type OpcoesTranscricao = {
  apiKey?: string;
  nomeArquivo?: string;
  timeoutMs?: number;
  fetchImpl?: typeof fetch;
};

/**
 * Transcreve uma nota de voz via Whisper da OpenAI. É best-effort: sem chave,
 * URL ou rede, devolve null e o chamador usa o fallback educativo.
 */
export async function transcreverAudio(url: string, opcoes: OpcoesTranscricao = {}): Promise<string | null> {
  const apiKey = opcoes.apiKey ?? process.env.OPENAI_API_KEY;
  if (!apiKey || !url) return null;

  const executar = opcoes.fetchImpl ?? fetch;
  const sinal = AbortSignal.timeout(opcoes.timeoutMs ?? 15_000);

  try {
    const audio = await executar(url, { signal: sinal });
    if (!audio.ok) return null;

    const blob = await audio.blob();
    const form = new FormData();
    form.append("file", blob, opcoes.nomeArquivo || "audio.ogg");
    form.append("model", process.env.OPENAI_TRANSCRIBE_MODEL || "whisper-1");
    form.append("language", "pt");

    const resposta = await executar("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}` },
      body: form,
      signal: sinal,
    });
    if (!resposta.ok) return null;

    const dados = (await resposta.json()) as { text?: unknown };
    if (typeof dados.text !== "string") return null;
    return dados.text.trim().slice(0, 4000) || null;
  } catch {
    return null;
  }
}
