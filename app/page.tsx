"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import Countdown from "@/components/countdown";
import DropIntro from "@/components/dropIntro";
import { Line } from "@/components/manifesto";
import { useI18n } from "@/lib/i18n/context";
import { HELVETICA } from "@/lib/fonts";
import { MANIFESTO } from "@/config/brand";
import { DROP_VIDEO, DROP_POSTER, isDropOpen } from "@/config/drop";

/**
 * A DÓNDE LLEVA "ENTRAR"
 *
 * AL CATÁLOGO, derecho. Se probó durante unos días entrar por la página de
 * marca (`/about`) y se echó para atrás el 6-ago-2026: quien acaba de aguantar
 * el countdown viene a ver las playeras, y meterle una página de lectura antes
 * era ponerle una puerta de más.
 *
 * El Nosotros no se perdió, cambió de puerta: ahora está en el navbar, junto al
 * logo (antes solo en el pie). Para volver a probar la entrada por marca, aquí
 * se pone "/about".
 */
const DESTINO = "/product";

/*
  LA SALIDA DEL COUNTDOWN, EN TRES TIEMPOS (ms)
  ---------------------------------------------
  1. CORTINA — la pantalla se llena del color del tema y se traga el video.
  2. FRASE   — aparece el manifiesto centrado y se queda un momento. Es el
     puente entre el video y la tienda: lo que en el countdown se leyó a
     pedazos, aquí se lee completo y quieto.
  3. DIFUMINA — la frase se desenfoca y se va; recién entonces se cambia de
     página, para que del otro lado ya solo quede el fundido de entrada.

  Súbelos o bájalos aquí, que el resto se acomoda solo.
*/
const T_CORTINA = 450;
const T_FRASE = 1500;
const T_DIFUMINA = 550;
const DURACION_SALIDA = T_CORTINA + T_FRASE + T_DIFUMINA;

export default function Home() {
  const { t } = useI18n();
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [open, setOpen] = useState(false);
  const [preview, setPreview] = useState(false);
  const [saliendo, setSaliendo] = useState(false);

  useEffect(() => {
    if (isDropOpen()) setOpen(true);
    if (document.cookie.includes("drop_preview=1")) setPreview(true);
  }, []);

  const handleComplete = useCallback(() => setOpen(true), []);

  /*
    TRANSICIÓN AL CATÁLOGO
    ----------------------
    Antes ENTRAR era un salto seco: se cortaba el video y aparecía la tienda de
    golpe. Ahora la pantalla se funde al color del tema (el MISMO fondo con el
    que abre el catálogo), y del otro lado el catálogo entra apareciendo. Como
    los dos extremos son del mismo color, se siente un solo movimiento y no dos
    páginas distintas.

    Se usa un <Link> normal con `preventDefault` en vez de un <button>: así
    Next sigue precargando el catálogo por su cuenta (y el clic derecho /
    "abrir en pestaña nueva" siguen funcionando), pero el cambio de página lo
    disparamos nosotros al terminar el fundido.
  */
  const entrar = useCallback(
    (e: React.MouseEvent) => {
      // Si abre en pestaña nueva (ctrl/cmd + clic), que se comporte normal.
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
      e.preventDefault();
      if (saliendo) return;
      setSaliendo(true);
      setTimeout(() => router.push(DESTINO), DURACION_SALIDA);
    },
    [router, saliendo],
  );

  return (
    <main className="relative flex h-dvh w-full items-center justify-center overflow-hidden bg-black text-white">
      {/* VIDEO DE FONDO (bucle, sin sonido). Va SIN letras: solo los caballos. */}
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay
        loop
        muted
        playsInline
        poster={DROP_POSTER}
      >
        <source src={DROP_VIDEO} type="video/mp4" />
      </video>

      {/* TEXTO DEL DROP, dibujado en el navegador y pegado al tiempo del video. */}
      <DropIntro videoRef={videoRef} />

      {/* CONTADOR (un poco abajo del centro) */}
      <div className="absolute inset-x-0 bottom-[16%] z-10 flex flex-col items-center px-6 text-center">
        {open ? (
          <Link
            href={DESTINO}
            onClick={entrar}
            className="border border-white px-12 py-4 text-[11px] font-bold tracking-[0.03em] transition-colors hover:bg-white hover:text-black"
          >
            {t.home.enter}
          </Link>
        ) : (
          <>
            <Countdown onComplete={handleComplete} />
            {preview && (
              <Link
                href={DESTINO}
                onClick={entrar}
                className="mt-3 text-[9px] uppercase tracking-[0.03em] text-white/60 transition-opacity hover:text-white"
              >
                {t.home.enterPreview}
              </Link>
            )}
          </>
        )}
      </div>

      {/*
        CORTINA DEL FUNDIDO + EL MANIFIESTO.
        `bg-background` = el mismo color con el que abre la página siguiente,
        por eso el corte no se nota.

        AQUÍ NO HACE FALTA `usePresencia` (que es lo que reemplazó a
        framer-motion en el carrito y el modal): esto solo ENTRA. Se enciende
        con `saliendo`, corre, y para cuando termina ya se cambió de página —
        no hay salida que animar, así que basta con dibujarlo o no.
      */}
      {saliendo && (
        <div
          className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center bg-background px-6"
          /* Los cuadros clave están en `globals.css` (`@keyframes cortina`);
             los tiempos salen de las constantes de arriba. `both` deja el
             elemento en su estado inicial antes de arrancar y en el final al
             terminar, o si no parpadea en los bordes. */
          style={{
            animation: `cortina ${T_CORTINA}ms ease-in-out both`,
          }}
        >
          {/*
            La frase entra desenfocada, se aclara, se queda un momento y se
            vuelve a desenfocar al irse. Va en UNA sola animación por cuadros
            clave en vez de encadenar estados: así los tiempos se leen de
            corrido y no hay forma de que se desincronicen.
          */}
          <div
            className="w-full max-w-5xl text-center text-foreground"
            style={{
              fontFamily: HELVETICA,
              animation: `frase-de-salida ${T_FRASE + T_DIFUMINA}ms ease-out ${T_CORTINA}ms both`,
            }}
          >
            <p
              className="font-bold uppercase opacity-45"
              style={{
                fontSize: "clamp(0.72rem, 2vw, 1.2rem)",
                letterSpacing: "0.04em",
              }}
            >
              <Line line={MANIFESTO.top} />
            </p>
            <p
              className="mt-4 font-bold uppercase md:mt-6"
              style={{
                fontSize: "clamp(2rem, 8vw, 6rem)",
                lineHeight: 0.95,
                letterSpacing: "-0.02em",
              }}
            >
              {MANIFESTO.bottom.map((linea, i) => (
                <span key={i} className="block">
                  <Line line={linea} />
                </span>
              ))}
            </p>
          </div>
        </div>
      )}
    </main>
  );
}
