"use client";

import { useEffect, useId, useRef, useState } from "react";
import { audio as textos } from "@/content/site";
import { Icon } from "./icon";

const BARRAS = [10, 18, 26, 14, 22, 30, 18, 12, 24, 28, 16, 10, 20, 26, 30, 22, 14, 18, 26, 12, 20, 16, 10, 14];
const VELOCIDADES = [1, 1.5, 2];
const EVENTO = "vat-audio-tocou";

/** Controla um <audio>: um toca por vez; devolve estado e ações. */
function useAudio(src: string) {
  const ref = useRef<HTMLAudioElement | null>(null);
  const id = useId();
  const [tocando, setTocando] = useState(false);
  const [progresso, setProgresso] = useState(0);
  const [vel, setVel] = useState(1);

  useEffect(() => {
    const parar = (e: Event) => {
      if ((e as CustomEvent<string>).detail !== id) ref.current?.pause();
    };
    window.addEventListener(EVENTO, parar);
    return () => window.removeEventListener(EVENTO, parar);
  }, [id]);

  const alternar = () => {
    const a = ref.current;
    if (!a) return;
    if (a.paused) {
      window.dispatchEvent(new CustomEvent(EVENTO, { detail: id }));
      a.playbackRate = vel;
      void a.play().catch(() => setTocando(false));
    } else a.pause();
  };
  const trocarVelocidade = () => {
    const prox = VELOCIDADES[(VELOCIDADES.indexOf(vel) + 1) % VELOCIDADES.length];
    setVel(prox);
    if (ref.current) ref.current.playbackRate = prox;
  };
  const el = (
    <audio
      ref={ref}
      src={src}
      preload="none"
      onPlay={() => setTocando(true)}
      onPause={() => setTocando(false)}
      onEnded={() => {
        setTocando(false);
        setProgresso(0);
      }}
      onTimeUpdate={(e) => {
        const a = e.currentTarget;
        if (a.duration) setProgresso(a.currentTime / a.duration);
      }}
    />
  );
  return { el, tocando, progresso, vel, alternar, trocarVelocidade };
}

/** Mensagem de áudio do chat: play, forma de onda, velocidade e transcrição visível. */
export function MensagemAudio({ titulo, src, duracao, transcricao }: { titulo: string; src: string; duracao: string; transcricao: string }) {
  const a = useAudio(src);
  const ativas = Math.round(a.progresso * BARRAS.length);
  return (
    <div className="bolha-bot flex w-[88%] flex-col gap-2 px-3 py-2.5">
      {a.el}
      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={a.alternar}
          aria-label={a.tocando ? textos.pausar : textos.ouvirAudio(titulo)}
          className="grid h-12 w-12 flex-none cursor-pointer place-items-center rounded-full border-[1.5px] border-ciano text-texto transition-transform duration-150 ease-[var(--ease-out)] active:scale-[.94]"
          style={{ background: a.tocando ? "rgba(90,200,250,.25)" : "rgba(90,200,250,.08)" }}
        >
          <Icon nome={a.tocando ? "pause" : "play"} />
        </button>
        <div aria-hidden="true" className="flex h-8 flex-1 items-center justify-between gap-0.5">
          {BARRAS.map((h, k) => (
            <span key={k} className="max-w-1 flex-1 rounded-sm" style={{ height: h, background: k < ativas ? "#5AC8FA" : "#5E66C4" }} />
          ))}
        </div>
        <button
          type="button"
          onClick={a.trocarVelocidade}
          aria-label={`${textos.velocidade}: ${a.vel}×`}
          className="h-9 min-w-12 flex-none cursor-pointer rounded-full border border-[rgba(185,191,234,.35)] bg-transparent text-[13px] font-semibold text-texto-2"
        >
          {a.vel}×
        </button>
      </div>
      <div className="flex justify-between text-[12.5px] text-texto-5">
        <span>{titulo}</span>
        <span>{a.tocando ? textos.tocando : duracao}</span>
      </div>
      <p className="m-0 border-t border-[rgba(154,163,240,.16)] pt-2 text-sm leading-[1.45] text-texto-3">
        <strong className="font-semibold text-ciano-gelo">{textos.transcricao} </strong>
        {transcricao}
      </p>
    </div>
  );
}

/** Botão compacto "Ouvir · 0:12" (cartões de risco e perguntas do quiz). */
export function BotaoOuvir({
  src,
  rotulo,
  ariaTitulo,
  compacto,
}: {
  src: string;
  rotulo: string;
  ariaTitulo: string;
  compacto?: boolean;
}) {
  const a = useAudio(src);
  return (
    <>
      {a.el}
      <button
        type="button"
        onClick={a.alternar}
        className={
          compacto
            ? "flex min-h-11 cursor-pointer items-center gap-1.5 rounded-full border border-[rgba(90,200,250,.45)] bg-transparent px-3 text-[13px] font-medium text-ciano-claro"
            : "btn !min-h-12 self-start !gap-2.5 !border-[rgba(90,200,250,.45)] !pr-4 !pl-1.5 !text-[15px] !text-ciano-gelo"
        }
        style={!compacto && a.tocando ? { background: "rgba(90,200,250,.16)" } : undefined}
      >
        {compacto ? (
          <Icon nome={a.tocando ? "pause" : "speaker"} tamanho={16} />
        ) : (
          <span className="grid h-9 w-9 place-items-center rounded-full bg-[rgba(90,200,250,.16)]">
            <Icon nome={a.tocando ? "pause" : "play"} tamanho={16} />
          </span>
        )}
        {a.tocando ? textos.tocando : rotulo}
        {/* Nome acessível começa pelo texto visível (WCAG 2.5.3). */}
        <span className="sr-only">{a.tocando ? `, ${textos.pausar}` : `, ${textos.ouvirAudio(ariaTitulo)}`}</span>
      </button>
    </>
  );
}
