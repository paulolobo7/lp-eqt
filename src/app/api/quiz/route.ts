import { getServices } from "@/lib/services";

/** GET -> { perguntas } (sem gabarito nem explicação). */
export async function GET() {
  try {
    const perguntas = await getServices().quiz.perguntas();
    return Response.json({ perguntas });
  } catch {
    return Response.json({ erro: "Quiz indisponível no momento." }, { status: 503 });
  }
}

