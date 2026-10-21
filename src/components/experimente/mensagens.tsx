"use client";

import { chat, niveis, resultado as textosResultado, selo as textosSelo, tiposAtivo } from "@/content/site";
import { dataBR } from "@/lib/texto";
import { BotaoOuvir, MensagemAudio } from "../audio";
import { Icon } from "../icon";
import { TagSimulacao } from "../ui";
import type { Msg } from "./estado";
import { VISUAL_NIVEL } from "./niveis";

const fmtDist = (m: number) => (m >= 1000 ? `${(m / 1000).toFixed(1).replace(".", ",")} km` : `${m} m`);

export function Mensagem({ m, aoResponder }: { m: Msg; aoResponder: (msgId: number, opcaoId: string) => void }) {
  switch (m.k) {
    case "eu":
      return <div className="bolha-eu max-w-[82%] px-[13px] py-2.5 leading-[1.42] whitespace-pre-line">{m.texto}</div>;
    case "eu-loc":
      return (
        <div className="bolha-eu w-[72%] overflow-hidden">
          <div
            aria-hidden="true"
            className="grid h-24 place-items-center text-texto [background:linear-gradient(0deg,rgba(15,19,80,.5),rgba(15,19,80,.5)),repeating-linear-gradient(35deg,transparent_0_22px,rgba(154,163,240,.25)_22px_23px),repeating-linear-gradient(-55deg,transparent_0_30px,rgba(154,163,240,.2)_30px_31px),#1A2F86]"
          >
            <Icon nome="pin" tamanho={30} />
          </div>
          <div className="px-3 pt-2 pb-2.5 text-[15px]">{m.texto}</div>
        </div>
      );
    case "bot":
      return <div className="bolha-bot max-w-[86%] px-[13px] py-2.5 leading-[1.42] whitespace-pre-line">{m.texto}</div>;
    case "imagem":
      return (
        <figure className="bolha-bot m-0 w-[84%] overflow-hidden">
          <div
            role="img"
            aria-label={m.legenda}
            className="grid h-[150px] place-items-center bg-[radial-gradient(60%_70%_at_50%_60%,rgba(90,200,250,.22),rgba(90,200,250,0)_70%),linear-gradient(180deg,#141861,#1E2370)] text-ciano [filter:drop-shadow(0_0_14px_rgba(90,200,250,.6))]"
          >
            <Icon nome={m.icone} tamanho={64} cor="#5AC8FA" traco={1.3} />
          </div>
          <figcaption className="px-[13px] pt-2.5 pb-3 text-[15.5px] leading-[1.4] text-texto">{m.legenda}</figcaption>
        </figure>
      );
    case "audio":
      return <MensagemAudio titulo={m.titulo} src={m.src} duracao={m.duracao} transcricao={m.transcricao} />;
    case "pedido-loc":
      return (
        <div className="flex w-[88%] flex-col gap-2.5 rounded-[18px_18px_18px_6px] border border-transparent p-3.5 [background:linear-gradient(#1E2370,#1E2370)_padding-box,linear-gradient(135deg,#5AC8FA,#8B5CF6)_border-box]">
          <div className="flex items-start gap-2.5">
            <span className="grid h-9 w-9 flex-none place-items-center rounded-xl bg-[rgba(90,200,250,.14)] text-ciano">
              <Icon nome="pin" />
            </span>
            <span className="leading-[1.42]">{chat.pedidoLocalizacao}</span>
          </div>
          <div className="flex items-center gap-2 text-[13.5px] text-texto-4">
            <Icon nome="lock" tamanho={16} />
            {chat.pedidoLocalizacaoNota}
          </div>
        </div>
      );
    case "resultado": {
      const r = m.resultado;
      const v = VISUAL_NIVEL[r.nivel];
      const n = niveis[r.nivel];
      const texto = r.nivel === "baixo" ? niveis.baixo.texto() : n.texto(tiposAtivo[r.ativoMaisProximo.tipo], fmtDist(r.ativoMaisProximo.distanciaM));
      return (
        <div
          data-testid="resultado"
          data-nivel={r.nivel}
          className="flex w-[90%] flex-col gap-2.5 rounded-[18px_18px_18px_6px] p-3.5"
          style={{ background: `linear-gradient(${v.fundo},${v.fundo}),#1E2370`, border: `1.5px solid ${v.cor}` }}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-[12.5px] uppercase tracking-[.1em] text-texto-4">
              {textosResultado.prefixo} · {m.rotulo}
            </span>
            {r.simulacao && <TagSimulacao />}
          </div>
          <div className="flex items-center gap-2.5">
            <Icon nome={v.icone} tamanho={24} cor={v.cor} />
            <strong className="titulo text-[21px]" style={{ color: v.cor }}>
              {n.rotulo}
            </strong>
          </div>
          <p className="m-0 text-[15.5px] leading-[1.45] text-[#E4E7F7]">{texto}</p>
          {r.simulacao && <p className="m-0 text-[13px] text-texto-4">{textosResultado.notaFicticia}</p>}
        </div>
      );
    }
    case "quiz": {
      const respondida = m.respondida != null;
      return (
        <div className="flex flex-col gap-2.5 self-stretch rounded-[20px] border border-borda bg-superficie p-3.5" data-testid={`quiz-${m.indice + 1}`}>
          <div className="flex items-center justify-between gap-2">
            <span className="text-[12.5px] uppercase tracking-[.1em] text-[#9FE0FF]">{chat.perguntaDe(m.indice + 1, m.total)}</span>
            <BotaoOuvir src={m.pergunta.audio.src} rotulo={chat.ouvir} ariaTitulo={chat.perguntaDe(m.indice + 1, m.total)} compacto />
          </div>
          <strong className="text-[17px] font-semibold leading-[1.35]" id={`q-${m.id}`}>
            {m.pergunta.pergunta}
          </strong>
          <div className="flex flex-col gap-2" role="group" aria-labelledby={`q-${m.id}`}>
            {m.pergunta.opcoes.map((o) => {
              const escolhida = m.respondida === o.id;
              const cor = escolhida ? (m.correta ? "#22C55E" : "#FFB020") : "#3A41A0";
              return (
                <button
                  key={o.id}
                  type="button"
                  disabled={respondida}
                  onClick={() => aoResponder(m.id, o.id)}
                  className="flex min-h-14 w-full cursor-pointer items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-[15.5px] font-medium leading-[1.35] text-texto transition-transform duration-150 ease-[var(--ease-out)] enabled:active:scale-[.98] disabled:cursor-default"
                  style={{
                    border: `1.5px solid ${cor}`,
                    background: escolhida ? (m.correta ? "rgba(34,197,94,.14)" : "rgba(255,176,32,.12)") : "rgba(154,163,240,.05)",
                    opacity: respondida && !escolhida ? 0.5 : 1,
                  }}
                >
                  <span className="titulo grid h-[30px] w-[30px] flex-none place-items-center rounded-[10px] bg-[rgba(154,163,240,.16)] text-sm">
                    {o.id.toUpperCase()}
                  </span>
                  <span className="flex-1">{o.texto}</span>
                  {escolhida && (
                    <span className="flex items-center gap-1 text-[12.5px] font-semibold" style={{ color: cor }}>
                      <Icon nome={m.correta ? "check" : "x"} tamanho={16} />
                      {m.correta ? chat.correta : chat.suaResposta}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      );
    }
    case "feedback":
      return m.ok ? (
        <div className="flex w-[90%] flex-col gap-1.5 rounded-[18px_18px_18px_6px] border-[1.5px] border-ok bg-[#18306A] px-3.5 py-3">
          <div className="flex items-center gap-2 font-bold text-ok-claro">
            <Icon nome="check" cor="#22C55E" />
            {chat.feedbackOk}
          </div>
          <p className="m-0 text-[15.5px] leading-[1.45] text-[#E4E7F7]">{m.texto}</p>
        </div>
      ) : (
        <div className="flex w-[90%] flex-col gap-1.5 rounded-[18px_18px_18px_6px] border-[1.5px] border-alerta bg-[#2A2560] px-3.5 py-3">
          <div className="flex items-center gap-2 font-bold text-alerta-claro">
            <Icon nome="warn" cor="#FFB020" />
            {chat.feedbackErro}
          </div>
          <p className="m-0 text-[15.5px] leading-[1.45] text-[#E4E7F7]">{m.texto}</p>
        </div>
      );
    case "selo":
      return (
        <div className="w-[80%] rounded-[22px] bg-[linear-gradient(140deg,#5AC8FA,#8B5CF6)] p-0.5 shadow-[0_0_36px_rgba(90,200,250,.3)]" data-testid="selo-chat">
          <div className="flex flex-col items-center gap-2 rounded-[20px] bg-[radial-gradient(120%_80%_at_50%_0%,#2B3196,#14185F_60%,#0D1046)] px-3.5 py-[18px] text-center">
            <span className="text-ciano [filter:drop-shadow(0_0_12px_rgba(90,200,250,.6))]">
              <Icon nome="shieldBolt" tamanho={54} cor="#5AC8FA" traco={1.4} />
            </span>
            <strong className="titulo text-[19px] font-extrabold uppercase leading-[1.05]">
              {textosSelo.linha1}
              <br />
              {textosSelo.linha2}
            </strong>
            <span className="text-[15px]">
              {m.selo.primeiroNome} · {m.selo.bairro}
            </span>
            <span className="font-mono text-xs tracking-[.06em] text-texto-4">
              {dataBR(m.selo.data)} · {m.selo.codigo}
            </span>
          </div>
        </div>
      );
  }
}
