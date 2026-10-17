import { PH } from "./placeholders";

/** Textos da landing, em pt-BR, vindos do design (design/fonte/telas-e-tokens.html). */

export const marca = {
  nome: "Vizinho de Alta Tensão",
  logoRotulo: "LOGO EQUATORIAL",
  logoRotuloCurto: "LOGO",
  descricao:
    "Programa educativo da Equatorial no WhatsApp para quem mora perto de linhas, subestações e equipamentos de alta tensão.",
};

export const nav = {
  links: [
    { href: "#como", rotulo: "Como funciona" },
    { href: "#selo", rotulo: "O selo" },
    { href: "#risco", rotulo: "Em caso de risco" },
    { href: "#banca", rotulo: "Para a banca" },
  ],
  menuLinks: [
    { href: "#como", rotulo: "Como funciona" },
    { href: "#experimente", rotulo: "Experimente" },
    { href: "#selo", rotulo: "O selo" },
    { href: "#vizinhanca", rotulo: "Efeito vizinhança" },
    { href: "#risco", rotulo: "Em caso de risco" },
    { href: "#banca", rotulo: "Para a banca" },
  ],
  ctaCurto: "Entrar no WhatsApp",
  ctaBarra: "Falar no WhatsApp",
  abrirMenu: "Abrir menu",
  fecharMenu: "Fechar menu",
  riscoMenu: "Em caso de risco: falar com a Equatorial",
};

export const cta = {
  principal: "Quero ser Vizinho de Alta Tensão",
  mensagemPronta: "Oi! Quero ser Vizinho de Alta Tensão.",
  qrTituloDesktop: "Abra no seu celular",
  qrTextoDesktop:
    "Aponte a câmera do celular para o código. A conversa abre no WhatsApp com a mensagem pronta.",
  qrAbrirAqui: "Abrir o WhatsApp neste computador",
  qrRotulo: "QR code para abrir a conversa no WhatsApp",
  qrRodape: "Número do WhatsApp:",
  fechar: "Fechar",
};

export const hero = {
  // No celular estreito só a segunda parte aparece, para o kicker caber em uma linha.
  kickerMarca: "Equatorial Energia",
  kicker: "Programa no WhatsApp",
  titulo: "Quem mora perto da alta tensão merece saber como se proteger.",
  texto:
    "Converse com o bot da Equatorial no WhatsApp, aprenda os cuidados em imagem e áudio e ganhe o selo Vizinho de Alta Tensão.",
  secundario: "Ver como funciona",
  rolar: "Role para continuar",
  rotuloSecao: "Abertura: da noite ao amanhecer",
};

export const problema = {
  rotuloCadeia: "A cadeia do problema",
  estados: [
    {
      kicker: "1 de 3 · Exposição",
      curto: "Exposição",
      titulo: "O perigo nem sempre aparece.",
      texto: "Pipa presa no fio, área cercada, cabo baixo. Quem mora perto convive com riscos que não dá para ver.",
    },
    {
      kicker: "2 de 3 · Risco de dano",
      curto: "Risco de dano",
      titulo: "Uma faísca, um cabo furtado: a rede se danifica.",
      texto: "Arcos elétricos, invasão de área energizada e furto de cabos aumentam o risco para todo mundo.",
    },
    {
      kicker: "3 de 3 · Emergência",
      curto: "Emergência",
      titulo: "E o bairro inteiro fica no escuro.",
      texto: "Acidentes, chamados de emergência e queda no fornecimento de energia.",
    },
  ],
  amanhecer: {
    kicker: "O conhecimento acende a luz",
    titulo: "A cada vizinho que aprende, uma janela acende.",
    texto: "Junte-se à rede que protege a vizinhança.",
  },
  rotuloEstatico: "O problema em três momentos",
};

export const como = {
  kicker: "Como funciona",
  titulo: "Cinco passos no WhatsApp. Experimente aqui.",
  texto: "Esta é uma simulação da conversa. Toque nas respostas para seguir.",
  passos: [
    { titulo: "Mande um oi", texto: "A conversa começa por você, pelo link ou pelo QR code." },
    { titulo: "Envie sua localização", texto: "Ou escolha o bairro. Você decide." },
    { titulo: "Descubra se mora perto", texto: "De linhas, subestações e equipamentos de alta tensão." },
    { titulo: "Aprenda com imagem e áudio", texto: "Cuidados curtos, para ouvir quando quiser." },
    { titulo: "Faça o quiz e ganhe o selo", texto: "3 perguntas. Errou? A gente explica e você tenta de novo." },
  ],
};

