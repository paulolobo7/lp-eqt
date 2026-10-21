import { MockBadgeService } from "./mock/badge";
import { MockChannelsService } from "./mock/channels";
import { MockCommunityService } from "./mock/community";
import { MockProximityService } from "./mock/proximity";
import { MockQuizService } from "./mock/quiz";
import {
  EquatorialChannelsService,
  EquatorialCommunityService,
  EquatorialProximityService,
  EquatorialQuizService,
} from "./real";
import type { Services } from "./types";

export type * from "./types";

const SEGREDO_DEV = "vizinho-alta-tensao-dev";

/**
 * Em produção o segredo é obrigatório: sem ele, qualquer pessoa com acesso ao
 * repositório conseguiria assinar um selo falso.
 */
function segredoBadge(): string {
  const segredo = process.env.BADGE_SECRET?.trim();
  if (segredo) return segredo;
  if (process.env.NODE_ENV === "production") {
    throw new Error("BADGE_SECRET é obrigatório em produção. Defina um valor longo e aleatório.");
  }
  return SEGREDO_DEV;
}

/** Mocks ligados por padrão; USE_MOCKS=false liga os adapters reais. */
export function usandoMocks(): boolean {
  return process.env.USE_MOCKS !== "false";
}

export function getServices(): Services {
  // O selo assinado já funciona de verdade no MVP; muda só o segredo.
  const badge = new MockBadgeService(segredoBadge());
  if (usandoMocks()) {
    return {
      proximity: new MockProximityService(),
      quiz: new MockQuizService(),
      badge,
      channels: new MockChannelsService(),
      community: new MockCommunityService(),
    };
  }
  return {
    proximity: new EquatorialProximityService(),
    quiz: new EquatorialQuizService(),
    badge,
    channels: new EquatorialChannelsService(),
    community: new EquatorialCommunityService(),
  };
}
