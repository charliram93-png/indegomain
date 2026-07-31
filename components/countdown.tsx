"use client";

import { useEffect, useState } from "react";
import { DROP_DATE } from "@/config/drop";

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
 * Cuenta regresiva para el countdown (sobre el video):
 * números en rojo, Helvetica bold, muy pegados. Sin etiquetas.
 * Llama a `onComplete` una vez al llegar a cero.
 */
export default function Countdown({
  onComplete,
}: {
  onComplete?: () => void;
}) {
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

  const text = timeLeft
    ? `${format(timeLeft.days)}:${format(timeLeft.hours)}:${format(
        timeLeft.minutes
      )}:${format(timeLeft.seconds)}`
    : "--:--:--:--";

  return (
    <div
      aria-label="Cuenta regresiva para el lanzamiento"
      className="text-4xl font-bold tabular-nums leading-none sm:text-6xl md:text-8xl"
      style={{
        fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
        color: "#E10600",
        letterSpacing: "-0.06em",
      }}
    >
      {text}
    </div>
  );
}
