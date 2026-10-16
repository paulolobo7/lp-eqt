import { createHmac, timingSafeEqual } from "node:crypto";
import { z } from "zod";
import { chat } from "@/content/site";
import { primeiroNome } from "@/lib/texto";
import type { BadgeService, DadosSelo, Selo } from "../types";

const carga = z.object({
  n: z.string().min(1).max(20),
  b: z.string().min(1).max(60),
  f: z.enum(["alto", "medio", "baixo"]),
  d: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

const ALFABETO = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

/**
 * Selo sem banco: o id é a própria carga (primeiro nome, bairro, faixa e data)
 * em base64url, assinada com HMAC. Nada é persistido.
 */
export class MockBadgeService implements BadgeService {
  constructor(private readonly segredo: string) {}

  async emitir(dados: Omit<DadosSelo, "data">, agora = new Date()): Promise<Selo> {
    const c = {
      n: primeiroNome(dados.primeiroNome) || chat.nomePadrao,
      b: dados.bairro.trim().slice(0, 60),
      f: dados.nivel,
      d: agora.toISOString().slice(0, 10),
    };
    const corpo = Buffer.from(JSON.stringify(c)).toString("base64url");
    const assinatura = this.assinar(corpo);
    return this.montar(`${corpo}.${assinatura.toString("base64url")}`, c, assinatura);
  }

  async ler(id: string): Promise<Selo | null> {
    const partes = id.split(".");
    if (partes.length !== 2 || !partes[0] || !partes[1]) return null;
    const [corpo, recebida] = partes;
    const esperada = this.assinar(corpo);
    const rec = Buffer.from(recebida, "base64url");
    if (rec.length !== esperada.length || !timingSafeEqual(rec, esperada)) return null;
    try {
      const c = carga.parse(JSON.parse(Buffer.from(corpo, "base64url").toString("utf8")));
      return this.montar(id, c, esperada);
    } catch {
      return null;
    }
  }

  private assinar(corpo: string): Buffer {
    return createHmac("sha256", this.segredo).update(corpo).digest().subarray(0, 16);
  }

  private montar(id: string, c: z.infer<typeof carga>, assinatura: Buffer): Selo {
    const codigo = "VAT-" + Array.from(assinatura.subarray(0, 4), (b) => ALFABETO[b % 32]).join("");
    return { id, codigo, primeiroNome: c.n, bairro: c.b, nivel: c.f, data: c.d };
  }
}
