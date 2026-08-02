"use client";

import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Minus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useCart, precioVigente } from "@/store/cart";
import { formatMXN } from "@/lib/format";
import { HELVETICA } from "@/lib/fonts";
import { useScrollLock } from "@/lib/useScrollLock";
import { useI18n } from "@/lib/i18n/context";

export default function CartDrawer() {
  const { items, isOpen, closeCart, updateQuantity, removeItem, subtotal } =
    useCart();
  const { t, lang } = useI18n();
  const [loading, setLoading] = useState(false);

  const total = subtotal();

  /*
    Con el carrito abierto la página de atrás ya no se mueve: arregla el botón
    de PAGAR cortado y que al cerrar el carrito aparecieras hasta el final del
    catálogo. El detalle del por qué está en `lib/useScrollLock.ts`.
  */
  useScrollLock(isOpen);

  const handleCheckout = async () => {
    if (items.length === 0) return;
    setLoading(true);
    try {
      /*
        Se manda SOLO qué playera, qué talla y cuántas. NADA de precios: el
        servidor los saca de `config/products.ts`, que es la única fuente en la
        que se puede confiar. Antes se enviaba el precio desde aquí y el
        servidor le hacía caso — cualquiera podía cambiarlo antes de enviarlo.
        El idioma va para que el recibo de Stripe diga "Talla" o "Size".
      */
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lang,
          items: items.map((i) => ({
            slug: i.slug,
            size: i.size,
            quantity: i.quantity,
          })),
        }),
      });

      const session = await response.json();
      if (session.url) {
        window.location.assign(session.url);
      } else {
        throw new Error(t.cart.errorPay);
      }
    } catch (err) {
      console.error(err);
      alert(t.cart.errorPay);
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/*
            Fondo. SIN `backdrop-blur`: desenfocar el fondo obliga al navegador
            a volver a desenfocarlo en cada cuadro mientras el panel se desliza
            encima, y eso era el tirón al abrir el carrito. Ahora es una capa
            de color plana, más opaca para que siga separando del contenido.
          */}
          <motion.div
            className="fixed inset-0 z-[60] bg-foreground/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
          />

          {/* Panel */}
          <motion.aside
            /* Todo el carrito en la Helvetica del sitio (se hereda hacia adentro) */
            style={{ fontFamily: HELVETICA }}
            /*
              `h-svh` (no `h-dvh`): mide la ventana en su estado MÁS CHICO, con
              las barras del navegador visibles. Así el panel siempre cabe,
              aunque Safari muestre u oculte su barra a media animación.
            */
            className="fixed top-0 right-0 z-[70] flex h-svh w-full max-w-md flex-col bg-surface text-foreground shadow-2xl"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3, ease: "easeInOut" }}
          >
            {/* Encabezado */}
            <div className="flex items-center justify-between border-b border-foreground/10 px-6 py-5">
              <h2 className="text-xs font-bold uppercase italic tracking-[0.08em]">
                {t.cart.title}
              </h2>
              <button
                onClick={closeCart}
                aria-label={t.cart.close}
                className="transition-opacity hover:opacity-40"
              >
                <X size={22} strokeWidth={1.5} />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-6">
              {items.length === 0 ? (
                <div className="flex h-full items-center justify-center">
                  <p className="text-[11px] uppercase tracking-[0.03em] opacity-40">
                    {t.cart.empty}
                  </p>
                </div>
              ) : (
                <ul className="divide-y divide-foreground/10">
                  {items.map((item) => (
                    <li key={item.id} className="flex gap-4 py-5">
                      <div className="relative h-24 w-20 shrink-0 overflow-hidden">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          sizes="80px"
                          className="object-contain"
                        />
                      </div>

                      <div className="flex flex-1 flex-col justify-between">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-xs font-bold uppercase tracking-tight">
                              {item.name}
                            </p>
                            <p className="mt-1 text-[10px] uppercase tracking-[0.02em] opacity-50">
                              {t.cart.size} {item.size}
                            </p>
                          </div>
                          <button
                            onClick={() => removeItem(item.id)}
                            aria-label={t.cart.remove}
                            className="cursor-pointer p-1 opacity-30 transition-opacity hover:opacity-100"
                          >
                            <Trash2 size={14} strokeWidth={1.5} />
                          </button>
                        </div>

                        <div className="flex items-center justify-between">
                          {/*
                            CANTIDAD, igual que en el modal de producto: sin
                            recuadro ni fondo, solo los signos y el número.
                          */}
                          <div className="flex w-fit items-center gap-5">
                            <button
                              onClick={() =>
                                updateQuantity(item.id, item.quantity - 1)
                              }
                              aria-label={t.cart.less}
                              className="cursor-pointer py-2 opacity-50 transition-opacity hover:opacity-100"
                            >
                              <Minus size={16} />
                            </button>
                            <span className="min-w-6 text-center text-sm font-bold">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                updateQuantity(item.id, item.quantity + 1)
                              }
                              aria-label={t.cart.more}
                              className="cursor-pointer py-2 opacity-50 transition-opacity hover:opacity-100"
                            >
                              <Plus size={16} />
                            </button>
                          </div>
                          <p className="text-xs font-bold">
                            {/* `precioVigente` y no `item.price`: el carrito
                                guardado puede traer un precio viejo. */}
                            {formatMXN(precioVigente(item) * item.quantity)}
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/*
              Pie / checkout.
              `pb-[env(safe-area-inset-bottom)]` deja libre la franja de la
              barra de gestos del iPhone: sin eso, el botón queda debajo de
              ella y se ve mochado.
            */}
            {items.length > 0 && (
              <div className="border-t border-foreground/10 px-6 pt-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))]">
                <div className="mb-1 flex items-center justify-between text-sm font-bold uppercase tracking-[0.02em]">
                  <span>{t.cart.subtotal}</span>
                  <span>{formatMXN(total)}</span>
                </div>
                <p className="mb-4 text-[10px] uppercase tracking-[0.02em] opacity-40">
                  {t.cart.shippingNote}
                </p>
                {/*
                  PAGAR: solo texto, como "Agregar al carrito" en el modal.
                  Sin fondo sólido, sin borde, sin sombra.
                */}
                <button
                  onClick={handleCheckout}
                  disabled={loading}
                  className="w-fit cursor-pointer py-2 text-left text-xs font-bold uppercase tracking-[0.08em] text-foreground transition-opacity hover:opacity-50 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  {loading ? t.cart.connecting : t.cart.pay}
                </button>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
