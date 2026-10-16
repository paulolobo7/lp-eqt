import { mkdirSync } from "node:fs";
import { test, type Page } from "@playwright/test";

/**
 * Capturas das seções principais em 390×844 (projeto "celular") e 1440×900
 * ("desktop"), salvas em docs/capturas/ para comparar com design/referencia/.
 * Rode com `pnpm shots`.
 */
const PASTA = "docs/capturas";
mkdirSync(PASTA, { recursive: true });

async function foto(page: Page, projeto: string, nome: string) {
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${PASTA}/${projeto}-${nome}.png` });
}

async function rolarAte(page: Page, seletor: string, deslocamento = -72) {
  await page.evaluate(
    ([sel, d]) => {
      const el = document.querySelector(sel as string)!;
      window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY + (d as number), behavior: "instant" });
    },
    [seletor, deslocamento],
  );
}

test("capturas das seções", async ({ page }, info) => {
  const p = info.project.name;
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  await foto(page, p, "01-hero");

  // Os três estados da história e o amanhecer, pela posição de rolagem.
  const altura = await page.evaluate(() => {
    const h = document.querySelector(".historia") as HTMLElement;
    return { topo: h.offsetTop, total: h.offsetHeight - innerHeight };
  });
  for (const [i, f] of [[2, 0.28], [3, 0.5], [4, 0.72], [5, 0.97]] as const) {
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" }), Math.round(altura.topo + altura.total * f));
    await foto(page, p, `0${i}-historia-${Math.round(f * 100)}`);
  }

  await rolarAte(page, "#como");
  await foto(page, p, "06-como-funciona");

  // Simulação até o resultado.
  await page.getByRole("button", { name: "Escolher meu bairro", exact: true }).click();
  await page.getByRole("button", { name: "Vila Esperança", exact: true }).click();
  await page.getByRole("button", { name: "Começar o quiz", exact: true }).waitFor();
  await rolarAte(page, "[data-testid=chat-log]", -140);
  await foto(page, p, "07-simulador-resultado");

  for (const [n, sel] of [["08-selo", "#selo"], ["09-vizinhanca", "#vizinhanca"], ["10-impacto", "#impacto"], ["11-risco", "#risco"], ["12-banca", "#banca"]] as const) {
    await rolarAte(page, sel);
    await foto(page, p, n);
  }
  await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: "instant" }));
  await foto(page, p, "13-convite-rodape");
});
