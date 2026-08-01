"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { HELVETICA } from "@/lib/fonts";
import { formatMXN } from "@/lib/format";
import { useI18n } from "@/lib/i18n/context";

/**
 * ESTADO DEL PEDIDO (página pública, enlazada desde el pie).
 *
 * El cliente escribe su número de pedido y el correo con el que compró, y ve
 * en qué va. La consulta la resuelve `app/api/order/route.ts`, que le pregunta
 * a Stripe (hoy no hay base de datos todavía).
 *
 * Se piden LAS DOS COSAS a propósito: con el número solo, cualquiera que se lo
 * encontrara podría ver la compra ajena.
 */

type Pedido = {
  orderNumber: string | null;
  status: "pagado" | "pendiente" | "enviado" | "fallido";
  total: number;
  currency: string;
  items: { description: string | null; quantity: number | null }[];
  createdAt: number;
  shippingCity: string | null;
  tracking: { number: string; carrier: string | null; url: string | null } | null;
  oxxoVoucherUrl: string | null;
};

const etiqueta = "text-[10px] font-bold uppercase tracking-[0.08em] opacity-50";

export default function OrderPage() {
  const { t, lang } = useI18n();
  const router = useRouter();

  const [numero, setNumero] = useState("");
  const [correo, setCorreo] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pedido, setPedido] = useState<Pedido | null>(null);

  const consultar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cargando) return;

    setCargando(true);
    setError(null);
    setPedido(null);

    try {
      const res = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderNumber: numero, email: correo }),
      });

      if (res.ok) {
        setPedido((await res.json()) as Pedido);
      } else if (res.status === 429) {
        setError(t.order.tooMany);
      } else {
        setError(t.order.notFound);
      }
    } catch {
      setError(t.order.error);
    } finally {
      setCargando(false);
    }
  };

  const textoEstado = {
    pagado: [t.order.statusPaid, t.order.statusPaidNote],
    pendiente: [t.order.statusPending, t.order.statusPendingNote],
    enviado: [t.order.statusShipped, t.order.statusShippedNote],
    fallido: [t.order.statusFailed, t.order.statusFailedNote],
  };

  return (
    /* Toda la página en la Helvetica del sitio (se hereda hacia adentro). */
    <main
      className="min-h-dvh bg-background px-6 py-16 text-foreground md:px-12"
      style={{ fontFamily: HELVETICA }}
    >
      <div className="mx-auto max-w-lg">
        <button
          onClick={() => router.back()}
          className="cursor-pointer text-[10px] uppercase tracking-[0.03em] opacity-50 transition-opacity hover:opacity-100"
        >
          {t.order.back}
        </button>

        <h1 className="mt-8 text-3xl font-bold uppercase tracking-tighter md:text-4xl">
          {t.order.title}
        </h1>

        {!pedido && (
          <>
            <p className="mt-4 text-sm leading-relaxed opacity-60">
              {t.order.intro}
            </p>

            {/* Mismo estilo minimalista del modal y el carrito: los campos son
                una línea abajo, sin recuadro, y el botón es puro texto. */}
            <form onSubmit={consultar} className="mt-10 space-y-8">
              <div>
                <label htmlFor="numero" className={`block ${etiqueta}`}>
                  {t.order.numberLabel}
                </label>
                <input
                  id="numero"
                  value={numero}
                  onChange={(e) => setNumero(e.target.value)}
                  placeholder={t.order.numberPlaceholder}
                  autoComplete="off"
                  autoCapitalize="characters"
                  spellCheck={false}
                  required
                  className="mt-2 w-full border-b border-foreground/20 bg-transparent pb-2 text-lg font-bold uppercase tracking-[0.06em] outline-none transition-colors placeholder:font-normal placeholder:tracking-normal placeholder:opacity-25 focus:border-foreground"
                />
              </div>

              <div>
                <label htmlFor="correo" className={`block ${etiqueta}`}>
                  {t.order.emailLabel}
                </label>
                <input
                  id="correo"
                  type="email"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  placeholder={t.order.emailPlaceholder}
                  autoComplete="email"
                  required
                  className="mt-2 w-full border-b border-foreground/20 bg-transparent pb-2 text-lg outline-none transition-colors placeholder:opacity-25 focus:border-foreground"
                />
              </div>

              <button
                type="submit"
                disabled={cargando}
                className="w-fit cursor-pointer py-2 text-xs font-bold uppercase tracking-[0.08em] transition-opacity hover:opacity-50 disabled:cursor-not-allowed disabled:opacity-30"
              >
                {cargando ? t.order.checking : t.order.submit}
              </button>
            </form>

            {error && (
              <p className="mt-6 max-w-sm text-xs leading-relaxed text-accent">
                {error}
              </p>
            )}
          </>
        )}

        {/* ---------- RESULTADO ---------- */}
        {pedido && (
          <div className="mt-10">
            <p className={etiqueta}>{pedido.orderNumber}</p>

            <h2 className="mt-3 text-2xl font-bold uppercase tracking-tight">
              {textoEstado[pedido.status][0]}
            </h2>
            <p className="mt-2 max-w-sm text-sm leading-relaxed opacity-60">
              {textoEstado[pedido.status][1]}
            </p>

            {pedido.oxxoVoucherUrl && (
              <Link
                href={pedido.oxxoVoucherUrl}
                target="_blank"
                className="mt-4 inline-block text-xs font-bold uppercase tracking-[0.08em] underline underline-offset-4 transition-opacity hover:opacity-50"
              >
                {t.order.voucher}
              </Link>
            )}

            {/* GUÍA, cuando ya se puso en Stripe */}
            {pedido.tracking && (
              <div className="mt-8 border-t border-foreground/10 pt-6">
                {pedido.tracking.carrier && (
                  <>
                    <p className={etiqueta}>{t.order.carrier}</p>
                    <p className="mt-1 text-sm">{pedido.tracking.carrier}</p>
                  </>
                )}
                <p className={`mt-4 ${etiqueta}`}>{t.order.trackingNumber}</p>
                <p className="mt-1 text-lg font-bold tracking-[0.04em]">
                  {pedido.tracking.number}
                </p>
                {pedido.tracking.url && (
                  <Link
                    href={pedido.tracking.url}
                    target="_blank"
                    className="mt-3 inline-block text-xs font-bold uppercase tracking-[0.08em] underline underline-offset-4 transition-opacity hover:opacity-50"
                  >
                    {t.order.trackIt}
                  </Link>
                )}
              </div>
            )}

            {/* DETALLE */}
            <div className="mt-8 border-t border-foreground/10 pt-6">
              <p className={etiqueta}>{t.order.items}</p>
              <ul className="mt-2 space-y-1 text-sm">
                {pedido.items.map((item, i) => (
                  <li key={i}>
                    {item.quantity && item.quantity > 1 && `${item.quantity} × `}
                    {item.description}
                  </li>
                ))}
              </ul>

              <div className="mt-6 flex items-baseline justify-between">
                <span className={etiqueta}>{t.order.total}</span>
                <span className="text-sm font-bold">
                  {formatMXN(pedido.total)}
                </span>
              </div>

              <div className="mt-6 flex items-baseline justify-between gap-4">
                <span className={etiqueta}>{t.order.orderedOn}</span>
                <span className="text-sm">
                  {new Date(pedido.createdAt).toLocaleDateString(
                    lang === "es" ? "es-MX" : "en-US",
                    { day: "numeric", month: "long", year: "numeric" }
                  )}
                </span>
              </div>

              {pedido.shippingCity && (
                <div className="mt-4 flex items-baseline justify-between gap-4">
                  <span className={etiqueta}>{t.order.shippingTo}</span>
                  <span className="text-right text-sm">
                    {pedido.shippingCity}
                  </span>
                </div>
              )}
            </div>

            <button
              onClick={() => {
                setPedido(null);
                setNumero("");
                setCorreo("");
              }}
              className="mt-10 cursor-pointer py-2 text-xs font-bold uppercase tracking-[0.08em] opacity-50 transition-opacity hover:opacity-100"
            >
              {t.order.newSearch}
            </button>
          </div>
        )}

        <p className="mt-16 text-[9px] uppercase tracking-[0.02em] opacity-30">
          {t.footer.rights}
        </p>
      </div>
    </main>
  );
}
