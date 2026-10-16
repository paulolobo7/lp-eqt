"use client";

import { Dialog } from "@base-ui/react/dialog";
import { useState } from "react";
import { toast } from "sonner";
import { PH } from "@/content/placeholders";
import { marca, nav, risco } from "@/content/site";
import { CtaWhatsApp } from "./app-provider";
import { Icon } from "./icon";
import { LogoPh } from "./ui";

export function Header() {
  const [menu, setMenu] = useState(false);
  return (
    <header className="nav-topo fixed inset-x-0 top-0 z-50 isolate pt-[env(safe-area-inset-top,0px)]">
      <nav aria-label="Principal" className="mx-auto flex min-h-[68px] max-w-[1320px] items-center gap-7 px-[clamp(16px,4vw,40px)] py-2.5 max-[389px]:gap-3">
        <a href="#topo" className="mr-auto flex min-h-12 items-center gap-3 text-texto no-underline max-[389px]:gap-2">
          <span aria-hidden="true" className="hidden sm:inline-flex"><LogoPh rotulo={marca.logoRotulo} /></span>
          <span aria-hidden="true" className="inline-flex sm:hidden"><LogoPh curto rotulo={marca.logoRotulo} /></span>
          <span className="titulo flex items-center gap-2 text-[17px] text-texto max-[389px]:text-[15px]">
            <Icon nome="shieldBolt" tamanho={22} cor="#5AC8FA" />
            {marca.nome}
            <span className="sr-only">, início</span>
          </span>
        </a>
        <div className="hidden items-center gap-[26px] min-[1100px]:flex">
          {nav.links.map((l) => (
            <a key={l.href} href={l.href} className="text-[15px] text-texto-2 no-underline">
              {l.rotulo}
            </a>
          ))}
          <CtaWhatsApp className="btn btn-contorno !min-h-11 !px-[18px] !text-[15px]">{nav.ctaCurto}</CtaWhatsApp>
        </div>
        <Dialog.Root open={menu} onOpenChange={setMenu}>
          <Dialog.Trigger className="btn !h-12 !w-12 !rounded-[14px] !p-0 min-[1100px]:!hidden" aria-label={nav.abrirMenu}>
            <Icon nome="menu" />
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Popup
              className="dialogo-popup menu-popup fixed inset-0 z-[80] flex flex-col overflow-y-auto px-[clamp(16px,4vw,40px)] pt-[calc(10px+env(safe-area-inset-top,0px))] pb-[calc(16px+env(safe-area-inset-bottom,0px))] outline-none"
              aria-label="Menu"
            >
              {/* Mesma linha do cabeçalho: ao abrir, só o ícone do botão troca. */}
              <div className="flex min-h-12 items-center gap-3 max-[389px]:gap-2">
                <span aria-hidden="true" className="hidden sm:inline-flex"><LogoPh rotulo={marca.logoRotulo} /></span>
                <span aria-hidden="true" className="inline-flex sm:hidden"><LogoPh curto rotulo={marca.logoRotulo} /></span>
                <Dialog.Title className="titulo m-0 mr-auto flex items-center gap-2 text-[17px] text-texto max-[389px]:text-[15px]">
                  <Icon nome="shieldBolt" tamanho={22} cor="#5AC8FA" />
                  {marca.nome}
                </Dialog.Title>
                <Dialog.Close className="btn !h-12 !w-12 !rounded-[14px] !p-0" aria-label={nav.fecharMenu}>
                  <Icon nome="x" />
                </Dialog.Close>
              </div>
              <nav aria-label="Menu" className="mt-8 flex flex-col">
                {nav.menuLinks.map((l) => (
                  <a
                    key={l.href + l.rotulo}
                    href={l.href}
                    onClick={() => setMenu(false)}
                    className="titulo flex min-h-16 items-center justify-between border-b border-[rgba(154,163,240,.14)] text-[26px] text-texto no-underline"
                  >
                    {l.rotulo}
                    <Icon nome="arrow" cor="#5AC8FA" />
                  </a>
                ))}
              </nav>
              <div className="mt-auto flex flex-col gap-2.5 pt-8">
                <button
                  type="button"
                  className="btn btn-alerta"
                  onClick={() => toast.success(risco.canalToast(PH.canal))}
                >
                  <Icon nome="phone" />
                  {nav.riscoMenu}
                </button>
                <CtaWhatsApp className="btn btn-cta" fundo="#0F1350">
                  {nav.ctaBarra}
                </CtaWhatsApp>
              </div>
            </Dialog.Popup>
          </Dialog.Portal>
        </Dialog.Root>
      </nav>
    </header>
  );
}
