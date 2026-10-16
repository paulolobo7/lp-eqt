"use client";

import { useEffect, useState } from "react";
import { nav } from "@/content/site";
import { CtaWhatsApp } from "../app-provider";

/** M10: barra fixa "Falar no WhatsApp" no celular depois do Hero, respeitando a área segura. */
export function BarraMovel() {
  const [ver, setVer] = useState(false);
  useEffect(() => {
    const historia = document.getElementById("topo");
    if (!historia) return;
    // Aparece quando o fim da história passa de 60% da tela, como no design.
    const io = new IntersectionObserver(([en]) => setVer(!en.isIntersecting && en.boundingClientRect.top < 0), {
      rootMargin: "0px 0px -40% 0px",
    });
    io.observe(historia);
    return () => io.disconnect();
  }, []);
  if (!ver) return null;
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[rgba(154,163,240,.2)] bg-[rgba(11,14,58,.92)] px-4 pt-2.5 pb-[calc(10px+env(safe-area-inset-bottom,0px))] backdrop-blur-[14px] [animation:vat-up_240ms_var(--ease-out)_both] min-[820px]:hidden">
      <CtaWhatsApp className="btn btn-cta w-full !min-h-[54px]">{nav.ctaBarra}</CtaWhatsApp>
    </div>
  );
}
