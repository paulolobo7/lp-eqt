import { afterEach, describe, expect, it, vi } from "vitest";
import { linkDoSelo, urlDoSite } from "./site";

afterEach(() => vi.unstubAllEnvs());

describe("urlDoSite", () => {
  it("aceita URL completa", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://vizinho.exemplo.com");
    expect(urlDoSite().toString()).toBe("https://vizinho.exemplo.com/");
  });

  it("completa o protocolo quando a env vem sem ele", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "vizinho.exemplo.com");
    expect(urlDoSite().toString()).toBe("https://vizinho.exemplo.com/");
  });

  it("usa a URL de produção da Vercel quando não há URL explícita", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "");
    vi.stubEnv("VERCEL_PROJECT_PRODUCTION_URL", "vizinho.vercel.app");
    expect(urlDoSite().toString()).toBe("https://vizinho.vercel.app/");
  });
});

describe("linkDoSelo", () => {
  it("monta o link no domínio público configurado", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://vizinho.exemplo.com");
    expect(linkDoSelo("dados.assinatura")).toBe("https://vizinho.exemplo.com/selo/dados.assinatura");
  });
});