export const simulacao = "Simulação";

export const chat = {
  nomeBot: "Vizinho de Alta Tensão",
  online: "online · responde na hora",
  digitando: "digitando…",
  rotuloLog: "Conversa simulada",
  digitandoAria: "O bot está digitando",
  composerVazio: "Escolha uma opção acima",
  boasVindasUsuario: cta.mensagemPronta,
  boasVindasBot:
    "Oi! Aqui é o Vizinho de Alta Tensão, da Equatorial. Em poucos minutos você aprende a se proteger e ganha um selo.",
  audioBoasVindas: {
    titulo: "Boas-vindas",
    src: "/audio/boas-vindas.wav",
    duracao: "0:18",
    transcricao:
      "Oi, vizinho! Aqui você aprende a reconhecer riscos perto da rede elétrica e o que fazer em cada caso.",
  },
  pedidoLocalizacao: "Para saber se você mora perto da alta tensão, preciso saber onde você está.",
  pedidoLocalizacaoNota: "Usada só para isso. Não guardamos seu endereço.",
  respostas: {
    compartilhar: "Compartilhar localização",
    escolherBairro: "Escolher meu bairro",
    comecarQuiz: "Começar o quiz",
    tentarDeNovo: "Tentar de novo",
    compartilharSelo: "Compartilhar selo",
    verSelo: "Ver meu selo",
    pular: "Pular",
  },
  qualBairro: "Qual é o seu bairro?",
  localizacaoEnviada: "Localização aproximada enviada",
  localizacaoFalhou:
    "Não consegui pegar sua localização. Sem problema: escolha o seu bairro.",
  erroServico: "Não consegui responder agora. Tente de novo em instantes.",
  cuidadosIntro: "Veja 3 cuidados para você e sua família.",
  imagens: [
    { icone: "kite", legenda: "Pipa só longe da rede. Se prender, deixe lá e avise." },
    { icone: "cable", legenda: "Cabo no chão: não encoste e afaste todo mundo." },
  ],
  audioCuidados: {
    titulo: "Cuidados",
    src: "/audio/cuidados.wav",
    duracao: "0:42",
    transcricao:
      "Não solte pipa perto da rede. Se a pipa prender, deixe lá. Cabo no chão pode estar energizado: não encoste, afaste as pessoas e avise a Equatorial.",
  },
  convitesQuiz: "Agora, 3 perguntas rápidas. Acerte as 3 e ganhe seu selo.",
  perguntaDe: (n: number) => `Pergunta ${n} de 3`,
  ouvir: "Ouvir",
  ouvirPergunta: "Ouvir a pergunta",
  tocando: "Tocando",
  correta: "Correta",
  suaResposta: "Sua resposta",
  feedbackOk: "Isso mesmo!",
  feedbackErro: "Quase. Veja por quê:",
  pedirNome:
    "Você acertou as 3! Como você quer que seu primeiro nome apareça no selo? Só o primeiro nome.",
  nomePlaceholder: "Seu primeiro nome",
  nomeEnviar: "Enviar nome",
  nomeRotulo: "Primeiro nome para o selo",
  nomePadrao: "Vizinho",
  parabens: "Pronto! Agora você é Vizinho de Alta Tensão.",
  convidar: "Compartilhe no status e convide quem mora ao lado.",
  recomecar: "Recomeçar a simulação",
};

export const sheet = {
  rotulo: "Pedido de localização",
  titulo: "Você mora perto da alta tensão?",
  texto:
    "Sua localização é usada só para responder isso. Guardamos apenas o bairro e a faixa de risco, nunca o endereço exato.",
  enviar: "Enviar minha localização",
  bairro: "Escolher meu bairro",
  agoraNao: "Agora não",
};

export const niveis = {
  alto: {
    rotulo: "Perto da alta tensão",
    curto: "Perto",
    texto: (tipo: string, dist: string) => `${tipo} a cerca de ${dist} da sua área. Os cuidados abaixo são para você.`,
  },
  medio: {
    rotulo: "Distância média",
    curto: "Médio",
    texto: (tipo: string, dist: string) => `${tipo} a cerca de ${dist} do seu bairro.`,
  },
  baixo: {
    rotulo: "Longe da alta tensão",
    curto: "Longe",
    texto: () => "Nenhum equipamento de alta tensão perto. Os cuidados valem para a rede da sua rua.",
  },
} as const;

