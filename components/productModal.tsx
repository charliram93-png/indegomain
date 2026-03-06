"use client";

import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Product } from "@/types/products";
import { X } from "lucide-react"; // Importamos el icono X

type Props = {
  product: Product | null;
  onClose: () => void;
};

export default function ProductModal({ product, onClose }: Props) {
  return (
    <AnimatePresence>
      {product && (
        <motion.div
          className="fixed inset-0 bg-[#E2E5D5]/40 backdrop-blur-xl z-50 flex items-center justify-center p-6 md:p-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          {/* BOTÓN CERRAR (X) - Arriba a la Izquierda */}
          <button 
            onClick={onClose}
            className="absolute top-8 left-8 p-2 text-[#32331F] hover:opacity-40 transition-opacity z-[60]"
          >
            <X size={24} strokeWidth={1.5} />
          </button>

          <motion.div
            layoutId={product.slug}
            className="max-w-6xl w-full grid md:grid-cols-2 gap-10 items-center bg-transparent"
            onClick={(e) => e.stopPropagation()}
          >
            {/* IMAGEN FLOTANTE */}
            <div className="relative select-none flex justify-center items-center">
              <Image
                src={product.image}
                alt={product.name}
                width={700}
                height={700}
                className="object-contain w-full h-auto select-none pointer-events-none drop-shadow-2xl"
              />
            </div>

            {/* INFO FLOTANTE */}
            <div className="flex flex-col justify-center text-center md:text-left">
              <h1 
                className="text-4xl md:text-7xl font-bold uppercase tracking-tighter leading-none"
                style={{ color: "#32331F", fontFamily: "Inter, sans-serif" }}
              >
                {product.name}
              </h1>

              <p 
                className="mt-4 text-xl md:text-2xl font-medium opacity-70"
                style={{ color: "#32331F", fontFamily: "Inter, sans-serif" }}
              >
                {product.price}
              </p>
              
            {/*<div className="mt-12">
            <button className="px-14 py-4 bg-[#32331F] text-[#E2E5D5] text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-black transition-all hover:scale-105 active:scale-95 shadow-2xl">
                Add to Cart
            </button>
            </div>*/}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}