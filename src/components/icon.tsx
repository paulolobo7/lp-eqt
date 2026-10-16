/** Conjunto único de ícones de traço do design (design/fonte/cena-e-icones.js). */
const ICONES = {
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
  send: '<path d="M4 12 20 4l-5 16-3-7-8-1Z"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
} as const;

export type NomeIcone = keyof typeof ICONES;

export function Icon({
  nome,
  tamanho = 20,
  cor = "currentColor",
  traco = 1.75,
  className,
}: {
  nome: NomeIcone;
  tamanho?: number;
  cor?: string;
  traco?: number;
  className?: string;
}) {
  return (
    <svg
      width={tamanho}
      height={tamanho}
      viewBox="0 0 24 24"
      fill="none"
      stroke={cor}
      strokeWidth={traco}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
      style={{ display: "block", flex: "none" }}
      dangerouslySetInnerHTML={{ __html: ICONES[nome] }}
    />
  );
}
