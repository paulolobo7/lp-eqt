export type MensagemBot = {
  texto: string;
  atrasoMs?: number;
};

export type RespostaBot = {
  mensagens: string[];
  seloId?: string;
  bloqueadoParaHumano?: boolean;
  bairroReconhecido?: string;
  nivelRisco?: "alto" | "medio" | "baixo";
};

export type SolicitacaoMensagem = {
  mensagem: string;
  telefone?: string;
  sessao?: string;
  nome?: string;
  eAudio?: boolean;
  audioUrl?: string;
};

/** Payload recebido da API WAHA (WhatsApp HTTP API), conforme fluxo bot.json */
export type WahaPayload = {
  event: string;
  session: string;
  payload: {
    id: string;
    from: string;
    to?: string;
    source?: string;
    body?: string;
    hasMedia?: boolean;
    fromMe?: boolean;
    media?: {
      mimetype?: string;
      url?: string;
      filename?: string;
    };
    _data?: {
      Info?: {
        PushName?: string;
        Type?: string;
        IsGroup?: boolean;
        Chat?: string;
        Sender?: string;
      };
    };
  };
};

/** Payload padrão da Meta WhatsApp Cloud API */
export type MetaWhatsAppPayload = {
  object: "whatsapp_business_account";
  entry: Array<{
    id: string;
    changes: Array<{
      value: {
        messaging_product?: string;
        metadata?: {
          display_phone_number?: string;
          phone_number_id?: string;
        };
        contacts?: Array<{
          profile: { name: string };
          wa_id: string;
        }>;
        messages?: Array<{
          from: string;
          id: string;
          timestamp: string;
          type: string;
          text?: { body: string };
          audio?: { id: string; mime_type: string };
          location?: { latitude: number; longitude: number; name?: string; address?: string };
        }>;
      };
      field: string;
    }>;
  }>;
};
