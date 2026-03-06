import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Indego Studio",
  description: "Under Construction",

  openGraph: {
    title: "Indego Studio",
    description: "Under Construction",
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
    title: "Indego Studio",
    description: "Under Construction",
    images: ["https://res.cloudinary.com/dij60ghdf/image/upload/v1772763867/LogoWhatsMetaData_jmp0lg.png"], 
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
