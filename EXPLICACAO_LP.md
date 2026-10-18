# Vizinho de Alta Tensão — como a Landing Page funciona

Resumo técnico do protótipo `project/Landing.dc.html` (+ `scene.js`), e opções de caminho para o chatbot.

> Importante: o "bot" da página **é uma simulação 100% no navegador**. Não existe backend, WhatsApp, GPS real nem áudio real. Tudo que parece dado (bairros, distâncias, contadores) é fictício ou `{{placeholder}}`.

---

## 1. Visão geral

Landing imersiva, mobile-first, com dois papéis:
1. Apresentar o projeto à banca do hackathon.
2. Ser a porta de entrada pública para um bot de WhatsApp (oi → localização → risco → cuidados → quiz → selo compartilhável).

Fluxo do cidadão: **oi → localização (ou bairro) → "mora perto?" → cuidados (imagem + áudio) → quiz de 3 perguntas → selo**.

## 2. Arquivos

| Arquivo | Papel |
|---|---|
| `Landing.dc.html` | Página completa: template (HTML + estilos inline) e uma classe `Component` com toda a lógica |
| `scene.js` | Geradores SVG: `VAT_SCENE` (cena noite→amanhecer), `VAT_NET` (rede de casas), `VAT_IC` (ícones). **Peça mais reaproveitável** |
| `support.js` | Runtime do protótipo (`DCLogic`, `<sc-if>`, `<sc-for>`). **Não portar** |
| `_ds/.../styles.css` | Sistema "Nocturne": `.btn`, `.tag`, `.seg`, `.dialog`, foco |
| `Fundamentos.dc.html` | Tokens, ícones, selo (3 variações), movimento, telas M1–M10 |

Alvo de produção definido no handoff: **Next.js (App Router) + TypeScript + Tailwind + motion**.

## 3. Seções da página

Nav fixa → **Hero (520vh, sticky)** → **Como funciona + simulador de chat** → **Selo** → **Efeito vizinhança** → **Impacto** → **Em caso de risco** → **Para a banca** → Convite final → Rodapé (LGPD). No mobile: barra fixa "Falar no WhatsApp" e menu em tela cheia.

## 4. Como funciona por dentro

### 4.1 Cena controlada pela rolagem (hero)
- O hero tem 520vh com um filho `sticky` de 100vh. Em cada scroll (throttled por `requestAnimationFrame`) calcula-se `p = -rect.top / (altura - innerHeight)` (0..1).
- A partir de `p` são gravadas variáveis CSS **só na seção hero**: `--p`, `--s0..--s4` (opacidade de cada um dos 5 estágios de texto, centrados em 0, .25, .5, .75, 1) e `--dawn` (amanhecer, `clamp((p-.74)/.2)`).
- O SVG da cena **não é re-renderizado**: ele usa `var(--sN)`/`var(--dawn)` dentro de `style` (opacidade das janelas, arco elétrico, cabo rompido, céu). Ou seja, a animação é CSS puro dirigida por variáveis — barato e sem React no loop.
- Parallax em 3 camadas (`translate3d(0, p * --m * k px, 0)`); `--m = 0` com `prefers-reduced-motion`.
- Cabos: pulso de luz via `stroke-dashoffset` animado. Sem `filter: blur` no SVG (travava); brilho é feito com traços largos de baixa opacidade e gradientes radiais.
- `VAT_SCENE(W)` é gerada com PRNG com seed fixa (determinística): W=520 no mobile, 1440 no desktop. A mesma função gera a cena estática do "Convite final" (seed 23, `still:true`).

