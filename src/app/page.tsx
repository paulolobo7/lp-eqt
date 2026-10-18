import QRCode from "qrcode";
import { PH } from "@/content/placeholders";
import { como, cta } from "@/content/site";
import { AppProvider } from "@/components/app-provider";
import { Experimente } from "@/components/experimente/experimente";
import { Header } from "@/components/header";
import { RolagemAlternativa } from "@/components/scene/rolagem-alternativa";
import { BarraMovel } from "@/components/secoes/barra-movel";
import { BrilhoCursor } from "@/components/secoes/brilho";
import { Banca, Convite, Impacto, Risco, Rodape } from "@/components/secoes/estaticas";
import { Historia, ProblemaEstatico } from "@/components/secoes/historia";
import { SecaoSelo } from "@/components/secoes/selo";
import { Vizinhanca } from "@/components/secoes/vizinhanca";
import { Kicker, Ph } from "@/components/ui";
import { getServices } from "@/lib/services";
import { seloDeExemplo } from "@/lib/site";
import { linkWhatsApp, numeroWhatsAppValido } from "@/lib/whatsapp";

export default async function Home() {
  const svc = getServices();
  const [bairros, contagem, exemplo] = await Promise.all([
    svc.proximity.listarBairros(),
    svc.community.contagemPorBairro(),
    seloDeExemplo(),
  ]);
  const numero = (process.env.WHATSAPP_NUMERO || "5598984860486").replace(/\D/g, "");
  const link = linkWhatsApp(numero, cta.mensagemPronta);
  const qrSvg = await QRCode.toString(link, { type: "svg", margin: 0, color: { dark: "#14185F", light: "#F5F7FF" }, errorCorrectionLevel: "M" });

  const rotuloFormatado = numeroWhatsAppValido(numero) ? (
    <span className="inline-flex items-center gap-1.5 font-mono font-medium text-brand-celeste">
      +{numero.slice(0, 2)} ({numero.slice(2, 4)}) {numero.length === 13 ? `${numero.slice(4, 9)}-${numero.slice(9)}` : `${numero.slice(4, 8)}-${numero.slice(8)}`}
      <span className="text-[11px] font-sans bg-[rgba(90,200,250,.15)] text-brand-celeste px-2 py-0.5 rounded-full border border-[rgba(90,200,250,.25)]">
        EquaBot · Projeto #486
      </span>
    </span>
  ) : (
    <Ph>{PH.numero}</Ph>
  );

  return (
    <AppProvider linkWhatsApp={link} qrSvg={qrSvg} numeroRotulo={rotuloFormatado}>
      <a href="#como" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:rounded-lg focus:bg-superficie focus:p-3">
        Pular para Como funciona
      </a>
      <Header />
      <main className="bg-[linear-gradient(180deg,#0B0E3A_0%,#14185F_30%,#171C66_75%,#1E2370_100%)]">
        <Historia />
        <ProblemaEstatico />
        <section id="como" aria-labelledby="como-t" className="relative mx-auto max-w-[1320px] px-[clamp(20px,5vw,64px)] py-[clamp(80px,10vw,140px)]">
          <Kicker>{como.kicker}</Kicker>
          <h2 id="como-t" className="titulo-secao mt-[18px] mb-4 max-w-[820px]">{como.titulo}</h2>
          <p id="experimente" className="m-0 mb-[clamp(36px,5vw,64px)] max-w-[560px] scroll-mt-24 text-lg text-texto-3">
            {como.texto}
          </p>
          <Experimente bairros={bairros} />
        </section>
        <SecaoSelo exemplo={exemplo} beneficio={PH.beneficio} />
        <Vizinhanca contagem={contagem} />
        <Impacto />
        <Risco />
        <Banca />
        <Convite />
      </main>
      <Rodape />
      <BarraMovel />
      <BrilhoCursor />
      <RolagemAlternativa alvo="topo" rede="rede-viva" />
    </AppProvider>
  );
}
