"use client";

import Link from "next/link";
import Image from "next/image";
import { ShoppingBag } from "lucide-react";
import React from "react";
import { useTheme } from "next-themes";
import { useCart } from "@/store/cart";
import ThemeToggle from "@/components/themeToggle";
import LangToggle from "@/components/langToggle";
import { LOGO_ESTRELLA } from "@/config/brand";
import { useFlag } from "@/lib/flags";
import { useI18n } from "@/lib/i18n/context";
import { useMontado } from "@/lib/useMontado";

const Navbar: React.FC = () => {
  const { openCart, totalItems } = useCart();
  const { t } = useI18n();
  const { resolvedTheme } = useTheme();
  // `?glass=0` apaga el cristal de la barra, para medirlo en el teléfono.
  const glass = useFlag("glass", "1") !== "0";

  // Evita mismatch de hidratación: contador y logo temático solo tras montar.
  // Ver `lib/useMontado.ts`.
  const montado = useMontado();
  const count = montado ? totalItems() : 0;
  const logoSrc =
    montado && resolvedTheme === "dark"
      ? LOGO_ESTRELLA.oscuro
      : LOGO_ESTRELLA.claro;

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
        {/*
          EL LOGO LLEVA AL CATÁLOGO (7-ago-2026), no a la raíz y ya no al
          Nosotros.

          La raíz es el countdown: los caballos a pantalla completa. Mandar ahí
          a alguien que ya entró es sacarlo del sitio y ponerlo otra vez en la
          puerta. El logo tiene que llevar "a casa", y desde hoy la casa es el
          catálogo: es la página principal del sitio. El Nosotros pasó a ser una
          página de consulta, a la que se llega desde el pie.

          Apunta al MISMO lugar que `DESTINO` en `app/page.tsx` (a dónde lleva
          ENTRAR). Si se cambia uno, hay que cambiar el otro.

          La raíz sigue siendo los caballos y nada más, a propósito: quien
          escribe el dominio pelado ve el countdown.
        */}
        <Link href="/product" className="select-none">
          <Image
            src={logoSrc}
            width={100}
            height={100}
            alt="Indego Studio"
            className="h-14 w-14 select-none object-contain pointer-events-none md:h-20 md:w-20"
          />
        </Link>
      </div>

      {/*
        NOSOTROS NO VA AQUÍ. Se probó junto al logo (6-ago-2026) y se regresó al
        pie: en la barra competía con el logo y con el carrito por la misma
        mirada, y no es un enlace de esa jerarquía. En el pie va después de
        "seguir pedido", que es lo que la gente busca primero.
      */}

      {/*
        AQUÍ VIVÍA LA ENTRADA AL DROP y se quitó el 7-ago-2026, junto con su
        componente. Primero fue una calcomanía roja montada en el borde de la
        barra y luego un "DROP #1" de texto en esta fila.

        YA NO TIENE SENTIDO: el catálogo pasó a ser la página principal, así que
        el logo de aquí al lado ya lleva ahí y el enlace apuntaba a donde estás
        parado. El único sitio donde salía era el Nosotros, que ahora es una
        página de consulta a la que se llega desde el pie.
      */}

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
