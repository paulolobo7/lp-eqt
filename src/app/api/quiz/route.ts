import { getServices } from "@/lib/services";

/** GET -> { perguntas } (sem gabarito nem explicação). */
export async function GET() {
  const perguntas = await getServices().quiz.perguntas();
  return Response.json({ perguntas });
}
