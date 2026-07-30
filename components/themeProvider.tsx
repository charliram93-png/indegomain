"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ReactNode } from "react";

/**
 * Provee el tema claro/oscuro a toda la app.
 * defaultTheme="system" -> sigue la preferencia del dispositivo.
 * El toggle (components/themeToggle.tsx) puede forzar light/dark.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}
