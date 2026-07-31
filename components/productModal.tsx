"use client";

import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Product, isSoldOut } from "@/types/products";
import { X, Plus, Minus } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/store/cart";
import { formatMXN } from "@/lib/format";
import { useI18n } from "@/lib/i18n/context";

type Props = {
  product: Product | null;
  index: number;
  onClose: () => void;
};

export default function ProductModal({ product, index, onClose }: Props) {
  const { addItem, openCart } = useCart();
  const { t, lang } = useI18n();

  const [activeImage, setActiveImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  const soldOut = product ? isSoldOut(product) : false;

  // Talla activa derivada (sin efectos).
  const firstAvailable = product?.sizes.find((s) => s.stock > 0)?.size ?? null;
  const selectedValid = product?.sizes.some(
    (s) => s.size === selectedSize && s.stock > 0
  );
  const activeSize = selectedValid ? selectedSize : firstAvailable;
  const maxQty = product?.sizes.find((s) => s.size === activeSize)?.stock ?? 0;
  const qty = Math.min(quantity, Math.max(1, maxQty));

  const number = String(index + 1).padStart(2, "0");
  // Imagen segura (por si se cambió de producto con una miniatura activa alta).
  const mainImage = product
    ? product.images[activeImage] ?? product.images[0]
    : "";

  const handleAddToCart = () => {
    if (!product || !activeSize || maxQty <= 0) return;
    addItem(product, activeSize, Math.min(qty, maxQty));
    onClose();
    setTimeout(() => openCart(), 150);
    setQuantity(1);
    setActiveImage(0);
  };

  const cycleImage = () => {
    if (!product) return;
    setActiveImage((i) => (i + 1) % product.images.length);
  };

  const hasGallery = !!product && product.images.length > 1;

  return (
    <AnimatePresence>
      {product && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/15 p-4 backdrop-blur-sm md:p-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 12 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="relative max-h-[90vh] w-full max-w-6xl overflow-y-auto rounded-sm border border-foreground/15 bg-surface/50 p-5 shadow-2xl backdrop-blur-2xl md:p-10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Cerrar: en la esquina del modal, sticky (no se corta al hacer scroll) */}
            <div className="pointer-events-none sticky top-0 z-20 flex justify-end">
              <button
                onClick={onClose}
                aria-label={t.product.close}
                className="pointer-events-auto -mr-1 -mt-1 p-2 text-foreground transition-opacity hover:opacity-50"
              >
                <X size={22} strokeWidth={1.5} />
              </button>
            </div>

            <div className="-mt-6 grid gap-4 md:grid-cols-2 md:items-center md:gap-10">
            {/* IMAGEN + GALERÍA (puntos) */}
            <div>
              <button
                type="button"
                onClick={hasGallery ? cycleImage : undefined}
                aria-label={hasGallery ? t.product.changeView : product.name}
                className={`relative flex h-[30vh] w-full items-center justify-center md:h-auto md:aspect-square ${
                  hasGallery ? "cursor-pointer" : "cursor-default"
                }`}
              >
                <span className="pointer-events-none absolute left-2 top-0 text-7xl font-bold leading-none opacity-10 md:text-9xl">
                  {number}
                </span>
                <Image
                  src={mainImage}
                  alt={product.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                  className={`select-none object-contain p-4 pointer-events-none drop-shadow-2xl ${
                    soldOut ? "opacity-50 grayscale" : ""
                  }`}
                />
              </button>

              {hasGallery && (
                <div className="mt-4 flex justify-center gap-2.5">
                  {product.images.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImage(i)}
                      aria-label={`${t.product.changeView} ${i + 1}`}
                      className={`h-2 w-2 rounded-full transition-all ${
                        activeImage === i
                          ? "scale-110 bg-foreground"
                          : "bg-foreground/30 hover:bg-foreground/60"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* INFO Y CONTROLES */}
            <div className="flex flex-col justify-center space-y-5 text-foreground md:space-y-6">
              <div>
                {/* Nombre y precio en la misma línea */}
                <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                  <h1 className="text-4xl font-bold uppercase leading-none tracking-tighter md:text-6xl">
                    {product.name}
                  </h1>
                  <p className="text-lg font-medium opacity-70">
                    {formatMXN(product.price)}
                  </p>
                </div>
                {product.description && (
                  <p className="mt-2 max-w-sm text-sm leading-relaxed opacity-60">
                    {product.description[lang]}
                  </p>
                )}
              </div>

              {/* TALLAS */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.02em] opacity-50">
                  {t.product.selectSize}
                </span>
                <div className="flex gap-2">
                  {product.sizes.map(({ size, stock }) => {
                    const out = stock <= 0;
                    const active = activeSize === size;
                    return (
                      <button
                        key={size}
                        onClick={() => !out && setSelectedSize(size)}
                        disabled={out}
                        className={`flex h-12 w-12 items-center justify-center border text-xs font-bold transition-all ${
                          active
                            ? "border-foreground bg-foreground text-background"
                            : "border-foreground/20 text-foreground hover:border-foreground"
                        } ${
                          out
                            ? "cursor-not-allowed opacity-30 line-through hover:border-foreground/20"
                            : ""
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* CANTIDAD */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.02em] opacity-50">
                  {t.product.quantity}
                </span>
                <div className="flex h-12 w-fit items-center border border-foreground/20">
                  <button
                    onClick={() => setQuantity(Math.max(1, qty - 1))}
                    disabled={soldOut}
                    aria-label="-"
                    className="h-full px-4 transition-colors hover:bg-foreground/5 disabled:opacity-30"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-14 text-center text-sm font-bold">{qty}</span>
                  <button
                    onClick={() => setQuantity(Math.min(maxQty, qty + 1))}
                    disabled={soldOut || qty >= maxQty}
                    aria-label="+"
                    className="h-full px-4 transition-colors hover:bg-foreground/5 disabled:opacity-30"
                  >
                    <Plus size={14} />
                  </button>
                </div>
                {!soldOut && maxQty > 0 && maxQty <= 5 && (
                  <span className="block text-[10px] uppercase tracking-[0.02em] text-foreground/60">
                    {t.product.lastPieces.replace("{n}", String(maxQty))}
                  </span>
                )}
              </div>

              <button
                onClick={handleAddToCart}
                disabled={soldOut || !activeSize}
                className="w-full bg-foreground px-16 py-5 text-[10px] font-bold uppercase tracking-[0.03em] text-background shadow-2xl transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 md:w-fit"
              >
                {soldOut ? t.product.soldOut : t.product.addToCart}
              </button>
            </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
