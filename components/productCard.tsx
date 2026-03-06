"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Product } from "@/types/products";

type Props = {
  product: Product;
  onClick: () => void;
};

export default function ProductCard({ product, onClick }: Props) {
  return (
    <motion.div
      layoutId={product.slug}
      onClick={onClick}
      className="cursor-pointer group flex flex-col items-center p-4 md:p-14 " // 'group' permite que el hover afecte a los hijos
    >
      {/* CONTENEDOR DE IMAGEN (El marco para el zoom) */}
      <div className="relative w-full overflow-hidden select-none rounded-sm">
        <Image
          src={product.image}
          alt={product.name}
          width={500}
          height={500}
          /* - select-none: Evita el sombreado azul (estilo Yeezy).
             - transition-transform duration-700: Zoom suave y lento.
             - group-hover:scale-[1.04]: Zoom del 4% al pasar el mouse.
             - pointer-events-none: Evita que la imagen sea "arrastrable".
          */
          className="w-full h-auto object-contain select-none pointer-events-none transition-transform duration-700 ease-out group-hover:scale-[1.04]"
        />
      </div>

      {/* TEXTO DEL PRODUCTO */}
      <p 
        className="mt-3 text-sm text-center uppercase tracking-tight" 
        style={{ 
          color: "#32331F",
          fontFamily: "Inter, sans-serif",
         
        }}
      >
        {product.name}
      </p>
    </motion.div>
  );
}