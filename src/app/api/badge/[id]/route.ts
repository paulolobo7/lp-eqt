import type { NextRequest } from "next/server";
import { imagemDoSelo } from "@/lib/badge-image";
import { limitar } from "@/lib/rate-limit";
import { formatoSeloSchema } from "@/lib/schemas";
import { getServices } from "@/lib/services";

/** GET -> PNG do selo. 1080x1350 (status) ou ?format=square (1080x1080). ?download=1 baixa. */
export async function GET(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const bloqueio = limitar(request, "badge", { max: 60, janelaMs: 60_000 });
  if (bloqueio) return bloqueio;

  const { id } = await ctx.params;
  const selo = await getServices().badge.ler(id);
  if (!selo) return Response.json({ erro: "Selo não encontrado." }, { status: 404 });

  const formato = formatoSeloSchema.parse(request.nextUrl.searchParams.get("format"));
  const headers: Record<string, string> = { "Cache-Control": "public, max-age=31536000, immutable" };
  if (request.nextUrl.searchParams.get("download") === "1") {
    headers["Content-Disposition"] = `attachment; filename="selo-vizinho-alta-tensao-${selo.codigo}-${formato}.png"`;
  }
  return imagemDoSelo(selo, formato, headers);
}
