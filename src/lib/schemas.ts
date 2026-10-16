import { z } from "zod";

const ID = /^[a-z0-9-]{1,40}$/;

export const nivelSchema = z.enum(["alto", "medio", "baixo"], { error: "Faixa de risco inválida." });

const coordenadas = z.object({
  lat: z
    .number({ error: "A latitude deve ser um número." })
    .min(-90, "A latitude deve estar entre -90 e 90.")
    .max(90, "A latitude deve estar entre -90 e 90."),
  lng: z
    .number({ error: "A longitude deve ser um número." })
    .min(-180, "A longitude deve estar entre -180 e 180.")
    .max(180, "A longitude deve estar entre -180 e 180."),
});

const bairro = z.object({
  bairroId: z.string({ error: "O bairro deve ser um texto." }).regex(ID, "Bairro inválido."),
});

export const consultaProximidadeSchema = z.union([coordenadas.strict(), bairro.strict()], {
  error: "Envie a localização (lat e lng) ou o bairro (bairroId).",
});

export const respostaSchema = z.object({
  perguntaId: z.string().regex(ID, "Pergunta inválida."),
  opcaoId: z.string().regex(/^[a-z]$/, "Opção inválida."),
});

export const submitQuizSchema = z.object({
  respostas: z
    .array(respostaSchema, { error: "Envie as respostas em uma lista." })
    .min(1, "Envie pelo menos uma resposta.")
    .max(3, "Envie no máximo 3 respostas."),
  primeiroNome: z.string().max(60, "Nome muito longo.").optional(),
  bairroId: z.string().regex(ID, "Bairro inválido.").optional(),
  nivel: nivelSchema.optional(),
});

export const emitirSeloSchema = z.object({
  primeiroNome: z.string().min(1, "Informe o primeiro nome.").max(20, "Use até 20 letras."),
  bairro: z.string().min(1, "Informe o bairro.").max(60, "Nome de bairro muito longo."),
  nivel: nivelSchema,
});

export const formatoSeloSchema = z.enum(["status", "square"]).catch("status");

export function mensagensDeErro(erro: z.ZodError): string[] {
  return [...new Set(erro.issues.map((i) => i.message))];
}

export function respostaDeErro(erro: z.ZodError, status = 400): Response {
  return Response.json({ erro: "Dados inválidos.", detalhes: mensagensDeErro(erro) }, { status });
}
