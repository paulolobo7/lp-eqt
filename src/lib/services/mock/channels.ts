import { PH } from "@/content/placeholders";
import type { ChannelsService } from "../types";

export class MockChannelsService implements ChannelsService {
  async listar() {
    return {
      simulacao: true,
      canais: [
        { id: "emergencia", tipo: "telefone" as const, rotulo: "Emergência e risco na rede", valor: PH.canal },
        { id: "whatsapp", tipo: "whatsapp" as const, rotulo: "WhatsApp do programa", valor: PH.numero },
      ],
    };
  }
}
