"use client";

import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Product } from "@/types/products";
import { X, Plus, Minus } from "lucide-react";
import { useState } from "react";

type Props = {
  product: Product | null;
  onClose: () => void;
};

export default function ProductModal({ product, onClose }: Props) {
  const [loading, setLoading] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string>("M");
  const [quantity, setQuantity] = useState<number>(1);

  const sizes = ["S", "M", "L", "XL"];

  const handleCheckout = async () => {
    if (!product) return;
    
    setLoading(true);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${product.name} - Talla ${selectedSize}`,
          price: product.price,
          image: product.image,
          quantity: quantity,
        }),
      });

      const session = await response.json();

      // Redirección moderna: Stripe ahora prefiere usar la URL generada en el server
      if (session.url) {
        window.location.assign(session.url);
      } else {
        throw new Error("No se pudo obtener la URL de pago de Stripe");
      }

    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Error de conexión";
      console.error(errorMessage);
      alert(errorMessage);
      setLoading(false);
    }
  };

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
            {/* IMAGEN */}
            <div className="relative select-none flex justify-center items-center">
              <Image
                src={product.image}
                alt={product.name}
                width={700}
                height={700}
                priority
                className="object-contain w-full h-auto select-none pointer-events-none drop-shadow-2xl"
              />
            </div>

            {/* INFO Y CONTROLES */}
            <div className="flex flex-col justify-center text-center md:text-left space-y-8">
              <div>
                <h1 
                  className="text-4xl md:text-7xl font-bold uppercase tracking-tighter leading-none"
                  style={{ color: "#32331F", fontFamily: "Inter, sans-serif" }}
                >
                  {product.name}
                </h1>
                <p className="mt-2 text-xl font-medium opacity-70 text-[#32331F]">
                  {product.price}
                </p>
              </div>

              {/* SELECTOR DE TALLAS */}
              <div className="flex flex-col items-center md:items-start space-y-3">
                <span className="text-[10px] uppercase tracking-widest font-bold opacity-50 text-[#32331F]">Select Size</span>
                <div className="flex gap-2">
                  {sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`w-12 h-12 border flex items-center justify-center text-xs font-bold transition-all
                        ${selectedSize === size 
                          ? "bg-[#32331F] text-[#E2E5D5] border-[#32331F]" 
                          : "border-[#32331F]/20 text-[#32331F] hover:border-[#32331F]"}`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* SELECTOR DE CANTIDAD */}
              <div className="flex flex-col items-center md:items-start space-y-3">
                <span className="text-[10px] uppercase tracking-widest font-bold opacity-50 text-[#32331F]">Quantity</span>
                <div className="flex items-center border border-[#32331F]/20 h-12 text-[#32331F]">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 h-full hover:bg-[#32331F]/5 transition-colors"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="px-6 font-bold text-sm w-16 text-center">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-4 h-full hover:bg-[#32331F]/5 transition-colors"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
              
              <div className="pt-4">
                <button 
                  onClick={handleCheckout}
                  disabled={loading}
                  className="w-full md:w-auto px-20 py-5 bg-[#32331F] text-[#E2E5D5] text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-black transition-all shadow-2xl disabled:opacity-50"
                >
                  {loading ? "Connecting to Stripe..." : "Checkout Now"}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}