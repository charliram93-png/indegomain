"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Countdown from "@/components/countdown";
import DropIntro from "@/components/dropIntro";
import { useI18n } from "@/lib/i18n/context";
import { DROP_VIDEO, DROP_POSTER, isDropOpen } from "@/config/drop";

/** Cuánto dura el fundido al catálogo, en milisegundos. */
const DURACION_SALIDA = 500;

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
      setTimeout(() => router.push("/product"), DURACION_SALIDA);
    },
    [router, saliendo]
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
            href="/product"
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
                href="/product"
                onClick={entrar}
                className="mt-3 text-[9px] uppercase tracking-[0.03em] text-white/60 transition-opacity hover:text-white"
              >
                {t.home.enterPreview}
              </Link>
            )}
          </>
        )}
      </div>

      {/* CORTINA DEL FUNDIDO. `bg-background` = el mismo color con el que abre
          el catálogo, por eso el corte no se nota. */}
      <AnimatePresence>
        {saliendo && (
          <motion.div
            className="pointer-events-none absolute inset-0 z-30 bg-background"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: DURACION_SALIDA / 1000, ease: "easeInOut" }}
          />
        )}
      </AnimatePresence>
    </main>
  );
}
