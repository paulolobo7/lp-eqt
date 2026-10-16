import { vizinhanca as t } from "@/content/site";
import type { ContagemBairro } from "@/lib/services/types";
import { gerarRede } from "../scene/gerar-cena";
import { Kicker, TagSimulacao } from "../ui";
import { Contador } from "./contador";

/** D6/M9: rede de casas acendendo + contador agregado (dados fictícios). */
export function Vizinhanca({ contagem }: { contagem: ContagemBairro[] }) {
  return (
    <section id="vizinhanca" aria-labelledby="viz-t" className="mx-auto max-w-[1320px] px-[clamp(20px,5vw,64px)] py-[clamp(80px,10vw,140px)]">
      <Kicker>{t.kicker}</Kicker>
      <h2 id="viz-t" className="titulo-secao mt-[18px] mb-4 max-w-[820px]">{t.titulo}</h2>
      <p className="m-0 mb-[clamp(32px,4vw,56px)] max-w-[600px] text-lg text-texto-3">{t.texto}</p>
      <div className="flex flex-wrap items-stretch gap-6">
        <div
          id="rede-viva"
          role="img"
          aria-label={t.redeAria}
          className="rede-viva flex-[2_1_460px] rounded-[28px] border border-[rgba(154,163,240,.16)] bg-[#10145A] bg-[radial-gradient(70%_70%_at_50%_50%,rgba(90,200,250,.08),transparent_70%)] p-[clamp(12px,2vw,28px)]"
          dangerouslySetInnerHTML={{ __html: gerarRede(820, 420, 26, "rede") }}
        />
        <div className="cartao-borda flex flex-[1_1_300px] flex-col gap-4 rounded-[28px] p-[22px]">
          <div className="flex items-center justify-between gap-2">
            <h3 className="m-0 text-base font-semibold">{t.contadorTitulo}</h3>
            <TagSimulacao>{t.dadosFicticios}</TagSimulacao>
          </div>
          <Contador contagem={contagem} />
          <p className="mt-auto mb-0 text-[13.5px] leading-[1.45] text-texto-5">{t.nota}</p>
        </div>
      </div>
    </section>
  );
}