export const tiposAtivo = {
  linha_transmissao: "Uma linha de transmissão",
  subestacao: "Uma subestação",
} as const;

export const resultado = {
  prefixo: "Resultado",
  notaFicticia: "Distância calculada sobre dados fictícios.",
};

export const mapa = {
  titulo: "Bairros de demonstração",
  aria: "Mapa esquemático com uma linha de transmissão, uma subestação e três bairros fictícios",
  nota: "Linhas, subestações e bairros fictícios. A versão real usa a camada de ativos da Equatorial.",
};

export const selo = {
  kicker: "O selo",
  titulo: "Você aprendeu. Agora ensine quem mora ao lado.",
  texto:
    "Quem acerta as 3 perguntas ganha o selo digital, pronto para o status. Cada selo tem nome, bairro, data e um código curto.",
  beneficioTitulo: "Benefício do selo",
  beneficioTexto: "Um benefício que a Equatorial já oferece.",
  formatoRotulo: "Formato",
  formatoStatus: "Status 1080×1350",
  formatoQuadrado: "Quadrado 1080×1080",
  compartilhar: "Compartilhar",
  baixar: "Baixar",
  frase: "Você aprendeu. Agora ensine quem mora ao lado.",
  linha1: "Vizinho de",
  linha2: "Alta Tensão",
  exemplo: "Exemplo",
  seuSelo: "Seu selo",
  compartilharTitulo: "Sou Vizinho de Alta Tensão",
  compartilharTexto: "Você aprendeu. Agora ensine quem mora ao lado. Entre também:",
  linkCopiado: "Link copiado. Cole no status ou envie para um vizinho.",
  copiaFalhou: "Não deu para copiar. Segure o link para copiar:",
  baixando: "Baixando a imagem do selo.",
};

export const seloPagina = {
  titulo: (nome: string) => `${nome} é Vizinho de Alta Tensão`,
  descricao: "Aprendeu a se proteger perto da rede elétrica. Faça o quiz e ganhe o seu selo também.",
  convite: "Você também mora perto da alta tensão? Faça o quiz no WhatsApp e ganhe o seu selo.",
  invalido: "Este selo não é válido ou o link está incompleto.",
  voltar: "Conhecer o programa",
};

export const vizinhanca = {
  kicker: "Efeito vizinhança",
  titulo: "Um selo no status acende outra casa.",
  texto:
    "Cada selo compartilhado convida quem mora ao lado. O contador mostra quantos vizinhos já entraram em cada bairro, sem nenhum dado pessoal.",
  contadorTitulo: "Vizinhos por bairro",
  dadosFicticios: "Dados fictícios",
  voce: "+1 você",
  nota: "Contagem agregada por bairro. Nenhum nome, telefone ou endereço aparece aqui.",
  redeAria: "Rede de casas que acendem conforme os vizinhos entram no programa",
};

export const impacto = {
  kicker: "Impacto",
  titulo: "Bom para a rede, para o bairro e para o estado.",
  colunas: [
    { icone: "building", titulo: "Equatorial", itens: ["Menos vandalismo e intervenções indevidas na rede", "Menor custo operacional com emergências"] },
    { icone: "users", titulo: "Comunidade", itens: ["Menos acidentes com a rede elétrica", "Mais confiança e pertencimento"] },
    { icone: "globe", titulo: "Sociedade", itens: ["Fornecimento de energia mais estável", "Replicável em outros estados com baixo custo incremental"] },
  ],
} as const;

