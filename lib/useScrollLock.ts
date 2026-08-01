"use client";

import { useEffect } from "react";

/**
 * BLOQUEA EL SCROLL DE LA PÁGINA mientras hay algo encima (el carrito o el
 * modal de producto).
 *
 * Por qué `position: fixed` y no solo `overflow: hidden`:
 * Safari en iPhone IGNORA `overflow: hidden` en el body. Con eso, la página de
 * atrás seguía moviéndose al arrastrar dentro del carrito y, al cerrarlo,
 * aparecías hasta el final del catálogo. Además, al scrollear, Safari esconde
 * su barra de abajo y la altura de la ventana cambia a media animación: por eso
 * el botón de PAGAR salía cortado si el carrito se abría con la página abajo.
 *
 * `position: fixed` sí lo congela en todos lados, pero el navegador olvida
 * dónde ibas, así que aquí se guarda la posición y se restaura al soltar.
 */
export function useScrollLock(activo: boolean) {
  useEffect(() => {
    if (!activo) return;

    const y = window.scrollY;
    const { body } = document;

    /*
      En computadora, al esconder el scroll desaparece la barra lateral y toda
      la página se recorre unos pixeles a la derecha: se ve como un brinco al
      abrir el carrito. Se mide cuánto ocupaba y se rellena con ese mismo
      espacio. En el teléfono la barra no ocupa lugar, así que esto vale 0.
    */
    const barra = window.innerWidth - document.documentElement.clientWidth;

    const anterior = {
      position: body.style.position,
      top: body.style.top,
      width: body.style.width,
      overflow: body.style.overflow,
      paddingRight: body.style.paddingRight,
    };

    body.style.position = "fixed";
    body.style.top = `-${y}px`;
    body.style.width = "100%";
    body.style.overflow = "hidden";
    if (barra > 0) body.style.paddingRight = `${barra}px`;

    return () => {
      body.style.position = anterior.position;
      body.style.top = anterior.top;
      body.style.width = anterior.width;
      body.style.overflow = anterior.overflow;
      body.style.paddingRight = anterior.paddingRight;
      window.scrollTo(0, y);
    };
  }, [activo]);
}
