"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Product, isSoldOut } from "@/types/products";
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
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="grid items-center gap-6 md:grid-cols-2 md:gap-16"
    >
      {/* IMAGEN (cuadro con número) */}
      <button
        onClick={onClick}
        aria-label={product.name}
        className={`group relative order-2 block w-full overflow-hidden rounded-sm bg-surface ${
          reversed ? "md:order-2" : "md:order-1"
        }`}
      >
        <div className="relative aspect-square w-full">
          <span className="pointer-events-none absolute left-4 top-2 text-7xl font-bold leading-none opacity-10 md:text-9xl">
            {number}
          </span>
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className={`select-none object-contain p-8 pointer-events-none transition-transform duration-500 ease-out group-hover:scale-[1.04] ${
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

      {/* NOMBRE EN GRANDE (arriba de la imagen en móvil) */}
      <div className={`order-1 flex flex-col ${reversed ? "md:order-1" : "md:order-2"}`}>
        <button onClick={onClick} className="text-left">
          <h2 className="text-5xl font-bold uppercase leading-none tracking-tighter transition-opacity hover:opacity-60 md:text-7xl">
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
    </motion.div>
  );
}
