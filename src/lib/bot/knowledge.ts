/**
 * Base de Conhecimento Oficial do Programa Vizinho de Alta Tensão
 * Equatorial Energia Maranhão — São Luís e Região Metropolitana
 * Desafio #486 · Hackathon Equatorial
 */

import { QUIZ } from "@/content/quiz";

/** Distância de segurança usada nos textos educativos. */
export const DISTANCIA_SEGURA = "10 a 15 metros";

export const EQUATORIAL_MA = {
  empresa: "Equatorial Maranhão",
  estado: "Maranhão",
  cidadePrincipal: "São Luís",
  telefones: {
    central24h: "116",
    whatsappClara: "(98) 2055-0116",
    whatsappNumeroLimpo: "559820550116",
    bombeiros: "193",
    policiaMilitar: "190",
    defesaCivil: "199",
  },
  links: {
    site: "https://www.equatorialenergia.com.br",
    agenciaWeb: "https://ma.equatorialenergia.com.br",
    appAndroid: "https://play.google.com/store/apps/details?id=br.com.equatorialenergia.app",
    appIos: "https://apps.apple.com/br/app/equatorial-energia/id1485640209",
  },
  bairrosSaoLuis: [
    { nome: "Cohatrac", ativos: "Subestação SE Cohatrac e Linhas de Distribuição", riscoPadrao: "medio" },
    { nome: "Tirirical", ativos: "Subestação SE Tirirical e Linhas de Alta Tensão 69kV/138kV", riscoPadrao: "alto" },
    { nome: "Maracanã", ativos: "Corredor de Linhas de Transmissão e SE Maracanã", riscoPadrao: "alto" },
    { nome: "Coroadinho", ativos: "Linha de Transmissão cruza encostas e proximidades", riscoPadrao: "alto" },
    { nome: "Cidade Operária", ativos: "Subestação e Linhas de Média/Alta Tensão", riscoPadrao: "medio" },
    { nome: "Vinhais", ativos: "Subestação SE Vinhais", riscoPadrao: "medio" },
    { nome: "São Cristóvão", ativos: "Linhas de transmissão próximas ao aeroporto", riscoPadrao: "alto" },
    { nome: "Distrito Industrial", ativos: "Linhas de alta tensão pesada 138kV/230kV e Subestação", riscoPadrao: "alto" },
    { nome: "Anjo da Guarda / Itaqui-Bacanga", ativos: "Linhas de transmissão do complexo portuário", riscoPadrao: "alto" },
    { nome: "Renascença", ativos: "Rede de distribuição subterrânea e aérea urbana", riscoPadrao: "baixo" },
    { nome: "Calhau", ativos: "Rede de distribuição urbana", riscoPadrao: "baixo" },
    { nome: "Centro", ativos: "Rede histórica de distribuição", riscoPadrao: "baixo" },
    { nome: "Vila Esperança", ativos: "Linha de transmissão cruza o bairro (área piloto)", riscoPadrao: "alto" },
    { nome: "Jardim das Torres", ativos: "Subestação próxima (área piloto)", riscoPadrao: "medio" },
    { nome: "Parque das Águas", ativos: "Rede de distribuição local (área piloto)", riscoPadrao: "baixo" },
  ],
};

export type TopicoSeguranca = {
  id: string;
  palavrasChave: string[];
  titulo: string;
  resumo: string;
  oQueFazer: string[];
  oQueNaoFazer: string[];
  detalhesTecnicos: string;
  canaisAcionamento: string[];
};

