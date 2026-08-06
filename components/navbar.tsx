"use client";

import Link from "next/link";
import Image from "next/image";
import { ShoppingBag } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { useCart } from "@/store/cart";
import ThemeToggle from "@/components/themeToggle";
import DropTag from "@/components/dropTag";
import LangToggle from "@/components/langToggle";
import { useFlag } from "@/lib/flags";
import { useI18n } from "@/lib/i18n/context";

// TODO: reemplazar por los logos oficiales (negro y blanco) subidos a Cloudinary.
const LOGO_DARK =
  "https://res.cloudinary.com/dij60ghdf/image/upload/v1772763867/LogoWhatsMetaData_jmp0lg.png"; // logo negro, para fondo claro
const LOGO_LIGHT =
  "https://res.cloudinary.com/dij60ghdf/image/upload/v1772753917/Logo_White_xhx1kd.webp"; // logo blanco, para fondo oscuro

const Navbar: React.FC = () => {
  const { openCart, totalItems } = useCart();
  const { t } = useI18n();
  const { resolvedTheme } = useTheme();
  // `?glass=0` apaga el cristal de la barra, para medirlo en el teléfono.
  const glass = useFlag("glass", "1") !== "0";

  // Evita mismatch de hidratación: contador y logo temático solo tras montar.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const count = mounted ? totalItems() : 0;
  const logoSrc =
    mounted && resolvedTheme === "dark" ? LOGO_LIGHT : LOGO_DARK;

  return (
    /*
      EL CRISTAL DE LA BARRA (`backdrop-blur`) SE QUEDA.
      Es el único desenfoque que sobrevivió a la limpieza de rendimiento, y a
      propósito: de los cuatro que había era el MÁS BARATO (una franja de 80 px
      de alto, no un panel entero moviéndose encima) y el que más se nota.
      Los caros —el del panel del modal y los de los fondos del carrito y el
      modal— sí se quitaron: esos se recalculaban en cada cuadro MIENTRAS el
      panel entraba animado, que es justo el tirón que se sentía.

      Aun así, la barra es fija y su desenfoque se recalcula al scrollear. Si
      después de todo lo demás el scroll TODAVÍA se siente pesado en el
      teléfono, este es el siguiente sospechoso: pruébalo con `?glass=0`.
    */
    <nav
      className={`fixed top-0 left-0 z-50 flex h-20 w-full items-center justify-between px-6 md:px-12 ${
        glass ? "bg-surface/70 backdrop-blur-md" : "bg-surface/95"
      }`}
    >
      {/* LOGO */}
      <div className="flex select-none items-center">
        <Link href="/" className="select-none">
          <Image
            src={logoSrc}
            width={100}
            height={100}
            alt="Indego Studio"
            className="h-14 w-14 select-none object-contain pointer-events-none md:h-20 md:w-20"
          />
        </Link>
      </div>

      {/* ETIQUETA DEL DROP. Va FUERA de la fila del logo: está posicionada
          contra la barra para poder montarse sobre su borde de abajo, la mayor
          parte adentro y el resto colgando. Se esconde sola dentro del
          catálogo. Ver `components/dropTag.tsx`. */}
      <DropTag />

      {/* CONTROLES */}
      <div className="flex select-none items-center gap-1">
        <LangToggle />
        <ThemeToggle />
        <button
          onClick={openCart}
          aria-label={t.nav.openCart}
          className="relative select-none rounded-full p-2 text-foreground outline-none transition-all"
        >
          <ShoppingBag
            size={24}
            strokeWidth={1.5}
            className="select-none pointer-events-none"
          />
          {count > 0 && (
            <span className="absolute right-0 top-0 flex h-4 w-4 select-none items-center justify-center rounded-full bg-foreground text-[10px] font-bold text-background pointer-events-none">
              {count}
            </span>
          )}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
