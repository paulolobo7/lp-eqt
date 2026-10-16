// Cena "A rede que protege a vizinhança" — SVG gerado, dirigido por variáveis CSS:
// --p (progresso 0..1), --m (multiplicador de parallax; 0 = reduzir movimento),
// --s1 exposição, --s2 risco de dano, --s3 emergência, --dawn amanhecer.
(function () {
  const v = (n, d) => `var(--${n},${d})`;
  const P = (k) => `transform:translate3d(0,calc(${v('p', 0)} * ${v('m', 1)} * ${k}px),0)`;

  window.VAT_SCENE = function (W, opt) {
    opt = opt || {};
    const H = 900, k = W < 900 ? 0.78 : 1;
    let sd = opt.seed || 11;
    const r = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
    const q = (a, c, b, t) => ({ x: (1 - t) * (1 - t) * a.x + 2 * (1 - t) * t * c.x + t * t * b.x, y: (1 - t) * (1 - t) * a.y + 2 * (1 - t) * t * c.y + t * t * b.y });
    let s = `<defs>
<linearGradient id="vNight" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#080A30"/><stop offset=".62" stop-color="#14185F"/><stop offset="1" stop-color="#1E2370"/></linearGradient>
<linearGradient id="vDawn" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1B2070"/><stop offset=".5" stop-color="#3F35A8"/><stop offset=".82" stop-color="#4FA9E6"/><stop offset="1" stop-color="#BFEAFF"/></linearGradient>
<radialGradient id="vSun" cx=".5" cy="1" r=".7"><stop offset="0" stop-color="#E3F6FF" stop-opacity=".95"/><stop offset=".35" stop-color="#5AC8FA" stop-opacity=".4"/><stop offset="1" stop-color="#8B5CF6" stop-opacity="0"/></radialGradient>
<radialGradient id="vMoon" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#5AC8FA" stop-opacity=".22"/><stop offset="1" stop-color="#5AC8FA" stop-opacity="0"/></radialGradient>
<linearGradient id="vCable" x1="0" x2="1"><stop offset="0" stop-color="#5AC8FA"/><stop offset="1" stop-color="#8B5CF6"/></linearGradient>
<linearGradient id="vFog" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#14185F" stop-opacity="0"/><stop offset="1" stop-color="#0A0D3C" stop-opacity=".9"/></linearGradient>
<radialGradient id="vAmb" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#FFB020" stop-opacity=".85"/><stop offset="1" stop-color="#FFB020" stop-opacity="0"/></radialGradient>
<radialGradient id="vCy" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#5AC8FA" stop-opacity=".5"/><stop offset="1" stop-color="#5AC8FA" stop-opacity="0"/></radialGradient>
</defs>`;
    // céu
    s += `<rect width="${W}" height="${H}" fill="url(#vNight)"/>`;
    s += `<rect width="${W}" height="${H}" fill="url(#vDawn)" style="opacity:${v('dawn', 0)}"/>`;
    s += `<ellipse cx="${W * 0.38}" cy="${H}" rx="${W * 0.7}" ry="${H * 0.55}" fill="url(#vSun)" style="opacity:${v('dawn', 0)}"/>`;
    s += `<circle cx="${W * 0.72}" cy="${H * 0.3}" r="${360 * k}" fill="url(#vMoon)" style="opacity:calc(1 - ${v('dawn', 0)})"/>`;
    const sb = ['', '', ''];
    for (let i = 0; i < Math.round(90 * W / 1440) + 20; i++) { const cx = r() * W, cy = r() * H * 0.6, rr = 0.5 + r() * 1.2; sb[Math.floor(r() * 3)] += `M${(cx - rr).toFixed(1)} ${cy.toFixed(1)}a${rr.toFixed(2)} ${rr.toFixed(2)} 0 1 0 ${(2 * rr).toFixed(2)} 0a${rr.toFixed(2)} ${rr.toFixed(2)} 0 1 0 ${(-2 * rr).toFixed(2)} 0`; }
    const st = sb.map((d, j) => `<path d="${d}" fill="#F5F7FF" opacity="${0.3 + j * 0.25}"/>`).join('');
    s += `<g style="opacity:calc(1 - ${v('dawn', 0)});${P(-40)}">${st}</g>`;

    // camada 1: colinas e torres distantes
    let far = `<path d="M0 690 C${W * 0.18} 640 ${W * 0.36} 700 ${W * 0.55} 660 S${W * 0.85} 650 ${W} 630 V${H} H0Z" fill="#191E6C"/>`;
    [0.1, 0.3, 0.92].forEach((f, i) => {
      const x = W * f, h = 120 - i * 18, b = 670 - i * 4;
      far += `<path d="M${x - 16} ${b} L${x} ${b - h} L${x + 16} ${b} M${x - 26} ${b - h + 22} H${x + 26} M${x - 9} ${b - 50} L${x + 9} ${b - 20}" stroke="#3B43A6" stroke-width="1.4" fill="none"/>`;
    });
    far += `<path d="M${W * 0.1 - 26} ${578} Q${W * 0.2} 620 ${W * 0.3 - 26} ${590}" stroke="#5AC8FA" stroke-opacity=".3" fill="none"/>`;
    s += `<g style="${P(-14)}">${far}</g>`;
    s += `<rect y="560" width="${W}" height="340" fill="url(#vFog)"/>`;

    // camada 2: torre principal + cabos
    const tx = W * (W < 900 ? 0.68 : 0.7), base = 790, top = base - 600 * k, bw = 95 * k, tw = 18 * k;
    const lx = (y) => tx - bw + (bw - tw) * (base - y) / (base - top), rx = (y) => 2 * tx - lx(y);
    let tw_ = `<path d="M${tx - bw} ${base} L${tx - tw} ${top} L${tx} ${top - 44 * k} L${tx + tw} ${top} L${tx + bw} ${base}" />`;
    const n = 10;
    for (let i = 0; i < n; i++) {
      const ya = top + (base - top) * i / n, yb = top + (base - top) * (i + 1) / n;
      tw_ += `<path d="M${lx(ya)} ${ya} L${rx(yb)} ${yb} M${rx(ya)} ${ya} L${lx(yb)} ${yb}"/>`;
    }
    const y1 = top + 70 * k, y2 = top + 165 * k, h1 = 190 * k, h2 = 150 * k;
    tw_ += `<path d="M${tx - h1} ${y1} H${tx + h1} M${tx - h1} ${y1} L${lx(y1 + 30 * k)} ${y1 + 30 * k} M${tx + h1} ${y1} L${rx(y1 + 30 * k)} ${y1 + 30 * k}"/>`;
    tw_ += `<path d="M${tx - h2} ${y2} H${tx + h2} M${tx - h2} ${y2} L${lx(y2 + 28 * k)} ${y2 + 28 * k} M${tx + h2} ${y2} L${rx(y2 + 28 * k)} ${y2 + 28 * k}"/>`;
    [[tx - h1, y1], [tx + h1, y1], [tx - h2, y2], [tx + h2, y2]].forEach(([x, y]) => tw_ += `<path d="M${x} ${y} V${y + 20 * k}" stroke-width="3"/>`);
    let tower = `<g stroke="#9AA3F0" stroke-opacity=".62" stroke-width="1.6" fill="none" stroke-linejoin="round">${tw_}</g>`;
    tower += `<ellipse cx="${tx}" cy="${base + 6}" rx="${170 * k}" ry="20" fill="url(#vCy)" opacity=".5"/>`;

    const at = { L1: { x: tx - h1, y: y1 + 20 * k }, R1: { x: tx + h1, y: y1 + 20 * k }, L2: { x: tx - h2, y: y2 + 20 * k }, R2: { x: tx + h2, y: y2 + 20 * k } };
    const cab = [
      [{ x: -30, y: y1 + 70 }, { x: at.L1.x * 0.5, y: y1 + 190 }, at.L1],
      [at.R1, { x: (at.R1.x + W) / 2, y: y1 + 150 }, { x: W + 30, y: y1 + 60 }],
      [{ x: -30, y: y2 + 90 }, { x: at.L2.x * 0.5, y: y2 + 210 }, at.L2],
      [at.R2, { x: (at.R2.x + W) / 2, y: y2 + 160 }, { x: W + 30, y: y2 + 80 }],
    ];
    const pd = (c) => `M${c[0].x} ${c[0].y} Q${c[1].x} ${c[1].y} ${c[2].x} ${c[2].y}`;
    let cables = '';
    cab.forEach((c, i) => {
      const d = pd(c);
      cables += `<path d="${d}" stroke="#5AC8FA" stroke-width="12" opacity=".07" fill="none"/><path d="${d}" stroke="#5AC8FA" stroke-width="5" opacity=".18" fill="none"/>`;
      cables += `<path d="${d}" stroke="url(#vCable)" stroke-width="1.8" fill="none"/>`;
      if (!opt.still) cables += `<path d="${d}" stroke="#E3F6FF" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-dasharray="26 640" style="animation:vatPulse ${5 + i * 0.7}s linear ${-i * 1.3}s infinite"/>`;
    });
    // exposição: pipa presa no cabo + cerca com placa
    const kp = q(cab[0][0], cab[0][1], cab[0][2], 0.62);
    let s1 = `<g transform="translate(${kp.x} ${kp.y + 4})"><path d="M0 0 L22 30 L0 70 L-22 30 Z" fill="#8B5CF6" fill-opacity=".35" stroke="#F5F7FF" stroke-width="1.6"/><path d="M-22 30 H22 M0 0 V70" stroke="#F5F7FF" stroke-width="1" opacity=".6"/><path d="M0 70 C-14 96 18 112 2 140 C-10 160 10 172 0 196" stroke="#F5F7FF" stroke-width="1.2" fill="none" opacity=".7"/></g>`;
    s1 += `<circle cx="${kp.x}" cy="${kp.y}" r="18" fill="url(#vAmb)"/>`;
    let fence = '';
    for (let x = tx - 170 * k; x <= tx + 170 * k; x += 24 * k) fence += `<path d="M${x} ${base + 4} V${base - 40 * k}"/>`;
    s1 += `<g stroke="#B8BEEA" stroke-width="1.4" opacity=".7">${fence}<path d="M${tx - 170 * k} ${base - 30 * k} H${tx + 170 * k} M${tx - 170 * k} ${base - 12 * k} H${tx + 170 * k}"/></g>`;
    s1 += `<path d="M${tx} ${base - 62 * k} l20 34 h-40 z" fill="#14185F" stroke="#FFB020" stroke-width="2" stroke-linejoin="round"/><path d="M${tx} ${base - 50 * k} v10 M${tx} ${base - 34 * k} v.5" stroke="#FFB020" stroke-width="2.4" stroke-linecap="round"/>`;
    // risco de dano: arco elétrico no cabo
    const sp = q(cab[2][0], cab[2][1], cab[2][2], 0.7);
    let s2 = `<path d="${pd(cab[2])}" stroke="#FFB020" stroke-width="8" opacity=".18" fill="none"/><path d="${pd(cab[2])}" stroke="#FFB020" stroke-width="2.2" fill="none"/>`;
    s2 += `<circle cx="${sp.x}" cy="${sp.y}" r="48" fill="url(#vAmb)" opacity=".8"/><circle cx="${sp.x}" cy="${sp.y}" r="5" fill="#FFF3D6"/>`;
    s2 += `<g stroke="#FFD58A" stroke-width="1.8" stroke-linecap="round">${[0, 1, 2, 3, 4, 5, 6, 7].map(i => { const a = i * Math.PI / 4 + 0.3, r1 = 12, r2 = 22 + (i % 2) * 10; return `<path d="M${sp.x + Math.cos(a) * r1} ${sp.y + Math.sin(a) * r1} L${sp.x + Math.cos(a) * r2} ${sp.y + Math.sin(a) * r2}"/>`; }).join('')}</g>`;
    // emergência: cabo rompido + faixa de isolamento
    let s3 = `<path d="M${at.R2.x} ${at.R2.y} Q${at.R2.x + 70 * k} ${at.R2.y + 120} ${at.R2.x + 40 * k} ${base - 10}" stroke="#FFB020" stroke-width="2" fill="none"/><path d="M${at.R2.x} ${at.R2.y} Q${at.R2.x + 70 * k} ${at.R2.y + 120} ${at.R2.x + 40 * k} ${base - 10}" stroke="#FFB020" stroke-width="8" opacity=".18" fill="none"/>`;
    s3 += `<ellipse cx="${tx}" cy="${base + 4}" rx="${250 * k}" ry="34" fill="none" stroke="#FFB020" stroke-width="2" stroke-dasharray="10 12" opacity=".9"/>`;
    s += `<g style="${P(-6)}">${tower}<g style="opacity:calc(1 - ${v('s3', 0)} * .75)">${cables}</g><g style="opacity:${v('s1', 0)}">${s1}</g><g style="opacity:${v('s2', 0)}">${s2}</g><g style="opacity:${v('s3', 0)}">${s3}</g></g>`;

    // camada 3: casas
    function row(b, minW, maxW, minH, maxH, fill, edge, win, front) {
      let out = '', x = -20 - r() * 30, peaks = [], pane = '', night = '', bk = ['', '', '', '', '', ''];
      while (x < W + 20) {
        const w = minW + r() * (maxW - minW), h = minH + r() * (maxH - minH), y = b - h, gab = r() > 0.4, rh = gab ? 16 + r() * 24 : 0;
        out += gab ? `<path d="M${x} ${y} L${x + w / 2} ${y - rh} L${x + w} ${y} V${b} H${x}Z" fill="${fill}" stroke="${edge}" stroke-width="1"/>` : `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" stroke="${edge}" stroke-width="1"/>`;
        peaks.push({ x: x + w / 2, y: y - rh });
        const cols = Math.max(1, Math.floor((w - 14) / (win * 2.3))), rows = Math.min(3, Math.max(1, Math.floor((h - 26) / (win * 2.6))));
        const gx = (w - cols * win * 2.3 + win * 1.3) / 2;
        for (let c = 0; c < cols; c++) for (let rr = 0; rr < rows; rr++) {
          const wx = x + gx + c * win * 2.3, wy = y + 14 + rr * win * 2.6, t = (r() * 0.75).toFixed(2), wh = win * 1.25;
          const rd = `M${wx.toFixed(1)} ${wy.toFixed(1)}h${win}v${wh.toFixed(1)}h${-win}Z`;
          pane += rd; if (r() < 0.22) night += rd; bk[Math.min(5, Math.floor(t / 0.75 * 6))] += rd;
        }
        x += w + 4 + r() * 18;
      }
      out += `<path d="${pane}" fill="#262D8C" opacity=".8"/><path d="${night}" fill="#8FD9FF" style="opacity:calc((1 - ${v('s3', 0)}) * .85)"/>`;
      bk.forEach((d, j) => out += `<path d="${d}" fill="#D7F3FF" style="opacity:calc((${v('dawn', 0)} * 1.75 - ${(j / 6 * 0.75).toFixed(3)}) * 5)"/>`);
      if (front) {
        let net = '';
        for (let i = 0; i < peaks.length - 1; i++) {
          const a = peaks[i], c = peaks[i + 1], t = (i / peaks.length * 0.7).toFixed(2);
          const o = `calc((${v('dawn', 0)} * 1.75 - ${t}) * 5)`;
          net += `<path d="M${a.x} ${a.y} Q${(a.x + c.x) / 2} ${Math.min(a.y, c.y) - 46} ${c.x} ${c.y}" pathLength="100" stroke="#5AC8FA" stroke-width="1.6" fill="none" stroke-dasharray="100 100" style="opacity:${v('dawn', 0)};stroke-dashoffset:max(0, min(100, calc(100 - (${v('dawn', 0)} * 1.75 - ${t}) * 260)))"/>`;
          net += `<circle cx="${a.x}" cy="${a.y}" r="3.5" fill="#E3F6FF" style="opacity:${o}"/>`;
        }
        out += net;
      }
      return out;
    }
    s += `<g style="${P(10)}">${row(860, 56, 120, 60, 150, '#171C66', '#232A85', 7, false)}</g>`;
    s += `<g style="${P(26)}">${row(912, 90, 170, 100, 210, '#0D1150', '#2A318F', 11, true)}</g>`;
    return `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMax slice" width="100%" height="100%" aria-hidden="true" style="display:block">${s}</svg>`;
  };

  // Rede de casas do "Efeito vizinhança" — dirigida por --q (0..1)
  window.VAT_NET = function (W, H, N) {
    let sd = 5; const r = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
    const pts = [];
    let tries = 0;
    while (pts.length < N && tries++ < 5000) {
      const p = { x: 40 + r() * (W - 80), y: 40 + r() * (H - 80) };
      if (pts.every(o => Math.hypot(o.x - p.x, o.y - p.y) > 58)) pts.push(p);
    }
    pts.sort((a, b) => (a.x + a.y * 0.4) - (b.x + b.y * 0.4));
    pts.forEach((p, i) => p.t = (i / N * 0.8).toFixed(3));
    let e = '', h = '';
    const o = (t) => `calc((var(--q,0) * 1.25 - ${t}) * 6)`;
    pts.forEach((p, i) => {
      const near = pts.map((o2, j) => ({ j, d: Math.hypot(o2.x - p.x, o2.y - p.y) })).filter(a => a.j < i).sort((a, b) => a.d - b.d).slice(0, 2);
      near.forEach(({ j }) => { const b = pts[j]; e += `<path d="M${b.x} ${b.y} L${p.x} ${p.y}" stroke="url(#nG)" stroke-width="1.4" pathLength="100" stroke-dasharray="100 100" style="stroke-dashoffset:max(0, min(100, calc(100 - (var(--q,0) * 1.25 - ${p.t}) * 600)))"/>`; });
      h += `<g transform="translate(${p.x - 14} ${p.y - 14})"><path d="M2 13 14 3l12 10v13H2Z" fill="#14185F" stroke="#3B43A6" stroke-width="1.4"/><path d="M2 13 14 3l12 10v13H2Z" fill="#1E2370" stroke="#5AC8FA" stroke-width="1.6" style="opacity:${o(p.t)}"/><rect x="10" y="14" width="8" height="7" rx="1" fill="#D7F3FF" style="opacity:${o(p.t)}"/></g>`;
    });
    return `<svg viewBox="0 0 ${W} ${H}" width="100%" aria-hidden="true" style="display:block"><defs><linearGradient id="nG" x1="0" x2="1"><stop offset="0" stop-color="#5AC8FA"/><stop offset="1" stop-color="#8B5CF6"/></linearGradient><filter id="nB"><feGaussianBlur stdDeviation="6"/></filter></defs>${e}${h}</svg>`;
  };

  window.VAT_IC = {
    bolt: '<path d="M13 3 5 14h6l-1 7 8-11h-6l1-7Z"/>',
    tower: '<path d="M12 3 8 21M12 3l4 18M5 8h14M6.5 13h11M10 8l4 5M14 8l-4 5M9.3 17h5.4"/>',
    shield: '<path d="M12 3 4 6v6c0 4.5 3.4 8 8 9 4.6-1 8-4.5 8-9V6l-8-3Z"/>',
    shieldBolt: '<path d="M12 3 4 6v6c0 4.5 3.4 8 8 9 4.6-1 8-4.5 8-9V6l-8-3Z"/><path d="m13 7.5-3.5 5h3l-1 4 3.5-5h-3l1-4Z"/>',
    warn: '<path d="M12 4 2.5 20h19L12 4Z"/><path d="M12 10v4.5M12 17.5v.01"/>',
    pin: '<path d="M12 21s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12Z"/><circle cx="12" cy="9" r="2.5"/>',
    mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>',
    play: '<path d="M7.5 4.8v14.4L19 12 7.5 4.8Z"/>',
    pause: '<path d="M8.5 5v14M15.5 5v14"/>',
    check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
    x: '<path d="M6 6l12 12M18 6 6 18"/>',
    share: '<path d="M12 15V3M7.5 7.5 12 3l4.5 4.5"/><path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7"/>',
    download: '<path d="M12 3v12M7.5 10.5 12 15l4.5-4.5"/><path d="M5 20h14"/>',
    chat: '<path d="M4 20l1.3-3.9A8 8 0 1 1 8 19l-4 1Z"/>',
    down: '<path d="M12 5v14M6 13l6 6 6-6"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    house: '<path d="M4 11 12 4l8 7v9H4v-9Z"/><path d="M10 20v-5h4v5"/>',
    kite: '<path d="M12 2 18.5 9 12 17 5.5 9 12 2Z"/><path d="M5.5 9h13M12 2v15M12 17c-1.2 1.6 1.2 2.6 0 4.5"/>',
    cable: '<path d="M3 6c4 0 6 3 9 3s5-3 9-3"/><path d="M16 8.6c0 4-3 6-3 9.4M11.5 20l1.5-2 1.5 2"/>',
    spark: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/>',
    fence: '<path d="M5 21V8l2-3 2 3v13M15 21V8l2-3 2 3v13M3 11h18M3 16h18"/>',
    lock: '<rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
    phone: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 14a6 6 0 0 1 3.5 6"/>',
    building: '<path d="M4 21V8l8-5 8 5v13"/><path d="M9 21v-6h6v6M3 21h18"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3Z"/>',
    retry: '<path d="M4 12a8 8 0 1 0 2.5-5.8M4 4v4h4"/>',
    speaker: '<path d="M4 9v6h4l5 4V5L8 9H4Z"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"/>',
    qr: '<rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><path d="M14 14h2v2h-2zM18 18h2v2h-2zM14 18h2M18 14h2"/>',
    send: '<path d="M4 12 20 4l-5 16-3-7-8-1Z"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  };
  window.VAT_icon = function (React, name, size, color, sw) {
    return React.createElement('svg', { width: size || 20, height: size || 20, viewBox: '0 0 24 24', fill: 'none', stroke: color || 'currentColor', strokeWidth: sw || 1.75, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true, style: { display: 'block', flex: 'none' }, dangerouslySetInnerHTML: { __html: window.VAT_IC[name] || '' } });
  };
})();
