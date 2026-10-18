"use client";

import { Drawer } from "@base-ui/react/drawer";
import { useCallback, useEffect, useReducer, useRef, useState, type FormEvent } from "react";
import { chat, como, mapa, niveis, sheet } from "@/content/site";
import { api, arredondar } from "@/lib/api-client";
import type { BairroDemo, ConsultaProximidade } from "@/lib/services/types";
import { primeiroNome } from "@/lib/texto";
import { useApp } from "../app-provider";
import { compartilharLink } from "../compartilhar";
import { Icon } from "../icon";
import { TagSimulacao } from "../ui";
import { estadoInicial, reducer, type Acao, type MsgSemId, type RespostaRapida } from "./estado";
import { Mensagem } from "./mensagens";
import { VISUAL_NIVEL } from "./niveis";

const MAPA_IDS: Record<string, { cx: number; cy: number; r: number; fill: string }> = {
  "vila-esperanca": { cx: 150, cy: 92, r: 40, fill: "rgba(255,176,32,.08)" },
  "jardim-das-torres": { cx: 252, cy: 196, r: 34, fill: "rgba(139,92,246,.1)" },
  "parque-das-aguas": { cx: 64, cy: 196, r: 34, fill: "rgba(90,200,250,.08)" },
};

function useMovimentoReduzido() {
  const [r, setR] = useState(false);
  useEffect(() => {
    const mq = matchMedia("(prefers-reduced-motion: reduce)");
    const f = () => setR(mq.matches);
    f();
    mq.addEventListener("change", f);
    return () => mq.removeEventListener("change", f);
  }, []);
  return r;
}

