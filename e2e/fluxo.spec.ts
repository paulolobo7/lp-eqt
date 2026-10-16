import { expect, test, type Page } from "@playwright/test";

const chat = (page: Page) => page.getByTestId("chat-log");
const chip = (page: Page, nome: string) => page.getByRole("button", { name: nome, exact: true });

async function irParaSimulador(page: Page) {
  await page.goto("/#experimente");
  await expect(chat(page)).toBeVisible();
}

/** Opção ainda respondível de uma pergunta (a pergunta refeita aparece de novo na conversa). */
const opcao = (page: Page, n: number, texto: string) =>
  page.locator(`[data-testid=quiz-${n}] button:enabled`, { hasText: texto });

async function fazerQuiz(page: Page, errarPrimeira: boolean) {
  await chip(page, "Começar o quiz").click();
  if (errarPrimeira) {
    await opcao(page, 1, "madeira seca").click();
    await chip(page, "Tentar de novo").click();
  }
  await opcao(page, 1, "Não encosto").click();
  await opcao(page, 2, "Deixo a pipa lá").click();
  await opcao(page, 3, "Não intervenho").click();
}

test("bairro → quiz com erro e nova tentativa → nome → selo", async ({ page, request }) => {
  await irParaSimulador(page);
  await chip(page, "Escolher meu bairro").click();
  await chip(page, "Vila Esperança").click();

  const resultado = page.getByTestId("resultado");
  await expect(resultado).toHaveAttribute("data-nivel", "alto");
  await expect(resultado).toContainText("Simulação");

  await fazerQuiz(page, true);

  const nome = page.getByLabel(/primeiro nome/i);
  await nome.fill("ana maria");
  await nome.press("Enter");

  const seloChat = page.getByTestId("selo-chat");
  await expect(seloChat).toContainText("Ana");
  await expect(seloChat).toContainText("Vila Esperança");

  // A seção "O selo" passa a mostrar o selo emitido, com link de download.
  const baixar = page.getByRole("link", { name: "Baixar" });
  const href = await baixar.getAttribute("href");
  expect(href).toMatch(/^\/api\/badge\/[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\?/);
  const id = href!.split("/api/badge/")[1].split("?")[0];

  const png = await request.get(`/api/badge/${id}`);
  expect(png.status()).toBe(200);
  expect(png.headers()["content-type"]).toBe("image/png");

  await page.goto(`/selo/${id}`);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Ana");
  await expect(page.locator('meta[property="og:image"]').first()).toHaveAttribute("content", new RegExp(`/api/badge/${id}`));
});

test("localização real com consentimento", async ({ page, context }) => {
  await context.grantPermissions(["geolocation"]);
  await context.setGeolocation({ latitude: 0.0034, longitude: -0.0021 });
  await irParaSimulador(page);

  await chip(page, "Compartilhar localização").click();
  const folha = page.getByRole("dialog");
  await expect(folha).toContainText(/localização/i);
  await folha.getByRole("button", { name: "Enviar minha localização" }).click();

  await expect(page.getByTestId("resultado")).toHaveAttribute("data-nivel", "alto");
  await expect(page.getByTestId("resultado")).toContainText("Vila Esperança");
});

test("pular o nome usa “Vizinho”", async ({ page }) => {
  await irParaSimulador(page);
  await page.getByRole("button", { name: /Parque das Águas/ }).click();
  await expect(page.getByTestId("resultado")).toHaveAttribute("data-nivel", "baixo");
  await fazerQuiz(page, false);
  await chip(page, "Pular").click();
  await expect(page.getByTestId("selo-chat")).toContainText("Vizinho");
});

test("CTA do WhatsApp: QR no desktop, link direto no celular", async ({ page, isMobile }) => {
  await page.goto("/");
  const cta = page.getByTestId("cta-hero");
  await expect(cta).toHaveAttribute("href", /^https:\/\/wa\.me\//);
  if (isMobile) return;
  await cta.click();
  const dialogo = page.getByRole("dialog");
  await expect(dialogo).toBeVisible();
  await expect(dialogo.locator("svg").first()).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialogo).toBeHidden();
});

test.describe("movimento reduzido", () => {
  test.use({ contextOptions: { reducedMotion: "reduce" } });
  test("mostra a história como cartões estáticos", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator(".problema-estatico")).toBeVisible();
  });
});

test("APIs: quiz não expõe gabarito e proximidade recusa entrada inválida", async ({ request }) => {
  const quiz = await (await request.get("/api/quiz")).json();
  expect(JSON.stringify(quiz)).not.toMatch(/correta/);
  const r = await request.post("/api/proximity", { data: { lat: 999, lng: 0 } });
  expect(r.status()).toBe(400);
});
