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
    let meta = document.querySelector<HTMLMetaElement>(
      'meta[name="theme-color"]'
    );
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "theme-color";
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", color);
  }, [resolvedTheme]);

  return null;
}
