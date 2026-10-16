import type { Metadata, Viewport } from "next";
import { Exo_2, Inter } from "next/font/google";
import { marca } from "@/content/site";
import { urlDoSite } from "@/lib/site";
import "./globals.css";

const exo = Exo_2({ subsets: ["latin"], style: ["italic"], weight: ["700", "800"], variable: "--font-exo", display: "swap" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export const metadata: Metadata = {
  metadataBase: urlDoSite(),
  title: `${marca.nome} · Equatorial Energia`,
  description: marca.descricao,
  openGraph: { title: marca.nome, description: marca.descricao, locale: "pt_BR", type: "website" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  interactiveWidget: "resizes-content",
  themeColor: "#0B0E3A",
  colorScheme: "dark",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={`${exo.variable} ${inter.variable}`}>
      <body>{children}</body>
    </html>
  );
}
