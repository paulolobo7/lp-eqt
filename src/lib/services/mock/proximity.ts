import grid from "@/data/mock-grid.json";
import { CUIDADOS } from "@/content/cuidados";
import { distanciaAteLinhaM, haversineM, type Coordenada } from "@/lib/geo";
import type { BairroDemo, ConsultaProximidade, Nivel, ProximityService, ResultadoProximidade, TipoAtivo } from "../types";

/** Raio para reconhecer um bairro fictício a partir de coordenadas. */
const RAIO_BAIRRO_M = 800;

export class MockProximityService implements ProximityService {
  async consultar(consulta: ConsultaProximidade): Promise<ResultadoProximidade> {
    let ponto: Coordenada;
    let bairro: { id: string; nome: string } | undefined;

    if ("bairroId" in consulta) {
      const b = grid.bairros.find((x) => x.id === consulta.bairroId);
      if (!b) throw new Error("Bairro não encontrado.");
      ponto = { lat: b.lat, lng: b.lng };
      bairro = { id: b.id, nome: b.nome };
    } else {
      ponto = { lat: consulta.lat, lng: consulta.lng };
      const perto = grid.bairros
        .map((b) => ({ b, d: haversineM(ponto, b) }))
        .filter((x) => x.d <= RAIO_BAIRRO_M)
        .sort((x, y) => x.d - y.d)[0];
      if (perto) bairro = { id: perto.b.id, nome: perto.b.nome };
    }

    const ativo = ativoMaisProximo(ponto);
    const nivel = classificar(ativo.distanciaM);
    return {
      nivel,
      ativoMaisProximo: { tipo: ativo.tipo, distanciaM: Math.round(ativo.distanciaM / 10) * 10 },
      cuidados: [...CUIDADOS[nivel]],
      ...(bairro ? { bairro } : {}),
      simulacao: true,
    };
  }

  async listarBairros(): Promise<BairroDemo[]> {
    return grid.bairros.map((b) => ({
      id: b.id,
      nome: b.nome,
      descricao: b.descricao,
      nivel: classificar(ativoMaisProximo(b).distanciaM),
    }));
  }
}

function ativoMaisProximo(p: Coordenada): { tipo: TipoAtivo; distanciaM: number } {
  const linhas = grid.linhas.map((l) => ({ tipo: "linha_transmissao" as const, distanciaM: distanciaAteLinhaM(p, l.pontos) }));
  const subestacoes = grid.subestacoes.map((s) => ({ tipo: "subestacao" as const, distanciaM: haversineM(p, s) }));
  return [...linhas, ...subestacoes].sort((a, b) => a.distanciaM - b.distanciaM)[0];
}

function classificar(distanciaM: number): Nivel {
  if (distanciaM <= grid.faixas.altoAteM) return "alto";
  if (distanciaM <= grid.faixas.medioAteM) return "medio";
  return "baixo";
}
