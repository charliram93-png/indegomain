"use client";

import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Product, isSoldOut } from "@/types/products";
import { X, Plus, Minus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
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
  const { t } = useI18n();

  const [activeImage, setActiveImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  /*
    Al cambiar de playera hay que EMPEZAR DE CERO: mostrando el frente, sin
    talla elegida y con cantidad 1. Si no, el modal se queda con lo de la
    playera anterior (se abría en la foto de la espalda, por ejemplo).
    Se ajusta durante el dibujado y no en un `useEffect` a propósito: así el
    modal nunca alcanza a pintarse un instante con los datos viejos.
  */
  const [slugAnterior, setSlugAnterior] = useState(product?.slug);
  if (product && product.slug !== slugAnterior) {
    setSlugAnterior(product.slug);
    setActiveImage(0);
    setSelectedSize(null);
    setQuantity(1);
  }

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

  // Bloquea el scroll del fondo mientras el modal está abierto (evita el
  // "zoom raro" por el cambio de altura de la barra del navegador en móvil).
  useEffect(() => {
    if (!product) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [product]);

  const hasGallery = !!product && product.images.length > 1;
  const total = product?.images.length ?? 1;

  const nextImage = () => setActiveImage((i) => (i + 1) % total);
  const prevImage = () => setActiveImage((i) => (i - 1 + total) % total);

  // Swipe en móvil para cambiar de foto.
  const touchStartX = useRef<number | null>(null);
  const swiped = useRef(false);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    swiped.current = false;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || !hasGallery) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 40) {
      swiped.current = true;
      if (dx < 0) nextImage();
      else prevImage();
    }
    touchStartX.current = null;
  };

  return (
    <AnimatePresence>
      {product && (
        <motion.div
          className="fixed inset-0 z-50 flex items-start justify-center bg-foreground/15 backdrop-blur-sm md:items-center md:p-10"
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
            className="relative flex h-svh w-full flex-col bg-surface/50 p-4 backdrop-blur-2xl md:grid md:h-auto md:max-h-[90vh] md:max-w-6xl md:grid-cols-2 md:items-center md:gap-10 md:overflow-y-auto md:rounded-sm md:border md:border-foreground/15 md:p-10 md:shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Cerrar */}
            <button
              onClick={onClose}
              aria-label={t.product.close}
              className="absolute right-3 top-3 z-30 p-2 text-foreground transition-opacity hover:opacity-50"
            >
              <X size={22} strokeWidth={1.5} />
            </button>

            {/* IMAGEN + GALERÍA (puntos). En móvil ocupa el espacio disponible. */}
            <div className="flex min-h-0 flex-1 flex-col md:block md:flex-none">
              <button
                type="button"
                onClick={() => {
                  if (swiped.current) {
                    swiped.current = false;
                    return;
                  }
                  if (hasGallery) nextImage();
                }}
                onTouchStart={onTouchStart}
                onTouchEnd={onTouchEnd}
                aria-label={hasGallery ? t.product.changeView : product.name}
                className={`relative flex min-h-0 w-full flex-1 items-center justify-center md:h-auto md:aspect-square md:flex-none ${
                  hasGallery ? "cursor-pointer" : "cursor-default"
                }`}
              >
                {/* En el modal el número va ARRIBA A LA IZQUIERDA (decisión de
                    diseño): aquí la prenda se ve completa y grande, y el número
                    funciona mejor como marca de agua en la esquina. En el
                    catálogo sí va abajo a la derecha, metido tras la playera. */}
                <span className="pointer-events-none absolute left-2 top-0 text-7xl font-bold leading-none opacity-10 md:text-9xl">
                  {number}
                </span>
                <Image
                  src={mainImage}
                  alt={product.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                  className={`select-none object-contain p-2 pointer-events-none drop-shadow-2xl md:p-4 ${
                    soldOut ? "opacity-50 grayscale" : ""
                  }`}
                />
              </button>

              {hasGallery && (
                <div className="mt-3 flex shrink-0 justify-center gap-2.5">
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
            {/* En móvil (modal a pantalla completa) los controles van
                CENTRADOS; en escritorio, alineados a la izquierda como siempre. */}
            <div className="flex shrink-0 flex-col items-center space-y-3 pt-3 text-foreground md:items-stretch md:justify-center md:space-y-6 md:pt-0">
              <div className="w-full">
                {/* Nombre + precio: en la MISMA línea en móvil, apilados en desktop */}
                <div className="flex items-baseline justify-between gap-3 md:block">
                  <h1 className="text-3xl font-bold uppercase leading-none tracking-tighter md:text-6xl">
                    {product.name}
                  </h1>
                  <p className="shrink-0 text-lg font-medium opacity-70 md:mt-2">
                    {formatMXN(product.price)}
                  </p>
                </div>
                {/* La descripción NO va en el modal (en ninguna pantalla): ya
                    se lee en el catálogo, y aquí el espacio es para la foto y
                    los controles de compra. Sigue viviendo en
                    `config/products.ts`. */}
              </div>

              {/* TALLAS */}
              <div className="flex flex-col items-center space-y-2 md:items-start">
                <span className="text-[10px] font-bold uppercase tracking-[0.02em] opacity-50">
                  {t.product.selectSize}
                </span>
                {/* Solo texto: sin recuadro ni fondo. La talla elegida se
                    marca en rojo. El `py-2` no se ve, pero deja el área de
                    toque decente en el teléfono. */}
                <div className="flex gap-6">
                  {product.sizes.map(({ size, stock }) => {
                    const out = stock <= 0;
                    const active = activeSize === size;
                    return (
                      <button
                        key={size}
                        onClick={() => !out && setSelectedSize(size)}
                        disabled={out}
                        /* La talla elegida va con el color de TEXTO del tema
                           (olivo en claro, crema en oscuro) a contraste pleno;
                           las demás, el mismo color pero apagado. Así el
                           contraste lo pone el tema y no un color fijo. */
                        className={`py-2 text-sm font-bold uppercase text-foreground transition-opacity ${
                          out
                            ? "cursor-not-allowed opacity-25 line-through"
                            : active
                              ? "cursor-pointer opacity-100"
                              : "cursor-pointer opacity-35 hover:opacity-70"
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* CANTIDAD */}
              <div className="flex flex-col items-center space-y-2 md:items-start">
                <span className="text-[10px] font-bold uppercase tracking-[0.02em] opacity-50">
                  {t.product.quantity}
                </span>
                {/* Igual que las tallas: sin recuadro, solo los signos. */}
                <div className="flex w-fit items-center gap-5">
                  <button
                    onClick={() => setQuantity(Math.max(1, qty - 1))}
                    disabled={soldOut}
                    aria-label="-"
                    className="cursor-pointer py-2 opacity-50 transition-opacity hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-20"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="min-w-6 text-center text-sm font-bold">
                    {qty}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(maxQty, qty + 1))}
                    disabled={soldOut || qty >= maxQty}
                    aria-label="+"
                    className="cursor-pointer py-2 opacity-50 transition-opacity hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-20"
                  >
                    <Plus size={16} />
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
                /* Sin fondo, sin borde, sin sombra: solo el texto. */
                className="w-fit cursor-pointer py-2 text-left text-xs font-bold uppercase tracking-[0.08em] text-foreground transition-opacity hover:opacity-50 disabled:cursor-not-allowed disabled:opacity-30"
              >
                {soldOut ? t.product.soldOut : t.product.addToCart}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
