"use client";

import { Fragment, useEffect, useState } from "react";
import { DROP_DATE } from "@/config/drop";
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
 * Countdown hacia la fecha del drop.
 * Llama a `onComplete` una sola vez cuando el tiempo llega a cero,
 * para que la landing pueda revelar el acceso a la tienda.
 */
export default function Countdown({
  onComplete,
}: {
  onComplete?: () => void;
}) {
  const { t } = useI18n();
  // Evita hydration mismatch: no calculamos tiempo hasta montar en el cliente.
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);

  useEffect(() => {
    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      const next = calculateTimeLeft();
      setTimeLeft(next);
      if (next.done) {
        clearInterval(timer);
        onComplete?.();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [onComplete]);

  const units: { label: string; value: number }[] = [
    { label: t.countdown.days, value: timeLeft?.days ?? 0 },
    { label: t.countdown.hrs, value: timeLeft?.hours ?? 0 },
    { label: t.countdown.min, value: timeLeft?.minutes ?? 0 },
    { label: t.countdown.sec, value: timeLeft?.seconds ?? 0 },
  ];

  return (
    <div
      className="flex items-start justify-center gap-2 tabular-nums sm:gap-4 md:gap-6"
      aria-label="Cuenta regresiva para el lanzamiento"
    >
      {units.map((unit, i) => (
        <Fragment key={unit.label}>
          <div className="flex flex-col items-center">
            <span className="text-3xl font-bold leading-none tracking-tight sm:text-4xl md:text-6xl">
              {timeLeft ? format(unit.value) : "--"}
            </span>
            <span className="mt-2 text-[8px] tracking-[0.2em] opacity-50 md:text-[11px] md:tracking-[0.25em]">
              {unit.label}
            </span>
          </div>
          {i < units.length - 1 && (
            <span className="text-3xl font-bold leading-none opacity-30 sm:text-4xl md:text-6xl">
              :
            </span>
          )}
        </Fragment>
      ))}
    </div>
  );
}