### 4.2 Simulador de chat (máquina de estados em `Component`)
- Estado: `step (1–5)`, `msgs[]`, `replies[]` (máx. 3), `typing`, `sheet`, `bairro`, `playing`, `speed`, `sealEarned`…
- Tipos de mensagem: `botText, userText, userLoc, image, audio, locReq, result, quiz, fbOk, fbBad, seal`.
- `say(items, replies, step)` enfileira mensagens do bot com "digitando…" (750 ms na 1ª, depois 450 ms + 7 ms/caractere, máx. 600) e só então mostra as respostas rápidas.
- Fluxo codificado em `act()`: `askLoc` → bottom sheet de consentimento → `shareLoc` (sempre resolve para "Vila Esperança") **ou** `pickMenu` → 3 bairros → `result()` → cuidados → `quiz` → `answer()` (errou = feedback amarelo + "Tentar de novo"; acertou 3 = selo).
- Os passos do lado esquerdo (1–5) acompanham `step`, com borda gradiente no ativo e check verde nos concluídos.
- Áudios são fake: `play()` só alterna um estado por 4 s e anima barras; a transcrição fica sempre visível (acessibilidade).
- Dados/conteúdo ficam em constantes no topo: `BAIRROS`, `LV` (níveis perto/médio/longe), `QUIZ`, `STEPS`, `RISKS`, `IMPACT`, `ARCH`, `ROADMAP`, `PH` (placeholders).

### 4.3 Selo
- Cartão 3D: `perspective:1200px`; no `mousemove` atualiza `--rx/--ry/--gx` (até ~12°), com reflexo holográfico (gradiente deslocado por `--gx`).
- Formato Status 1080×1350 / Quadrado 1080×1080 troca `aspect-ratio`. Nome/bairro/data/código (`VAT-7K2Q`) são **fixos** no protótipo.
- "Compartilhar": Web Share API; fallback copia o link. "Baixar": hoje só mostra um toast (a geração da imagem não existe).

### 4.4 Efeito vizinhança
- `VAT_NET(820,420,26)` desenha 26 casas e arestas; `--q` (0..1, calculado pela posição da seção na tela) acende casas e traça linhas. Contadores por bairro são fictícios; ganha +1 quando o usuário completa o quiz.

### 4.5 Outros
- CTA principal abre modal: **QR de exemplo** (desktop, desenhado aleatoriamente — não é um QR real) ou botão "Abrir o WhatsApp" (mobile, hoje `href="#topo"`). Destino previsto: `wa.me/{{NUMERO_WHATSAPP}}`.
- Brilho que segue o mouse (halo ciano/violeta com easing 0.16): só em ponteiro fino, desligado com reduzir movimento, no chat em tela cheia, QR e menu; liga/desliga pela prop `glow`.
- Parâmetros de URL para depurar estados: `?p=0|.5|1`, `?at=<id>`, `?full=1`, `?demo=sheet|perto|medio|longe|quiz|ok|erro|selo`, `&only=result`, `?menu=1`.
- Acessibilidade: foco visível 2px ciano, alvos ≥ 48px, `role="log" aria-live` no chat, `aria-current="step"`, reduce-motion tratado.

### 4.6 O que é placeholder (não inventar)
`{{CANAL_EQUATORIAL}}`, `{{NUMERO_WHATSAPP}}`, `{{DISTANCIA_A_VALIDAR}}`, `{{BENEFICIO_A_VALIDAR}}`, `{{A_VALIDAR}}`; logo da Equatorial (caixa tracejada); conteúdo do quiz/cuidados em validação técnica.

### 4.7 Pontos de atenção para o porte
- Template depende de `support.js` (`DCLogic`, `<sc-if>/<sc-for>`) → reescrever em React/TSX; manter a estratégia "variáveis CSS na seção + rAF" em vez de estado React por scroll.
- `scene.js` injeta SVG via `dangerouslySetInnerHTML` com strings → portar para componentes React que retornam o mesmo SVG (mantendo `var(--…)` nos estilos).
- IDs de gradiente/filtros duplicados no DOM (`vNight`, `nG`…) se a cena aparecer duas vezes (hero + convite) → prefixar por instância.
- `shareLoc` ignora a localização real; `download` e áudios são stubs; QR é decorativo.
- Estado da simulação é local: nada persiste, contador "+1" some ao recarregar.

---

## 5. Opções para o chatbot

O desafio é o que fazer com o chat: ele já existe como **simulação**; a pergunta é onde mora o "bot real". Quatro caminhos (combináveis).

