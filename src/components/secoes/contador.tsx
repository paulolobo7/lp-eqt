"use client";

import { vizinhanca as t } from "@/content/site";
import type { ContagemBairro } from "@/lib/services/types";
import { useApp } from "../app-provider";

/** Soma +1 no bairro de quem ganhou o selo nesta visita (só na tela, nada é gravado). */
export function Contador({ contagem }: { contagem: ContagemBairro[] }) {
  const { selo } = useApp();
  const linhas = contagem
    .map((c) => {
      const voce = !!selo && selo.bairroId === c.id;
      return { ...c, n: c.vizinhos + (voce ? 1 : 0), voce };
    })
    .sort((a, b) => b.n - a.n);
  const max = Math.max(...linhas.map((l) => l.n), 1);
  return (
    <ul className="m-0 flex list-none flex-col gap-4 p-0">
      {linhas.map((c) => (
        <li key={c.id} className="flex flex-col gap-1.5">
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-[15.5px]">
              {c.nome}
              {c.voce && <span className="ml-2 text-[12.5px] font-semibold text-ok">{t.voce}</span>}
            </span>
            <strong className="titulo text-xl">{c.n}</strong>
          </div>
          <span aria-hidden="true" className="h-1.5 overflow-hidden rounded-md bg-[rgba(154,163,240,.14)]">
            <span className="block h-full origin-left rounded-md bg-[linear-gradient(90deg,#5AC8FA,#8B5CF6)]" style={{ transform: `scaleX(${c.n / max})` }} />
          </span>
        </li>
      ))}
    </ul>
  );
}
