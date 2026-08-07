"use client";

import type { Lang } from "./dictionaries";

/**
 * DÓNDE VIVE EL IDIOMA
 * --------------------
 * En `localStorage`, y este archivo es el único que lo toca. El proveedor
 * (`context.tsx`) se limita a leer de aquí con `useSyncExternalStore`.
 *
 * POR QUÉ NO ES UN `useState` CON UN `useEffect` QUE LEE AL MONTAR, que es como
 * estaba: aquello dibujaba dos veces al entrar (una con el idioma por defecto y
 * otra con el guardado) y `react-hooks/set-state-in-effect` lo marcaba como
 * error. Con un almacén de verdad, React pide el valor cuando lo necesita y no
 * hay efecto de por medio.
 *
 * DE PILÓN, SE SINCRONIZA ENTRE PESTAÑAS: el evento `storage` del navegador
 * avisa cuando OTRA pestaña cambia el idioma, así que cambiarlo en una lo
 * cambia en todas. Antes cada pestaña se quedaba con el suyo hasta recargar.
 */

const LLAVE = "indego-lang";
export const IDIOMA_POR_DEFECTO: Lang = "en";

const esIdioma = (v: unknown): v is Lang => v === "en" || v === "es";

const escuchas = new Set<() => void>();

/**
 * LA COPIA EN MEMORIA, y no es un lujo: `useSyncExternalStore` exige que leer
 * dos veces seguidas sin cambios devuelva EXACTAMENTE lo mismo. Pegarle a
 * `localStorage` en cada dibujado además de ser lento puede devolver valores
 * distintos a media escritura, y React entra en un ciclo de dibujados.
 * `null` significa "todavía no se ha leído del navegador".
 */
let enMemoria: Lang | null = null;

export function leerEnElCliente(): Lang {
  if (enMemoria === null) {
    try {
      const guardado = localStorage.getItem(LLAVE);
      enMemoria = esIdioma(guardado) ? guardado : IDIOMA_POR_DEFECTO;
    } catch {
      // Modo privado o almacenamiento bloqueado: se sigue con el de fábrica.
      enMemoria = IDIOMA_POR_DEFECTO;
    }
  }
  return enMemoria;
}

/** En el servidor no hay navegador que preguntar: siempre el de fábrica. Tiene
 *  que coincidir con lo que dibuja el servidor o la hidratación falla. */
export function leerEnElServidor(): Lang {
  return IDIOMA_POR_DEFECTO;
}

export function guardar(idioma: Lang) {
  enMemoria = idioma;
  try {
    localStorage.setItem(LLAVE, idioma);
  } catch {
    // Sin guardar: el idioma vale para esta visita y no se recuerda.
  }
  escuchas.forEach((avisar) => avisar());
}

export function suscribir(avisar: () => void) {
  escuchas.add(avisar);
  /* `storage` SOLO lo disparan las OTRAS pestañas, nunca la que escribió; por
     eso arriba se avisa a mano además de esto. */
  const desdeOtraPestana = (e: StorageEvent) => {
    if (e.key !== LLAVE) return;
    enMemoria = esIdioma(e.newValue) ? e.newValue : IDIOMA_POR_DEFECTO;
    avisar();
  };
  window.addEventListener("storage", desdeOtraPestana);
  return () => {
    escuchas.delete(avisar);
    window.removeEventListener("storage", desdeOtraPestana);
  };
}