export const TOPICOS_SEGURANCA: TopicoSeguranca[] = [
  {
    id: "cabo_caido",
    palavrasChave: [
      "cabo",
      "fio",
      "caido",
      "no chao",
      "chao",
      "arrebentado",
      "partido",
      "poste quebrado",
      "rompido",
      "fio solto",
      "cabo partido",
    ],
    titulo: "Cabo caído ou rompido no chão",
    resumo:
      "Cabos caídos no solo devem ser considerados sempre energizados e representam perigo mortal imediato por contato direto ou por tensão de passo no solo.",
    oQueFazer: [
      "Mantenha distância de segurança de no mínimo 10 a 15 metros do cabo.",
      "Afaste imediatamente crianças, vizinhos e animais de estimação.",
      "Sinalize o local de longe (colocando cones, galhos ou pedras a distância segura) para evitar que carros ou pessoas passem.",
      "Ligue imediatamente para a Central 116 da Equatorial (gratuita, 24h) e para o Corpo de Bombeiros no 193 se houver risco de incêndio.",
      "Se você estiver muito perto do cabo e sentir formigamento nos pés, junte os dois pés e pule com ambos unidos ou arraste os pés sem desencostar do solo para sair do campo de tensão de passo.",
      "Se o cabo cair em cima do seu carro: FIQUE DENTRO DO CARRO! A estrutura metálica protege quem está dentro. Buzine e espere o socorro. Só pule do carro se houver fogo, saltando sem encostar no veículo e no chão ao mesmo tempo.",
    ],
    oQueNaoFazer: [
      "NUNCA encoste no cabo em hipótese alguma.",
      "NUNCA tente afastar o fio com pedaço de pau, cabo de vassoura, cano ou pedaço de borracha. Em alta tensão, até madeira ou plástico úmido conduzem eletricidade letal!",
      "NUNCA passe com carro, moto ou bicicleta por cima do cabo.",
      "NUNCA tente puxar alguém que esteja sofrendo choque elétrico sem antes desligar a fonte de energia.",
    ],
    detalhesTecnicos:
      "Tensão de passo: a corrente elétrica se propaga no solo em ondas circulares decrescentes. Ao dar um passo largo, há uma diferença de voltagem entre um pé e outro que faz a eletricidade atravessar o corpo.",
    canaisAcionamento: ["Equatorial 116", "Bombeiros 193"],
  },
  {
    id: "arco_eletrico",
    palavrasChave: [
      "arco",
      "arco eletrico",
      "faisca",
      "estalo",
      "clarisao",
      "pipoco",
      "centelha",
      "zumbido",
      "fagulha",
      "curto",
    ],
    titulo: "Arcos elétricos, faíscas e estalos na rede de alta tensão",
    resumo:
      "Na alta tensão, a eletricidade pode saltar pelo ar sem encostar em nada (flashover). Faíscas e estalos indicam fuga de corrente e perigo extremo.",
    oQueFazer: [
      "Afaste-se imediatamente pelo menos 10 metros da fiação ou torre que apresentar faíscas ou estalos.",
      "Alerte quem estiver por perto para não se aproximar.",
      "Em dias chuvosos ou com garoa/alta umidade em São Luís, redobre a atenção: a umidade facilita a formação do arco elétrico.",
      "Ligue imediatamente para a Central 116 da Equatorial informando a rua, bairro e ponto de referência do poste ou torre.",
    ],
    oQueNaoFazer: [
      "NUNCA aponte objetos longos (varas de bambu, canos, vergalhões de ferro, escadas de alumínio) em direção aos condutores.",
      "NUNCA fique embaixo de fios que estejam estalando ou soltando faíscas.",
      "NUNCA jogue água ou tente apagar faíscas na rede com água.",
    ],
    detalhesTecnicos:
      "Arco voltaico atinge temperaturas superiores a 5.000 °C instantaneamente, gerando queimaduras de 3º grau graves e onda de choque acústico.",
    canaisAcionamento: ["Equatorial 116"],
  },
  {
    id: "pipas",
    palavrasChave: [
      "pipa",
      "papagaio",
      "arraia",
      "cerol",
      "linha chilena",
      "linha presa",
      "pipa no fio",
      "poste",
      "enroscou",
    ],
    titulo: "Pipas e papagaios perto da rede elétrica",
    resumo:
      "Soltar pipas perto de postes, fios e subestações é um dos maiores causadores de mortes por choque e de interrupções de energia no Maranhão.",
    oQueFazer: [
      "Solte pipas apenas em campos abertos, praias ou praças bem afastadas da fiação elétrica.",
      "Se a pipa enroscar nos fios ou na subestação: DEIXE LÁ! Nenhuma pipa vale uma vida humana.",
      "Avise as crianças sobre os perigos e denuncie o uso e venda de cerol ou linha chilena.",
    ],
    oQueNaoFazer: [
      "NUNCA use cerol ou linha chilena. Além de ser crime, elas contêm pó de vidro, quartzo e limalha de metal que conduzem eletricidade!",
      "NUNCA tente retirar a pipa presa na rede com vara de bambu, cabo de vassoura, cano ou vergalhão.",
      "NUNCA suba em postes, muros, lajes desprotegidas ou transformadores para pegar pipas.",
      "NUNCA use fios metálicos ou papel alumínio para confeccionar pipas.",
    ],
    detalhesTecnicos:
      "A linha com cerol ou linha chilena, ao tocar dois condutores ou um condutor energizado e a terra, fecha curto-circuito violento.",
    canaisAcionamento: ["Equatorial 116", "Polícia Militar 190 (venda de cerol)"],
  },
  {
    id: "invasao_subestacao",
    palavrasChave: [
      "subestacao",
      "invasao",
      "pular cerca",
      "muro",
      "bola",
      "area cercada",
      "portao aberto",
      "equipamento",
      "transformador",
    ],
    titulo: "Invasão de subestações e áreas cercadas de alta tensão",
    resumo:
      "Subestações elétricas possuem barramentos expostos operando em dezenas ou centenas de milhares de volts. A invasão é risco de morte instantânea.",
    oQueFazer: [
      "Respeite sempre as cercas, muros e placas de aviso de 'Perigo de Morte - Alta Tensão'.",
      "Se uma bola de futebol, pipa, brinquedo ou animal de estimação cair dentro de uma subestação: NÃO PULE A CERCA!",
      "Ligue imediatamente para o 116 da Equatorial informando o nome da subestação e solicite a presença de técnicos autorizados para resgate.",
    ],
    oQueNaoFazer: [
      "NUNCA pule o muro ou cerque de subestações por motivo nenhum.",
      "NUNCA corte o alambrado nem force portões de acesso.",
      "NUNCA encoste na tela ou cerca de proteção se ela estiver danificada.",
    ],
    detalhesTecnicos:
      "Equipamentos de pátio possuem distâncias mínimas de segurança regulamentadas pela norma NBR 5422. Apenas aproximar o corpo já pode deflagrar choque elétrico.",
    canaisAcionamento: ["Equatorial 116"],
  },
  {
    id: "furto_vandalismo",
    palavrasChave: [
      "furto",
      "roubo",
      "ladrao",
      "furto de cabos",
      "vandalismo",
      "cortando fio",
      "cobre",
      "aluminio",
      "mexendo no poste",
      "clandestino",
    ],
    titulo: "Furto de cabos e vandalismo contra o sistema elétrico",
    resumo:
      "O furto de fios é crime, causa mortes por choque e desliga serviços essenciais como hospitais, escolas, postos de saúde e bairros inteiros.",
    oQueFazer: [
      "Viu movimentação suspeita de pessoas mexendo em fios, postes ou transformadores sem fardamento oficial da Equatorial? Denuncie!",
      "Ligue imediatamente para a Polícia Militar no 190 e para a Equatorial no 116.",
      "A denúncia pode ser feita de forma 100% anônima.",
      "Mantenha distância segura para proteger sua integridade física.",
    ],
    oQueNaoFazer: [
      "NUNCA tente intervir, abordar os suspeitos ou fazer justiça com as próprias mãos.",
      "NUNCA compre cabos ou equipamentos de cobre/alumínio sem nota fiscal (receptação é crime).",
    ],
    detalhesTecnicos:
      "Artigo 265 do Código Penal: atentar contra a segurança ou o funcionamento de serviço de utilidade pública (energia elétrica) é crime com pena de reclusão.",
    canaisAcionamento: ["Polícia Militar 190", "Equatorial 116"],
  },
  {
    id: "eletrodomesticos_ressarcimento",
    palavrasChave: [
      "eletrodomestico",
      "queimou",
      "aparelho",
      "geladeira",
      "tv",
      "televisao",
      "computador",
      "ventilador",
      "microondas",
      "ar condicionado",
      "ressarcimento",
      "indenizacao",
      "queda de energia",
      "raio",
      "tempestade",
      "danos eletricos",
      "queimado",
      "oscilacao",
      "pico de luz",
      "ressarcir",
    ],
    titulo: "Cuidados com Eletrodomésticos e Processo de Ressarcimento de Danos Elétricos na Equatorial",
    resumo:
      "Aprenda por que aparelhos queimam durante chuvas e oscilações, como protegê-los e como solicitar o ressarcimento à Equatorial Maranhão passo a passo.",
    oQueFazer: [
      "PREVENÇÃO EM TEMPESTADES:",
      "1. Ao perceber tempestades fortes com raios em São Luís, retire aparelhos eletrônicos sensíveis da tomada (Smart TV, PC, roteador, micro-ondas, som).",
      "2. Desconecte cabos de rede (Ethernet) e antenas de TV, pois surtos também viajam por esses fios.",
      "3. Utilize filtros de linha de boa procedência com fusível/varistor ou instale protetores de surto (DPS) no quadro de energia de sua casa.",
      "4. Mantenha o aterramento elétrico residencial bem instalado.",
      "",
      "SE O APARELHO JÁ QUEIMOU (COMO PEDIR RESSARCIMENTO À EQUATORIAL MARANHÃO):",
      "1. PRAZO: Você tem até 90 (noventa) dias corridos a partir da data provável do evento para abrir a solicitação de ressarcimento (Resolução Normativa ANEEL 1.000/2021).",
      "2. NÃO CONSERTE E NÃO JOGUE FORA: É fundamental NÃO consertar nem descartar o aparelho danificado antes da autorização formal ou vistoria da Equatorial! A empresa tem direito de realizar vistoria técnica. Se você consertar por conta própria antes, seu pedido pode ser indeferido.",
      "3. DADOS NECESSÁRIOS: Tenha em mãos:",
      "   - Número da Conta Contrato do imóvel (presente na sua conta de energia);",
      "   - Dados do titular da conta (Nome, CPF e telefone);",
      "   - Data e horário aproximado da ocorrência (ex: 15/03 por volta das 17h, durante chuva);",
      "   - Relato do que aconteceu (queda brusca, retorno de energia com oscilação, estalo);",
      "   - Marca, modelo exato e tempo aproximado de uso do eletrodoméstico.",
      "4. ONDE ABRIR O PEDIDO NA EQUATORIAL MARANHÃO:",
      "   - WhatsApp da Clara: (98) 2055-0116 (digite 'Danos Elétricos' ou 'Ressarcimento');",
      "   - Site Oficial: www.equatorialenergia.com.br (Agência Web -> Solicitação de Ressarcimento);",
      "   - Aplicativo Equatorial Energia (Android e iOS);",
      "   - Central de Atendimento Gratuita: 116;",
      "   - Presencialmente nas Agências de Atendimento da Equatorial em São Luís.",
      "5. PRAZOS DE RESPOSTA DA EQUATORIAL:",
      "   - Vistoria: até 10 dias corridos (ou 1 dia corrido se for geladeira/freezer com alimentos ou remédios perecíveis);",
      "   - Resposta formal: até 15 dias corridos após a vistoria;",
      "   - Pagamento/Conserto: até 20 dias corridos após a aprovação.",
    ],
    oQueNaoFazer: [
      "NUNCA mande consertar o aparelho em assistência técnica por conta própria antes da vistoria ou liberação da Equatorial, sob pena de perder o direito ao ressarcimento.",
      "NUNCA jogue fora o aparelho danificado ou suas peças.",
      "NUNCA deixe passar o prazo de 90 dias para registrar a solicitação.",
      "NUNCA utilize tomadas ou cabos elétricos com cheiro de queimado ou derretidos.",
    ],
    detalhesTecnicos:
      "Surtos transitórios de tensão ocorrem devido a descargas atmosféricas (raios) atingindo a rede ou por manobras de chaveamento. O DPS (Dispositivo de Proteção contra Surtos) drena o excesso de voltagem diretamente para a terra, salvando a fiação e os circuitos dos eletrodomésticos.",
    canaisAcionamento: [
      "WhatsApp Equatorial Clara: (98) 2055-0116",
      "Telefone 116",
      "Site www.equatorialenergia.com.br",
      "App Equatorial Energia",
    ],
  },
  {
    id: "obras_reformas",
    palavrasChave: [
      "obra",
      "reforma",
      "construcao",
      "laje",
      "andaime",
      "vergalhao",
      "barra de ferro",
      "antena",
      "pintura",
      "rolo de pintura",
      "varal",
      "calcada",
      "faixa de servidao",
    ],
    titulo: "Construções, reformas, lajes e antenas perto da rede de alta tensão",
    resumo:
      "Aproximar materiais condutores (ferro, alumínio, madeira úmida) da rede elétrica durante obras é a causa número 1 de acidentes fatais na construção civil.",
    oQueFazer: [
      "Respeite a Faixa de Servidão de linhas de transmissão: é expressamente proibido construir sob a linha.",
      "Mantenha distância mínima de segurança de pelo menos 3 a 5 metros entre qualquer parte da obra e a fiação elétrica.",
      "Instale redes de proteção e barreiras isolantes caso a construção fique próxima à rede pública.",
      "Ao manusear barras de ferro, vergalhões, réguas de pedreiro e escadas de metal na laje, transporte-os sempre na posição horizontal, nunca na vertical.",
      "Ao instalar antenas de TV ou internet, escolha o lado oposto da casa em relação à fiação da rua.",
      "Em caso de dúvida sobre a distância de segurança da sua obra, solicite orientação técnica à Equatorial no 116.",
    ],
    oQueNaoFazer: [
      "NUNCA levante vergalhões ou barras de ferro na laje em direção aos fios da rua.",
      "NUNCA monte andaimes metálicos colados aos cabos elétricos.",
      "NUNCA instale varais de arame ou antenas perto de condutores de média ou alta tensão.",
      "NUNCA construa sacadas ou lajes avançando em direção aos postes.",
    ],
    detalhesTecnicos:
      "Vergalhões de aço funcionam como antenas condutoras que atraem arcos voltaicos mesmo sem tocar fisicamente no cabo energizado.",
    canaisAcionamento: ["Equatorial 116"],
  },
];

/**
 * Quiz do bot derivado da mesma fonte do site (`src/content/quiz.ts`), para o
 * simulado e o WhatsApp nunca darem respostas diferentes.
 */
export type PerguntaQuizBot = {
  id: string;
  numero: number;
  pergunta: string;
  opcoes: { id: string; texto: string; correta?: boolean }[];
  explicacao: string;
};

export const PERGUNTAS_QUIZ: PerguntaQuizBot[] = QUIZ.map((pergunta, indice) => ({
  id: pergunta.id,
  numero: indice + 1,
  pergunta: pergunta.pergunta,
  opcoes: pergunta.opcoes.map((opcao) => ({ ...opcao, correta: opcao.id === pergunta.correta })),
  explicacao: pergunta.explicacao,
}));

