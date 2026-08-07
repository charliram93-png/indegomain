"use client";

import { useEffect, useRef, type RefObject } from "react";

/**
 * LA PISTA DEL RIEL — la rayita de avance del Nosotros.
 * ------------------------------------------------------
 * Una línea fina abajo al centro, con un relleno adentro que avanza conforme la
 * página se recorre hacia la derecha. Dice DOS cosas de un vistazo: que esto se
 * mueve de lado (que era el problema: nadie lo adivinaba en teléfono) y qué
 * tanto falta.
 *
 * ES LA MISMA RAYITA DEL CATÁLOGO, a propósito. En `components/swipeHint.tsx`
 * ya significa "hay más de este lado, deslízame"; repetir el trazo aquí es
 * enseñar un vocabulario, no inventar otro adorno. La diferencia es que allá el
 * relleno salta entre fotos sueltas y aquí sigue un recorrido continuo, así que
 * no se pudo reusar el componente tal cual.
 *
 * NO USA ESTADO DE REACT. El relleno se mueve tocando el nodo directamente
 * desde el `scroll`: con estado, cada cuadro de scroll volvería a dibujar la
 * página entera —los diez paneles, las cascadas, el carrusel— para correr una
 * barra dos píxeles. Es la misma razón por la que este proyecto sacó
 * framer-motion.
 *
 * Es DECORATIVA para lector de pantalla (`aria-hidden`): quien navega con uno
 * recorre los paneles por orden y ya sabe dónde va; una barra de avance ahí
 * sería ruido.
 */

/**
 * QUÉ TANTO DE LA LÍNEA OCUPA EL RELLENO.
 *
 * NO es el ancho "honesto" de una barra de scroll. Si el relleno midiera lo que
 * mide una pantalla contra el recorrido completo (una décima parte, con los
 * paneles de hoy), sobre una línea de 64 px saldría un puntito de 6 px — o sea
 * justo los puntos que ya se habían descartado por sucios. Un tercio se lee
 * como TRAZO, que es lo que se quiere, y sigue dejando claro que falta camino.
 */
const FRACCION_DEL_RELLENO = 0.32;

/**
 * CUÁNTO VIAJA EL RELLENO, medido en su propio ancho.
 *
 * Se calcula, no se escribe a mano: el relleno tiene que terminar pegado al
 * borde derecho de la línea justo cuando el riel llega a su tope. Si se toca
 * `FRACCION_DEL_RELLENO` esto se acomoda solo.
 */
const RECORRIDO = ((1 - FRACCION_DEL_RELLENO) / FRACCION_DEL_RELLENO) * 100;

/**
 * EL HALO QUE LA MANTIENE VISIBLE SOBRE CUALQUIER FONDO.
 *
 * La rayita va FIJA sobre un riel donde pasa de todo por debajo: el crema de la
 * página, la cascada de logos NEGRA del panel de entrada, y la banda del cierre,
 * que va invertida (fondo del color de la tinta). Una línea de un solo color se
 * borra en al menos uno de esos.
 *
 * La solución es un halo del color de la PÁGINA alrededor del trazo, del color
 * de la TINTA. Se resuelve solo en los cuatro casos y en los dos temas, porque
 * los dos colores son variables:
 *   · sobre el crema → el halo no se ve y manda el trazo oscuro;
 *   · sobre la cascada negra o la banda invertida → el trazo se pierde y el
 *     halo claro toma su lugar, así que SIEMPRE queda una raya visible.
 *
 * NO ES `mix-blend-mode`, y no por casualidad: este proyecto ya sacó el blend
 * del grano porque obliga a recomponer la pantalla completa en cada cuadro
 * (ver `.grain` en `globals.css`). Un `drop-shadow` sobre un elemento de
 * 64 × 2 px se dibuja una vez y la GPU lo reusa.
 */
const HALO =
  "drop-shadow(0 0 1px var(--color-background)) " +
  "drop-shadow(0 0 3px var(--color-background))";

