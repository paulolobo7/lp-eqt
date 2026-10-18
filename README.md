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
| `pnpm build` / `pnpm start` | build de produção e servidor |
| `pnpm lint` | ESLint |
| `pnpm typecheck` | TypeScript estrito |
| `pnpm test` | testes unitários e de rota (Vitest) |
| `pnpm e2e` | Playwright: fluxo completo em 390×844 e 1440×900 (sobe `pnpm start` na porta 3200; rode `pnpm build` antes) |
| `pnpm shots` | só as capturas das seções, salvas em `docs/capturas/` |

O Playwright usa o Chromium dele; se ainda não tiver, rode `pnpm exec playwright install chromium`.

## Variáveis de ambiente

| Variável | Para quê | Padrão |
| --- | --- | --- |
| `USE_MOCKS` | `true` usa os serviços simulados; `false` liga os adapters reais | `true` |
| `WHATSAPP_NUMERO` | número do bot, só dígitos com DDI e DDD. Monta o link `wa.me` e o QR code | vazio → `{{NUMERO_WHATSAPP}}` |
| `WHATSAPP_VERIFY_TOKEN` | token de verificação do webhook (`GET /api/whatsapp/webhook`) | vazio |
| `BADGE_SECRET` | segredo HMAC que assina o id de cada selo. **Obrigatório em produção** (sem ele, usa um segredo de desenvolvimento e os selos podem ser forjados) | segredo de dev |
| `NEXT_PUBLIC_SITE_URL` | URL pública usada nas prévias (Open Graph) | `VERCEL_PROJECT_PRODUCTION_URL` ou `localhost` |

A home é gerada estaticamente: ao mudar `WHATSAPP_NUMERO`, faça um novo deploy (a Vercel já
faz isso ao salvar variáveis e reimplantar).

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
  - `GET /api/channels`: canais oficiais (placeholders).
  - `GET|POST /api/whatsapp/webhook`: stub da WhatsApp Business Platform, com TODOs.
- **`/selo/[id]`**: página pública do selo com `generateMetadata` (Open Graph com a imagem do selo, `noindex`).
- **Selo sem banco**: o id é um token assinado (HMAC-SHA256 com `BADGE_SECRET`) que carrega só primeiro nome, bairro, faixa e data.
- **Textos** em `src/content` (`site.ts`, `quiz.ts`, `cuidados.ts`, `placeholders.ts`).

### Como trocar os mocks pela integração real

1. Implemente as classes em `src/lib/services/real/index.ts` (mesmas interfaces de `types.ts`):
   proximidade com a camada georreferenciada de ativos, quiz e canais vindos do conteúdo validado, contador vindo da base de inscritos.
2. Defina `USE_MOCKS=false`.
3. Ligue o webhook do WhatsApp (`src/app/api/whatsapp/webhook/route.ts`): validar `X-Hub-Signature-256`, máquina de estados do bot, envio pela Graph API.

Os testes de rota rodam com `USE_MOCKS=true`, então continuam valendo como contrato.

## Privacidade (LGPD)

- A localização só é pedida depois da tela de consentimento; há sempre a opção "Escolher meu bairro".
- O navegador arredonda as coordenadas para 3 casas antes de enviar; o servidor só calcula a faixa e não guarda nada.
- O selo guarda só **primeiro nome** (uma palavra, até 20 letras, opcional), bairro, faixa e data.
- O contador por bairro é agregado e fictício.

## O que é simulado

| Peça | No MVP |
| --- | --- |
| Bot do WhatsApp | simulador nesta página; webhook só de teste |
| Linhas, subestações e bairros | fictícios, perto de lat/lng 0,0 (`src/data/mock-grid.json`) |
| Faixas de proximidade (300 m e 1.200 m) | limites fictícios do mock, **não são distâncias de segurança** |
| Quiz e cuidados | conteúdo de exemplo, a validar pela equipe técnica |
| Contador por bairro | números fictícios |
| Áudios (`public/audio/*.wav`) | placeholders (um sinal curto e silêncio); a transcrição visível é o texto de referência para gravar |
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
- Capturas em `docs/capturas/` (390×844 e 1440×900), comparadas com `design/referencia/`.

## Deploy na Vercel

1. Suba este diretório para um repositório Git e importe na Vercel (ou rode `vercel` na pasta).
2. Defina `BADGE_SECRET` (obrigatório) e, quando houver, `WHATSAPP_NUMERO` e `NEXT_PUBLIC_SITE_URL`.

O framework é detectado sozinho; não há banco nem serviço externo para configurar.

## Documentos

- Spec: `docs/specs/2026-10-16-landing-vizinho-alta-tensao.md`
- Plano: `docs/plans/2026-10-16-plano-landing.md`
- Design de origem: `design/`
