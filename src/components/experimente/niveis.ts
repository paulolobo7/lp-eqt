import type { Nivel } from "@/lib/services/types";
import type { NomeIcone } from "../icon";

/** Cor e ícone por faixa (nunca só a cor: sempre ícone + texto). */
export const VISUAL_NIVEL: Record<Nivel, { cor: string; icone: NomeIcone; fundo: string; tinta: string }> = {
  alto: { cor: "#FFB020", icone: "warn", fundo: "rgba(255,176,32,.1)", tinta: "rgba(255,176,32,.14)" },
  medio: { cor: "#B9A4FF", icone: "tower", fundo: "rgba(139,92,246,.14)", tinta: "rgba(139,92,246,.18)" },
  baixo: { cor: "#5AC8FA", icone: "shield", fundo: "rgba(90,200,250,.1)", tinta: "rgba(90,200,250,.14)" },
};
