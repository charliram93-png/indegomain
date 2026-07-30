"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import Countdown from "@/components/countdown";
import ThemeToggle from "@/components/themeToggle";
import LangToggle from "@/components/langToggle";
import { useI18n } from "@/lib/i18n/context";
import { DROP_NAME, isDropOpen } from "@/config/drop";

export default function Home() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [preview, setPreview] = useState(false);

  // Si el drop ya abrió al montar (fecha pasada), revela la entrada de inmediato.
  // Además, si el visitante ya desbloqueó con la clave, mostramos la entrada de preview.
  useEffect(() => {
    if (isDropOpen()) setOpen(true);
    if (document.cookie.includes("drop_preview=1")) setPreview(true);
  }, []);

  const handleComplete = useCallback(() => setOpen(true), []);

  return (
    <main className="relative flex h-dvh w-full flex-col items-center justify-center overflow-hidden bg-olive px-6 text-center text-cream">
      {/* CONTROLES */}
      <div className="absolute top-6 right-6 z-10 flex items-center gap-1">
        <LangToggle variant="light" />
        <ThemeToggle variant="light" />
      </div>

      {/* LOGO ESQUINA */}
      <div className="absolute top-6 left-6 z-10">
        <Link
          href="https://indegostudio.com"
          rel="noopener noreferrer"
          className="opacity-80 transition-opacity hover:opacity-100"
        >
          <Image
            src="https://res.cloudinary.com/dij60ghdf/image/upload/v1772753917/Logo_White_xhx1kd.webp"
            width={60}
            height={60}
            alt="Logo Indego Studio"
            className="h-10 w-10 md:h-16 md:w-16"
            priority
          />
        </Link>
      </div>

      {/* CONTENEDOR CENTRAL */}
      <div className="flex w-full max-w-md flex-col items-center justify-center gap-8 md:gap-12">
        {/* LOGOS */}
        <div className="w-full max-w-65 space-y-3 md:max-w-sm">
          <Image
            src="https://res.cloudinary.com/dij60ghdf/image/upload/f_auto,q_auto/v1772755253/LogoHev_White_db30dd.png"
            width={500}
            height={200}
            alt="Indego Studio"
            className="h-auto w-full"
            priority
          />
          <Image
            src="https://res.cloudinary.com/dij60ghdf/image/upload/f_auto,q_auto/v1772755266/LogoKids_White_ril01y.png"
            width={500}
            height={200}
            alt=""
            className="h-auto w-full px-6 md:px-10"
          />
        </div>

        {/* COUNTDOWN / ENTRADA */}
        <div className="flex w-full flex-col items-center gap-6">
          <p className="text-[10px] tracking-[0.35em] opacity-60 md:text-xs">
            {DROP_NAME} — {open ? t.home.outNow : t.home.comingSoon}
          </p>

          {open ? (
            <Link
              href="/product"
              className="border border-cream px-12 py-4 text-[11px] font-bold tracking-[0.3em] transition-colors hover:bg-cream hover:text-olive"
            >
              {t.home.enter}
            </Link>
          ) : (
            <>
              <Countdown onComplete={handleComplete} />
              {preview && (
                <Link
                  href="/product"
                  className="mt-2 text-[9px] uppercase tracking-[0.3em] opacity-40 transition-opacity hover:opacity-80"
                >
                  {t.home.enterPreview}
                </Link>
              )}
            </>
          )}

          {/* Logo inferior */}
          <div className="mt-4 flex w-full justify-center">
            <Image
              src="https://res.cloudinary.com/dij60ghdf/image/upload/f_auto,q_auto/v1772755261/Indg_Cd_White_zqimyq.png"
              width={100}
              height={35}
              alt=""
              className="h-auto w-20 opacity-90 md:w-28"
            />
          </div>
        </div>
      </div>
    </main>
  );
}