### Opção A — Manter só a simulação na LP (MVP/banca)
O bot real fica para a Fase 2; a LP demonstra a experiência.
- **Prós:** zero backend, zero risco, funciona offline, perfeito para pitch; já pronto.
- **Contras:** nada é real; não gera dados nem selo verdadeiro; "Para a banca" precisa deixar isso claro (já deixa, com as tags *Simulado no MVP*).
- **Esforço:** ~0 (só portar para Next).

### Opção B — Chat real embutido na LP (web chat)
O widget do celular passa a falar com APIs próprias (`/api/proximity`, `/api/quiz`, `/api/quiz/submit`, `/api/badge/[id]`), como já sugere o handoff. A lógica `act()/say()/answer()` vira cliente; as regras vão ao servidor.
- **Prós:** funciona para qualquer pessoa sem WhatsApp; dá para medir funil; reaproveita 100% da UI; selo real (imagem gerada, link único).
- **Contras:** não é o canal-alvo (WhatsApp); exige backend, base de ativos, geração de imagem do selo; LGPD para localização na web.
- **Esforço:** médio. Bom como "versão web" e para fallback de quem não tem WhatsApp.
- **Variante com LLM:** só para perguntas livres; manter quiz/risco **determinísticos** (conteúdo de segurança precisa ser validado, não improvisado).

### Opção C — Bot no WhatsApp, fora da LP (o canal-alvo)
A LP vira só porta de entrada: o CTA abre `wa.me/<número>?text=Oi` (QR real no desktop). O bot roda na **WhatsApp Business Platform (Cloud API)** com webhook (Next.js route handler ou serviço separado).
- **Fluxo:** mensagem recebida → webhook → máquina de estados (mesma dos `act()`) → respostas com botões/lista, mensagem de localização nativa, imagens e áudios → selo enviado como imagem + link.
- **Prós:** onde o cidadão já está; localização e áudio nativos; compartilhamento viral pelo status.
- **Contras:** exige número verificado, templates aprovados pela Meta, custo por conversa, política de privacidade publicada; a LP deixa de demonstrar ao vivo (manter a simulação como "demo" ajuda).
- **Esforço:** médio-alto. Reaproveita textos (`QUIZ`, `LV`, `RISKS`) centralizados em `src/content`.

### Opção D — Híbrido (recomendado)
1. **Agora (hackathon):** A + um webhook de teste (como já descreve a tabela da banca: "Simulador nesta página e webhook de teste").
2. **Piloto:** C com número real; a LP mantém o simulador como demonstração e o CTA/QR passam a ser reais.
3. **Opcional:** B como fallback web, compartilhando o mesmo motor de conversa.

**Arquitetura sugerida para não duplicar lógica:** extrair a máquina de estados do chat para um módulo puro (`conversation engine`: estado + evento → mensagens + respostas), usado tanto pelo simulador da LP quanto pelo webhook do WhatsApp. Conteúdo em `src/content` (validado pela Equatorial), adaptadores finos por canal (UI web / WhatsApp).

### Comparativo rápido

| | A. Só simulação | B. Chat web real | C. WhatsApp real | D. Híbrido |
|---|---|---|---|---|
| Esforço | Mínimo | Médio | Médio-alto | Escalonado |
| Backend | Não | Sim | Sim | Sim (gradual) |
| Canal-alvo atendido | Não | Parcial | Sim | Sim |
| Funciona na banca ao vivo | Sim | Sim | Depende de número/Meta | Sim |
| Dados/selo reais | Não | Sim | Sim | Sim |
| Risco | Baixo | Médio | Médio (aprovação Meta, LGPD) | Baixo-médio |

### Decisões que destravam a escolha
1. O hackathon exige bot funcional ou apenas protótipo + roadmap?
2. Existe (ou dá para obter a tempo) um número/conta Business verificada?
3. A Equatorial vai fornecer a camada de ativos (linhas/subestações) e a distância-limite `{{DISTANCIA_A_VALIDAR}}`?
4. Quem valida o conteúdo de segurança (quiz, cuidados, áudios)?
5. Onde guardar dados mínimos (primeiro nome, bairro, faixa de risco) e qual a base legal/consentimento (LGPD)?
