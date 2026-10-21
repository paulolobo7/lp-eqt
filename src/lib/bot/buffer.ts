type Espera = { resolve: (resultado: BufferResultado) => void };

type Entrada = {
  textos: string[];
  esperas: Espera[];
  timer: ReturnType<typeof setTimeout>;
};

export type BufferResultado = { lider: boolean; texto: string };

const MAX_MENSAGENS = 10;
const pendentes = new Map<string, Entrada>();

/** Duração do debounce de mensagens picotadas. 0 desliga. */
export function bufferMs(): number {
  const valor = Number(process.env.WAHA_BUFFER_MS ?? "6500");
  return Number.isFinite(valor) && valor >= 0 ? valor : 6500;
}

/**
 * Agrupa mensagens rápidas da mesma conversa. A última requisição vira a
 * "líder" e é quem processa/responde; as anteriores devolvem `lider: false`
 * para não enviarem a mesma resposta várias vezes.
 */
export function agrupar(chave: string, texto: string, ms = bufferMs()): Promise<BufferResultado> {
  if (ms <= 0) return Promise.resolve({ lider: true, texto });

  const atual = pendentes.get(chave);
  if (atual) {
    if (atual.textos.length < MAX_MENSAGENS) atual.textos.push(texto);
    clearTimeout(atual.timer);
    atual.timer = setTimeout(() => liberar(chave), ms);
    return new Promise((resolve) => atual.esperas.push({ resolve }));
  }

  const entrada: Entrada = {
    textos: [texto],
    esperas: [],
    timer: setTimeout(() => liberar(chave), ms),
  };
  const promessa = new Promise<BufferResultado>((resolve) => entrada.esperas.push({ resolve }));
  pendentes.set(chave, entrada);
  return promessa;
}

function liberar(chave: string): void {
  const entrada = pendentes.get(chave);
  if (!entrada) return;
  pendentes.delete(chave);
  clearTimeout(entrada.timer);

  const texto = entrada.textos.join("\n");
  const ultima = entrada.esperas.length - 1;
  entrada.esperas.forEach((espera, indice) => espera.resolve({ lider: indice === ultima, texto }));
}

/** Usado nos testes e em desligamentos. */
export function limparBuffers(): void {
  for (const entrada of pendentes.values()) clearTimeout(entrada.timer);
  pendentes.clear();
}
