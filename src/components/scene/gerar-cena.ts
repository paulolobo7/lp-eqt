/**
 * Cena "A rede que protege a vizinhança" — porta de design/fonte/cena-e-icones.js.
 * Gera SVG no servidor (zero JS no cliente), dirigido por variáveis CSS:
 *   --p     progresso da rolagem (0..1)        --m   multiplicador do parallax (0 = sem movimento)
 *   --cam   câmera do parallax (0..1; ver .historia no globals.css)
 *   --s1..3 exposição, risco de dano, emergência   --dawn amanhecer
 * Só opacity e transform mudam com a rolagem.
 */

type Opcoes = { seed?: number; still?: boolean; prefixo: string };
type Pt = { x: number; y: number };

const v = (n: string, d: number | string) => `var(--${n},${d})`;
// Parallax por profundidade: k acompanha a história toda (--p); c segue a câmera (--cam).
const P = (k: number, c = 0) => `transform:translate3d(0,calc((${v("p", 0)} * ${k} + ${v("cam", 0)} * ${c}) * ${v("m", 1)} * 1px),0)`;
const f1 = (n: number) => Number(n.toFixed(1));

export function gerarCena(W: number, opt: Opcoes): string {
  const id = (n: string) => `${opt.prefixo}-${n}`;
  const url = (n: string) => `url(#${id(n)})`;
  const H = 900;
  const k = W < 900 ? 0.78 : 1;
  let sd = opt.seed ?? 11;
  const r = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
  const q = (a: Pt, c: Pt, b: Pt, t: number): Pt => ({
    x: (1 - t) * (1 - t) * a.x + 2 * (1 - t) * t * c.x + t * t * b.x,
    y: (1 - t) * (1 - t) * a.y + 2 * (1 - t) * t * c.y + t * t * b.y,
  });

  let s = `<defs>
<linearGradient id="${id("night")}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#080A30"/><stop offset=".62" stop-color="#14185F"/><stop offset="1" stop-color="#1E2370"/></linearGradient>
<linearGradient id="${id("dawn")}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1B2070"/><stop offset=".5" stop-color="#3F35A8"/><stop offset=".82" stop-color="#4FA9E6"/><stop offset="1" stop-color="#BFEAFF"/></linearGradient>
<radialGradient id="${id("sun")}" cx=".5" cy="1" r=".7"><stop offset="0" stop-color="#E3F6FF" stop-opacity=".95"/><stop offset=".35" stop-color="#5AC8FA" stop-opacity=".4"/><stop offset="1" stop-color="#8B5CF6" stop-opacity="0"/></radialGradient>
<radialGradient id="${id("moon")}" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#5AC8FA" stop-opacity=".22"/><stop offset="1" stop-color="#5AC8FA" stop-opacity="0"/></radialGradient>
<linearGradient id="${id("cable")}" x1="0" x2="1"><stop offset="0" stop-color="#5AC8FA"/><stop offset="1" stop-color="#8B5CF6"/></linearGradient>
<linearGradient id="${id("fog")}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#14185F" stop-opacity="0"/><stop offset="1" stop-color="#0A0D3C" stop-opacity=".9"/></linearGradient>
<radialGradient id="${id("amb")}" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#FFB020" stop-opacity=".85"/><stop offset="1" stop-color="#FFB020" stop-opacity="0"/></radialGradient>
<radialGradient id="${id("cy")}" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#5AC8FA" stop-opacity=".5"/><stop offset="1" stop-color="#5AC8FA" stop-opacity="0"/></radialGradient>
</defs>`;

  // céu
  s += `<rect width="${W}" height="${H}" fill="${url("night")}"/>`;
  s += `<rect width="${W}" height="${H}" fill="${url("dawn")}" style="opacity:${v("dawn", 0)}"/>`;
  s += `<ellipse cx="${f1(W * 0.38)}" cy="${H}" rx="${f1(W * 0.7)}" ry="${H * 0.55}" fill="${url("sun")}" style="opacity:${v("dawn", 0)}"/>`;
  s += `<circle cx="${f1(W * 0.72)}" cy="${H * 0.3}" r="${f1(360 * k)}" fill="${url("moon")}" style="opacity:calc(1 - ${v("dawn", 0)})"/>`;
  const sb = ["", "", ""];
  for (let i = 0; i < Math.round((90 * W) / 1440) + 20; i++) {
    const cx = r() * W, cy = r() * H * 0.6, rr = 0.5 + r() * 1.2;
    sb[Math.floor(r() * 3)] += `M${(cx - rr).toFixed(1)} ${cy.toFixed(1)}a${rr.toFixed(2)} ${rr.toFixed(2)} 0 1 0 ${(2 * rr).toFixed(2)} 0a${rr.toFixed(2)} ${rr.toFixed(2)} 0 1 0 ${(-2 * rr).toFixed(2)} 0`;
  }
  s += `<g style="opacity:calc(1 - ${v("dawn", 0)});${P(-40, -60)}">${sb.map((d, j) => `<path d="${d}" fill="#F5F7FF" opacity="${0.3 + j * 0.25}"/>`).join("")}</g>`;

  // camada 1: colinas e torres distantes
  let far = `<path d="M0 690 C${f1(W * 0.18)} 640 ${f1(W * 0.36)} 700 ${f1(W * 0.55)} 660 S${f1(W * 0.85)} 650 ${W} 630 V${H} H0Z" fill="#191E6C"/>`;
  [0.1, 0.3, 0.92].forEach((fr, i) => {
    const x = f1(W * fr), h = 120 - i * 18, b = 670 - i * 4;
    far += `<path d="M${x - 16} ${b} L${x} ${b - h} L${x + 16} ${b} M${x - 26} ${b - h + 22} H${x + 26} M${x - 9} ${b - 50} L${x + 9} ${b - 20}" stroke="#3B43A6" stroke-width="1.4" fill="none"/>`;
  });
  far += `<path d="M${f1(W * 0.1 - 26)} 578 Q${f1(W * 0.2)} 620 ${f1(W * 0.3 - 26)} 590" stroke="#5AC8FA" stroke-opacity=".3" fill="none"/>`;
  s += `<g style="${P(-14, -32)}">${far}</g>`;
  s += `<rect y="560" width="${W}" height="340" fill="${url("fog")}"/>`;

  // camada 2: torre principal + cabos
  const tx = W * (W < 900 ? 0.68 : 0.7), base = 790, top = base - 600 * k, bw = 95 * k, tw = 18 * k;
  const lx = (y: number) => tx - bw + ((bw - tw) * (base - y)) / (base - top);
  const rx = (y: number) => 2 * tx - lx(y);
  let torre = `<path d="M${f1(tx - bw)} ${base} L${f1(tx - tw)} ${f1(top)} L${f1(tx)} ${f1(top - 44 * k)} L${f1(tx + tw)} ${f1(top)} L${f1(tx + bw)} ${base}"/>`;
  const n = 10;
  for (let i = 0; i < n; i++) {
    const ya = top + ((base - top) * i) / n, yb = top + ((base - top) * (i + 1)) / n;
    torre += `<path d="M${f1(lx(ya))} ${f1(ya)} L${f1(rx(yb))} ${f1(yb)} M${f1(rx(ya))} ${f1(ya)} L${f1(lx(yb))} ${f1(yb)}"/>`;
  }
  const y1 = top + 70 * k, y2 = top + 165 * k, h1 = 190 * k, h2 = 150 * k;
  torre += `<path d="M${f1(tx - h1)} ${f1(y1)} H${f1(tx + h1)} M${f1(tx - h1)} ${f1(y1)} L${f1(lx(y1 + 30 * k))} ${f1(y1 + 30 * k)} M${f1(tx + h1)} ${f1(y1)} L${f1(rx(y1 + 30 * k))} ${f1(y1 + 30 * k)}"/>`;
  torre += `<path d="M${f1(tx - h2)} ${f1(y2)} H${f1(tx + h2)} M${f1(tx - h2)} ${f1(y2)} L${f1(lx(y2 + 28 * k))} ${f1(y2 + 28 * k)} M${f1(tx + h2)} ${f1(y2)} L${f1(rx(y2 + 28 * k))} ${f1(y2 + 28 * k)}"/>`;
  [[tx - h1, y1], [tx + h1, y1], [tx - h2, y2], [tx + h2, y2]].forEach(([x, y]) => (torre += `<path d="M${f1(x)} ${f1(y)} V${f1(y + 20 * k)}" stroke-width="3"/>`));
  let tower = `<g stroke="#9AA3F0" stroke-opacity=".62" stroke-width="1.6" fill="none" stroke-linejoin="round">${torre}</g>`;
  tower += `<ellipse cx="${f1(tx)}" cy="${base + 6}" rx="${f1(170 * k)}" ry="20" fill="${url("cy")}" opacity=".5"/>`;

  const at = {
    L1: { x: tx - h1, y: y1 + 20 * k }, R1: { x: tx + h1, y: y1 + 20 * k },
    L2: { x: tx - h2, y: y2 + 20 * k }, R2: { x: tx + h2, y: y2 + 20 * k },
  };
  const cab: [Pt, Pt, Pt][] = [
    [{ x: -30, y: y1 + 70 }, { x: at.L1.x * 0.5, y: y1 + 190 }, at.L1],
    [at.R1, { x: (at.R1.x + W) / 2, y: y1 + 150 }, { x: W + 30, y: y1 + 60 }],
    [{ x: -30, y: y2 + 90 }, { x: at.L2.x * 0.5, y: y2 + 210 }, at.L2],
    [at.R2, { x: (at.R2.x + W) / 2, y: y2 + 160 }, { x: W + 30, y: y2 + 80 }],
  ];
  const pd = (c: [Pt, Pt, Pt]) => `M${f1(c[0].x)} ${f1(c[0].y)} Q${f1(c[1].x)} ${f1(c[1].y)} ${f1(c[2].x)} ${f1(c[2].y)}`;
  let cables = "", flashes = "";
  cab.forEach((c, i) => {
    const d = pd(c);
    cables += `<path d="${d}" stroke="#5AC8FA" stroke-width="12" opacity=".07" fill="none"/>`;
    cables += `<path d="${d}" stroke="#5AC8FA" stroke-width="5" opacity=".18" fill="none"/>`;
    cables += `<path d="${d}" stroke="${url("cable")}" stroke-width="1.8" fill="none"/>`;
    // Flash de luz correndo pelo cabo, em ritmo defasado: dois halos (borda suave) e o núcleo. Ver .vat-flash no CSS.
    const ritmo = `animation-duration:${(5 + i * 0.7).toFixed(1)}s;animation-delay:${(-i * 1.3).toFixed(1)}s`;
    [[14, "#5AC8FA", ".14"], [7, "#A9E2FC", ".35"], [2.6, "#F5FBFF", "1"]].forEach(([lw, cor, op]) => {
      flashes += `<path d="${d}" pathLength="1000" class="vat-flash" stroke="${cor}" stroke-width="${lw}" stroke-linecap="round" opacity="${op}" fill="none" style="${ritmo}"/>`;
    });
  });
  // Na emergência o bairro fica sem luz: o flash apaga junto.
  if (!opt.still) cables += `<g style="opacity:calc(1 - ${v("s3", 0)})">${flashes}</g>`;

  // exposição: pipa presa no cabo + cerca com placa
  const kp = q(cab[0][0], cab[0][1], cab[0][2], 0.62);
  let s1 = `<g transform="translate(${f1(kp.x)} ${f1(kp.y + 4)})"><path d="M0 0 L22 30 L0 70 L-22 30 Z" fill="#8B5CF6" fill-opacity=".35" stroke="#F5F7FF" stroke-width="1.6"/><path d="M-22 30 H22 M0 0 V70" stroke="#F5F7FF" stroke-width="1" opacity=".6"/><path d="M0 70 C-14 96 18 112 2 140 C-10 160 10 172 0 196" stroke="#F5F7FF" stroke-width="1.2" fill="none" opacity=".7"/></g>`;
  s1 += `<circle cx="${f1(kp.x)}" cy="${f1(kp.y)}" r="18" fill="${url("amb")}"/>`;
  let cerca = "";
  for (let x = tx - 170 * k; x <= tx + 170 * k; x += 24 * k) cerca += `M${f1(x)} ${base + 4} V${f1(base - 40 * k)}`;
  s1 += `<g stroke="#B8BEEA" stroke-width="1.4" opacity=".7"><path d="${cerca}"/><path d="M${f1(tx - 170 * k)} ${f1(base - 30 * k)} H${f1(tx + 170 * k)} M${f1(tx - 170 * k)} ${f1(base - 12 * k)} H${f1(tx + 170 * k)}"/></g>`;
  s1 += `<path d="M${f1(tx)} ${f1(base - 62 * k)} l20 34 h-40 z" fill="#14185F" stroke="#FFB020" stroke-width="2" stroke-linejoin="round"/><path d="M${f1(tx)} ${f1(base - 50 * k)} v10 M${f1(tx)} ${f1(base - 34 * k)} v.5" stroke="#FFB020" stroke-width="2.4" stroke-linecap="round"/>`;

  // risco de dano: arco elétrico no cabo
  const sp = q(cab[2][0], cab[2][1], cab[2][2], 0.7);
  let s2 = `<path d="${pd(cab[2])}" stroke="#FFB020" stroke-width="8" opacity=".18" fill="none"/><path d="${pd(cab[2])}" stroke="#FFB020" stroke-width="2.2" fill="none"/>`;
  s2 += `<circle cx="${f1(sp.x)}" cy="${f1(sp.y)}" r="48" fill="${url("amb")}" opacity=".8"/><circle cx="${f1(sp.x)}" cy="${f1(sp.y)}" r="5" fill="#FFF3D6"/>`;
  s2 += `<g stroke="#FFD58A" stroke-width="1.8" stroke-linecap="round"><path d="${[0, 1, 2, 3, 4, 5, 6, 7]
    .map((i) => {
      const a = (i * Math.PI) / 4 + 0.3, r1 = 12, r2 = 22 + (i % 2) * 10;
      return `M${f1(sp.x + Math.cos(a) * r1)} ${f1(sp.y + Math.sin(a) * r1)} L${f1(sp.x + Math.cos(a) * r2)} ${f1(sp.y + Math.sin(a) * r2)}`;
    })
    .join("")}"/></g>`;

  // emergência: cabo rompido + faixa de isolamento
  const rompido = `M${f1(at.R2.x)} ${f1(at.R2.y)} Q${f1(at.R2.x + 70 * k)} ${f1(at.R2.y + 120)} ${f1(at.R2.x + 40 * k)} ${base - 10}`;
  let s3 = `<path d="${rompido}" stroke="#FFB020" stroke-width="2" fill="none"/><path d="${rompido}" stroke="#FFB020" stroke-width="8" opacity=".18" fill="none"/>`;
  s3 += `<ellipse cx="${f1(tx)}" cy="${base + 4}" rx="${f1(250 * k)}" ry="34" fill="none" stroke="#FFB020" stroke-width="2" stroke-dasharray="10 12" opacity=".9"/>`;
  s += `<g style="${P(-6, -10)}">${tower}<g style="opacity:calc(1 - ${v("s3", 0)} * .75)">${cables}</g><g style="opacity:${v("s1", 0)}">${s1}</g><g style="opacity:${v("s2", 0)}">${s2}</g><g style="opacity:${v("s3", 0)}">${s3}</g></g>`;

  // camada 3: casas (janelas acendem com --dawn; algumas apagam na emergência)
  function fileira(b: number, minW: number, maxW: number, minH: number, maxH: number, fill: string, edge: string, win: number, frente: boolean) {
    let out = "", x = -20 - r() * 30, pane = "", noite = "";
    const picos: Pt[] = [];
    const bk = ["", "", "", "", "", ""];
    while (x < W + 20) {
      const w = minW + r() * (maxW - minW), h = minH + r() * (maxH - minH), y = b - h, gab = r() > 0.4, rh = gab ? 16 + r() * 24 : 0;
      out += gab
        ? `<path d="M${f1(x)} ${f1(y)} L${f1(x + w / 2)} ${f1(y - rh)} L${f1(x + w)} ${f1(y)} V${b} H${f1(x)}Z" fill="${fill}" stroke="${edge}" stroke-width="1"/>`
        : `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(h)}" fill="${fill}" stroke="${edge}" stroke-width="1"/>`;
      picos.push({ x: x + w / 2, y: y - rh });
      const cols = Math.max(1, Math.floor((w - 14) / (win * 2.3)));
      const rows = Math.min(3, Math.max(1, Math.floor((h - 26) / (win * 2.6))));
      const gx = (w - cols * win * 2.3 + win * 1.3) / 2;
      for (let c = 0; c < cols; c++)
        for (let rr = 0; rr < rows; rr++) {
          const wx = x + gx + c * win * 2.3, wy = y + 14 + rr * win * 2.6, t = r() * 0.75, wh = win * 1.25;
          const rd = `M${wx.toFixed(1)} ${wy.toFixed(1)}h${win}v${wh.toFixed(1)}h${-win}Z`;
          pane += rd;
          if (r() < 0.22) noite += rd;
          bk[Math.min(5, Math.floor((t / 0.75) * 6))] += rd;
        }
      x += w + 4 + r() * 18;
    }
    out += `<path d="${pane}" fill="#262D8C" opacity=".8"/><path d="${noite}" fill="#8FD9FF" style="opacity:calc((1 - ${v("s3", 0)}) * .85)"/>`;
    bk.forEach((d, j) => (out += `<path d="${d}" fill="#D7F3FF" style="opacity:calc((${v("dawn", 0)} * 1.75 - ${((j / 6) * 0.75).toFixed(3)}) * 5)"/>`));
    if (frente) {
      // Linhas de conexão entre as casas nascem no amanhecer (opacity em sequência).
      for (let i = 0; i < picos.length - 1; i++) {
        const a = picos[i], c = picos[i + 1], t = ((i / picos.length) * 0.7).toFixed(2);
        const o = `calc((${v("dawn", 0)} * 1.75 - ${t}) * 5)`;
        out += `<path d="M${f1(a.x)} ${f1(a.y)} Q${f1((a.x + c.x) / 2)} ${f1(Math.min(a.y, c.y) - 46)} ${f1(c.x)} ${f1(c.y)}" stroke="#5AC8FA" stroke-width="1.6" fill="none" style="opacity:${o}"/>`;
        out += `<circle cx="${f1(a.x)}" cy="${f1(a.y)}" r="3.5" fill="#E3F6FF" style="opacity:${o}"/>`;
      }
    }
    return out;
  }
  s += `<g style="${P(10, 4)}">${fileira(860, 56, 120, 60, 150, "#171C66", "#232A85", 7, false)}</g>`;
  s += `<g style="${P(26, 10)}">${fileira(912, 90, 170, 100, 210, "#0D1150", "#2A318F", 11, true)}</g>`;
  return `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMax slice" width="100%" height="100%" aria-hidden="true" focusable="false" style="display:block">${s}</svg>`;
}

