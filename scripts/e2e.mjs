import { spawnSync } from "node:child_process";

/**
 * O build da home é estático, então WHATSAPP_NUMERO/BADGE_SECRET precisam valer
 * já no build. Este script garante o mesmo ambiente para build e servidor de e2e.
 */
const ambiente = {
  ...process.env,
  USE_MOCKS: "true",
  BADGE_SECRET: process.env.BADGE_SECRET || "segredo-e2e",
  WHATSAPP_NUMERO: process.env.WHATSAPP_NUMERO || "5598999999999",
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3200",
  WAHA_BUFFER_MS: "0",
};

function rodar(comando, argumentos) {
  const resultado = spawnSync(comando, argumentos, { stdio: "inherit", env: ambiente, shell: process.platform === "win32" });
  if (resultado.error) {
    console.error(resultado.error.message);
    process.exit(1);
  }
  if (resultado.status !== 0) process.exit(resultado.status ?? 1);
}

rodar("pnpm", ["build"]);
rodar("pnpm", ["exec", "playwright", "test", ...process.argv.slice(2)]);
