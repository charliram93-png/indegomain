"use client";

import { RefObject, useEffect, useState } from "react";
import {
  INTRO_BADGE,
  INTRO_COLOR,
  INTRO_CUES,
  INTRO_ENABLED,
  INTRO_LOOP,
  INTRO_STAR,
  type IntroAnchor,
  type IntroCue,
} from "@/config/dropIntro";
import { HELVETICA } from "@/lib/fonts";


/** Cada cuánto se recalcula qué palabras ya entraron (en segundos). */
const TICK = 0.05;

/**
 * Desorden reproducible: para el mismo número siempre devuelve el mismo valor
 * entre 0 y 1. No usamos `Math.random()` porque la mancha cambiaría en cada
 * dibujado (y no coincidiría entre el servidor y el navegador).
 */
const noise = (seed: number) => {
  const s = Math.sin(seed * 12.9898) * 43758.5453;
  return s - Math.floor(s);
};

/** Convierte un texto en un número, para que cada palabra tenga su desorden. */
const hash = (text: string) =>
  [...text].reduce((a, ch) => a + ch.charCodeAt(0), 0);

/** Traduce el ancla del texto a `left` + `transform`. */
const anchorStyle = (x: number, y: number, anchor: IntroAnchor) => {
  if (anchor === "right") {
    return { right: `${100 - x}%`, top: `${y}%`, transform: "translateY(-50%)" };
  }
  return {
    left: `${x}%`,
    top: `${y}%`,
    transform:
      anchor === "center" ? "translate(-50%, -50%)" : "translateY(-50%)",
  };
};

/**
 * Dibuja una escena. `elapsed` son los segundos que lleva corriendo, medidos
 * sobre el video: por eso las palabras entran siempre en el mismo cuadro,
 * aunque el video se trabe o el usuario cambie de pestaña.
 */
function Cue({ cue, elapsed }: { cue: IntroCue; elapsed: number }) {
  if (cue.kind === "line") {
    return (
      <div
        className="absolute whitespace-nowrap"
        style={{
          ...anchorStyle(cue.x, cue.y, cue.anchor),
          fontSize: `${cue.size}cqw`,
          letterSpacing: `${cue.tracking ?? 0}em`,
          lineHeight: 1,
        }}
      >
        {cue.words.map((w, i) => (
          <span
            key={i}
            style={{
              fontWeight: w.weight ?? 700,
              fontStyle: w.italic ? "italic" : "normal",
              marginRight: i < cue.words.length - 1 ? "0.28em" : undefined,
              // Las que aún no entran ocupan su lugar pero no se ven, así las
              // que ya están escritas no se recorren cuando llega la siguiente.
              visibility: elapsed >= (w.at ?? 0) ? "visible" : "hidden",
            }}
          >
            {w.text}
          </span>
        ))}
      </div>
    );
  }

  if (cue.kind === "trail") {
    return (
      <>
        {cue.trails.map((tr) => {
          const seed = hash(tr.text);
          const idx = Array.from(
            { length: tr.copies },
            (_, k) => (tr.from ?? 0) + k
          );
          // Orden en que van saliendo: en fila, o salteado si `shuffle`.
          const order = tr.shuffle
            ? [...idx].sort(
                (a, b) => noise(seed + a * 7.7) - noise(seed + b * 7.7)
              )
            : [...idx].sort((a, b) => Math.abs(a) - Math.abs(b));

          // Dónde cae cada copia: retícula (si hay `cols`) o fila con deriva.
          const place = (i: number, k: number) => {
            if (!tr.cols) return [tr.dx * i, tr.dy * i];
            const rows = Math.ceil(tr.copies / tr.cols);
            const col = k % tr.cols;
            const row = Math.floor(k / tr.cols);
            return [
              (col - (tr.cols - 1) / 2) * (tr.gapX ?? 1),
              (row - (rows - 1) / 2) * (tr.gapY ?? 1),
            ];
          };

          return (
            <div
              key={tr.text}
              className="absolute whitespace-nowrap"
              style={{
                left: `${tr.x}%`,
                top: `${tr.y}%`,
                fontSize: `${tr.size}cqw`,
                fontWeight: tr.weight ?? 700,
                fontStyle: tr.italic ? "italic" : "normal",
                letterSpacing: `${cue.tracking ?? 0}em`,
                lineHeight: 1,
              }}
            >
              {idx.map((i, k) => {
                if (
                  elapsed <
                  (tr.at ?? 0) + order.indexOf(i) * (tr.step ?? 0.08)
                )
                  return null;
                const [px, py] = place(i, k);
                const jx = (noise(seed + i * 1.7) - 0.5) * 2 * (tr.jx ?? 0);
                const jy = (noise(seed + i * 3.1 + 50) - 0.5) * 2 * (tr.jy ?? 0);
                return (
                  <span
                    key={i}
                    className="absolute left-0 top-0"
                    style={{
                      // El `- 50%` centra cada copia en `y`, como las líneas.
                      transform: `translate(${(px + jx).toFixed(3)}em, calc(${(
                        py + jy
                      ).toFixed(3)}em - 50%))`,
                    }}
                  >
                    {tr.text}
                  </span>
                );
              })}
            </div>
          );
        })}
      </>
    );
  }

  if (cue.kind === "star") {
    return (
      /* eslint-disable-next-line @next/next/no-img-element */
      <img
        src={INTRO_STAR}
        alt=""
        className="absolute"
        style={{
          ...anchorStyle(cue.x, cue.y, "center"),
          width: `${cue.size}cqw`,
          height: "auto",
        }}
      />
    );
  }

  // cierre: COMING · [logo] · SOON
  return (
    <div
      className="absolute inset-x-0"
      style={{
        top: `${cue.y}%`,
        transform: "translateY(-50%)",
        fontSize: `${cue.size}cqw`,
        letterSpacing: `${cue.tracking ?? 0}em`,
        lineHeight: 1,
      }}
    >
      {/*
        Cada pieza va anclada por su cuenta: si se usara `justify-between`, el
        logo quedaría en medio de COMING y SOON (que miden distinto) y no en el
        centro real de la pantalla.
      */}
      <div className="relative font-bold">
        <span className="absolute -translate-y-1/2" style={{ left: `${cue.inset}%` }}>
          {cue.left}
        </span>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={INTRO_BADGE}
          alt=""
          className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{ width: `${cue.logoWidth}cqw`, height: "auto" }}
        />
        <span
          className="absolute -translate-y-1/2"
          style={{ right: `${cue.inset}%` }}
        >
          {cue.right}
        </span>
      </div>
    </div>
  );
}

