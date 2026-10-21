import { getServices } from "@/lib/services";

/** GET -> { canais, simulacao }. No MVP, valores são {{CANAL_EQUATORIAL}}. */
export async function GET() {
  try {
    return Response.json(await getServices().channels.listar());
  } catch {
    return Response.json({ erro: "Canais indisponíveis no momento." }, { status: 503 });
  }
}

