"use client";

import { useEffect, useRef } from "react";

/**
 * Marca no <html> onde a rolagem está em relação à história (data-historia):
 * - "visivel": a história (#topo) está na tela;
 * - "perto": ela saiu, mas a faixa que vai até uma tela depois dela ainda aparece;
 * - "longe": nenhuma das duas.
 * Com isso o globals.css liga o scroll snap das pausas só em "visivel"/"perto" (na última tela
 * da faixa, a .historia-livre deixa a rolagem livre, então ligar ou desligar o snap ali não faz a
 * página pular) e pausa as animações contínuas da cena fora de "visivel" (o flash dos cabos anima
 * stroke-dashoffset, que roda na thread principal mesmo fora da tela).
 * A faixa é alta (e não um marco de 1px) para que saltos de âncora, que pulariam o marco sem
 * cruzar a tela, também contem. Ver .historia-pausa no globals.css.
 */
export function PausasHistoria() {
  const faixa = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const raiz = document.documentElement;
    const historia = document.getElementById("topo");
    const naTela = new Map<Element, boolean>();
    const io = new IntersectionObserver((entradas) => {
      entradas.forEach((en) => naTela.set(en.target, en.isIntersecting));
      raiz.dataset.historia = historia && naTela.get(historia) ? "visivel" : naTela.get(faixa.current!) ? "perto" : "longe";
    });
    io.observe(faixa.current!);
    if (historia) io.observe(historia);
    return () => {
      io.disconnect();
      delete raiz.dataset.historia;
    };
  }, []);
  return (
    <>
      <div aria-hidden="true" className="historia-livre" />
      <div ref={faixa} aria-hidden="true" className="historia-faixa" />
    </>
  );
}
