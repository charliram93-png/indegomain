"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import Countdown from "@/components/countdown";
import { useI18n } from "@/lib/i18n/context";
import { DROP_VIDEO, DROP_POSTER, isDropOpen } from "@/config/drop";

export default function Home() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [preview, setPreview] = useState(false);

  useEffect(() => {
    if (isDropOpen()) setOpen(true);
    if (document.cookie.includes("drop_preview=1")) setPreview(true);
  }, []);

  const handleComplete = useCallback(() => setOpen(true), []);

  return (
    <main className="landscape-lock relative flex h-dvh w-full items-center justify-center overflow-hidden bg-black text-white">
      {/* VIDEO DE FONDO (bucle, sin sonido). El video ya trae el branding/texto. */}
      <video
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay
        loop
        muted
        playsInline
        poster={DROP_POSTER}
      >
        <source src={DROP_VIDEO} type="video/mp4" />
      </video>

      {/* CONTADOR (un poco abajo del centro) */}
      <div className="absolute inset-x-0 bottom-[16%] z-10 flex flex-col items-center px-6 text-center">
        {open ? (
          <Link
            href="/product"
            className="border border-white px-12 py-4 text-[11px] font-bold tracking-[0.3em] transition-colors hover:bg-white hover:text-black"
          >
            {t.home.enter}
          </Link>
        ) : (
          <>
            <Countdown onComplete={handleComplete} />
            {preview && (
              <Link
                href="/product"
                className="mt-3 text-[9px] uppercase tracking-[0.3em] text-white/60 transition-opacity hover:text-white"
              >
                {t.home.enterPreview}
              </Link>
            )}
          </>
        )}
      </div>
    </main>
  );
}
