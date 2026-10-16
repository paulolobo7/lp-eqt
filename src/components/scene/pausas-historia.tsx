"use client";

import { useEffect, useRef } from "react";

/**
 * Liga o scroll snap das pausas da história (html.pausas-historia) só enquanto a faixa que vai
 * do topo até uma tela depois da história aparece. Nessa última tela, a .historia-livre deixa a
 * rolagem livre, então ligar ou desligar o snap ali não faz a página pular. A faixa é alta (e não
 * um marco de 1px) para que saltos de âncora, que pulam o marco sem cruzar a tela, também contem.
 * Ver .historia-pausa no globals.css.
 */
export function PausasHistoria() {
  const faixa = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const raiz = document.documentElement;
    const io = new IntersectionObserver(([en]) => raiz.classList.toggle("pausas-historia", en.isIntersecting));
    io.observe(faixa.current!);
    return () => {
      io.disconnect();
      raiz.classList.remove("pausas-historia");
    };
  }, []);
  return (
    <>
      <div aria-hidden="true" className="historia-livre" />
      <div ref={faixa} aria-hidden="true" className="historia-faixa" />
    </>
  );
}
