"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { Plus, Minus } from "lucide-react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import CartDrawer from "@/components/cartDrawer";
import SwipeHint from "@/components/swipeHint";
import { Product, isSoldOut } from "@/types/products";
import { useCart } from "@/store/cart";
import { formatMXN } from "@/lib/format";
import { HELVETICA } from "@/lib/fonts";
import { useI18n } from "@/lib/i18n/context";

/**
 * PÁGINA PROPIA DE UN PRODUCTO — PRUEBA (ago-2026)
 * ------------------------------------------------
 * El modal del catálogo no tiene dirección propia: no se le puede mandar a
 * nadie el enlace de UNA playera. Esto es lo mismo pero como página real, para
 * ver cómo queda antes de decidir si reemplaza al modal o convive con él.
 *
 * Lo que gana siendo página y no ventana:
 *  · se puede compartir por Instagram, en el link de la bio o en un anuncio
 *  · la previsualización al compartir muestra ESA playera (lo arma el
 *    `generateMetadata` de `app/product/[slug]/page.tsx`)
 *  · el botón de atrás del teléfono hace lo que se espera
 *
 * A diferencia del modal, aquí SÍ va la descripción y hay aire de sobra: la
 * página no tiene que caber en una pantalla.
 */

type Props = {
  product: Product;
  /** Posición en el catálogo: de ahí sale el número grande (01, 02, 03). */
  index: number;
};