export default function PistaDelRiel({
  riel,
}: {
  /** El contenedor que se recorre. Vive en `app/about/page.tsx`. */
  riel: RefObject<HTMLElement | null>;
}) {
  const caja = useRef<HTMLDivElement>(null);
  const relleno = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = riel.current;
    const barra = relleno.current;
    const marco = caja.current;
    if (!el || !barra || !marco) return;

    /*
      EN TELÉFONO LA RAYITA NO ESTÁ DESDE EL PRINCIPIO (7-ago-2026).

      En la primera pantalla ya vive el letrero de cómo recorrer
      (`components/comoRecorrer.tsx`), que ocupa media anchura del teléfono
      justo abajo — y la rayita cae centrada encima de él. Dos avisos apretados
      en la misma esquina se estorban y ninguno se lee.

      Se reparten el trabajo en el tiempo en vez de en el espacio: el letrero
      manda en la primera pantalla y se apaga; la rayita entra cuando aquél ya
      se fue, o sea cuando aparece el manifiesto. A partir de ahí no hay nada
      más abajo con qué pelearse.

      EN COMPUTADORA SE QUEDA SIEMPRE VISIBLE: ahí el letrero está metido en la
      esquina de una pantalla ancha y la rayita, centrada, ni lo roza.
    */
    const enTelefono =
      window.matchMedia("(pointer: coarse)").matches &&
      !window.matchMedia("(pointer: fine)").matches;

    /* El `scroll` se dispara muchas más veces que cuadros dibuja la pantalla.
       Esta banderita deja pasar UNO por cuadro y tira los demás. */
    let pedido = false;

    const pintar = () => {
      pedido = false;
      const recorrible = el.scrollWidth - el.clientWidth;
      /* Sin nada que recorrer (una pantalla enorme donde todo cabe) el avance
         es 0 y la rayita se queda quieta al principio, que es lo correcto. */
      const avance = recorrible > 0 ? el.scrollLeft / recorrible : 0;
      const acotado = Math.min(Math.max(avance, 0), 1);
      barra.style.transform = `translateX(${acotado * RECORRIDO}%)`;

      if (!enTelefono) return;

      /*
        SE MIDE CONTRA EL PRIMER PANEL, no contra el recorrido completo: el
        relevo tiene que pasar cuando el panel de entrada se va, y ese momento
        depende del ancho del panel, no de cuántos bloques traiga hoy
        `config/about.ts`. Con un porcentaje del total, agregar una sección
        movería el punto de entrada sin que nadie lo pidiera.

        Arranca a la MITAD del panel, que es justo donde el letrero termina de
        apagarse (ver `HASTA` en `comoRecorrer.tsx`), y llega entera al final
        del panel. Así uno no se ha ido cuando el otro ya viene.
      */
      const panel = (el.firstElementChild as HTMLElement | null)?.offsetWidth;
      const salida = panel && panel > 0 ? el.scrollLeft / panel : 1;
      const entrada = Math.min(Math.max((salida - 0.5) / 0.5, 0), 1);

      marco.style.opacity = String(entrada);
      /* A cero no se ve, pero el `filter` del halo se seguiría calculando. */
      marco.style.visibility = entrada <= 0.01 ? "hidden" : "visible";
    };

    const alRecorrer = () => {
      if (pedido) return;
      pedido = true;
      requestAnimationFrame(pintar);
    };

    pintar();
    el.addEventListener("scroll", alRecorrer, { passive: true });
    /* Al girar el teléfono cambia cuánto hay que recorrer, y con él la
       proporción que representa la posición actual. */
    window.addEventListener("resize", alRecorrer);

    return () => {
      el.removeEventListener("scroll", alRecorrer);
      window.removeEventListener("resize", alRecorrer);
    };
  }, [riel]);

  return (
    /* `fixed` y no dentro del riel: si viajara con los paneles se iría de la
       pantalla al primer deslizón, que es exactamente lo contrario de lo que
       tiene que hacer. La página mide una pantalla justa (`h-dvh`), así que
       aquí `fixed` no pelea con ningún scroll. */
    <div
      ref={caja}
      aria-hidden
      className="pointer-events-none fixed inset-x-0 bottom-5 z-20 flex justify-center"
      style={{ filter: HALO, transition: "opacity 0.25s linear" }}
    >
      <div className="h-[2px] w-16 overflow-hidden rounded-full bg-foreground/20">
        <div
          ref={relleno}
          className="h-full rounded-full bg-foreground/75"
          style={{ width: `${FRACCION_DEL_RELLENO * 100}%` }}
        />
      </div>
    </div>
  );
}
