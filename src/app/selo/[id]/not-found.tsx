import Link from "next/link";
import { seloPagina } from "@/content/site";

export default function SeloNaoEncontrado() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-6 bg-[linear-gradient(180deg,#0B0E3A,#14185F)] px-5 text-center">
      <h1 className="titulo m-0 text-[clamp(24px,6vw,34px)]">{seloPagina.invalido}</h1>
      <Link href="/" className="btn btn-cta">{seloPagina.voltar}</Link>
    </main>
  );
}
