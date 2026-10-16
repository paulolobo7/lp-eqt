import grid from "@/data/mock-grid.json";
import type { CommunityService, ContagemBairro } from "../types";

export class MockCommunityService implements CommunityService {
  async contagemPorBairro(): Promise<ContagemBairro[]> {
    return [...grid.bairros, ...grid.outrosBairros]
      .map(({ id, nome, vizinhos }) => ({ id, nome, vizinhos }))
      .sort((a, b) => b.vizinhos - a.vizinhos);
  }
}
