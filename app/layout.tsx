import type { Metadata } from "next";
import { Saira_Semi_Condensed } from "next/font/google";
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
      <body className={`${inter.variable} antialiased`}>
        <ThemeProvider>
          <ThemeColorSync />
          <I18nProvider>{children}</I18nProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
