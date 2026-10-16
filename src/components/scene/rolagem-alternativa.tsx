"use client";

import { scroll } from "motion";
import { useEffect } from "react";

const cl = (x: number) => Math.min(1, Math.max(0, x));
// Pleno até 7% do centro e some em 5%: o mesmo ritmo dos @keyframes h-s* do globals.css.
const estado = (p: number, c: number) => cl(1 - (Math.abs(p - c) - 0.07) / 0.05);

/**
 * Alternativa às CSS scroll-driven animations (Firefox, Safari < 26): usa o
 * scroll() do motion para escrever as mesmas variáveis. Não roda onde o CSS já faz.
 */
export function RolagemAlternativa({ alvo, rede }: { alvo: string; rede: string }) {
  useEffect(() => {
    if (CSS.supports("animation-timeline: view()")) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = document.getElementById(alvo);
    const elRede = document.getElementById(rede);
    const limpar: (() => void)[] = [];
    if (el) {
      const c0 = el.querySelector<HTMLElement>(".camada-0");
      const c4 = el.querySelector<HTMLElement>(".camada-4");
      limpar.push(
        scroll(
          (p: number) => {
            const s = [0, 0.25, 0.5, 0.75, 1].map((c) => estado(p, c));
            el.style.setProperty("--p", p.toFixed(4));
            s.forEach((v, i) => el.style.setProperty(`--s${i}`, v.toFixed(3)));
            el.style.setProperty("--dawn", cl((p - 0.74) / 0.2).toFixed(3));
            if (c0) c0.style.visibility = s[0] < 0.04 ? "hidden" : "visible";
            if (c4) c4.style.visibility = s[4] < 0.04 ? "hidden" : "visible";
          },
          { target: el, offset: ["start start", "end end"] },
        ),
      );
    }
    if (elRede) {
      limpar.push(
        scroll((q: number) => elRede.style.setProperty("--q", q.toFixed(3)), {
          target: elRede,
          offset: ["start 0.95", "center 0.6"],
        }),
      );
    }
    return () => limpar.forEach((f) => f());
  }, [alvo, rede]);
  return null;
}
