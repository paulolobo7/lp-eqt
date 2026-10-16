import { PH } from "./placeholders";

/** Cuidados por faixa de risco. Conteúdo de exemplo: {{A_VALIDAR}}. */
export const CUIDADOS = {
  alto: [
    "Pipa só longe da rede. Se prender, deixe lá e avise a Equatorial.",
    "Cabo no chão pode estar energizado: não encoste e afaste todo mundo.",
    `Não entre em área cercada de linha ou subestação. Em caso de risco, use o canal oficial ${PH.canal}.`,
  ],
  medio: [
    "Não entre em área cercada de subestação, nem para buscar bola ou pipa.",
    "Cabo no chão pode estar energizado: não encoste e afaste todo mundo.",
    `Viu furto ou invasão? Não intervenha e avise pelo canal oficial ${PH.canal}.`,
  ],
  baixo: [
    "Pipa só longe da rede. Se prender, deixe lá e avise a Equatorial.",
    "Cabo no chão pode estar energizado: não encoste e afaste todo mundo.",
    `Em caso de risco, use o canal oficial ${PH.canal}.`,
  ],
} as const;
