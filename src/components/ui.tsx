import Image from "next/image";
import type { ReactNode } from "react";
import { simulacao } from "@/content/site";
// Logo oficial do Grupo Equatorial Energia, versão branca (a "D" é a de fundo escuro, como o do site).
// Usar sempre inteiro e na proporção original (1545×458): só mudar o tamanho, pela altura.
import logoEquatorial from "@/assets/logos/Logos Equatorial/EQTL3.SA_BIG.D.svg";

export function Kicker({ children, cor, icone }: { children: ReactNode; cor?: string; icone?: ReactNode }) {
  return (
    <div className="kicker" style={cor ? { color: cor } : undefined}>
      {icone ?? <span className="kicker-traco" aria-hidden="true" />}
      {children}
    </div>
  );
}

export function TagSimulacao({ children = simulacao }: { children?: ReactNode }) {
  return <span className="tag-sim">{children}</span>;
}

export function Ph({ children }: { children: ReactNode }) {
  return <span className="ph">{children}</span>;
}

/**
 * Logo oficial da Equatorial. Defina só a altura (ex.: "h-8"); a largura segue a proporção.
 * Decorativo (`decorativo`) quando o nome da Equatorial já está no texto ao lado.
 */
export function LogoEquatorial({ className = "h-9", decorativo, prioridade }: { className?: string; decorativo?: boolean; prioridade?: boolean }) {
  return (
    <Image
      src={logoEquatorial}
      alt={decorativo ? "" : "Grupo Equatorial Energia"}
      priority={prioridade}
      draggable={false}
      className={`block w-auto flex-none select-none ${className}`}
    />
  );
}
