"use client";

import { useSyncExternalStore } from "react";

/**
 * BANDERAS DE PRUEBA
 * ------------------
 * Sirven para COMPARAR dos versiones de algo en el teléfono, en vivo, sin
 * tener que volver a desplegar. Se activan agregando algo a la dirección:
 *
 *   /product?grano=0     -> apaga el granulado (para medir si se siente más ágil)
 *   /product?grano=1     -> lo enciende
 *   /product?talla=rojo  -> la talla elegida se marca en ROJO
 *   /product?talla=tema  -> la talla elegida se marca solo con el contraste
 *
 * Sin parámetro, manda el valor por defecto que está escrito en el código.
 * Nada de esto queda guardado: al abrir la dirección normal, todo vuelve a su
 * valor de siempre.
 *
 * Cuando se decida cada cosa, el switch se borra y se deja el valor ganador.
 */

/**
 * La dirección solo existe en el navegador: el servidor no la conoce. Por eso
 * se lee con `useSyncExternalStore`, que es la forma que React trae justo para
 * esto: en el servidor devuelve el valor por defecto y en el navegador el real,
 * sin quejarse de que un HTML y el otro no coincidan.
 *
 * La dirección no cambia sola, así que `suscribir` no tiene nada que escuchar;
 * está fuera de la función a propósito, para que sea siempre la misma y React
 * no vuelva a suscribirse en cada dibujado.
 */
const suscribir = () => () => {};

export function useFlag(nombre: string, porDefecto: string): string {
  return useSyncExternalStore(
    suscribir,
    () => new URLSearchParams(window.location.search).get(nombre) ?? porDefecto,
    () => porDefecto
  );
}
