/**
 * Ports (interfaces) dos serviços. Os componentes e as rotas só conhecem estes
 * tipos; as implementações ficam em ./mock (USE_MOCKS=true) ou ./real.
 */

export type Nivel = "alto" | "medio" | "baixo";
export type TipoAtivo = "linha_transmissao" | "subestacao";

export type ConsultaProximidade = { lat: number; lng: number } | { bairroId: string };

export type ResultadoProximidade = {
  nivel: Nivel;
  ativoMaisProximo: { tipo: TipoAtivo; distanciaM: number };
  cuidados: string[];
  /** Bairro reconhecido, quando houver. Nunca devolve coordenadas. */
  bairro?: { id: string; nome: string };
  simulacao: boolean;
};

export type BairroDemo = { id: string; nome: string; descricao: string; nivel: Nivel };

export interface ProximityService {
  consultar(consulta: ConsultaProximidade): Promise<ResultadoProximidade>;
  listarBairros(): Promise<BairroDemo[]>;
}

export type PerguntaPublica = {
  id: string;
  pergunta: string;
  opcoes: { id: string; texto: string }[];
  audio: { src: string; duracao: string; transcricao: string };
};

export type Resposta = { perguntaId: string; opcaoId: string };

export type CorrecaoQuiz = {
  acertos: number;
  erradas: string[];
  resultados: { perguntaId: string; correta: boolean; explicacao: string }[];
  /** true só quando as 3 perguntas foram respondidas e todas estão certas. */
  completo: boolean;
};

export interface QuizService {
  perguntas(): Promise<PerguntaPublica[]>;
  corrigir(respostas: Resposta[]): Promise<CorrecaoQuiz>;
}

export type DadosSelo = {
  primeiroNome: string;
  bairro: string;
  nivel: Nivel;
  /** Data de emissão, AAAA-MM-DD. */
  data: string;
};

export type Selo = DadosSelo & { id: string; codigo: string };

export interface BadgeService {
  emitir(dados: Omit<DadosSelo, "data">, agora?: Date): Promise<Selo>;
  /** Devolve null quando o id é inválido ou foi adulterado. */
  ler(id: string): Promise<Selo | null>;
}

export type Canal = { id: string; tipo: "telefone" | "whatsapp" | "site" | "app"; rotulo: string; valor: string };

export interface ChannelsService {
  listar(): Promise<{ canais: Canal[]; simulacao: boolean }>;
}

export type ContagemBairro = { id: string; nome: string; vizinhos: number };

export interface CommunityService {
  /** Contagem agregada por bairro. Nunca contém dados pessoais. */
  contagemPorBairro(): Promise<ContagemBairro[]>;
}

export type Services = {
  proximity: ProximityService;
  quiz: QuizService;
  badge: BadgeService;
  channels: ChannelsService;
  community: CommunityService;
};
