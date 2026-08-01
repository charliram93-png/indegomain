import type { Metadata } from "next";
import localFont from "next/font/local";
import { Analytics } from "@vercel/analytics/next";
import { ThemeProvider } from "@/components/themeProvider";
import ThemeColorSync from "@/components/themeColorSync";
import Grain from "@/components/grain";
import { I18nProvider } from "@/lib/i18n/context";
import "./globals.css";

/**
 * TIPOGRAFÍA ÚNICA DEL SITIO (ago-2026)
 * -------------------------------------
 * Antes convivían DOS: Saira Semi Condensed para el cuerpo y esta Helvetica
 * para los títulos y el countdown. Ya no: TODO el sitio va en Helvetica, que
 * es la del video, así que la tienda se lee como continuación del countdown.
 *
 * Es TeX Gyre Heros, un clon libre de Helvetica (licencia GUST, de la
 * fundición e-foundry). Está recortada a Latin-1 completo: lleva minúsculas,
 * acentos, ñ, ¿, ¡ y comillas tipográficas, así que sirve igual para el
 * español y para los textos largos (términos, descripciones). ~9 KB por peso,
 * 4 pesos = ~38 KB en total, y ya no se descarga nada de Google Fonts.
 *
 * Si se compra la Helvetica de verdad, solo se reemplazan los 4 archivos de
 * `app/fonts/`. Para volver a tener dos tipografías, se vuelve a cargar la
 * de cuerpo aquí y se apunta `--font-sans` a ella en globals.css.
 */
const helvetica = localFont({
  src: [
    { path: "./fonts/heros-regular.woff2", weight: "400", style: "normal" },
    { path: "./fonts/heros-italic.woff2", weight: "400", style: "italic" },
    { path: "./fonts/heros-bold.woff2", weight: "700", style: "normal" },
    { path: "./fonts/heros-bolditalic.woff2", weight: "700", style: "italic" },
  ],
  variable: "--font-helvetica",
  display: "swap",
  fallback: ["Helvetica Neue", "Helvetica", "Arial", "sans-serif"],
});

export const metadata: Metadata = {
  title: "Indego Studio — Drop #1",
  description: "Indego Studio · Drop #1. Próximamente.",

  openGraph: {
    title: "Indego Studio — Drop #1",
    description: "Indego Studio · Drop #1. Próximamente.",
    url: "https://indegostudio.com",
    siteName: "Indego Studio",
    images: [
      {
        url: "https://res.cloudinary.com/dij60ghdf/image/upload/v1772763867/LogoWhatsMetaData_jmp0lg.png", 
        width: 299,
        height: 299, 
        alt: "Indego Studio - Previsualización",
      },
    ],
    locale: "es_MX",
    type: "website",
  },
  
  twitter: {
    card: "summary_large_image",
    title: "Indego Studio — Drop #1",
    description: "Indego Studio · Drop #1. Próximamente.",
    images: ["https://res.cloudinary.com/dij60ghdf/image/upload/v1772763867/LogoWhatsMetaData_jmp0lg.png"], 
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${helvetica.variable} antialiased`}>
        <ThemeProvider>
          <ThemeColorSync />
          <I18nProvider>{children}</I18nProvider>
          {/* GRANO DE PELÍCULA sobre todo el sitio. Se puede apagar con
              `?grano=0` para comparar el rendimiento; ver components/grain.tsx. */}
          <Grain />
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
