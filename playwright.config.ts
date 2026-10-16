import { defineConfig, devices } from "@playwright/test";

const PORTA = Number(process.env.E2E_PORT ?? 3200);

export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  reporter: [["list"]],
  use: {
    baseURL: `http://localhost:${PORTA}`,
    locale: "pt-BR",
    trace: "retain-on-failure",
  },
  projects: [
    { name: "celular", use: { ...devices["Desktop Chrome"], viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true } },
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } },
  ],
  webServer: {
    command: `pnpm start -p ${PORTA}`,
    url: `http://localhost:${PORTA}`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: { USE_MOCKS: "true", BADGE_SECRET: "segredo-e2e", WHATSAPP_NUMERO: "", NEXT_PUBLIC_SITE_URL: `http://localhost:${PORTA}` },
  },
});
