import { gerarCena } from "./gerar-cena";

/** A mesma cena em duas larguras; o CSS mostra a certa (sem JS). */
export function Cena({ prefixo, still, seed }: { prefixo: string; still?: boolean; seed?: number }) {
  return (
    <>
      <div className="cena-desktop h-full w-full" dangerouslySetInnerHTML={{ __html: gerarCena(1440, { prefixo: `${prefixo}d`, still, seed }) }} />
      <div className="cena-celular h-full w-full" dangerouslySetInnerHTML={{ __html: gerarCena(520, { prefixo: `${prefixo}m`, still, seed }) }} />
    </>
  );
}
