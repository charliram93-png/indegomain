"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { DROP_DATE } from "@/config/drop";
import { HELVETICA } from "@/lib/fonts";
import { useI18n } from "@/lib/i18n/context";

type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  done: boolean;
};

const calculateTimeLeft = (): TimeLeft => {
  const difference = +DROP_DATE - +new Date();

  if (difference <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, done: true };
  }

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / 1000 / 60) % 60),
    seconds: Math.floor((difference / 1000) % 60),
    done: false,
  };
};

const format = (n: number) => String(n).padStart(2, "0");

/**
 * EL RELOJ, VISTO COMO UN ALMACÉN EXTERNO
 * ---------------------------------------
 * La hora no vive en React: es algo de afuera que cambia solo. Por eso el
 * contador la lee con `useSyncExternalStore` en vez de tener un `useState` y un
 * `useEffect` que lo va empujando. Aquello dibujaba de más al montar (y era uno
 * de los `set-state-in-effect` que marcaba el linter).
 *
 * LA COPIA EN MEMORIA NO ES OPCIONAL. `useSyncExternalStore` exige que leer dos
 * veces seguidas, sin que nada haya cambiado, devuelva EXACTAMENTE el mismo
 * valor. `calculateTimeLeft()` arma un objeto nuevo cada vez, así que
 * devolverlo directo mete a React en un ciclo infinito de dibujados. Se guarda
 * el último y solo se recalcula cuando cambió el SEGUNDO.
 */
let ultimoSegundo = -1;
let ultimoValor: TimeLeft | null = null;

function leerElReloj(): TimeLeft {
  const segundo = Math.floor(Date.now() / 1000);
  if (segundo !== ultimoSegundo || ultimoValor === null) {
    ultimoSegundo = segundo;
    ultimoValor = calculateTimeLeft();
  }
  return ultimoValor;
}

/** En el servidor no hay hora del visitante que valga: se dibujan guiones. Si
 *  aquí se devolviera un tiempo, el HTML del servidor y el del navegador
 *  saldrían distintos por los segundos que pasan entre uno y otro. */
const leerEnElServidor = (): TimeLeft | null => null;

function suscribirseAlReloj(avisar: () => void) {
  const timer = setInterval(avisar, 1000);
  return () => clearInterval(timer);
}

/**
 * Cuenta regresiva para el countdown (sobre el video):
 * números en rojo, Helvetica bold, muy pegados. Sin etiquetas.
 * Llama a `onComplete` una vez al llegar a cero.
 */
export default function Countdown({
  onComplete,
}: {
  onComplete?: () => void;
}) {
  const { t } = useI18n();
  // `null` hasta montar en el cliente: el servidor no sabe la hora de quien
  // visita. Ver el comentario de `leerElReloj` arriba.
  const timeLeft = useSyncExternalStore(
    suscribirseAlReloj,
    leerElReloj,
    leerEnElServidor,
  );

  /*
    AVISAR QUE LLEGÓ A CERO va en un efecto y NO junto a la lectura del reloj:
    `onComplete` cambia algo de FUERA de este componente (abre el drop en la
    página de inicio), y eso no se puede hacer mientras React está dibujando.

    `yaAvisamos` evita repetirlo: el reloj sigue latiendo después del cero, así
    que sin esta bandera el aviso saldría una vez por segundo, para siempre.
  */
  const yaAvisamos = useRef(false);
  useEffect(() => {
    if (timeLeft?.done && !yaAvisamos.current) {
      yaAvisamos.current = true;
      onComplete?.();
    }
  }, [timeLeft?.done, onComplete]);

  const text = timeLeft
    ? `${format(timeLeft.days)}:${format(timeLeft.hours)}:${format(
        timeLeft.minutes
      )}:${format(timeLeft.seconds)}`
    : "--:--:--:--";

  return (
    <div
      aria-label={t.countdown.label}
      className="text-4xl font-bold tabular-nums leading-none sm:text-6xl md:text-8xl"
      style={{
        fontFamily: HELVETICA,
        color: "#E10600",
        letterSpacing: "-0.06em",
      }}
    >
      {text}
    </div>
  );
}