export default function ProductDetail({ product, index }: Props) {
  const { t, lang } = useI18n();
  const { addItem, openCart } = useCart();

  const [activeImage, setActiveImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  const soldOut = isSoldOut(product);
  const number = String(index + 1).padStart(2, "0");

  // Talla activa derivada, igual que en el modal (sin efectos).
  const firstAvailable = product.sizes.find((s) => s.stock > 0)?.size ?? null;
  const selectedValid = product.sizes.some(
    (s) => s.size === selectedSize && s.stock > 0
  );
  const activeSize = selectedValid ? selectedSize : firstAvailable;
  const maxQty = product.sizes.find((s) => s.size === activeSize)?.stock ?? 0;
  const qty = Math.min(quantity, Math.max(1, maxQty));

  const hasGallery = product.images.length > 1;
  const total = product.images.length;
  const nextImage = () => setActiveImage((i) => (i + 1) % total);
  const prevImage = () => setActiveImage((i) => (i - 1 + total) % total);

  // Deslizar en el teléfono para cambiar de foto.
  const inicioX = useRef<number | null>(null);
  const cuadro = useRef<HTMLDivElement | null>(null);

  /* Cuánto lleva recorrido el dedo, en fracción de foto: solo para que la
     rayita se mueva CON la mano (ver `components/swipeHint.tsx`). */
  const [arrastre, setArrastre] = useState(0);

  const onTouchStart = (e: React.TouchEvent) => {
    inicioX.current = e.touches[0].clientX;
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (inicioX.current === null || !hasGallery) return;
    const ancho = cuadro.current?.offsetWidth ?? 1;
    const dx = e.touches[0].clientX - inicioX.current;
    // Arrastrar a la IZQUIERDA avanza a la siguiente foto, de ahí el signo.
    setArrastre(Math.min(Math.max(-dx / ancho, -1), 1));
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    setArrastre(0);
    if (inicioX.current === null || !hasGallery) return;
    const dx = e.changedTouches[0].clientX - inicioX.current;
    if (Math.abs(dx) > 40) (dx < 0 ? nextImage : prevImage)();
    inicioX.current = null;
  };

  const handleAddToCart = () => {
    if (!activeSize || maxQty <= 0) return;
    addItem(product, activeSize, Math.min(qty, maxQty));
    openCart();
  };

  return (
    <div
      className="entrada flex min-h-dvh flex-col bg-background text-foreground"
      style={{ fontFamily: HELVETICA }}
    >
      <Navbar />

      <main className="flex-1 px-6 md:px-12">
        {/* Hueco del navbar fijo (h-20). */}
        <div className="h-20" />

        <div className="mx-auto w-full max-w-6xl pt-8 pb-24">
          <Link
            href="/product"
            className="text-[10px] font-bold uppercase tracking-[0.08em] opacity-50 transition-opacity hover:opacity-100"
          >
            {t.product.backToCatalog}
          </Link>

          <div className="mt-8 grid gap-10 md:grid-cols-2 md:items-start md:gap-16">
            {/* ---------- FOTO ---------- */}
            {/* En escritorio se queda PEGADA al hacer scroll: la prenda es lo
                que se está comprando, no debe irse de la pantalla mientras se
                lee lo demás. */}
            <div className="md:sticky md:top-28">
              <div
                ref={cuadro}
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
                onClick={() => hasGallery && nextImage()}
                className={`halo-prenda relative aspect-square w-full overflow-hidden rounded-sm bg-surface [container-type:inline-size] ${
                  hasGallery ? "cursor-pointer" : ""
                }`}
              >
                <span
                  className="pointer-events-none absolute bottom-[3%] right-[6%] text-[24cqw] font-bold leading-none opacity-15"
                  aria-hidden
                >
                  {number}
                </span>

                {/* Todas las fotos encimadas: se cambia la opacidad y no el
                    `src`, así no parpadea la primera vez que se cambia. */}
                {product.images.map((src, i) => (
                  <Image
                    key={src}
                    src={src}
                    alt={product.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority={i === 0}
                    className={`pointer-events-none select-none object-contain p-12 transition-opacity duration-500 ${
                      soldOut ? "grayscale" : ""
                    } ${
                      activeImage === i
                        ? soldOut
                          ? "opacity-50"
                          : "opacity-100"
                        : "opacity-0"
                    }`}
                  />
                ))}

                {soldOut && (
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <span className="bg-foreground px-4 py-2 text-[10px] font-bold uppercase tracking-[0.03em] text-background">
                      {t.product.soldOut}
                    </span>
                  </div>
                )}
              </div>

              {/* La rayita, igual que en el modal y en el catálogo: la misma
                  señal en todos lados. Se probó ponerle nombre (FRENTE /
                  ESPALDA) y no convenció — metía texto donde no hacía falta. */}
              {hasGallery && (
                <SwipeHint
                  total={total}
                  index={activeImage}
                  arrastre={arrastre}
                  className="mt-4"
                />
              )}
            </div>

            {/* ---------- INFO Y CONTROLES ---------- */}
            <div className="space-y-8">
              <div>
                <h1 className="text-5xl font-bold uppercase leading-none tracking-tighter md:text-7xl">
                  {product.name}
                </h1>
                <p className="mt-3 text-xl font-medium opacity-70">
                  {formatMXN(product.price)}
                </p>
                {/* La descripción SÍ va aquí (en el modal no cabía). */}
                {product.description && (
                  <p className="mt-5 max-w-sm text-sm leading-relaxed opacity-60">
                    {product.description[lang]}
                  </p>
                )}
              </div>

              {/* TALLAS — mismo criterio que el modal: solo texto, la elegida
                  a contraste pleno y las demás apagadas. */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.02em] opacity-50">
                  {t.product.selectSize}
                </span>
                <div className="flex gap-6">
                  {product.sizes.map(({ size, stock }) => {
                    const out = stock <= 0;
                    const active = activeSize === size;
                    return (
                      <button
                        key={size}
                        onClick={() => !out && setSelectedSize(size)}
                        disabled={out}
                        aria-pressed={active && !out}
                        className={`py-2 text-sm font-bold uppercase transition-opacity ${
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
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.02em] opacity-50">
                  {t.product.quantity}
                </span>
                <div className="flex w-fit items-center gap-5">
                  <button
                    onClick={() => setQuantity(Math.max(1, qty - 1))}
                    disabled={soldOut}
                    aria-label={t.cart.less}
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
                    aria-label={t.cart.more}
                    className="cursor-pointer py-2 opacity-50 transition-opacity hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-20"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                {!soldOut && maxQty > 0 && maxQty <= 5 && (
                  <span className="block text-[10px] uppercase tracking-[0.02em] opacity-60">
                    {t.product.lastPieces.replace("{n}", String(maxQty))}
                  </span>
                )}
              </div>

              <button
                onClick={handleAddToCart}
                disabled={soldOut || !activeSize}
                className="w-fit cursor-pointer py-2 text-xs font-bold uppercase tracking-[0.08em] transition-opacity hover:opacity-50 disabled:cursor-not-allowed disabled:opacity-30"
              >
                {soldOut ? t.product.soldOut : t.product.addToCart}
              </button>
            </div>
          </div>
        </div>
      </main>

      <CartDrawer />
      <Footer />
    </div>
  );
}
