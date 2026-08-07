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
 *
 * ────────────────────────────────────────────────────────────────────────────
 * EL BUG QUE TENÍA (encontrado y corregido el 7-ago-2026)
 * ────────────────────────────────────────────────────────────────────────────
 * **La barra se quedaba con el color del tema ANTERIOR.** No era un capricho de
 * Safari: el `<meta>` de verdad llevaba el color viejo. Medido en el navegador
 * —clase `light` y fondo claro ya aplicados, y el meta todavía en el olivo
 * oscuro del tema anterior.
 *
 * LA CAUSA es el ORDEN DE LOS EFECTOS de React: este componente es HIJO de
 * `ThemeProvider`, y los efectos de los hijos corren ANTES que los del padre.
 * O sea que aquí se leía `--surface` antes de que next-themes hubiera cambiado
 * la clase de `<html>`, y lo que se leía era, siempre, la paleta que estaba
 * saliendo.
 *
 * EL `requestAnimationFrame` QUE HABÍA NO LO SALVABA porque **volvía a escribir
 * la misma cadena** que ya se había leído, solo que en otra notación. Servía
 * para que Safari viera dos cambios, que era su propósito, pero los dos
 * cambios eran al color equivocado.
 *
 * EL ARREGLO NO ES ESPERAR, ES MIRAR. Se intentó primero releer la variable un
 * cuadro después, y **seguía saliendo el color viejo**: no hay ninguna garantía
 * de cuándo escribe next-themes la clase, así que cualquier espera es una
 * apuesta. En vez de adivinar el momento, un `MutationObserver` vigila el
 * atributo `class` de `<html>` y aplica el color **cuando la clase cambia de
 * verdad**. El aviso llega como microtarea, justo después del cambio: no
 * depende del orden de los efectos de React ni de que haya cuadros.
 *
 * LO QUE ESTO NO ARREGLA, y hay que comprobar en un iPhone de verdad: que
 * Safari REPINTE la barra al vuelo. En el catálogo se veía bien en cuanto se
 * hacía scroll; en el Nosotros, que no se recorre en vertical, no había scroll
 * que forzara el repintado. Si con el color ya correcto sigue sin repintar,
 * el siguiente paso es `DEJAR_QUE_SAFARI_ELIJA` (ver arriba): sin `<meta>`,
 * Safari saca el color del fondo real de la página, que sí cambia al instante.
 * `color-scheme` ya se está poniendo bien en `<html>` (comprobado), así que esa
 * salida está disponible.
 */
export default function ThemeColorSync() {
  /* Solo para que el componente se vuelva a montar/ejecutar con el tema; quien
     manda de verdad sobre CUÁNDO se aplica el color es el observador. */
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const raiz = document.documentElement;
    const metas = raiz.querySelectorAll<HTMLMetaElement>(
      'meta[name="theme-color"]'
    );

    if (DEJAR_QUE_SAFARI_ELIJA) {
      metas.forEach((m) => m.remove());
      return;
    }

    // Un solo <meta>, reutilizado entre cambios de tema.
    let meta = metas[0];
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "theme-color";
      document.head.appendChild(meta);
    }

    let cancelado = false;
    let cuadro = 0;

    /*
      RELEE LA VARIABLE CADA VEZ. Capturar el color una sola vez, al principio
      del efecto, era justo lo que garantizaba quedarse con el del tema que
      estaba saliendo.
    */
    const aplicar = () => {
      if (cancelado) return;
      const surface = getComputedStyle(raiz)
        .getPropertyValue("--surface")
        .trim();
      if (!surface) return;

      const rgb = hexToRgb(surface);
      if (rgb) meta.setAttribute("content", rgb);
      /* La segunda escritura, en otra notación, es la que hace que Safari vea
         un cambio de verdad. Va en el cuadro siguiente. */
      cancelAnimationFrame(cuadro);
      cuadro = requestAnimationFrame(() => {
        if (!cancelado) meta.setAttribute("content", surface);
      });
    };

    /* Al montar la clase ya es la correcta, así que este acierta siempre. */
    aplicar();

    /*
      Y DE AQUÍ EN ADELANTE, CUANDO LA CLASE CAMBIE DE VERDAD. `class` es lo que
      toca next-themes para cambiar de tema, y `style` porque de paso escribe
      ahí el `color-scheme`. El aviso llega como microtarea, justo después del
      cambio, así que el color que se lee ya es el nuevo — sin depender del
      orden de los efectos de React ni de que el navegador esté dibujando
      cuadros.
    */
    const observador = new MutationObserver(aplicar);
    observador.observe(raiz, {
      attributes: true,
      attributeFilter: ["class", "style"],
    });

    return () => {
      cancelado = true;
      observador.disconnect();
      cancelAnimationFrame(cuadro);
    };
  }, [resolvedTheme]);

  return null;
}