/** D3/D4 + M3–M8: passos, simulador de conversa e bairros de demonstração. */
export function Experimente({ bairros }: { bairros: BairroDemo[] }) {
  const [e, dispatch] = useReducer(reducer, undefined, estadoInicial);
  const { setSelo, selo } = useApp();
  const reduzido = useMovimentoReduzido();
  const logRef = useRef<HTMLDivElement>(null);
  const telaRef = useRef<HTMLDivElement>(null);
  const [nome, setNome] = useState("");
  const [textoLivre, setTextoLivre] = useState("");
  const [enviandoLivre, setEnviandoLivre] = useState(false);

  const sugestoesRapidas = [
    { rotulo: "⚡ Cabo caído", texto: "O que fazer se tiver um cabo caído no chão da rua?" },
    { rotulo: "🔌 Aparelho queimou", texto: "Minha geladeira queimou na chuva forte, como peço ressarcimento à Equatorial?" },
    { rotulo: "💥 Arco elétrico", texto: "O que é arco elétrico na alta tensão e qual a distância segura?" },
    { rotulo: "🪁 Pipa na rede", texto: "Uma pipa enroscou no fio de alta tensão, posso tirar?" },
    { rotulo: "🏆 Iniciar Quiz", texto: "quiz" },
  ];

  const respostasBairros: RespostaRapida[] = bairros.map((b) => ({ rotulo: b.nome, icone: "house", acao: { t: "bairro", id: b.id, nome: b.nome } }));

  // Entrega as mensagens do bot uma a uma, com "digitando…".
  useEffect(() => {
    if (e.fila.length === 0) return;
    const prox = e.fila[0];
    const tam = "texto" in prox ? prox.texto.length : "legenda" in prox ? prox.legenda.length : 40;
    const atraso = reduzido ? 120 : e.digitando && e.msgs.at(-1)?.k.startsWith("eu") ? 750 : 450 + Math.min(600, tam * 7);
    const t = setTimeout(() => dispatch({ t: "entregar" }), atraso);
    return () => clearTimeout(t);
  }, [e.fila, e.digitando, e.msgs, reduzido]);

  // Mantém o fim da conversa visível.
  useEffect(() => {
    const el = logRef.current;
    if (!el) return;
    requestAnimationFrame(() => el.scrollTo({ top: el.scrollHeight, behavior: reduzido ? "auto" : "smooth" }));
  }, [e.msgs.length, e.digitando, e.respostas, e.entradaNome, reduzido]);

  const consultar = useCallback(
    async (c: ConsultaProximidade, rotulo: string) => {
      try {
        const r = await api.proximidade(c);
        dispatch({ t: "resultado", bairro: r.bairro ?? null, nivel: r.nivel });
        const itens: MsgSemId[] = [{ k: "resultado", resultado: r, rotulo: r.bairro?.nome ?? rotulo }];
        if ("lat" in c && !r.bairro) itens.push({ k: "bot", texto: `${niveis.baixo.rotulo}. Sua localização fica fora da área de demonstração. Para ver os outros resultados, escolha um bairro de demonstração ao lado.` });
        itens.push(
          { k: "bot", texto: chat.cuidadosIntro },
          ...chat.imagens.map((i) => ({ k: "imagem" as const, icone: i.icone as "kite" | "cable", legenda: i.legenda })),
          { k: "audio", ...chat.audioCuidados },
          { k: "bot", texto: chat.convitesQuiz },
        );
        dispatch({ t: "falar", itens, respostas: [{ rotulo: chat.respostas.comecarQuiz, icone: "check", acao: { t: "comecar-quiz" } }], passo: 4 });
      } catch {
        dispatch({ t: "falar", itens: [{ k: "bot", texto: chat.erroServico }], respostas: respostasBairros });
      }
    },
    // respostasBairros deriva de bairros
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [bairros],
  );

  const mostrarPergunta = useCallback(async (indice: number) => {
    try {
      const ps = e.perguntas ?? (await api.perguntas());
      if (!e.perguntas) dispatch({ t: "perguntas", perguntas: ps });
      dispatch({ t: "falar", itens: [{ k: "quiz", indice, pergunta: ps[indice] }], passo: 5 });
    } catch {
      dispatch({ t: "falar", itens: [{ k: "bot", texto: chat.erroServico }], respostas: [{ rotulo: chat.respostas.comecarQuiz, icone: "check", acao: { t: "comecar-quiz" } }] });
    }
  }, [e.perguntas]);

  const iniciarQuizVisual = useCallback(() => {
    dispatch({ t: "usuario", texto: chat.respostas.comecarQuiz });
    if (!e.bairro) {
      dispatch({ t: "resultado", bairro: { id: "vila-esperanca", nome: "Vila Esperança" }, nivel: "alto" });
    }
    void mostrarPergunta(0);
  }, [e.bairro, mostrarPergunta]);

  useEffect(() => {
    const handler = () => {
      iniciarQuizVisual();
    };
    window.addEventListener("vat:iniciar-quiz", handler);
    return () => window.removeEventListener("vat:iniciar-quiz", handler);
  }, [iniciarQuizVisual]);

  const enviarMensagemLivre = async (txt?: string, eAudio?: boolean) => {
    const msg = (txt ?? textoLivre).trim();
    if (!msg || enviandoLivre) return;

    const msgLower = msg.toLowerCase();
    if (msgLower === "quiz" || msgLower.includes("fazer quiz") || msgLower.includes("começar quiz") || msgLower.includes("iniciar quiz")) {
      setTextoLivre("");
      iniciarQuizVisual();
      return;
    }

    setTextoLivre("");
    dispatch({ t: "usuario", texto: eAudio ? `🎤 ${msg}` : msg });
    setEnviandoLivre(true);
    try {
      const res = await fetch("/api/whatsapp/bot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mensagem: msg, eAudio }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.mensagens && Array.isArray(json.mensagens) && json.mensagens.length > 0) {
          const itens: MsgSemId[] = json.mensagens.map((t: string) => ({ k: "bot" as const, texto: t }));
          dispatch({ t: "falar", itens });
        }
      }
    } catch {
      dispatch({ t: "falar", itens: [{ k: "bot", texto: chat.erroServico }] });
    } finally {
      setEnviandoLivre(false);
    }
  };

  const executar = (a: Acao) => {
    switch (a.t) {
      case "pedir-loc":
        return dispatch({ t: "folha", aberta: true });
      case "escolher-bairro":
        dispatch({ t: "usuario", texto: chat.respostas.escolherBairro });
        return dispatch({ t: "falar", itens: [{ k: "bot", texto: chat.qualBairro }], respostas: respostasBairros, passo: 2 });
      case "bairro":
        dispatch({ t: "usuario", texto: a.nome });
        return void consultar({ bairroId: a.id }, a.nome);
      case "comecar-quiz":
        dispatch({ t: "usuario", texto: chat.respostas.comecarQuiz });
        return void mostrarPergunta(0);
      case "refazer":
        dispatch({ t: "usuario", texto: chat.respostas.tentarDeNovo });
        return void mostrarPergunta(a.indice);
      case "compartilhar":
        if (selo) void compartilharLink(`${location.origin}/selo/${selo.id}`);
        return;
      case "ver-selo":
        document.getElementById("selo")?.scrollIntoView({ behavior: reduzido ? "auto" : "smooth" });
        return;
    }
  };

  const enviarLocalizacao = () => {
    dispatch({ t: "folha", aberta: false });
    const falhou = () => {
      dispatch({ t: "usuario", texto: chat.respostas.compartilhar });
      dispatch({ t: "falar", itens: [{ k: "bot", texto: chat.localizacaoFalhou }], respostas: respostasBairros, passo: 2 });
    };
    if (!("geolocation" in navigator)) return falhou();
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        dispatch({ t: "usuario", texto: chat.localizacaoEnviada, loc: true });
        // Só a coordenada arredondada sai do aparelho; o servidor não a guarda.
        void consultar({ lat: arredondar(pos.coords.latitude), lng: arredondar(pos.coords.longitude) }, "Minha localização");
      },
      falhou,
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 300_000 },
    );
  };

  const responder = async (msgId: number, opcaoId: string) => {
    const m = e.msgs.find((x) => x.id === msgId);
    if (!m || m.k !== "quiz" || m.respondida) return;
    const opcao = m.pergunta.opcoes.find((o) => o.id === opcaoId)!;
    const resposta = { perguntaId: m.pergunta.id, opcaoId };
    dispatch({ t: "usuario", texto: opcao.texto });
    try {
      const anteriores = e.certas.filter((c) => c.perguntaId !== resposta.perguntaId);
      const r = await api.corrigir({ respostas: [...anteriores, resposta] });
      const res = r.resultados.find((x) => x.perguntaId === resposta.perguntaId)!;
      dispatch({ t: "marcar-resposta", msgId, opcaoId, correta: res.correta });
      if (!res.correta) {
        return dispatch({
          t: "falar",
          itens: [{ k: "feedback", ok: false, texto: res.explicacao }],
          respostas: [{ rotulo: chat.respostas.tentarDeNovo, icone: "retry", acao: { t: "refazer", indice: m.indice } }],
        });
      }
      dispatch({ t: "acerto", resposta });
      if (m.indice < 2) {
        const ps = e.perguntas!;
        return dispatch({ t: "falar", itens: [{ k: "feedback", ok: true, texto: res.explicacao }, { k: "quiz", indice: m.indice + 1, pergunta: ps[m.indice + 1] }] });
      }
      dispatch({ t: "falar", itens: [{ k: "feedback", ok: true, texto: res.explicacao }, { k: "bot", texto: chat.pedirNome }] });
      dispatch({ t: "entrada-nome", aberta: true });
    } catch {
      dispatch({ t: "falar", itens: [{ k: "bot", texto: chat.erroServico }], respostas: [{ rotulo: chat.respostas.tentarDeNovo, icone: "retry", acao: { t: "refazer", indice: m.indice } }] });
    }
  };

  const enviarNome = async (ev?: FormEvent, pular?: boolean) => {
    ev?.preventDefault();
    const n = pular ? "" : primeiroNome(nome);
    dispatch({ t: "entrada-nome", aberta: false });
    dispatch({ t: "usuario", texto: n || chat.respostas.pular });
    setNome("");
    try {
      const r = await api.corrigir({
        respostas: e.certas,
        primeiroNome: n || undefined,
        bairroId: e.bairro?.id,
        nivel: e.nivel ?? undefined,
      });
      if (!r.seloId || !r.selo) throw new Error("sem selo");
      const obtido = { id: r.seloId, ...r.selo, bairroId: e.bairro?.id };
      setSelo(obtido);
      dispatch({
        t: "falar",
        itens: [{ k: "bot", texto: chat.parabens }, { k: "selo", selo: obtido }, { k: "bot", texto: chat.convidar }],
        respostas: [
          { rotulo: chat.respostas.compartilharSelo, icone: "share", acao: { t: "compartilhar" } },
          { rotulo: chat.respostas.verSelo, icone: "shield", acao: { t: "ver-selo" } },
        ],
        passo: 6,
      });
    } catch {
      dispatch({ t: "falar", itens: [{ k: "bot", texto: chat.erroServico }] });
      dispatch({ t: "entrada-nome", aberta: true });
    }
  };

  const reiniciar = (bairro?: BairroDemo) => {
    dispatch({ t: "reiniciar" });
    if (bairro) {
      dispatch({ t: "usuario", texto: bairro.nome });
      void consultar({ bairroId: bairro.id }, bairro.nome);
    }
  };

  return (
    <div className="flex flex-wrap items-start gap-[clamp(28px,4vw,56px)]">
      <ol aria-label="Passos" className="m-0 flex flex-[1_1_300px] list-none flex-col gap-2.5 p-0">
        {como.passos.map((p, k) => {
          const n = k + 1, ativo = n === e.passo, feito = n < e.passo;
          return (
            <li
              key={p.titulo}
              aria-current={ativo ? "step" : undefined}
              className={`flex gap-4 rounded-[22px] border border-transparent p-[18px] transition-[opacity,box-shadow] duration-[240ms] ease-[var(--ease-out)] ${ativo ? "cartao-ativo" : ""}`}
              style={{ opacity: ativo || feito ? 1 : 0.62 }}
            >
              <span
                className="titulo grid h-10 w-10 flex-none place-items-center rounded-full border-[1.5px] text-base"
                style={{ borderColor: feito ? "#22C55E" : ativo ? "#5AC8FA" : "rgba(185,191,234,.4)", color: ativo ? "#5AC8FA" : "#F5F7FF" }}
              >
                {feito ? <Icon nome="check" tamanho={18} cor="#22C55E" traco={2.2} /> : n}
                {feito && <span className="sr-only">Concluído: passo {n}</span>}
              </span>
              <div className="flex flex-col gap-1 pt-0.5">
                <strong className="text-[17px] font-semibold text-texto">{p.titulo}</strong>
                <span className="text-[15px] leading-[1.45] text-texto-4">{p.texto}</span>
              </div>
            </li>
          );
        })}
      </ol>

      {/* Celular */}
      <div className="flex w-full flex-[0_1_400px] justify-center">
        <div className="relative h-[680px] w-[min(100%,390px)] rounded-[46px] bg-[linear-gradient(160deg,#2A2F86,#0D1046)] p-2.5 shadow-[0_0_0_1px_#3A41A0,0_40px_90px_rgba(3,5,30,.6),0_0_90px_rgba(90,200,250,.16)] min-[820px]:h-[clamp(640px,84vh,780px)]">
          <div ref={telaRef} className="relative flex h-full flex-col overflow-hidden rounded-[36px] bg-tela">
            <div className="flex flex-none items-center gap-3 border-b border-[rgba(154,163,240,.16)] bg-[linear-gradient(180deg,#1E2370,#181D68)] px-3.5 pt-[22px] pb-3">
              <span className="grid h-[42px] w-[42px] place-items-center rounded-full bg-[radial-gradient(circle_at_30%_30%,#2E3AA8,#14185F)] text-ciano shadow-[inset_0_0_0_1.5px_#5AC8FA]">
                <Icon nome="shieldBolt" tamanho={22} cor="#5AC8FA" />
              </span>
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <strong className="truncate text-[15.5px] font-semibold">{chat.nomeBot}</strong>
                <span className="text-[12.5px] text-[#9FE0FF]">{e.digitando ? chat.digitando : chat.online}</span>
              </div>
              <button
                type="button"
                onClick={iniciarQuizVisual}
                title="Iniciar o Quiz imediatamente"
                className="text-[11px] font-semibold bg-[rgba(90,200,250,.18)] hover:bg-[rgba(90,200,250,.3)] text-[#5AC8FA] px-2.5 py-1 rounded-full border border-[rgba(90,200,250,.3)] transition-colors active:scale-95 cursor-pointer shrink-0"
              >
                🏆 Quiz Direto
              </button>
              <TagSimulacao />
            </div>

            <div ref={logRef} role="log" aria-live="polite" aria-label={chat.rotuloLog} className="chat-log flex flex-1 flex-col gap-2.5 overflow-y-auto px-3 pt-4 pb-3" data-testid="chat-log">
              {e.msgs.map((m) => (
                <div key={m.id} className={`entra flex flex-col ${m.k === "eu" || m.k === "eu-loc" ? "items-end" : "items-start"}`}>
                  <Mensagem m={m} aoResponder={responder} />
                </div>
              ))}
              {e.digitando && (
                <div aria-label={chat.digitandoAria} role="status" className="bolha-bot flex gap-[5px] px-4 py-3.5">
                  {[0, 0.15, 0.3].map((d) => (
                    <span key={d} className="h-[7px] w-[7px] rounded-full bg-[#9FE0FF] [animation:vat-dot_1.1s_ease-in-out_infinite]" style={{ animationDelay: `${d}s` }} />
                  ))}
                </div>
              )}
            </div>

            {(e.respostas.length > 0 || e.entradaNome) && (
              <div className="flex flex-none flex-wrap gap-2 border-t border-[rgba(154,163,240,.12)] bg-tela px-3 py-2.5">
                {e.respostas.map((r) => (
                  <button key={r.rotulo} type="button" onClick={() => executar(r.acao)} className="btn btn-chip entra">
                    <Icon nome={r.icone} tamanho={18} />
                    {r.rotulo}
                  </button>
                ))}
                {e.entradaNome && (
                  <button type="button" onClick={() => void enviarNome(undefined, true)} className="btn btn-chip entra">
                    {chat.respostas.pular}
                  </button>
                )}
              </div>
            )}

            {e.entradaNome ? (
              <form onSubmit={(ev) => void enviarNome(ev)} className="flex flex-none items-center gap-2 bg-marinho px-3 pt-2 pb-3.5">
                <label htmlFor="nome-selo" className="sr-only">
                  {chat.nomeRotulo}
                </label>
                <input
                  id="nome-selo"
                  value={nome}
                  onChange={(ev) => setNome(ev.target.value)}
                  placeholder={chat.nomePlaceholder}
                  autoComplete="given-name"
                  autoCapitalize="words"
                  enterKeyHint="send"
                  maxLength={40}
                  className="min-h-12 min-w-0 flex-1 rounded-full border border-borda bg-superficie px-4 text-texto outline-none placeholder:text-[#8E95CF] focus-visible:border-ciano"
                />
                <button type="submit" aria-label={chat.nomeEnviar} className="grid h-12 w-12 flex-none cursor-pointer place-items-center rounded-full border-0 bg-[linear-gradient(135deg,#5AC8FA,#8B5CF6)] text-[#0D1046] active:scale-95">
                  <Icon nome="send" />
                </button>
              </form>
            ) : (
              <div className="flex flex-col flex-none bg-marinho">
                <div className="flex items-center gap-1.5 overflow-x-auto px-3 py-1.5 scrollbar-none border-t border-[rgba(185,191,234,.12)]">
                  <span className="text-[11px] font-semibold text-[#8E95CF] shrink-0 uppercase tracking-wider mr-1">Dúvidas:</span>
                  {sugestoesRapidas.map((s, idx) => (
                    <button
                      key={idx}
                      type="button"
                      disabled={enviandoLivre || e.digitando}
                      onClick={() => void enviarMensagemLivre(s.texto)}
                      className="shrink-0 text-[12px] bg-[rgba(154,163,240,.12)] hover:bg-[rgba(154,163,240,.24)] text-[#E2E6FF] px-2.5 py-1 rounded-full border border-[rgba(154,163,240,.2)] transition-colors active:scale-95 disabled:opacity-50 cursor-pointer"
                    >
                      {s.rotulo}
                    </button>
                  ))}
                </div>
                <form
                  onSubmit={(ev) => {
                    ev.preventDefault();
                    void enviarMensagemLivre();
                  }}
                  className="flex items-center gap-2 px-3 pt-1 pb-3.5"
                >
                  <label htmlFor="mensagem-bot-livre" className="sr-only">
                    Digite sua dúvida para o EquaBot
                  </label>
                  <input
                    id="mensagem-bot-livre"
                    value={textoLivre}
                    onChange={(ev) => setTextoLivre(ev.target.value)}
                    placeholder="Pergunte ao EquaBot (ex: cabo caído, TV queimou)..."
                    disabled={enviandoLivre || e.digitando}
                    autoComplete="off"
                    enterKeyHint="send"
                    className="min-h-12 min-w-0 flex-1 rounded-full border border-borda bg-superficie px-4 text-[14px] text-texto outline-none placeholder:text-[#8E95CF] focus-visible:border-ciano disabled:opacity-60"
                  />
                  <button
                    type="button"
                    title="Simular envio de áudio para transcrição (Whisper)"
                    aria-label="Simular gravação de áudio para o EquaBot"
                    disabled={enviandoLivre || e.digitando}
                    onClick={() =>
                      void enviarMensagemLivre(
                        "Olá EquaBot, caiu um cabo na minha rua aqui em São Luís e minha TV queimou com a queda de energia, o que eu faço?",
                        true
                      )
                    }
                    className="grid h-12 w-12 flex-none cursor-pointer place-items-center rounded-full bg-[linear-gradient(135deg,#5AC8FA,#8B5CF6)] text-[#0D1046] active:scale-95 disabled:opacity-50 hover:brightness-110 transition-transform"
                  >
                    <Icon nome="mic" />
                  </button>
                  {textoLivre.trim().length > 0 && (
                    <button
                      type="submit"
                      aria-label="Enviar mensagem para o EquaBot"
                      disabled={enviandoLivre || e.digitando}
                      className="grid h-12 w-12 flex-none cursor-pointer place-items-center rounded-full bg-ciano text-[#0D1046] active:scale-95 disabled:opacity-50 transition-transform"
                    >
                      <Icon nome="send" />
                    </button>
                  )}
                </form>
              </div>
            )}

            <Drawer.Root open={e.folha} onOpenChange={(aberta) => dispatch({ t: "folha", aberta })} swipeDirection="down">
              <Drawer.Portal container={telaRef}>
                <Drawer.Backdrop className="folha-fundo absolute inset-0 z-[5] bg-[rgba(5,7,35,.62)]" />
                <Drawer.Viewport className="absolute inset-0 z-[6] flex flex-col justify-end">
                  <Drawer.Popup className="folha-popup flex flex-col gap-3.5 rounded-t-[26px] bg-superficie px-[18px] pt-2.5 pb-[calc(22px+env(safe-area-inset-bottom,0px))] shadow-[0_-1px_0_#5AC8FA,0_-20px_60px_rgba(0,0,0,.4)] outline-none [transform:translateY(var(--drawer-swipe-movement-y,0px))]">
                    <span aria-hidden="true" className="h-1 w-10 self-center rounded bg-[rgba(185,191,234,.4)]" />
                    <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[rgba(90,200,250,.14)] text-ciano">
                      <Icon nome="pin" tamanho={24} />
                    </span>
                    <Drawer.Title className="titulo m-0 text-[22px] leading-[1.1]">{sheet.titulo}</Drawer.Title>
                    <Drawer.Description className="m-0 text-[15.5px] leading-[1.45] text-texto-2">{sheet.texto}</Drawer.Description>
                    <button type="button" onClick={enviarLocalizacao} className="btn btn-cta !min-h-[52px] !text-base" style={{ ["--cta-fundo" as string]: "#1E2370" }}>
                      <Icon nome="pin" />
                      {sheet.enviar}
                    </button>
                    <button
                      type="button"
                      className="btn !min-h-[52px]"
                      onClick={() => {
                        dispatch({ t: "folha", aberta: false });
                        executar({ t: "escolher-bairro" });
                      }}
                    >
                      <Icon nome="house" />
                      {sheet.bairro}
                    </button>
                    <Drawer.Close className="min-h-11 cursor-pointer border-0 bg-transparent text-[15px] font-medium text-ciano-claro">{sheet.agoraNao}</Drawer.Close>
                  </Drawer.Popup>
                </Drawer.Viewport>
              </Drawer.Portal>
            </Drawer.Root>
          </div>
        </div>
      </div>

      {/* Bairros de demonstração */}
      <div className="flex flex-[1_1_300px] flex-col gap-3.5">
        <div className="cartao-borda flex flex-col gap-3.5 rounded-[24px] p-[18px]">
          <div className="flex items-center justify-between gap-2">
            <strong className="font-semibold">{mapa.titulo}</strong>
            <TagSimulacao />
          </div>
          <svg viewBox="0 0 360 240" width="100%" role="img" aria-label={mapa.aria} className="block rounded-2xl bg-[#10145A]">
            <defs>
              <linearGradient id="mapa-l" x1="0" x2="1">
                <stop offset="0" stopColor="#5AC8FA" />
                <stop offset="1" stopColor="#8B5CF6" />
              </linearGradient>
              <filter id="mapa-b">
                <feGaussianBlur stdDeviation="4" />
              </filter>
            </defs>
            <path d="M0 60H360M0 120H360M0 180H360M60 0V240M140 0V240M220 0V240M300 0V240" stroke="#1E2370" strokeWidth="1" />
            {bairros.map((b) => {
              const c = MAPA_IDS[b.id];
              if (!c) return null;
              const sel = e.bairro?.id === b.id;
              return <circle key={b.id} cx={c.cx} cy={c.cy} r={c.r} fill={c.fill} stroke={sel ? VISUAL_NIVEL[b.nivel].cor : "rgba(185,191,234,.35)"} strokeWidth={sel ? 2.5 : 1} />;
            })}
            <path d="M-10 40 L370 150" stroke="#5AC8FA" strokeWidth="6" opacity=".4" filter="url(#mapa-b)" />
            <path d="M-10 40 L370 150" stroke="url(#mapa-l)" strokeWidth="2.2" />
            <path d="M40 50l6 4-6 4-6-4zM120 73l6 4-6 4-6-4zM200 96l6 4-6 4-6-4zM280 119l6 4-6 4-6-4z" fill="#14185F" stroke="#9AA3F0" strokeWidth="1.4" />
            <rect x="226" y="138" width="30" height="22" rx="4" fill="#14185F" stroke="#8B5CF6" strokeWidth="1.6" />
            <path d="M241 143l-4 6h4l-2 6 6-8h-4l2-4z" fill="#B9A4FF" />
            {bairros.map((b) => {
              const c = MAPA_IDS[b.id];
              if (!c) return null;
              return (
                <text key={b.id} x={c.cx} y={c.cy + c.r + 14} textAnchor="middle" fill="#F5F7FF" fontSize="11.5">
                  {b.nome}
                </text>
              );
            })}
          </svg>
          <div className="flex flex-col gap-2">
            {bairros.map((b) => {
              const v = VISUAL_NIVEL[b.nivel], sel = e.bairro?.id === b.id;
              return (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => reiniciar(b)}
                  aria-pressed={sel}
                  className="flex min-h-14 cursor-pointer items-center gap-3 rounded-2xl px-3 py-2 text-left text-texto transition-colors duration-150 [@media(hover:hover)_and_(pointer:fine)]:hover:bg-[rgba(154,163,240,.1)]"
                  style={{ border: `1px solid ${sel ? v.cor : "rgba(154,163,240,.18)"}`, background: sel ? "rgba(154,163,240,.1)" : "transparent" }}
                >
                  <span className="grid h-[34px] w-[34px] place-items-center rounded-xl" style={{ background: v.tinta }}>
                    <Icon nome={v.icone} tamanho={18} cor={v.cor} />
                  </span>
                  <span className="flex flex-1 flex-col gap-0.5">
                    <strong className="text-[15.5px] font-semibold">{b.nome}</strong>
                    <span className="text-[13.5px] text-texto-4">{b.descricao}</span>
                  </span>
                  <span className="text-[13px] font-semibold" style={{ color: v.cor }}>
                    {niveis[b.nivel].curto}
                  </span>
                </button>
              );
            })}
          </div>
          <p className="m-0 text-[13.5px] leading-[1.45] text-texto-5">{mapa.nota}</p>
        </div>
        <button type="button" onClick={() => reiniciar()} className="btn !min-h-12 self-start !border-transparent !px-3 !text-[15px] !text-ciano-claro">
          <Icon nome="retry" />
          {chat.recomecar}
        </button>
      </div>
    </div>
  );
}