/** Rede de casas do "Efeito vizinhança", dirigida por --q (0..1). Só opacity. */
export function gerarRede(W: number, H: number, N: number, prefixo: string): string {
  let sd = 5;
  const r = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
  const pts: (Pt & { t: string })[] = [];
  let tentativas = 0;
  while (pts.length < N && tentativas++ < 5000) {
    const p = { x: 40 + r() * (W - 80), y: 40 + r() * (H - 80), t: "0" };
    if (pts.every((o) => Math.hypot(o.x - p.x, o.y - p.y) > 58)) pts.push(p);
  }
  pts.sort((a, b) => a.x + a.y * 0.4 - (b.x + b.y * 0.4));
  pts.forEach((p, i) => (p.t = ((i / N) * 0.8).toFixed(3)));
  const o = (t: string) => `calc((var(--q,0) * 1.25 - ${t}) * 6)`;
  let e = "", h = "";
  pts.forEach((p, i) => {
    const perto = pts
      .map((o2, j) => ({ j, d: Math.hypot(o2.x - p.x, o2.y - p.y) }))
      .filter((a) => a.j < i)
      .sort((a, b) => a.d - b.d)
      .slice(0, 2);
    perto.forEach(({ j }) => {
      const b = pts[j];
      e += `<path d="M${f1(b.x)} ${f1(b.y)} L${f1(p.x)} ${f1(p.y)}" stroke="url(#${prefixo}-g)" stroke-width="1.4" style="opacity:${o(p.t)}"/>`;
    });
    h += `<g transform="translate(${f1(p.x - 14)} ${f1(p.y - 14)})"><path d="M2 13 14 3l12 10v13H2Z" fill="#14185F" stroke="#3B43A6" stroke-width="1.4"/><path d="M2 13 14 3l12 10v13H2Z" fill="#1E2370" stroke="#5AC8FA" stroke-width="1.6" style="opacity:${o(p.t)}"/><rect x="10" y="14" width="8" height="7" rx="1" fill="#D7F3FF" style="opacity:${o(p.t)}"/></g>`;
  });
  return `<svg viewBox="0 0 ${W} ${H}" width="100%" aria-hidden="true" focusable="false" style="display:block"><defs><linearGradient id="${prefixo}-g" x1="0" x2="1"><stop offset="0" stop-color="#5AC8FA"/><stop offset="1" stop-color="#8B5CF6"/></linearGradient></defs>${e}${h}</svg>`;
}
