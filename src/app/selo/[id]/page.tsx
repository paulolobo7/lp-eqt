import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { PH } from "@/content/placeholders";
import { cta, marca, selo as textosSelo, seloPagina } from "@/content/site";
import { Icon } from "@/components/icon";
import { LogoPh } from "@/components/ui";
import { getServices } from "@/lib/services";
import { dataBR } from "@/lib/texto";
import { linkWhatsApp } from "@/lib/whatsapp";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const selo = await getServices().badge.ler(id);
  if (!selo) return { title: `${marca.nome}`, robots: { index: false } };
  const titulo = seloPagina.titulo(selo.primeiroNome);
  const img = (f: "status" | "square") => `/api/badge/${encodeURIComponent(id)}?format=${f}`;
  return {
    title: titulo,
    description: seloPagina.descricao,
    robots: { index: false },
    openGraph: {
      title: titulo,
      description: seloPagina.descricao,
      type: "website",
      locale: "pt_BR",
      images: [
        { url: img("square"), width: 1080, height: 1080, alt: `${textosSelo.linha1} ${textosSelo.linha2}: ${selo.primeiroNome}` },
        { url: img("status"), width: 1080, height: 1350, alt: `${textosSelo.linha1} ${textosSelo.linha2}: ${selo.primeiroNome}` },
      ],
    },
    twitter: { card: "summary_large_image", title: titulo, description: seloPagina.descricao, images: [img("square")] },
  };
}

async function Conteudo({ params }: Props) {
  const { id } = await params;
  const selo = await getServices().badge.ler(id);
  const link = linkWhatsApp(process.env.WHATSAPP_NUMERO?.replace(/\D/g, ""), cta.mensagemPronta);
  if (!selo) {
    return (
      <div className="flex flex-col items-center gap-6 text-center">
        <h1 className="m-0 text-lg font-normal text-texto-3">{seloPagina.invalido}</h1>
        <Link href="/" className="btn btn-cta">{seloPagina.voltar}</Link>
      </div>
    );
  }
  return (
    <div className="flex w-full max-w-[420px] flex-col items-center gap-8">
      <h1 className="titulo m-0 text-center text-[clamp(28px,7vw,40px)] leading-[1.05]">{seloPagina.titulo(selo.primeiroNome)}</h1>
      {/* PNG gerado pela própria rota no tamanho final: sem otimização extra. */}
      <Image
        unoptimized
        priority
        src={`/api/badge/${encodeURIComponent(id)}?format=status`}
        width={1080}
        height={1350}
        alt={`${textosSelo.linha1} ${textosSelo.linha2}: ${selo.primeiroNome}, ${selo.bairro}, ${dataBR(selo.data)}, código ${selo.codigo}`}
        className="h-auto w-full rounded-[28px] shadow-[0_40px_90px_rgba(3,5,30,.65),0_0_80px_rgba(90,200,250,.28)]"
      />
      <p className="m-0 text-center text-lg text-texto-3">{seloPagina.convite}</p>
      <div className="flex flex-wrap justify-center gap-3">
        <a href={link} className="btn btn-cta">
          <Icon nome="chat" />
          {cta.principal}
        </a>
        <Link href="/" className="btn !min-h-14">{seloPagina.voltar}</Link>
      </div>
      {link.includes(PH.numero) && <p className="m-0 text-sm text-texto-5">wa.me/<span className="ph">{PH.numero}</span></p>}
    </div>
  );
}

export default function PaginaSelo(props: Props) {
  return (
    <main className="flex min-h-svh flex-col items-center gap-10 bg-[radial-gradient(60%_50%_at_50%_0%,rgba(90,200,250,.14),transparent_70%),linear-gradient(180deg,#0B0E3A,#14185F)] px-5 pt-[calc(32px+env(safe-area-inset-top,0px))] pb-[calc(48px+env(safe-area-inset-bottom,0px))]">
      <Link href="/" className="flex min-h-12 items-center gap-3 text-texto no-underline">
        <LogoPh curto rotulo="LOGO" />
        <span className="titulo flex items-center gap-2 text-[17px]">
          <Icon nome="shieldBolt" tamanho={22} cor="#5AC8FA" />
          {marca.nome}
        </span>
      </Link>
      <Suspense fallback={<div className="aspect-[4/5] w-full max-w-[420px] rounded-[28px] bg-superficie" aria-busy="true" />}>
        <Conteudo params={props.params} />
      </Suspense>
    </main>
  );
}
