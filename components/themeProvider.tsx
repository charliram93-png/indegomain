"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ReactNode } from "react";

/**
 * Provee el tema claro/oscuro a toda la app.
 *
 * El sitio SIEMPRE abre en CLARO (decisión de ago-2026). Antes seguía la
 * preferencia del teléfono (`defaultTheme="system"`), así que a quien tuviera
 * el modo oscuro activado el sitio se le abría en oscuro sin haberlo pedido, y
 * la primera impresión de la marca cambiaba según el aparato.
 *
 * El botón de la barra (components/themeToggle.tsx) sigue funcionando igual, y
 * la elección de cada quien se recuerda en su navegador.
 *
 * Para volver a seguir al sistema: `defaultTheme="system"` y `enableSystem`.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}
