"use client";

import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Minus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/store/cart";
import { formatMXN } from "@/lib/format";
import { useI18n } from "@/lib/i18n/context";

export default function CartDrawer() {
  const { items, isOpen, closeCart, updateQuantity, removeItem, subtotal } =
    useCart();
  const { t } = useI18n();
  const [loading, setLoading] = useState(false);

  const total = subtotal();

  const handleCheckout = async () => {
    if (items.length === 0) return;
    setLoading(true);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({
            name: `${i.name} — Talla ${i.size}`,
            price: i.price,
            image: i.image,
            quantity: i.quantity,
          })),
        }),
      });

      const session = await response.json();
      if (session.url) {
        window.location.assign(session.url);
      } else {
        throw new Error(session.error || "No se pudo iniciar el pago");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error de conexión";
      console.error(msg);
      alert(msg);
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Fondo */}
          <motion.div
            className="fixed inset-0 z-[60] bg-foreground/30 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
          />

          {/* Panel */}
          <motion.aside
            className="fixed top-0 right-0 z-[70] flex h-dvh w-full max-w-md flex-col bg-surface text-foreground shadow-2xl"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3, ease: "easeInOut" }}
          >
            {/* Encabezado */}
            <div className="flex items-center justify-between border-b border-foreground/10 px-6 py-5">
              <h2 className="text-xs font-bold uppercase tracking-[0.3em]">
                {t.cart.title}
              </h2>
              <button
                onClick={closeCart}
                aria-label={t.cart.title}
                className="transition-opacity hover:opacity-40"
              >
                <X size={22} strokeWidth={1.5} />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-6">
              {items.length === 0 ? (
                <div className="flex h-full items-center justify-center">
                  <p className="text-[11px] uppercase tracking-[0.2em] opacity-40">
                    {t.cart.empty}
                  </p>
                </div>
              ) : (
                <ul className="divide-y divide-foreground/10">
                  {items.map((item) => (
                    <li key={item.id} className="flex gap-4 py-5">
                      <div className="relative h-24 w-20 shrink-0 overflow-hidden bg-background">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-contain"
                        />
                      </div>

                      <div className="flex flex-1 flex-col justify-between">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-xs font-bold uppercase tracking-tight">
                              {item.name}
                            </p>
                            <p className="mt-1 text-[10px] uppercase tracking-widest opacity-50">
                              {t.cart.size} {item.size}
                            </p>
                          </div>
                          <button
                            onClick={() => removeItem(item.id)}
                            aria-label={t.cart.remove}
                            className="opacity-40 transition-opacity hover:opacity-100"
                          >
                            <Trash2 size={16} strokeWidth={1.5} />
                          </button>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex h-9 items-center border border-foreground/20">
                            <button
                              onClick={() =>
                                updateQuantity(item.id, item.quantity - 1)
                              }
                              aria-label="Menos"
                              className="px-3 h-full transition-colors hover:bg-foreground/5"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="w-8 text-center text-xs font-bold">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                updateQuantity(item.id, item.quantity + 1)
                              }
                              aria-label="Más"
                              className="px-3 h-full transition-colors hover:bg-foreground/5"
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                          <p className="text-xs font-bold">
                            {formatMXN(item.price * item.quantity)}
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Pie / checkout */}
            {items.length > 0 && (
              <div className="border-t border-foreground/10 px-6 py-5">
                <div className="mb-1 flex items-center justify-between text-sm font-bold uppercase tracking-widest">
                  <span>{t.cart.subtotal}</span>
                  <span>{formatMXN(total)}</span>
                </div>
                <p className="mb-4 text-[10px] uppercase tracking-widest opacity-40">
                  {t.cart.shippingNote}
                </p>
                <button
                  onClick={handleCheckout}
                  disabled={loading}
                  className="w-full bg-foreground py-4 text-[10px] font-bold uppercase tracking-[0.3em] text-background transition-colors hover:opacity-90 disabled:opacity-50"
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
