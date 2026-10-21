import { getServices } from "./services";

function normalizarUrl(valor: string): URL {
  const limpo = valor.trim();
  if (!limpo) throw new Error("NEXT_PUBLIC_SITE_URL está vazia.");
  // Aceita "vizinho.exemplo.com" e "https://vizinho.exemplo.com".
  const comProtocolo = /^[a-z][a-z0-9+.-]*:\/\//i.test(limpo) ? limpo : `https://${limpo}`;
  try {
    return new URL(comProtocolo);
  } catch {
    throw new Error(`NEXT_PUBLIC_SITE_URL inválida: "${valor}". Use uma URL completa, como https://exemplo.com.`);
  }
}

/** URL pública do site (metadados OG absolutos e links compartilháveis). */
export function urlDoSite(): URL {
  const explicita = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicita) return normalizarUrl(explicita);
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercel) return normalizarUrl(vercel);
  return new URL("http://localhost:3000");
}

/** Link público de um selo, sempre no domínio em que o site está publicado. */
export function linkDoSelo(id: string): string {
  return new URL(`/selo/${encodeURIComponent(id)}`, urlDoSite()).toString();
}

/** Selo de exemplo exibido antes de a pessoa ganhar o dela (dados fictícios, do design). */
export function seloDeExemplo() {
  return getServices().badge.emitir(
    { primeiroNome: "Ana", bairro: "Vila Esperança", nivel: "alto" },
    new Date("2026-10-15T12:00:00Z"),
  );
}
