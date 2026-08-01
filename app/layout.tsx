import type { Metadata } from "next";
import { Saira_Semi_Condensed } from "next/font/google";
import localFont from "next/font/local";
import { Analytics } from "@vercel/analytics/next";
import { ThemeProvider } from "@/components/themeProvider";
import ThemeColorSync from "@/components/themeColorSync";
import { I18nProvider } from "@/lib/i18n/context";
import "./globals.css";

// PRUEBA: Saira SemiCondensed (condensada). Para volver a Inter Tight, cambia
// este import/componente por Inter_Tight.
const inter = Saira_Semi_Condensed({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

/**
 * HELVETICA del countdown (el texto sobre el video y los números).
 * Windows y Android no traen Helvetica y caían en Arial, que tiene la G sin
 * espolón y la R de pierna recta — se notaba contra el video. Esta es
 * TeX Gyre Heros, un clon libre de Helvetica (licencia GUST, de la fundición
 * e-foundry). Va recortada a los caracteres que usa el sitio: ~9 KB por peso.
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
      <body className={`${inter.variable} ${helvetica.variable} antialiased`}>
        <ThemeProvider>
          <ThemeColorSync />
          <I18nProvider>{children}</I18nProvider>
          {/*
            GRANO DE PELÍCULA sobre todo el sitio (ver .grain en globals.css).
            El ruido se pasa a gris y se le sube el contraste; luego la capa se
            funde en modo "overlay", que aclara y oscurece a la vez. Por eso
            funciona igual en tema claro y en oscuro, sin ensuciar los colores.
          */}
          <svg
            className="grain"
            width="100%"
            height="100%"
            aria-hidden
            focusable="false"
          >
            <filter id="grain-noise">
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.8"
                numOctaves="3"
                stitchTiles="stitch"
              />
              <feColorMatrix type="saturate" values="0" />
              <feComponentTransfer>
                <feFuncR type="linear" slope="3" intercept="-1" />
                <feFuncG type="linear" slope="3" intercept="-1" />
                <feFuncB type="linear" slope="3" intercept="-1" />
                <feFuncA type="linear" slope="0" intercept="1" />
              </feComponentTransfer>
            </filter>
            <rect width="100%" height="100%" filter="url(#grain-noise)" />
          </svg>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
