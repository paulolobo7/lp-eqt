import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { marca, selo as textos } from "@/content/site";
import { dataBR } from "@/lib/texto";
import type { Selo } from "@/lib/services";

export type FormatoSelo = "status" | "square";
export const TAMANHOS: Record<FormatoSelo, { width: number; height: number }> = {
  status: { width: 1080, height: 1350 },
  square: { width: 1080, height: 1080 },
};

const dirFontes = join(process.cwd(), "src/assets/fonts");
let fontes: Promise<{ name: string; data: Buffer; weight: 400 | 600 | 800; style: "normal" | "italic" }[]> | undefined;
function carregarFontes() {
  fontes ??= Promise.all([
    readFile(join(dirFontes, "Exo2-ExtraBoldItalic.ttf")).then((data) => ({ name: "Exo 2", data, weight: 800 as const, style: "italic" as const })),
    readFile(join(dirFontes, "Inter-Regular.ttf")).then((data) => ({ name: "Inter", data, weight: 400 as const, style: "normal" as const })),
    readFile(join(dirFontes, "Inter-SemiBold.ttf")).then((data) => ({ name: "Inter", data, weight: 600 as const, style: "normal" as const })),
  ]);
  return fontes;
}

/** Imagem do selo (escolhida no design: escudo com raio, borda ciano→violeta). */
export async function imagemDoSelo(s: Selo, formato: FormatoSelo, headers?: Record<string, string>) {
  const { width, height } = TAMANHOS[formato];
  const quadrado = formato === "square";
  return new ImageResponse(
    (
      <div style={{ width, height, display: "flex", padding: 14, background: "linear-gradient(140deg,#5AC8FA,#8B5CF6 60%,#5AC8FA)", fontFamily: "Inter" }}>
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "space-between",
            padding: quadrado ? "64px 80px" : "84px 88px",
            borderRadius: 64,
            background: "radial-gradient(120% 75% at 50% 0%, #2E3AA8 0%, #14185F 58%, #0B0E3A 100%)",
            color: "#F5F7FF",
            textAlign: "center",
          }}
        >
          <div style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", height: 56, padding: "0 20px", border: "2px dashed rgba(185,191,234,.55)", borderRadius: 14, fontSize: 22, fontWeight: 600, letterSpacing: 3, color: "#B8BEEA" }}>
              {marca.logoRotulo}
            </div>
            <div style={{ fontSize: 30, letterSpacing: 2, color: "#B8BEEA" }}>{s.codigo}</div>
          </div>
          <svg width={quadrado ? 220 : 330} height={quadrado ? 242 : 363} viewBox="0 0 120 132">
            <defs>
              <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#5AC8FA" />
                <stop offset="1" stopColor="#8B5CF6" />
              </linearGradient>
            </defs>
            <path d="M60 6 L108 22 V62 C108 94 86 116 60 126 C34 116 12 94 12 62 V22 Z" fill="rgba(90,200,250,.12)" stroke="url(#g)" strokeWidth="3.5" />
            <path d="M60 18 L97 30.5 V62 C97 87 80 104 60 113 C40 104 23 87 23 62 V30.5 Z" fill="none" stroke="#5AC8FA" strokeOpacity=".35" strokeWidth="1" />
            <path d="M67 28 L41 70 H57 L51 104 L80 58 H63 Z" fill="#F5F7FF" stroke="#5AC8FA" strokeWidth="2" strokeLinejoin="round" />
          </svg>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: quadrado ? 14 : 22 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", fontFamily: "Exo 2", fontStyle: "italic", fontWeight: 800, fontSize: quadrado ? 92 : 104, lineHeight: 0.98, textTransform: "uppercase" }}>
              <span>{textos.linha1}</span>
              <span>{textos.linha2}</span>
            </div>
            <div style={{ fontSize: quadrado ? 56 : 64, fontWeight: 600 }}>{s.primeiroNome}</div>
            <div style={{ fontSize: 36, color: "#C9CEF0" }}>{`${s.bairro} · ${dataBR(s.data)}`}</div>
          </div>
          <div style={{ fontSize: 32, color: "#A9E2FC" }}>{textos.frase}</div>
        </div>
      </div>
    ),
    { width, height, fonts: await carregarFontes(), headers },
  );
}
