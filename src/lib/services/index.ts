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

/** Mocks ligados por padrão; USE_MOCKS=false liga os adapters reais. */
export function usandoMocks(): boolean {
  return process.env.USE_MOCKS !== "false";
}

export function getServices(): Services {
  // O selo assinado já funciona de verdade no MVP; muda só o segredo.
  const badge = new MockBadgeService(process.env.BADGE_SECRET || SEGREDO_DEV);
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
