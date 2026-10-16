import { hero, problema } from "@/content/site";
import { CtaWhatsApp } from "../app-provider";
import { Icon } from "../icon";
import { Cena } from "../scene/cena";
import { PausasHistoria } from "../scene/pausas-historia";

const kickerAlerta = "flex items-center gap-2.5 font-semibold text-[13px] leading-[1.3] tracking-[.14em] uppercase text-alerta mb-5";
const h2Historia = "titulo m-0 mb-5 text-[clamp(36px,5vw,72px)] leading-[1.03]";
const pHistoria = "m-0 max-w-[520px] text-[clamp(17px,1.5vw,20px)] leading-normal text-texto-3";

/** D1/D2 + M1/M2: Hero e Problema numa só cena, da noite ao amanhecer. */
export function Historia() {
  return (
    <>
      <section id="topo" className="historia" aria-label={hero.rotuloSecao}>
        {/* Pausas da rolagem: herói, os três estados e o amanhecer (ver .historia-pausa). */}
        {[0, 1, 2, 3, 4].map((k) => (
          <i key={k} aria-hidden="true" className="historia-pausa" style={{ ["--k" as string]: k }} />
        ))}
        <div className="historia-palco">
          <div className="historia-camera absolute inset-[-30px_0_0_0]">
            <Cena prefixo="h" />
          </div>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(110%_80%_at_0%_18%,rgba(8,10,48,.82)_0%,rgba(8,10,48,.4)_45%,rgba(8,10,48,0)_72%)]"
          />
          <div className="absolute inset-0 mx-auto max-w-[1320px] px-[clamp(20px,5vw,64px)] pt-[clamp(104px,17vh,190px)] [@media(max-height:700px)]:pt-[88px]">
            <div className="relative max-w-[760px]">
              <div className="camada camada-0">
                <div className="kicker mb-5">
                  <span className="kicker-traco" aria-hidden="true" />
                  {hero.kicker}
                </div>
                <h1 className="titulo m-0 mb-[22px] text-[clamp(38px,5.6vw,82px)] leading-[1.02] text-texto">{hero.titulo}</h1>
                <p className="m-0 mb-8 max-w-[540px] text-[clamp(17px,1.5vw,20px)] leading-normal text-texto-3 text-pretty">{hero.texto}</p>
                <div className="flex flex-wrap gap-3">
                  <CtaWhatsApp testId="cta-hero" />
                  <a href="#como" className="btn !min-h-14">
                    {hero.secundario}
                  </a>
                </div>
              </div>
              {problema.estados.map((e, i) => (
                <div key={e.titulo} className={`camada camada-${i + 1} pointer-events-none`}>
                  <div className={kickerAlerta}>
                    <Icon nome="warn" tamanho={18} cor="#FFB020" />
                    {e.kicker}
                  </div>
                  <h2 className={h2Historia}>{e.titulo}</h2>
                  <p className={pHistoria}>{e.texto}</p>
                </div>
              ))}
              <div className="camada camada-4">
                <div className="kicker mb-5 !text-ciano-gelo">
                  <Icon nome="sun" />
                  {problema.amanhecer.kicker}
                </div>
                <h2 className={`${h2Historia} [text-shadow:0_2px_30px_rgba(8,10,48,.6)]`}>{problema.amanhecer.titulo}</h2>
                <p className="m-0 mb-[30px] max-w-[520px] text-[clamp(17px,1.5vw,20px)] text-texto [text-shadow:0_1px_16px_rgba(8,10,48,.8)]">
                  {problema.amanhecer.texto}
                </p>
                <CtaWhatsApp fundo="#1B2070" />
              </div>
            </div>
          </div>
          {/* No celular o aviso fica centralizado acima da cadeia; a partir de 820px, à direita dela. */}
          <div className="pointer-events-none absolute inset-x-0 bottom-[clamp(20px,5vh,44px)] mx-auto flex max-w-[1320px] flex-col-reverse items-center gap-3 px-[clamp(20px,5vw,64px)] min-[820px]:flex-row min-[820px]:items-end min-[820px]:justify-between min-[820px]:gap-4">
            <ol
              aria-label={problema.rotuloCadeia}
              className="cadeia m-0 flex list-none gap-1.5 rounded-[18px] border border-[rgba(255,176,32,.25)] bg-[rgba(9,11,50,.72)] p-2.5 backdrop-blur-[10px]"
            >
              {problema.estados.map((e, i) => (
                <li key={e.curto} className={`cadeia-${i + 1} flex min-w-[92px] flex-col gap-1.5 px-2.5 py-1 max-[400px]:min-w-0`}>
                  <span className="text-[13px] font-semibold leading-tight text-texto">{e.curto}</span>
                  <i className="block h-[3px] origin-left rounded-[3px] bg-alerta" />
                </li>
              ))}
            </ol>
            <div className="dica-rolar flex items-center gap-2 rounded-full border border-[rgba(185,191,234,.28)] bg-[rgba(9,11,50,.62)] py-1.5 pr-4 pl-1.5 text-[13px] font-semibold text-texto-2 backdrop-blur-[10px]">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-[rgba(90,200,250,.14)] text-ciano">
                <span className="dica-rolar-seta grid place-items-center">
                  <Icon nome="down" tamanho={16} />
                </span>
              </span>
              {hero.rolar}
            </div>
          </div>
        </div>
      </section>
      {/* Área de rolagem livre depois da história e a faixa que liga o snap (posicionadas pelo body). */}
      <PausasHistoria />
    </>
  );
}

/** Alternativa estática da história para "reduzir movimento": os 3 estados lado a lado. */
export function ProblemaEstatico() {
  const icones = ["kite", "spark", "cable"] as const;
  return (
    <section className="problema-estatico mx-auto max-w-[1320px] px-[clamp(20px,5vw,64px)] py-16" aria-label={problema.rotuloEstatico}>
      <ol className="m-0 grid list-none gap-4 p-0 [grid-template-columns:repeat(auto-fit,minmax(min(100%,280px),1fr))]">
        {problema.estados.map((e, i) => (
          <li key={e.titulo} className="flex flex-col gap-3 rounded-[24px] border border-[rgba(255,176,32,.28)] bg-[linear-gradient(180deg,#1A1F6C,#141861)] p-6">
            <span className="grid h-14 w-14 place-items-center rounded-[18px] bg-[rgba(255,176,32,.12)] text-alerta">
              <Icon nome={icones[i]} tamanho={28} />
            </span>
            <span className="text-[13px] font-semibold uppercase tracking-[.14em] text-alerta">{e.kicker}</span>
            <h2 className="titulo m-0 text-[28px] leading-[1.08]">{e.titulo}</h2>
            <p className="m-0 text-texto-3">{e.texto}</p>
          </li>
        ))}
      </ol>
      <p className="titulo mt-10 text-[28px]">{problema.amanhecer.titulo}</p>
    </section>
  );
}
