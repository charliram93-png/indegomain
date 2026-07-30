"use client";

import Link from "next/link";
import Image from "next/image";
import { ShoppingBag } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useCart } from "@/store/cart";
import ThemeToggle from "@/components/themeToggle";
import LangToggle from "@/components/langToggle";
import { useI18n } from "@/lib/i18n/context";

const Navbar: React.FC = () => {
  const { openCart, totalItems } = useCart();
  const { t } = useI18n();

  // Evita mismatch de hidratación: el contador (de localStorage) solo se
  // pinta después de montar en el cliente.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const count = mounted ? totalItems() : 0;

  return (
    <nav className="fixed top-0 left-0 z-50 flex h-20 w-full items-center justify-between bg-surface/70 px-6 backdrop-blur-md md:px-12">
      {/* LOGO */}
      <div className="flex select-none items-center">
        <Link href="/" className="select-none">
          <Image
            src="https://res.cloudinary.com/dij60ghdf/image/upload/v1772763867/LogoWhatsMetaData_jmp0lg.png"
            width={100}
            height={100}
            alt="Indego Studio"
            className="h-14 w-14 select-none object-contain pointer-events-none md:h-20 md:w-20"
          />
        </Link>
      </div>

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
