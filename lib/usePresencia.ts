"use client";

import { useEffect, useState } from "react";

/**
 * ENTRAR Y SALIR CON CSS
 * ----------------------
 * Resuelve lo ÚNICO que el CSS no sabe hacer solo: animar algo que se está
 * yendo. Cuando un elemento se desmonta, desaparece de golpe — no hay a qué
 * aplicarle una transición. Esto lo mantiene montado el tiempo que dura la
 * salida y lo quita al terminar.
 *
 * ES EL REEMPLAZO DE `AnimatePresence` de framer-motion, que se quitó del
 * proyecto el 6-ago-2026: costaba 39 KB comprimidos POR PÁGINA y encima
 * viajaba duplicado (una copia para la home y otra para el resto), y todo lo
 * que animaba eran tres entradas y salidas que el CSS hace en la GPU. Es la
 * misma mudanza que ya se le había hecho a `components/reveal.tsx`.
 *
 * CÓMO SE USA
 * -----------
 *   const { montado, dentro } = usePresencia(isOpen, 300);
 *   if (!montado) return null;
 *   ...
 *   <div className={`transition-opacity duration-300 ${dentro ? "opacity-100" : "opacity-0"}`}>
 *
 *   · `montado` — si el elemento debe existir en la página.
 *   · `dentro`  — si ya debe verse. Es lo que se enciende y apaga en las clases.
 *
 * OJO: `salidaMs` TIENE QUE COINCIDIR con la duración de la transición en CSS.
 * Si se pone menos, el elemento se arranca a media salida; si se pone más, se
 * queda un rato invisible pero tapando los clics.
 */
export function usePresencia(abierto: boolean, salidaMs: number) {
  // Si nace abierto, nace montado: así la animación de entrada también corre
  // la primera vez, igual que hacía framer-motion.
  const [montado, setMontado] = useState(abierto);
  const [dentro, setDentro] = useState(false);

  /*
    ESTOS DOS AJUSTES VAN DURANTE EL DIBUJADO, no en un efecto. Es el mismo
    patrón que ya usa `productModal` con `slugAnterior`, y aquí importa por dos
    razones:

      · al ABRIR, el elemento tiene que existir YA. Si se montara desde un
        efecto habría un cuadro en el que la orden es "ábrete" y todavía no hay
        nada en la página;
      · al CERRAR, tiene que apagarse YA, para que la salida arranque desde el
        cuadro en que le dieron cerrar y no uno después.

    De paso evita la regla de React que prohíbe llamar a `setState` derecho
    dentro de un efecto (justamente porque provoca dibujados en cascada).
  */
  if (abierto && !montado) setMontado(true);
  if (!abierto && dentro) setDentro(false);

  /*
    ENCENDER, dos cuadros después de montar.

    POR QUÉ DOS `requestAnimationFrame`: para que una transición corra, el
    navegador tiene que haber pintado ANTES el estado apagado. Si se montara y
    se encendiera en el mismo cuadro, vería un solo estado —el final— y no
    habría nada que animar: aparecería de golpe. El primer cuadro deja que se
    pinte apagado; el segundo lo enciende.

    Y POR QUÉ ADEMÁS UN TEMPORIZADOR DE RESPALDO: los navegadores CONGELAN
    `requestAnimationFrame` cuando la pestaña no se está viendo (comprobado el
    6-ago-2026: en una pestaña oculta no dispara ni en medio segundo). Sin
    respaldo, si algo abre el carrito con la pestaña en segundo plano, al
    volver estaría montado pero invisible para siempre — no hay quien lo
    encienda. Los dos caminos llevan al mismo lugar y el que llegue primero
    gana; encender dos veces no hace nada.
  */
  useEffect(() => {
    if (!abierto || !montado) return;

    const encender = () => setDentro(true);

    let segundo = 0;
    const primero = requestAnimationFrame(() => {
      segundo = requestAnimationFrame(encender);
    });
    const respaldo = setTimeout(encender, 80);

    return () => {
      cancelAnimationFrame(primero);
      cancelAnimationFrame(segundo);
      clearTimeout(respaldo);
    };
  }, [abierto, montado]);

  /* DESMONTAR, cuando ya terminó de irse. Si vuelven a abrir antes de que se
     cumpla el plazo, la limpieza cancela el temporizador y no se desmonta. */
  useEffect(() => {
    if (abierto || !montado) return;

    const temporizador = setTimeout(() => setMontado(false), salidaMs);
    return () => clearTimeout(temporizador);
  }, [abierto, montado, salidaMs]);

  return { montado, dentro };
}
