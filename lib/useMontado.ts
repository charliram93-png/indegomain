"use client";

import { useSyncExternalStore } from "react";

/**
 * ¿YA MONTÓ EN EL CLIENTE?
 * -----------------------
 * Devuelve `false` mientras se dibuja en el servidor y durante la hidratación,
 * y `true` de ahí en adelante. Sirve para lo que NO se puede saber en el
 * servidor —el tema, el idioma guardado, la hora, una cookie— sin que el HTML
 * del servidor y el del navegador salgan distintos y React se queje.
 *
 * SUSTITUYE AL `useState(false)` + `useEffect(() => setMontado(true))` que
 * estaba repetido en cuatro componentes. Aquello funcionaba, pero provocaba un
 * dibujado en cascada (React pintaba, el efecto cambiaba el estado, React
 * volvía a pintar) y `react-hooks/set-state-in-effect` lo marcaba como error en
 * los seis lugares donde aparecía.
 *
 * `useSyncExternalStore` es la forma que React trae para esto: se le dan dos
 * respuestas, la del servidor y la del cliente, y él resuelve el cambio sin
 * pasar por un efecto.
 *
 * LAS TRES FUNCIONES VIVEN FUERA DEL HOOK a propósito: si se escribieran
 * adentro, cada dibujado crearía funciones nuevas y `useSyncExternalStore` se
 * volvería a suscribir cada vez.
 */
const nuncaCambia = () => () => {};
const enElCliente = () => true;
const enElServidor = () => false;

export function useMontado() {
  return useSyncExternalStore(nuncaCambia, enElCliente, enElServidor);
}
