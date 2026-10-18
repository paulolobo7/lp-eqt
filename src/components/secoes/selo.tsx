"use client";

import { useRef, useState, type PointerEvent } from "react";
import { toast } from "sonner";
import { selo as textos } from "@/content/site";
import { dataBR } from "@/lib/texto";
import { useApp, type SeloObtido } from "../app-provider";
import { compartilharLink } from "../compartilhar";
import { Icon } from "../icon";
import { Kicker, LogoEquatorial, Ph } from "../ui";

/** D5/M8: selo em destaque com inclinação 3D, benefício, compartilhar e baixar. */
export function SecaoSelo({ exemplo, beneficio }: { exemplo: SeloObtido; beneficio: string }) {
  const { selo: obtido } = useApp();
  const selo = obtido ?? exemplo;
  const [formato, setFormato] = useState<"status" | "square">("status");
  const palco = useRef<HTMLDivElement>(null);

  // Inclinação só com mouse (ponteiro fino) e sem "reduzir movimento".
  const inclinar = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse" || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = palco.current!;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty("--ry", `${(x * 24 - 4).toFixed(2)}deg`);
    el.style.setProperty("--rx", `${(-y * 16 + 2).toFixed(2)}deg`);
    el.style.setProperty("--gx", (x * 100 + 50).toFixed(1));
  };
  const soltar = () => {
    const el = palco.current!;
    el.style.removeProperty("--ry");
    el.style.removeProperty("--rx");
    el.style.removeProperty("--gx");
  };

  const urlImagem = `/api/badge/${selo.id}?format=${formato}&download=1`;

  return (
    <section id="selo" aria-labelledby="selo-t" className="relative overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_60%_at_30%_50%,rgba(90,200,250,.14),transparent_70%),radial-gradient(40%_50%_at_70%_40%,rgba(139,92,246,.16),transparent_70%)]" />
      <div className="relative mx-auto flex max-w-[1320px] flex-wrap items-center gap-[clamp(40px,6vw,96px)] px-[clamp(20px,5vw,64px)] py-[clamp(80px,10vw,140px)]">
        <div ref={palco} onPointerMove={inclinar} onPointerLeave={soltar} className="selo-palco flex flex-[1_1_340px] justify-center py-5">
          <div className="selo-cartao w-[min(400px,100%)]">
            <div
              className="relative w-full rounded-[28px] bg-[linear-gradient(140deg,#5AC8FA,#8B5CF6_60%,#5AC8FA)] p-0.5 shadow-[0_40px_90px_rgba(3,5,30,.65),0_0_80px_rgba(90,200,250,.28)]"
              style={{ aspectRatio: formato === "status" ? "4 / 5" : "1 / 1" }}
              role="img"
              aria-label={`${obtido ? textos.seuSelo : textos.exemplo}: ${textos.linha1} ${textos.linha2}, ${selo.primeiroNome}, ${selo.bairro}, ${dataBR(selo.data)}, código ${selo.codigo}`}
              data-testid="selo-destaque"
            >
              <div className="relative flex h-full flex-col items-center justify-between overflow-hidden rounded-[26px] bg-[radial-gradient(120%_75%_at_50%_0%,#2E3AA8_0%,#14185F_58%,#0B0E3A_100%)] px-[8%] py-[7%] text-center">
                <div className="flex w-full items-center justify-between">
                  <LogoEquatorial decorativo className="h-[clamp(26px,9%,34px)]" />
                  <span className="font-mono text-xs tracking-[.06em] text-texto-4">{selo.codigo}</span>
                </div>
                <svg viewBox="0 0 120 132" aria-hidden="true" className="block [filter:drop-shadow(0_0_22px_rgba(90,200,250,.55))]" style={{ width: formato === "status" ? "42%" : "30%" }}>
                  <defs>
                    <linearGradient id="selo-g" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0" stopColor="#5AC8FA" />
                      <stop offset="1" stopColor="#8B5CF6" />
                    </linearGradient>
                  </defs>
                  <path d="M60 6 L108 22 V62 C108 94 86 116 60 126 C34 116 12 94 12 62 V22 Z" fill="rgba(90,200,250,.1)" stroke="url(#selo-g)" strokeWidth="3.5" />
                  <path d="M60 18 L97 30.5 V62 C97 87 80 104 60 113 C40 104 23 87 23 62 V30.5 Z" fill="none" stroke="#5AC8FA" strokeOpacity=".35" strokeWidth="1" />
                  <path d="M67 28 L41 70 H57 L51 104 L80 58 H63 Z" fill="#F5F7FF" stroke="#5AC8FA" strokeWidth="2" strokeLinejoin="round" />
                </svg>
                <div className="flex flex-col items-center gap-2.5">
                  <strong className="titulo text-[clamp(28px,3vw,38px)] font-extrabold uppercase leading-[.98] tracking-[-.01em]">
                    {textos.linha1}
                    <br />
                    {textos.linha2}
                  </strong>
                  <span className="text-[22px] font-semibold">{selo.primeiroNome}</span>
                  <span className="text-[15px] text-texto-3">
                    {selo.bairro} · {dataBR(selo.data)}
                  </span>
                </div>
                <span className="text-[13px] text-ciano-claro">{textos.frase}</span>
                <div aria-hidden="true" className="selo-brilho pointer-events-none absolute inset-0" />
              </div>
            </div>
          </div>
        </div>
        <div className="flex max-w-[560px] flex-[1_1_380px] flex-col gap-[22px]">
          <Kicker>{textos.kicker}</Kicker>
          <h2 id="selo-t" className="titulo-secao m-0">{textos.titulo}</h2>
          <p className="m-0 text-lg text-texto-3">{textos.texto}</p>
          <div className="flex items-start gap-3.5 rounded-[20px] border border-[rgba(34,197,94,.45)] bg-[rgba(34,197,94,.08)] px-[18px] py-4">
            <span className="pt-0.5 text-ok"><Icon nome="check" /></span>
            <div className="flex flex-col gap-1">
              <strong className="font-semibold">{textos.beneficioTitulo}</strong>
              <span className="text-[15.5px] leading-[1.45] text-texto-2">
                <Ph>{beneficio}</Ph> {textos.beneficioTexto}
              </span>
            </div>
          </div>
          <fieldset className="m-0 flex self-start overflow-hidden rounded-[14px] border border-[rgba(185,191,234,.22)] p-0">
            <legend className="sr-only">{textos.formatoRotulo}</legend>
            {(["status", "square"] as const).map((f) => (
              <label
                key={f}
                className="flex min-h-11 cursor-pointer items-center px-4 text-sm has-[:checked]:text-ciano has-[:checked]:shadow-[inset_0_0_0_1px_#5AC8FA] has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-ciano [&+&]:border-l [&+&]:border-[rgba(185,191,234,.22)]"
              >
                <input type="radio" name="formato-selo" value={f} checked={formato === f} onChange={() => setFormato(f)} className="sr-only" />
                {f === "status" ? textos.formatoStatus : textos.formatoQuadrado}
              </label>
            ))}
          </fieldset>
          <div className="flex flex-wrap gap-3">
            <button type="button" className="btn btn-cta" style={{ ["--cta-fundo" as string]: "#171C66" }} onClick={() => void compartilharLink(`${location.origin}/selo/${selo.id}`)}>
              <Icon nome="share" />
              {textos.compartilhar}
            </button>
            <a href={urlImagem} download className="btn !min-h-14" onClick={() => toast.success(textos.baixando)}>
              <Icon nome="download" />
              {textos.baixar}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
