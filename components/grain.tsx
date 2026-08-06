"use client";

import { useFlag } from "@/lib/flags";

/**
 * GRANO DE PELÍCULA
 * -----------------
 * Capa fija de ruido sobre todo el sitio. La textura la dibuja el navegador con
 * un filtro SVG, así que no hay ninguna imagen que descargar.
 *
 * AQUÍ YA NO HAY SVG: el filtro entero vive dentro de la clase `.grain` de
 * `globals.css`, metido en un `background-image`. El cambio (6-ago-2026) es que
 * antes el ruido se calculaba sobre un rectángulo del TAMAÑO DE LA PANTALLA, y
 * ahora se calcula una vez en un cuadrito de 256 px que se repite. Se ve igual
 * y cuesta una fracción — sobre todo la primera vez que se pinta la página y
 * cada vez que alguien gira el teléfono. El porqué completo está en el comentario
 * de `.grain`.
 *
 * PRUEBA DE RENDIMIENTO: abre cualquier página con `?grano=0` para apagarlo y
 * `?grano=1` para encenderlo, y compara en el teléfono.
 *
 * Nota de lo ya investigado: el grano NO era el sospechoso principal de los
 * tirones. Lo caro era `mix-blend-mode`, que obligaba a recomponer la pantalla
 * completa en cada cuadro; eso ya se quitó. Lo que quedaba pesando era
 * `backdrop-filter` (el desenfoque del fondo detrás del carrito, el modal y el
 * navbar), que también se quitó. Esta bandera queda para confirmarlo midiendo.
 */
export default function Grain() {
  const encendido = useFlag("grano", "1") !== "0";
  if (!encendido) return null;

  return <div className="grain" aria-hidden />;
}
