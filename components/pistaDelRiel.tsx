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

/*
  AQUÍ VIVÍA UN HALO y se quitó el 7-ago-2026, a petición: se veía como una
  luz alrededor de la rayita y ensuciaba un trazo que quiere ser limpio.

  QUÉ HACÍA, por si hay que recuperarlo. Eran dos `drop-shadow` del color de la
  PÁGINA alrededor de un trazo del color de la TINTA:

      drop-shadow(0 0 1px var(--color-background))
      drop-shadow(0 0 3px var(--color-background))

  Servían para que la rayita no desapareciera nunca, porque va FIJA sobre un
  riel donde por debajo pasa de todo: el crema de la página, la cascada de
  logos NEGRA del panel de entrada y la banda del cierre, que va invertida. El
  halo se resolvía solo en los dos temas porque los dos colores son variables:
  sobre el crema no se veía y mandaba el trazo; sobre lo oscuro el trazo se
  perdía y el halo tomaba su lugar.

  LO QUE SE PIERDE AL QUITARLO: sobre la cascada negra y sobre la banda
  invertida, la rayita queda del mismo tono que su fondo y **puede no verse**.
  En teléfono duele menos de lo que parece, porque ahí solo aparece mientras se
  desliza y para entonces la entrada ya va saliendo; en computadora está
  siempre. Si se nota que desaparece, la salida NO es volver al halo tal cual
  —era justo lo que no gustaba— sino subir el contraste del propio trazo.
*/

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
      EN TELÉFONO LA RAYITA SOLO SE VE MIENTRAS TE MUEVES (7-ago-2026).

      Aparece al primer deslizón y se retira sola un momento después de que la
      página se queda quieta, como la barra de desplazamiento del propio
      teléfono. Dos motivos:

       · EN LA PRIMERA PANTALLA ESTORBABA. Ahí abajo ya vive el letrero de cómo
         recorrer (`components/comoRecorrer.tsx`), que ocupa media anchura del
         teléfono, y la rayita cae centrada encima de él. Dos avisos apretados
         en la misma esquina se tapan y no se lee ninguno.
       · UNA BARRA DE AVANCE SOLO INFORMA MIENTRAS ALGO AVANZA. Quieta no dice
         nada que no diga ya la propia pantalla, y en una página que quiere
         verse como un objeto y no como una interfaz, es un elemento de más.

      ANTES SE RESOLVÍA DISTINTO: la rayita entraba en función de cuánto llevaba
      salido el panel de entrada, para relevar al letrero cuando éste se
      apagaba. Se cambió porque el letrero dejó de apagarse —ahora se queda
      quieto— y porque esto es más simple y se explica solo al usarlo.

      EN COMPUTADORA SE QUEDA SIEMPRE VISIBLE: ahí el letrero está metido en la
      esquina de una pantalla ancha, la rayita centrada ni lo roza, y con ratón
      no existe la costumbre de que las barras se escondan.
    */
    const enTelefono =
      window.matchMedia("(pointer: coarse)").matches &&
      !window.matchMedia("(pointer: fine)").matches;

    /**
     * CUÁNTO AGUANTA VISIBLE DESPUÉS DEL ÚLTIMO MOVIMIENTO.
     *
     * TIENE QUE SOBREVIVIR A LA INERCIA: al soltar el dedo, el teléfono sigue
     * desplazando solo y va soltando eventos de scroll cada vez más
     * espaciados. Si esto se queda corto, la rayita parpadea al final de cada
     * deslizón, justo cuando la página se está frenando.
     *
     * Empezó en 900 ms y bajó a 500 el 7-ago-2026 porque se sentía pegajosa:
     * la rayita seguía ahí bastante después de que la página ya se había
     * parado. Medio segundo alcanza de sobra para la cola de la inercia —los
     * eventos siguen llegando mientras el desplazamiento se frena, y cada uno
     * reinicia la cuenta— y se retira en cuanto de verdad no pasa nada.
     * SI ALGÚN DÍA PARPADEA al final de un deslizón, este número es el que hay
     * que subir.
     */
    const ESPERA = 500;

    /* El `scroll` se dispara muchas más veces que cuadros dibuja la pantalla.
       Esta banderita deja pasar UNO por cuadro y tira los demás. */
    let pedido = false;
    let apagar: number | undefined;

    const pintar = () => {
      pedido = false;
      const recorrible = el.scrollWidth - el.clientWidth;
      /* Sin nada que recorrer (una pantalla enorme donde todo cabe) el avance
         es 0 y la rayita se queda quieta al principio, que es lo correcto. */
      const avance = recorrible > 0 ? el.scrollLeft / recorrible : 0;
      const acotado = Math.min(Math.max(avance, 0), 1);
      barra.style.transform = `translateX(${acotado * RECORRIDO}%)`;
    };

    /** La muestra y reinicia la cuenta para esconderla. Solo en teléfono. */
    const asomar = () => {
      if (!enTelefono) return;
      /*
        EL EMPUJONCITO DE ENTRADA NO CUENTA COMO MOVIMIENTO.

        Al llegar, el riel se asoma solo y regresa (ver el `useEffect` del
        empujón en `app/about/page.tsx`). Eso dispara eventos de scroll iguales
        a los de un dedo, y hacía aparecer la rayita nada más entrar — justo lo
        que se quería evitar al esconderla, porque la primera pantalla tiene que
        verse limpia. El empujón deja esta marca en el riel mientras dura.

        La regla, dicha en corto: **la rayita responde a la persona, no a la
        página moviéndose sola.**
      */
      if (el.dataset.empujando) return;
      marco.style.visibility = "visible";
      marco.style.opacity = "1";
      window.clearTimeout(apagar);
      apagar = window.setTimeout(() => {
        marco.style.opacity = "0";
        /*
          Se esconde DEL TODO al terminar de atenuarse, no solo transparente:
          un elemento a opacidad 0 sigue existiendo para el navegador y se
          recompone con cada cuadro del recorrido. La espera es la misma que
          dura la transición del CSS.
        */
        apagar = window.setTimeout(() => {
          marco.style.visibility = "hidden";
        }, 250);
      }, ESPERA);
    };

    const alRecorrer = () => {
      asomar();
      if (pedido) return;
      pedido = true;
      requestAnimationFrame(pintar);
    };

    pintar();
    /* De entrada, en teléfono NO se ve: nadie se ha movido todavía. */
    if (enTelefono) {
      marco.style.opacity = "0";
      marco.style.visibility = "hidden";
    }

    el.addEventListener("scroll", alRecorrer, { passive: true });
    /* Al girar el teléfono cambia cuánto hay que recorrer, y con él la
       proporción que representa la posición actual. */
    window.addEventListener("resize", alRecorrer);

    return () => {
      window.clearTimeout(apagar);
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
      style={{ transition: "opacity 0.25s linear" }}
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
