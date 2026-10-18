import { PH } from "@/content/placeholders";
import { banca, convite, impacto, risco, rodape } from "@/content/site";
import { BotaoOuvir } from "../audio";
import { CtaWhatsApp } from "../app-provider";
import { Icon, type NomeIcone } from "../icon";
import { Kicker, LogoEquatorial, Ph } from "../ui";
import { Cena } from "../scene/cena";
import { FalarComEquatorial } from "./falar";

const secao = "mx-auto max-w-[1320px] px-[clamp(20px,5vw,64px)] py-[clamp(60px,8vw,120px)]";

/** D7: Impacto em três colunas. */
export function Impacto() {
  return (
    <section id="impacto" aria-labelledby="imp-t" className={secao}>
      <Kicker>{impacto.kicker}</Kicker>
      <h2 id="imp-t" className="titulo-secao mt-[18px] mb-[clamp(32px,4vw,56px)] max-w-[820px]">{impacto.titulo}</h2>
      <div className="grid gap-5 [grid-template-columns:repeat(auto-fit,minmax(min(100%,300px),1fr))]">
        {impacto.colunas.map((c) => (
          <div key={c.titulo} className="flex flex-col gap-[18px] rounded-[26px] border border-[rgba(154,163,240,.18)] bg-[linear-gradient(180deg,#1A1F6C,#141861)] p-[26px]">
            <span className="grid h-[52px] w-[52px] place-items-center rounded-[18px] bg-[rgba(90,200,250,.12)] text-ciano">
              <Icon nome={c.icone as NomeIcone} tamanho={26} />
            </span>
            <h3 className="titulo m-0 text-[26px]">{c.titulo}</h3>
            <ul className="m-0 flex list-none flex-col gap-3 p-0">
              {c.itens.map((it) => (
                <li key={it} className="flex gap-2.5 leading-[1.45] text-texto-2">
                  <span aria-hidden="true" className="mt-[9px] h-1.5 w-1.5 flex-none rounded-full bg-ciano" />
                  {it}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

/** D8: Em caso de risco — 4 cartões com áudio e transcrição + "Falar com a Equatorial". */
export function Risco() {
  return (
    <section id="risco" aria-labelledby="risco-t" className={secao}>
      <Kicker cor="#FFB020" icone={<Icon nome="warn" tamanho={18} cor="#FFB020" />}>
        {risco.kicker}
      </Kicker>
      <h2 id="risco-t" className="titulo-secao mt-[18px] mb-4 max-w-[820px]">{risco.titulo}</h2>
      <p className="m-0 mb-[clamp(32px,4vw,56px)] max-w-[600px] text-lg text-texto-3">
        {risco.texto} <Ph>{PH.validar}</Ph>
      </p>
      <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(min(100%,260px),1fr))]">
        {risco.cartoes.map((c) => (
          <article key={c.id} className="flex flex-col gap-3.5 rounded-[24px] border border-[rgba(255,176,32,.28)] bg-[linear-gradient(180deg,#1A1F6C,#141861)] p-[22px]">
            <span className="grid h-14 w-14 place-items-center rounded-[18px] bg-[rgba(255,176,32,.12)] text-alerta">
              <Icon nome={c.icone as NomeIcone} tamanho={28} cor="#FFB020" />
            </span>
            <h3 className="m-0 text-[19px] font-semibold">{c.titulo}</h3>
            <p className="m-0 flex-1 leading-[1.45] text-texto-2">{c.texto.split(PH.distancia).flatMap((parte, i, arr) => (i < arr.length - 1 ? [parte, <Ph key={i}>{PH.distancia}</Ph>] : [parte]))}</p>
            <BotaoOuvir src={c.audio} rotulo={`Ouvir · ${c.duracao}`} ariaTitulo={c.titulo} />
            <details className="text-sm text-texto-4">
              <summary className="cursor-pointer py-1 text-ciano-claro">Ler a transcrição</summary>
              <p className="m-0 mt-1 leading-[1.45]">{c.transcricao}</p>
            </details>
          </article>
        ))}
      </div>
      <div className="relative bottom-5 z-20 mt-7 flex justify-end min-[820px]:sticky">
        <div className="flex flex-wrap items-center gap-3.5 rounded-[28px] border border-[rgba(154,163,240,.25)] bg-[rgba(13,16,70,.9)] py-2.5 pr-2.5 pl-5 shadow-[0_20px_50px_rgba(3,5,30,.5)] backdrop-blur-md min-[820px]:rounded-full">
          <span className="text-[15px] text-texto-2">
            {risco.canalRotulo} <Ph>{PH.canal}</Ph>
          </span>
          <FalarComEquatorial />
        </div>
      </div>
    </section>
  );
}

/** D9: arquitetura, o que é simulado e roadmap. */
export function Banca() {
  return (
    <section id="banca" aria-labelledby="banca-t" className={secao}>
      <Kicker>{banca.kicker}</Kicker>
      <h2 id="banca-t" className="titulo-secao mt-[18px] mb-[clamp(32px,4vw,56px)] max-w-[820px]">{banca.titulo}</h2>
      <div className="mb-9 flex flex-wrap items-center gap-3.5">
        {banca.blocos.map((b, i) => (
          <div key={b.titulo} className="contents">
            <div className={`flex flex-[1_1_180px] flex-col gap-2.5 rounded-[22px] p-5 ${i === 1 ? "cartao-ativo" : "border border-[rgba(154,163,240,.22)] bg-marinho-2"}`}>
              <span className="text-ciano"><Icon nome={b.icone as NomeIcone} /></span>
              <strong className="text-[17px] font-semibold">{b.titulo}</strong>
              <span className="text-[14.5px] text-texto-4">{b.texto}</span>
            </div>
            <span aria-hidden="true" className="text-ciano max-[520px]:rotate-90 max-[520px]:mx-auto"><Icon nome="arrow" /></span>
          </div>
        ))}
        <div className="flex flex-[2_1_320px] flex-col gap-3 rounded-[22px] border border-[rgba(154,163,240,.22)] bg-marinho-2 p-5">
          <strong className="text-[17px] font-semibold">{banca.servicosTitulo}</strong>
          <div className="flex flex-wrap gap-2">
            {banca.servicos.map((s) => (
              <span key={s} className="rounded-[10px] border border-ciano px-3 py-1.5 text-sm text-ciano">{s}</span>
            ))}
          </div>
        </div>
      </div>
      <div className="overflow-x-auto rounded-[24px] border border-[rgba(154,163,240,.16)] bg-marinho px-3 py-2" tabIndex={0} role="region" aria-label={banca.tabelaAria}>
        <table className="w-full min-w-[680px] border-collapse text-[15.5px]">
          <thead>
            <tr className="border-b border-[rgba(185,191,234,.22)]">
              {banca.colunas.map((c) => (
                <th key={c} scope="col" className="px-3 py-3.5 text-left text-[11px] font-semibold uppercase tracking-[.08em] text-texto-4">{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {banca.linhas.map((l) => (
              <tr key={l.peca} className="border-b border-[rgba(245,247,255,.08)] last:border-0">
                <th scope="row" className="px-3 py-3.5 text-left font-semibold">{l.peca}</th>
                <td className="px-3 py-3.5 text-texto-2">{l.mvp}</td>
                <td className="px-3 py-3.5">
                  <span
                    className="inline-flex rounded-[10px] px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap"
                    style={l.simulado ? { background: "rgba(139,92,246,.2)", color: "#EEE8FF", border: "1px solid rgba(139,92,246,.6)" } : { background: "rgba(34,197,94,.12)", color: "#B6F2CB", border: "1px solid rgba(34,197,94,.55)" }}
                  >
                    {l.simulado ? banca.simulado : banca.funciona}
                  </span>
                </td>
                <td className="px-3 py-3.5 text-texto-2">{l.real}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ol className="m-0 mt-10 grid list-none gap-4 p-0 [grid-template-columns:repeat(auto-fit,minmax(min(100%,280px),1fr))]">
        {banca.roadmap.map((r, k) => (
          <li key={r.titulo} className={`flex flex-col gap-2 rounded-[24px] p-[22px] pb-6 ${k === 0 ? "cartao-ativo" : "border border-[rgba(154,163,240,.18)] bg-marinho"}`}>
            <span className="text-[13px] font-semibold uppercase tracking-[.14em] text-ciano">{r.fase}</span>
            <h3 className="titulo m-0 text-2xl">{r.titulo}</h3>
            <span className="text-[15.5px] leading-[1.45] text-texto-2">{r.texto}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}

/** Amanhecer + CTA final. */
export function Convite() {
  return (
    <section aria-label={convite.rotulo} className="relative flex min-h-[max(560px,86svh)] items-start overflow-hidden" style={{ ["--dawn" as string]: 1, ["--m" as string]: 0 }}>
      <div className="absolute inset-0">
        <Cena prefixo="c" still seed={23} />
      </div>
      <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(180deg,#1E2370_0%,rgba(30,35,112,0)_35%)]" />
      <div className="relative mx-auto flex w-full max-w-[1320px] flex-col items-start gap-6 px-[clamp(20px,5vw,64px)] py-[clamp(60px,9vw,120px)]">
        <h2 className="titulo m-0 max-w-[760px] text-[clamp(34px,4.8vw,66px)] leading-[1.03] [text-shadow:0_2px_30px_rgba(20,24,95,.6)]">{convite.titulo}</h2>
        <CtaWhatsApp fundo="#1E2370" />
      </div>
    </section>
  );
}

/** D10: privacidade (LGPD) e créditos. */
export function Rodape() {
  return (
    <footer className="bg-noite px-[clamp(20px,5vw,64px)] pt-14 pb-[calc(56px+76px)] min-[820px]:pb-14">
      <div className="mx-auto flex max-w-[1320px] flex-wrap gap-x-16 gap-y-10">
        <div className="flex flex-[2_1_420px] flex-col gap-3">
          <h2 className="m-0 flex items-center gap-2 text-base font-semibold text-texto">
            <Icon nome="lock" />
            {rodape.privacidadeTitulo}
          </h2>
          <p className="m-0 max-w-[620px] text-[15.5px] leading-[1.55] text-texto-3">{rodape.privacidadeTexto}</p>
          <span className="inline-flex min-h-11 flex-wrap items-center gap-2 text-[15px]">
            <span className="text-ciano underline underline-offset-[3px]">{rodape.politica}</span>
            <Ph>{PH.politica}</Ph>
          </span>
        </div>
        <div className="flex flex-[1_1_280px] flex-col gap-2.5 text-[15px] leading-normal text-texto-4">
          <LogoEquatorial className="h-11 self-start" />
          <span>{rodape.hackathon}</span>
          <span>{rodape.aviso}</span>
        </div>
      </div>
    </footer>
  );
}
