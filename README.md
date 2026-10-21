# Vizinho de Alta Tensão — landing do MVP

Landing imersiva do programa **Vizinho de Alta Tensão** (Hackathon Equatorial, desafio #486).
Conta a história do risco perto da rede elétrica em rolagem, simula a conversa do bot no
WhatsApp (localização, resultado, cuidados em imagem e áudio, quiz de 3 perguntas, selo) e
gera o selo compartilhável em PNG para o status.

> **Tudo o que aparece com o rótulo "Simulação" é fictício.** O conteúdo de segurança é
> exemplo até a validação técnica da Equatorial.

## Como rodar

Requisitos: Node 20+ e pnpm 10+.

```bash
pnpm install
cp .env.example .env.local   # ajuste os valores se quiser
pnpm dev                     # http://localhost:3000
```

| Script | O que faz |
| --- | --- |
| `pnpm dev` | servidor de desenvolvimento |
| `pnpm build` / `pnpm start` | build de produção e servidor (o build exige `BADGE_SECRET`) |
| `pnpm lint` | ESLint |
| `pnpm typecheck` | gera os tipos de rota do Next e roda TypeScript estrito |
| `pnpm test` | testes unitários e de rota (Vitest) |
| `pnpm e2e` | Playwright: fluxo completo em 390×844 e 1440×900 (sobe `pnpm start` na porta 3200; rode `BADGE_SECRET=... pnpm build` antes) |
| `pnpm shots` | só as capturas das seções, salvas em `docs/capturas/` |

O Playwright usa o Chromium dele; se ainda não tiver, rode `pnpm exec playwright install chromium`.

## Variáveis de ambiente

| Variável | Para quê | Padrão |
| --- | --- | --- |
| `USE_MOCKS` | `true` usa os serviços simulados; `false` liga os adapters reais | `true` |
| `WHATSAPP_NUMERO` | número do bot, só dígitos com DDI e DDD. Monta o link `wa.me` e o QR code | vazio → `{{NUMERO_WHATSAPP}}` |
| `WHATSAPP_VERIFY_TOKEN` | token de verificação do webhook (`GET /api/whatsapp/webhook`) | vazio |
| `WHATSAPP_WEBHOOK_SECRET` | segredo do `POST /api/whatsapp/webhook` (header `x-webhook-token` ou `?token=`). Sem ele em produção, o webhook recusa tudo | vazio (aberto só em dev/teste) |
| `BADGE_SECRET` | segredo HMAC que assina o id de cada selo. **Obrigatório em produção** | segredo de dev |
| `OPENAI_API_KEY` | respostas generativas e transcrição de áudio (opcional) | vazio → regras locais |
| `OPENAI_TRANSCRIBE_MODEL` | modelo de transcrição de áudio | `whisper-1` |
| `WAHA_API_URL` / `WAHA_API_KEY` | envio das respostas pelo WAHA | vazio → somente devolve as mensagens |
| `WAHA_BUFFER_MS` | debounce de mensagens picotadas; `0` desliga | `6500` |
| `NEXT_PUBLIC_SITE_URL` | URL pública usada em links compartilháveis e prévias (Open Graph) | `VERCEL_PROJECT_PRODUCTION_URL` ou `localhost` |

`NEXT_PUBLIC_SITE_URL` aceita `https://exemplo.com` ou `exemplo.com` (o protocolo é completado). A home é
gerada estaticamente: ao mudar `WHATSAPP_NUMERO`, faça um novo deploy (a Vercel já
faz isso ao salvar variáveis e reimplantar). Como `/api/quiz` e `/api/channels` também são
estáticos, `USE_MOCKS` é uma escolha de **build** para essas rotas.

## Arquitetura

- **Next.js 16 (App Router, Cache Components)**, TypeScript estrito, Tailwind v4, pnpm.
- **Ports e adapters** em `src/lib/services`:
  - `types.ts` define as portas: `ProximityService`, `QuizService`, `BadgeService`,
    `ChannelsService` e `CommunityService` (contador agregado por bairro).
  - `mock/` traz as implementações simuladas, lidas de `src/data/mock-grid.json` e `src/content`.
  - `real/` traz os adapters da Equatorial, ainda vazios, com `TODO`s.
  - `index.ts` (`getServices()`) escolhe entre eles por `USE_MOCKS`.
- **Route Handlers** (todos com testes ao lado, validação com zod e mensagens em pt-BR):
  - `POST /api/proximity`: `{lat,lng}` ou `{bairroId}` → faixa `alto|medio|baixo`, tipo de ativo e distância arredondada. Nunca devolve coordenadas.
  - `GET /api/quiz`: perguntas **sem gabarito**.
  - `POST /api/quiz/submit`: `{respostas, primeiroNome?, bairroId?, nivel?}` → `{acertos, erradas[], resultados[], seloId?}`. O selo só sai com 3 de 3.
  - `GET /api/badge/[id]`: PNG 1080×1350; `?format=square` 1080×1080; `&download=1` para baixar.
  - `GET /api/channels`: canais oficiais.
  - `GET|POST /api/whatsapp/webhook`: Webhook unificado que atende tanto a **Meta WhatsApp Cloud API** quanto o **WAHA (WhatsApp HTTP API)** conforme o `fluxo bot.json` (n8n).
  - `POST /api/whatsapp/bot`: endpoint REST direto para conversar com o **EquaBot** (resposta educativa, quiz e selo).
- **Motor do Bot de WhatsApp (`src/lib/bot/`)**:
  - `knowledge.ts`: base de conhecimento de segurança elétrica, São Luís/MA, cuidados e ressarcimento de eletrodomésticos. O quiz do bot é derivado de `src/content/quiz.ts`.
  - `engine.ts`: inteligência conversacional, prioridade para risco, memória por sessão com TTL de 30 min e teto de sessões, quiz e selo.
  - `buffer.ts`: agrupa mensagens picotadas (padrão 6,5 s; `WAHA_BUFFER_MS=0` desliga).
  - `transcricao.ts`: transcrição best-effort de áudio pelo Whisper; sem chave/rede, usa o fallback educativo.
  - `waha-handler.ts`: pipeline do `fluxo bot.json` (filtro de grupos/API, áudio, buffer, anti-colisão com atendente de 50 min, envio com timeout).
- **`/selo/[id]`**: página pública do selo com `generateMetadata` (Open Graph com a imagem do selo, `noindex`); id inválido mostra a tela de selo inválido.
- **Selo sem banco**: o id é um token assinado (HMAC-SHA256 com `BADGE_SECRET`) que carrega só primeiro nome, bairro, faixa e data (data local de São Luís).
- **Segurança e abuso**: `POST /api/whatsapp/webhook` exige `WHATSAPP_WEBHOOK_SECRET` em produção; as rotas de webhook, bot, proximidade, quiz, selo e imagem têm limite de requisições por IP em memória (por instância).
- **Documentação do Bot**: veja o guia passo a passo em [`BOT_WHATSAPP_GUIA.md`](./BOT_WHATSAPP_GUIA.md).
- **Textos** em `src/content` (`site.ts`, `quiz.ts`, `cuidados.ts`, `placeholders.ts`).

### Como trocar os mocks pela integração real

1. Implemente as classes em `src/lib/services/real/index.ts` (mesmas interfaces de `types.ts`):
   proximidade com a camada georreferenciada de ativos, quiz e canais vindos do conteúdo validado, contador vindo da base de inscritos.
2. Defina `USE_MOCKS=false`.
3. Ligue o webhook do WhatsApp (`src/app/api/whatsapp/webhook/route.ts`): valide a assinatura oficial da Meta (`X-Hub-Signature-256`, com o App Secret), use uma máquina de estados persistente e envie pela Graph API. O caminho Meta atual é de simulação/contrato.

Os testes de rota rodam com `USE_MOCKS=true`, então continuam valendo como contrato.

### Produção e múltiplas instâncias

O estado do bot (sessões, buffer e rate limit) fica em memória. Uma instância suporta o piloto,
mas em serverless/múltiplas réplicas cada processo tem seu próprio estado: para produção real,
troque por Redis/Upstash (sessão, buffer, bloqueio de atendente e limites). A Vercel também exige
`BADGE_SECRET` no build e no runtime, porque a home é estática e gera o selo de exemplo.

## Privacidade (LGPD)

- A localização só é pedida depois da tela de consentimento; há sempre a opção "Escolher meu bairro".
- O navegador arredonda as coordenadas para 3 casas antes de enviar; o servidor só calcula a faixa e não guarda nada.
- O selo guarda só **primeiro nome** (uma palavra, até 20 letras, opcional), bairro, faixa e data.
- O nome do perfil do WhatsApp é reduzido ao primeiro nome antes de aparecer em mensagens e no selo.
- O histórico da conversa fica em memória, com teto por sessão e descarte após 30 minutos sem atividade.
- O contador por bairro é agregado e fictício.

## O que é simulado

| Peça | No MVP |
| --- | --- |
| Bot do WhatsApp | simulador nesta página; webhook só de teste |
| Linhas, subestações e bairros | fictícios, perto de lat/lng 0,0 (`src/data/mock-grid.json`) |
| Faixas de proximidade (300 m e 1.200 m) | limites fictícios do mock, **não são distâncias de segurança** |
| Quiz e cuidados | conteúdo de exemplo, a validar pela equipe técnica |
| Contador por bairro | números fictícios |
| Áudios (`public/audio/*.wav`) | placeholders (um sinal curto e silêncio); a transcrição visível é o texto de referência para gravar. No webhook, áudio real é transcrito se `OPENAI_API_KEY` estiver configurada |
| Selo | funciona de verdade (PNG e link), mas o benefício é placeholder |

## Placeholders a preencher

Nada abaixo foi inventado; cada item aparece na tela marcado como placeholder.

| Placeholder | Onde aparece | Fonte |
| --- | --- | --- |
| `{{NUMERO_WHATSAPP}}` | link `wa.me`, QR code, página do selo | env `WHATSAPP_NUMERO` |
| `{{CANAL_EQUATORIAL}}` | cuidados, explicações do quiz, barra "Falar com a Equatorial", tabela da banca | `src/content/placeholders.ts` |
| `{{DISTANCIA_A_VALIDAR}}` | cartão "Faísca ou estalo" | idem |
| `{{BENEFICIO_A_VALIDAR}}` | seção do selo, tabela da banca | idem |
| `{{A_VALIDAR}}` | aviso na seção "Em caso de risco" (conteúdo em validação) | idem |
| `{{URL_POLITICA_PRIVACIDADE}}` | rodapé | idem |
| Áudios | 9 arquivos em `public/audio/` (ver `LEIA-ME.txt`) | gravar a partir das transcrições |

## Bibliotecas

| Necessidade | Escolha | Motivo |
| --- | --- | --- |
| Diálogo do QR, menu, folha de localização | `@base-ui/react` | foco, fechamento e swipe acessíveis |
| Toast | `sonner` | leve e acessível |
| Animação | `motion` | fallback de rolagem quando o navegador não tem scroll-driven animations |
| QR code | `qrcode` | gera SVG no servidor, zero JS no cliente |
| Imagem do selo | `next/og` | já vem no Next |

## Movimento

- Só `transform` e `opacity` são animados. A história do topo usa **CSS scroll-driven animations**
  (`view-timeline`); onde não há suporte, `motion` (`scroll()`) faz o mesmo papel.
- Com `prefers-reduced-motion`, a história vira cartões estáticos equivalentes e nada se move.
- Sem WebGL: a cena é um SVG gerado no servidor.

## Qualidade medida

- Lighthouse mobile (build de produção, local): Performance 90–93, Acessibilidade 100, Boas práticas 100, SEO 100 (três rodadas).
- Capturas locais em `docs/capturas/` (não versionadas) em 390×844 e 1440×900.

## Deploy na Vercel

1. Suba este diretório para um repositório Git e importe na Vercel (ou rode `vercel` na pasta).
2. Defina `BADGE_SECRET` (**obrigatório no build e no runtime**) e, quando houver, `WHATSAPP_NUMERO`, `NEXT_PUBLIC_SITE_URL`, `WHATSAPP_WEBHOOK_SECRET` e as variáveis do WAHA (`WAHA_API_URL`, `WAHA_API_KEY`).
3. Se usar o webhook do WAHA, configure a URL com `?token=$WHATSAPP_WEBHOOK_SECRET` (ou o header `x-webhook-token`).

O framework é detectado sozinho; não há banco. O estado do bot é em memória (uma instância) — veja a seção de produção acima.

## Documentos

- Base de conhecimento: `docs/conhecimento-vizinho-alta-tensao.md`
- Guia do bot: `BOT_WHATSAPP_GUIA.md`
- Design de origem: `design/fonte/telas-e-tokens.html` e `design/fonte/cena-e-icones.js`
- Specs, planos e capturas ficam fora do repositório (o `.gitignore` ignora `docs/*`, exceto a base de conhecimento).
