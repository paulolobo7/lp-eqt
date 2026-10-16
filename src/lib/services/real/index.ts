import type {
  ChannelsService,
  CommunityService,
  ConsultaProximidade,
  ProximityService,
  QuizService,
} from "../types";

/*
 * Adapters reais. Cada um implementa o mesmo port do mock; os componentes e as
 * rotas não mudam ao trocar. Veja "Como trocar os mocks" no README.
 */

const pendente = (o: string): never => {
  throw new Error(`${o}: integração real ainda não implementada. Use USE_MOCKS=true.`);
};

export class EquatorialProximityService implements ProximityService {
  // TODO: consultar a camada georreferenciada de ativos da Equatorial (linhas e subestações).
  async consultar(consulta: ConsultaProximidade) {
    void consulta;
    return pendente("ProximityService");
  }
  async listarBairros() {
    return pendente("ProximityService");
  }
}

export class EquatorialQuizService implements QuizService {
  // TODO: conteúdo validado pela equipe técnica (CMS ou arquivo versionado).
  async perguntas() {
    return pendente("QuizService");
  }
  async corrigir() {
    return pendente("QuizService");
  }
}

export class EquatorialChannelsService implements ChannelsService {
  // TODO: canais oficiais de atendimento da Equatorial.
  async listar() {
    return pendente("ChannelsService");
  }
}

export class EquatorialCommunityService implements CommunityService {
  // TODO: contagem agregada por bairro a partir do bot (sem dados pessoais).
  async contagemPorBairro() {
    return pendente("CommunityService");
  }
}

