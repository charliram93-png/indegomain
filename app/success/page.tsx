"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "@/store/cart";
import { useFlag } from "@/lib/flags";
import { useI18n } from "@/lib/i18n/context";

export default function SuccessPage() {
  const clear = useCart((s) => s.clear);
  const { t } = useI18n();

  /*
    Stripe regresa al cliente con `?session_id=...` en la dirección (lo arma
    `app/api/checkout/route.ts`). Con eso se le pregunta al servidor cuál fue
    su NÚMERO DE PEDIDO, para enseñárselo aquí mismo: es lo que va a necesitar
    para consultar su pedido más adelante, y si no se lo damos ahora solo le
    queda buscarlo en el correo.

    Esta consulta no pide correo porque el `session_id` solo lo tiene quien
    acaba de comprar: viene en la dirección a la que Stripe lo mandó.
  */
  const sessionId = useFlag("session_id", "");
  const [numeroPedido, setNumeroPedido] = useState<string | null>(null);

  // El pago se completó: vaciamos el carrito.
  useEffect(() => {
    clear();
  }, [clear]);

  useEffect(() => {
    if (!sessionId) return;
    let vigente = true;

    fetch("/api/order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId }),
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (vigente && d?.orderNumber) setNumeroPedido(d.orderNumber);
      })
      // Si falla, simplemente no se muestra el número: el correo de
      // confirmación sigue siendo el respaldo.
      .catch(() => {});

    return () => {
      vigente = false;
    };
  }, [sessionId]);

  return (
    /* `min-h-dvh` y no `h-dvh`: con el bloque del número de pedido el
       contenido ya no siempre cabe en una pantalla de teléfono. */
    <main className="flex min-h-dvh w-full flex-col items-center justify-center bg-background px-6 py-16 text-center text-foreground">
      <p className="mb-4 text-[10px] uppercase tracking-[0.03em] opacity-60">
        {t.success.tag}
      </p>
      <h1 className="text-3xl font-bold uppercase tracking-tight md:text-5xl">
        {t.success.title}
      </h1>
      <p className="mt-4 max-w-md text-sm leading-relaxed opacity-70">
        {t.success.body}
      </p>

      {numeroPedido && (
        <div className="mt-10 border-t border-foreground/10 pt-8">
          <p className="text-[10px] font-bold uppercase tracking-[0.08em] opacity-50">
            {t.success.orderLabel}
          </p>
          <p className="mt-2 text-2xl font-bold uppercase tracking-[0.12em]">
            {numeroPedido}
          </p>
          <p className="mx-auto mt-3 max-w-xs text-[11px] leading-relaxed opacity-50">
            {t.success.orderNote}
          </p>
          <Link
            href="/order"
            className="mt-4 inline-block text-[10px] font-bold uppercase tracking-[0.08em] underline underline-offset-4 transition-opacity hover:opacity-50"
          >
            {t.success.track}
          </Link>
        </div>
      )}

      <Link
        href="/product"
        className="mt-10 border border-foreground px-10 py-4 text-[10px] font-bold uppercase tracking-[0.03em] transition-colors hover:bg-foreground hover:text-background"
      >
        {t.success.cta}
      </Link>
    </main>
  );
}
