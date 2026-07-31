"use client";

import { useTheme } from "next-themes";
import { useEffect } from "react";

// Color de la barra del navegador (Safari/iOS) según el tema. Coincide con la
// superficie del navbar (arriba, donde está la barra de dirección).
const COLORS = { light: "#d6d8c2", dark: "#3d3e26" };

/**
 * Mantiene <meta name="theme-color"> en sincronía con el tema activo, para que
 * la barra de dirección en iOS cambie de color al instante al cambiar de tema.
 */
export default function ThemeColorSync() {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const color = resolvedTheme === "dark" ? COLORS.dark : COLORS.light;
    // Recrear el <meta> (borrar + insertar) fuerza a Safari/iOS a repintar la
    // barra al instante; con solo cambiar `content` a veces tarda.
    document
      .querySelectorAll('meta[name="theme-color"]')
      .forEach((m) => m.remove());
    const meta = document.createElement("meta");
    meta.name = "theme-color";
    meta.content = color;
    document.head.appendChild(meta);
    // Empuja un repintado.
    void document.body.offsetHeight;
  }, [resolvedTheme]);

  return null;
}
