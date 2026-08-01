"use client";

import { useFlag } from "@/lib/flags";

/**
 * GRANO DE PELÍCULA
 * -----------------
 * Capa fija de ruido sobre todo el sitio (los estilos, en `.grain` de
 * globals.css). La textura la dibuja el navegador con un filtro SVG, así que
 * no hay ninguna imagen que descargar.
 *
 * PRUEBA DE RENDIMIENTO: abre cualquier página con `?grano=0` para apagarlo y
 * `?grano=1` para encenderlo, y compara en el teléfono.
 *
 * Nota de lo ya investigado: el grano YA NO es el sospechoso principal de los
 * tirones. Lo caro era `mix-blend-mode`, que obligaba a recomponer la pantalla
 * completa en cada cuadro; eso ya se quitó y ahora es una capa normal que la
 * GPU dibuja una vez. Lo que quedaba pesando era `backdrop-filter` (el
 * desenfoque del fondo detrás del carrito, el modal y el navbar), que también
 * se quitó. Esta bandera queda para confirmarlo midiendo.
 */
export default function Grain() {
  const encendido = useFlag("grano", "1") !== "0";
  if (!encendido) return null;

  return (
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
  );
}
