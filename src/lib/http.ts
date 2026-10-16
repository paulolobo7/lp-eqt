/** Lê o corpo JSON; devolve uma Response 400 quando não é JSON válido. */
export async function lerJson(request: Request): Promise<{ ok: true; dados: unknown } | { ok: false; resposta: Response }> {
  try {
    return { ok: true, dados: await request.json() };
  } catch {
    return { ok: false, resposta: Response.json({ erro: "JSON inválido." }, { status: 400 }) };
  }
}

export const semCache = { "Cache-Control": "no-store" } as const;