/**
 * Capa de texto del countdown, dibujada en el navegador sobre el video de los
 * caballos (que va SIN letras). Va pegada al `currentTime` del video, así que
 * el texto reinicia solo con cada vuelta del bucle. Si el navegador bloquea la
 * reproducción, cae a un reloj propio para que la secuencia igual se vea.
 *
 * Toda la tipografía se mide en `cqw` (% del ancho del video), por eso escala
 * bien en cualquier pantalla. Los textos y tiempos viven en `config/dropIntro.ts`.
 */
export default function DropIntro({
  videoRef,
}: {
  videoRef: RefObject<HTMLVideoElement | null>;
}) {
  // `tick` avanza de a `TICK` segundos: así solo redibujamos cuando algo cambia.
  const [state, setState] = useState({ index: -1, tick: 0 });

  useEffect(() => {
    if (!INTRO_ENABLED) return;

    let raf = 0;
    const t0 = performance.now();
    let index = -1;
    let tick = 0;

    const frame = () => {
      const v = videoRef.current;
      // Si el video ya arrancó, mandamos por su reloj (aunque esté pausado).
      // Solo caemos al reloj propio cuando el navegador bloquea la reproducción.
      const live =
        v &&
        v.readyState >= 2 &&
        v.duration > 0 &&
        (!v.paused || v.currentTime > 0);
      const t = live
        ? v.currentTime
        : ((performance.now() - t0) / 1000) % INTRO_LOOP;

      const nextIndex = INTRO_CUES.findIndex(
        (c) => t >= c.start && t < c.end
      );
      const nextTick =
        nextIndex < 0
          ? 0
          : Math.floor((t - INTRO_CUES[nextIndex].start) / TICK);

      if (nextIndex !== index || nextTick !== tick) {
        index = nextIndex;
        tick = nextTick;
        setState({ index, tick });
      }

      raf = requestAnimationFrame(frame);
    };

    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [videoRef]);

  const cue = state.index >= 0 ? INTRO_CUES[state.index] : null;

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-[5] select-none overflow-hidden"
      style={{
        containerType: "size",
        fontFamily: HELVETICA,
        color: INTRO_COLOR,
      }}
    >
      {cue && <Cue cue={cue} elapsed={state.tick * TICK} />}
    </div>
  );
}
