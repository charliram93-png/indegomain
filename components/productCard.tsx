"use client";

import Image from "next/image";
import Reveal from "@/components/reveal";
import { Product, isSoldOut } from "@/types/products";
import { HELVETICA } from "@/lib/fonts";
import { useI18n } from "@/lib/i18n/context";

type Props = {
  product: Product;
  index: number;
  onClick: () => void;
};

/**
 * Fila editorial del catálogo: imagen (cuadro con número) de un lado y el
 * nombre en grande del otro, alternando por índice. Al hacer clic abre el modal.
 */
export default function ProductCard({ product, index, onClick }: Props) {
  const { t, lang } = useI18n();
  const soldOut = isSoldOut(product);
  const number = String(index + 1).padStart(2, "0");
  const reversed = index % 2 === 1;

  return (
    <Reveal className="grid items-center gap-6 md:grid-cols-2 md:gap-16">
      {/* IMAGEN (cuadro con número) */}
      <button
        onClick={onClick}
        aria-label={product.name}
        className={`group relative order-2 block w-full overflow-hidden rounded-sm bg-surface ${
          reversed ? "md:order-2" : "md:order-1"
        }`}
      >
        {/*
          `container-type: inline-size` deja medir el número contra el ANCHO
          del cuadro (unidad `cqw`). Antes usaba tamaños fijos (7xl/9xl) y en
          escritorio salía proporcionalmente más grande que en móvil: por eso
          se veía distinto en cada pantalla.
        */}
        {/* `halo-prenda`: luz suave detrás de la playera SOLO en tema oscuro.
            Las tres prendas son oscuras y contra la placa oscura se pierden
            (la café es la peor). Ver globals.css. */}
        <div className="halo-prenda relative aspect-square w-full [container-type:inline-size]">
          {/*
            El número va ABAJO A LA DERECHA y un poco metido hacia adentro, para
            que la playera lo tape en parte. Queda ANTES de la <Image> a
            propósito: al pintarse primero, la foto le pasa por encima y se ve
            como si el número estuviera detrás.
          */}
          <span
            className="pointer-events-none absolute bottom-[3%] right-[6%] text-[24cqw] font-bold leading-none opacity-15 md:right-[5%]"
            style={{ fontFamily: HELVETICA }}
          >
            {number}
          </span>
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className={`pointer-events-none select-none object-contain p-8 transition-transform duration-500 ease-out group-hover:scale-[1.04] ${
              soldOut ? "opacity-50 grayscale" : ""
            }`}
          />
          {soldOut && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="bg-foreground px-4 py-2 text-[10px] font-bold uppercase tracking-[0.03em] text-background">
                {t.product.soldOut}
              </span>
            </div>
          )}
        </div>
      </button>

      {/*
        NOMBRE EN GRANDE. En móvil se monta sobre el borde de arriba del cuadro:
        el margen negativo sube la imagen y el `z-10` deja el nombre encima, así
        queda mitad sobre el fondo y mitad sobre la playera. En escritorio va al
        lado, como siempre.
      */}
      <div
        className={`relative z-10 order-1 -mb-12 flex flex-col md:mb-0 ${
          reversed ? "md:order-1" : "md:order-2"
        }`}
      >
        <button onClick={onClick} className="text-left">
          <h2
            className="text-5xl font-bold uppercase leading-none tracking-tighter transition-opacity hover:opacity-60 md:text-7xl"
            style={{ fontFamily: HELVETICA }}
          >
            {product.name}
          </h2>
        </button>
        {/* Descripción en desktop (junto al nombre) */}
        {product.description && (
          <p className="mt-5 hidden max-w-xs text-sm leading-relaxed opacity-50 md:block">
            {product.description[lang]}
          </p>
        )}
      </div>

      {/* Descripción en móvil: DEBAJO de la imagen */}
      {product.description && (
        <p className="order-3 max-w-xs text-sm leading-relaxed opacity-50 md:hidden">
          {product.description[lang]}
        </p>
      )}
    </Reveal>
  );
}
