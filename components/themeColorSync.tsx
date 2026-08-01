"use client";

import { useTheme } from "next-themes";
import { useEffect } from "react";

/**
 * PLAN B, por si el de abajo no funciona en algún iPhone.
 *
 * En `true`, el sitio NO pone ningún <meta name="theme-color">. Cuando no hay
 * uno, Safari toma el color de la barra del FONDO REAL de la página, y como ese
 * fondo sí cambia al instante con el tema, la barra lo sigue solo.
 * Es más tosco (el color puede no ser idéntico al del navbar), pero no depende
 * de que Safari se entere de un cambio.
 */
const DEJAR_QUE_SAFARI_ELIJA = false;

/** Pasa "#3d3e26" a "rgb(61, 62, 38)". */
const hexToRgb = (hex: string) => {
  const h = hex.replace("#", "").trim();
  if (h.length !== 6) return null;
  const n = parseInt(h, 16);
  return `rgb(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255})`;
};

/**
 * Mantiene la barra de dirección de iOS del color del tema activo.
 *
 * Por qué está escrito así:
 * - El color se LEE del CSS (`--surface`) en vez de estar copiado aquí, para
 *   que no se desincronice si algún día se cambian los colores de marca.
 * - Se reutiliza SIEMPRE el mismo <meta> y solo se cambia su `content`. Antes se
 *   borraba y se creaba de nuevo, y Safari se quedaba con el color viejo hasta
 *   refrescar: al reemplazar el elemento no siempre se entera.
 * - Se escribe el color DOS veces (primero en `rgb(...)`, luego en `#hex`). Son
 *   el mismo color pero texto distinto, así que Safari ve dos cambios reales y
 *   es mucho más difícil que ignore el segundo.
 */
export default function ThemeColorSync() {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const metas = document.querySelectorAll<HTMLMetaElement>(
      'meta[name="theme-color"]'
    );

    if (DEJAR_QUE_SAFARI_ELIJA) {
      metas.forEach((m) => m.remove());
      return;
    }

    if (!resolvedTheme) return;

    const surface = getComputedStyle(document.documentElement)
      .getPropertyValue("--surface")
      .trim();
    if (!surface) return;

    // Un solo <meta>, reutilizado entre cambios de tema.
    let meta = metas[0];
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "theme-color";
      document.head.appendChild(meta);
    }

    const rgb = hexToRgb(surface);
    if (rgb) meta.setAttribute("content", rgb);

    const id = requestAnimationFrame(() => {
      meta.setAttribute("content", surface);
    });
    return () => cancelAnimationFrame(id);
  }, [resolvedTheme]);

  return null;
}
