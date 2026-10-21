import type { Nivel } from "./services/types";

/**
 * Valores usados quando a pessoa não informa nome, bairro ou faixa.
 * Ficam num único lugar para o bot, a API do quiz e o selo não divergirem.
 */
export const SELO_PADRAO = {
  nome: "Vizinho",
  bairro: "Minha vizinhança",
  nivel: "baixo" as Nivel,
} as const;
