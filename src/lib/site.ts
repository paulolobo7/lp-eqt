import { getServices } from "./services";

/** URL pública do site (metadados OG absolutos). */
export function urlDoSite(): URL {
  const explicita = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicita) return new URL(explicita);
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercel) return new URL(`https://${vercel}`);
  return new URL("http://localhost:3000");
}

/** Selo de exemplo exibido antes de a pessoa ganhar o dela (dados fictícios, do design). */
export function seloDeExemplo() {
  return getServices().badge.emitir(
    { primeiroNome: "Ana", bairro: "Vila Esperança", nivel: "alto" },
    new Date("2026-10-15T12:00:00Z"),
  );
}
