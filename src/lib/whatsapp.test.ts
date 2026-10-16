import { describe, expect, it } from "vitest";
import { linkWhatsApp, numeroWhatsAppValido } from "./whatsapp";

describe("linkWhatsApp", () => {
  it("monta o link wa.me com a mensagem codificada", () => {
    expect(linkWhatsApp("5598999999999", "Oi! Quero ser Vizinho de Alta Tensão.")).toBe(
      "https://wa.me/5598999999999?text=Oi!%20Quero%20ser%20Vizinho%20de%20Alta%20Tens%C3%A3o.",
    );
  });

  it("remove espaços, parênteses e o sinal de mais do número", () => {
    expect(linkWhatsApp("+55 (98) 9999-9999", "oi")).toBe("https://wa.me/559899999999?text=oi");
  });

  it("mantém o placeholder quando o número não foi configurado", () => {
    expect(linkWhatsApp(undefined, "oi")).toBe("https://wa.me/{{NUMERO_WHATSAPP}}?text=oi");
  });
});

describe("numeroWhatsAppValido", () => {
  it("aceita só dígitos entre 10 e 15", () => {
    expect(numeroWhatsAppValido("5598999999999")).toBe(true);
    expect(numeroWhatsAppValido("{{NUMERO_WHATSAPP}}")).toBe(false);
    expect(numeroWhatsAppValido(undefined)).toBe(false);
  });
});