export const risco = {
  kicker: "Em caso de risco",
  titulo: "Viu algo assim? Afaste-se e avise.",
  texto: "Cada cuidado tem versão em áudio. Toque para ouvir.",
  cartoes: [
    { id: "cabo", icone: "cable", titulo: "Cabo caído", texto: "Não encoste. Afaste as pessoas e avise a Equatorial.", audio: "/audio/risco-cabo.wav", duracao: "0:12", transcricao: "Viu um cabo caído? Não encoste. Afaste as pessoas e avise a Equatorial pelo canal oficial." },
    { id: "pipa", icone: "kite", titulo: "Pipa na rede", texto: "Não puxe a linha nem use vara. Deixe a pipa lá.", audio: "/audio/risco-pipa.wav", duracao: "0:10", transcricao: "Pipa presa na rede? Não puxe a linha nem use vara. Deixe a pipa lá e avise a Equatorial." },
    { id: "faisca", icone: "spark", titulo: "Faísca ou estalo", texto: `Afaste-se pelo menos ${PH.distancia} e avise a Equatorial.`, audio: "/audio/risco-faisca.wav", duracao: "0:11", transcricao: "Viu faísca ou ouviu estalo na rede? Afaste-se e avise a Equatorial. A distância segura será informada pela equipe técnica." },
    { id: "furto", icone: "fence", titulo: "Furto ou invasão", texto: "Não intervenha. Mantenha distância e acione os canais oficiais.", audio: "/audio/risco-furto.wav", duracao: "0:13", transcricao: "Viu furto de cabos ou alguém entrando em área de subestação? Não intervenha. Mantenha distância e acione os canais oficiais." },
  ],
  canalRotulo: "Canal oficial:",
  falar: "Falar com a Equatorial",
  canalToast: (canal: string) => `Canal oficial da Equatorial: ${canal}`,
} as const;

export const banca = {
  kicker: "Para a banca",
  titulo: "Como o MVP funciona e o que vira integração real.",
  blocos: [
    { icone: "globe", titulo: "Landing page", texto: "Apresenta, simula e leva ao WhatsApp" },
    { icone: "chat", titulo: "Bot de WhatsApp", texto: "Conversa iniciada pelo cidadão" },
  ],
  servicosTitulo: "Serviços",
  servicos: ["Localização", "Quiz", "Selo", "Canais da Equatorial"],
  tabelaAria: "MVP e integração real",
  colunas: ["Peça", "No MVP", "Status", "Integração real"],
  linhas: [
    { peca: "Bot de WhatsApp", mvp: "Simulador nesta página e webhook de teste", real: "WhatsApp Business Platform oficial", simulado: true },
    { peca: "Localização", mvp: "Bairros, linhas e subestações fictícios", real: "Camada georreferenciada de ativos da Equatorial", simulado: true },
    { peca: "Quiz e cuidados", mvp: "Conteúdo de exemplo", real: "Conteúdo validado pela equipe técnica", simulado: true },
    { peca: "Selo", mvp: "Gerado na hora, com link compartilhável", real: `Vínculo com o benefício ${PH.beneficio}`, simulado: false },
    { peca: "Canais da Equatorial", mvp: PH.canal, real: "Canais oficiais de atendimento", simulado: true },
  ],
  simulado: "Simulado no MVP",
  funciona: "Funciona no MVP",
  roadmap: [
    { fase: "Fase 1 · agora", titulo: "MVP do hackathon", texto: "Landing, simulador do bot, quiz e selo com dados fictícios." },
    { fase: "Fase 2", titulo: "Piloto em um bairro", texto: "Bot oficial no WhatsApp, ativos reais da Equatorial e conteúdo validado." },
    { fase: "Fase 3", titulo: "Escala", texto: "Outros bairros e estados, com contador agregado por bairro." },
  ],
};

export const convite = {
  rotulo: "Convite final",
  titulo: "Entre para a rede que protege a vizinhança.",
};

export const rodape = {
  privacidadeTitulo: "Privacidade (LGPD)",
  privacidadeTexto:
    "Pedimos sua localização só com seu consentimento e só para indicar se você mora perto da rede de alta tensão. Guardamos apenas primeiro nome, bairro e faixa de risco. Você pode escolher o bairro sem usar o GPS.",
  politica: "Política de privacidade",
  hackathon: "Hackathon Equatorial · Desafio 4 · #486",
  aviso:
    "Vizinho de Alta Tensão é um projeto educativo. O conteúdo de segurança está em validação técnica pela Equatorial.",
};

export const audio = {
  pausar: "Pausar áudio",
  ouvirAudio: (t: string) => `Ouvir áudio: ${t}`,
  velocidade: "Mudar velocidade",
  transcricao: "Transcrição:",
  placeholder: "Áudio de exemplo",
  tocando: "Tocando…",
};
