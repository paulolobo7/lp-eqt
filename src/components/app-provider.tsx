"use client";

import { Dialog } from "@base-ui/react/dialog";
import { createContext, useCallback, useContext, useMemo, useState, type MouseEvent, type ReactNode } from "react";
import { Toaster } from "sonner";
import { cta } from "@/content/site";
import { Icon } from "./icon";

export type SeloObtido = {
  id: string;
  codigo: string;
  primeiroNome: string;
  bairro: string;
  bairroId?: string;
  data: string;
};

type Ctx = {
  linkWhatsApp: string;
  /** Em desktop (ponteiro fino), abre o QR; no celular o link segue direto. */
  aoClicarCta: (e: MouseEvent<HTMLAnchorElement>) => void;
  selo: SeloObtido | null;
  setSelo: (s: SeloObtido | null) => void;
};

const AppCtx = createContext<Ctx | null>(null);

export function useApp() {
  const c = useContext(AppCtx);
  if (!c) throw new Error("useApp fora do AppProvider");
  return c;
}

export function AppProvider({
  children,
  linkWhatsApp,
  qrSvg,
  numeroRotulo,
}: {
  children: ReactNode;
  linkWhatsApp: string;
  qrSvg: string;
  numeroRotulo: ReactNode;
}) {
  const [qrAberto, setQrAberto] = useState(false);
  const [selo, setSelo] = useState<SeloObtido | null>(null);

  const aoClicarCta = useCallback(
    (e: MouseEvent<HTMLAnchorElement>) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const desktop = window.matchMedia("(hover: hover) and (pointer: fine) and (min-width: 820px)").matches;
      if (desktop) {
        e.preventDefault();
        setQrAberto(true);
        return;
      }
      // No celular, um link wa.me válido segue direto. Sem número, leva ao simulador.
      if (!linkWhatsApp.startsWith("https://wa.me/")) {
        const el = document.getElementById("como");
        if (el) {
          e.preventDefault();
          el.scrollIntoView({ behavior: "smooth" });
        }
      }
    },
    [linkWhatsApp],
  );

  const valor = useMemo(() => ({ linkWhatsApp, aoClicarCta, selo, setSelo }), [linkWhatsApp, aoClicarCta, selo]);

  return (
    <AppCtx.Provider value={valor}>
      {children}
      <Dialog.Root open={qrAberto} onOpenChange={setQrAberto}>
        <Dialog.Portal>
          <Dialog.Backdrop className="dialogo-fundo z-[90]" />
          <Dialog.Viewport className="fixed inset-0 z-[91] grid place-items-center p-4">
            <Dialog.Popup className="dialogo-popup cartao-borda flex w-[min(420px,100%)] flex-col gap-4 rounded-[28px] p-7 outline-none">
              <div className="flex items-start justify-between gap-3">
                <Dialog.Title className="titulo text-[26px] leading-[1.1]">{cta.qrTituloDesktop}</Dialog.Title>
                <Dialog.Close className="btn !min-h-12 !w-12 !rounded-[14px] !p-0" aria-label={cta.fechar}>
                  <Icon nome="x" />
                </Dialog.Close>
              </div>
              <Dialog.Description className="m-0 text-texto-2">{cta.qrTextoDesktop}</Dialog.Description>
              {qrSvg ? (
                <div
                  className="self-center rounded-[20px] bg-texto p-4 [&_svg]:block [&_svg]:h-[200px] [&_svg]:w-[200px]"
                  role="img"
                  aria-label={cta.qrRotulo}
                  dangerouslySetInnerHTML={{ __html: qrSvg }}
                />
              ) : (
                <p className="m-0 rounded-[16px] border border-[rgba(185,191,234,.22)] bg-[rgba(154,163,240,.08)] p-3 text-center text-sm text-texto-3">
                  Defina <span className="font-mono text-brand-celeste">WHATSAPP_NUMERO</span> no{" "}
                  <span className="font-mono text-brand-celeste">.env.local</span> para gerar o QR code.
                </p>
              )}
              <div className="flex flex-col gap-2.5 w-full">
                <button
                  type="button"
                  onClick={() => {
                    setQrAberto(false);
                    const el = document.getElementById("como");
                    if (el) {
                      el.scrollIntoView({ behavior: "smooth" });
                    }
                    setTimeout(() => {
                      window.dispatchEvent(new CustomEvent("vat:iniciar-quiz"));
                    }, 350);
                  }}
                  className="btn btn-cta w-full justify-center text-center cursor-pointer"
                >
                  <Icon nome="chat" />
                  Iniciar o Quiz do EquaBot (Simulador)
                </button>
                {linkWhatsApp !== "#como" ? (
                  <a
                    href={linkWhatsApp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-contorno w-full justify-center text-center text-sm"
                  >
                    {cta.qrAbrirAqui}
                  </a>
                ) : (
                  <p className="m-0 text-center text-xs text-texto-4 px-2">
                    💡 Para testar no WhatsApp real, defina o número no arquivo <span className="text-brand-celeste font-mono">.env.local</span>.
                  </p>
                )}
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2 text-sm text-texto-4">
                {cta.qrRodape} {numeroRotulo}
              </div>
            </Dialog.Popup>
          </Dialog.Viewport>
        </Dialog.Portal>
      </Dialog.Root>
      <Toaster
        position="bottom-center"
        offset={{ bottom: "calc(96px + env(safe-area-inset-bottom, 0px))" }}
        mobileOffset={{ bottom: "calc(96px + env(safe-area-inset-bottom, 0px))" }}
        toastOptions={{
          style: {
            background: "#1E2370",
            border: "1px solid #22C55E",
            color: "#F5F7FF",
            borderRadius: 999,
            fontSize: 15,
          },
        }}
      />
    </AppCtx.Provider>
  );
}

/** CTA principal: um link wa.me que funciona sem JavaScript. */
export function CtaWhatsApp({
  children,
  className = "btn btn-cta",
  fundo,
  testId,
}: {
  children?: ReactNode;
  className?: string;
  fundo?: string;
  testId?: string;
}) {
  const { linkWhatsApp, aoClicarCta } = useApp();
  return (
    <a
      href={linkWhatsApp}
      onClick={aoClicarCta}
      className={className}
      style={fundo ? ({ "--cta-fundo": fundo } as React.CSSProperties) : undefined}
      data-testid={testId}
    >
      <Icon nome="chat" />
      {children ?? cta.principal}
    </a>
  );
}
