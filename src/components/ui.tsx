import type { ReactNode } from "react";
import { simulacao } from "@/content/site";

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

/** Placeholder do logotipo: nunca desenhar o logo oficial sem o manual de marca. */
export function LogoPh({ curto, rotulo }: { curto?: boolean; rotulo: string }) {
  return (
    <span className="logo-ph" role="img" aria-label="Espaço reservado para o logotipo da Equatorial">
      {curto ? "LOGO" : rotulo}
    </span>
  );
}
