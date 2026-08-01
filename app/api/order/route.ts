import { NextResponse } from "next/server";
import Stripe from "stripe";
import { normalizarNumeroPedido } from "@/lib/orderNumber";

/**
 * CONSULTA DEL ESTADO DE UN PEDIDO
 * --------------------------------
 * Hoy NO hay base de datos (Supabase es la etapa siguiente), así que la única
 * fuente de verdad es Stripe. Esta ruta le pregunta a Stripe y devuelve solo
 * lo que el cliente necesita ver.
 *
 * Dos formas de consultar:
 *
 *  1. `{ sessionId }` — la usa la página de "gracias" justo después de pagar.
 *     No pide correo porque ese identificador solo lo tiene quien acaba de
 *     comprar: viene en la dirección a la que Stripe lo regresó.
 *
 *  2. `{ orderNumber, email }` — la usa la página pública de seguimiento.
 *     Pide LAS DOS COSAS: el número solo no basta. Y cuando algo no cuadra
 *     responde siempre lo mismo ("no encontramos ese pedido"), sin decir si
 *     falló el número o el correo — si dijera cuál, se podría ir adivinando.
 *
 * EL ENVÍO: Stripe no sabe nada de paqueterías. Para publicar la guía, en el
 * Dashboard de Stripe se abre el pago y se le agregan estos `metadata`:
 *
 *     tracking_number   ->  el número de guía
 *     tracking_carrier  ->  la paquetería (Estafeta, DHL…)
 *     tracking_url      ->  (opcional) el enlace de rastreo
 *
 * En cuanto estén, esta ruta los devuelve y la página los muestra. Mientras
 * no estén, el pedido se reporta como "en preparación".
 */

let stripe: Stripe | null = null;
function getStripe(): Stripe {
  if (!stripe) {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2026-02-25.clover",
    });
  }
  return stripe;
}

/** Lo único que sale de aquí hacia el navegador. */
type RespuestaPedido = {
  orderNumber: string | null;
  status: "pagado" | "pendiente" | "enviado" | "fallido";
  total: number;
  currency: string;
  items: { description: string | null; quantity: number | null }[];
  createdAt: number;
  /** Solo la ciudad y el estado: no se devuelve la dirección completa. */
  shippingCity: string | null;
  tracking: { number: string; carrier: string | null; url: string | null } | null;
  /** Enlace del voucher de OXXO, si el pago sigue pendiente. */
  oxxoVoucherUrl: string | null;
};

/**
 * Freno básico contra quien intente adivinar números a lo bruto.
 * Vive en la memoria del servidor, así que se pierde en cada despliegue y no
 * se comparte entre instancias: es un tope tosco, no una defensa seria. La
 * defensa real es que hay que atinarle al número Y al correo a la vez.
 */
const intentos = new Map<string, { n: number; desde: number }>();
const VENTANA_MS = 60_000;
const MAX_POR_VENTANA = 10;

function demasiadosIntentos(ip: string): boolean {
  const ahora = Date.now();
  const registro = intentos.get(ip);

  if (!registro || ahora - registro.desde > VENTANA_MS) {
    intentos.set(ip, { n: 1, desde: ahora });
    // Limpieza oportunista, para que el mapa no crezca sin fin.
    if (intentos.size > 5000) {
      for (const [k, v] of intentos) {
        if (ahora - v.desde > VENTANA_MS) intentos.delete(k);
      }
    }
    return false;
  }

  registro.n += 1;
  return registro.n > MAX_POR_VENTANA;
}

/** Traduce el estado de Stripe al que entiende la página. */
function armarRespuesta(
  session: Stripe.Checkout.Session,
  lineItems: Stripe.LineItem[],
  metadata: Stripe.Metadata
): RespuestaPedido {
  const trackingNumber = metadata.tracking_number?.trim() || null;

  let status: RespuestaPedido["status"];
  if (session.payment_status === "paid") {
    status = trackingNumber ? "enviado" : "pagado";
  } else if (session.status === "expired") {
    status = "fallido";
  } else {
    // OXXO: la sesión se completó pero el pago sigue sin caer.
    status = "pendiente";
  }

  const shipping = session.collected_information?.shipping_details;
  const ciudad = shipping?.address?.city ?? null;
  const estado = shipping?.address?.state ?? null;

  return {
    orderNumber: metadata.order_number ?? null,
    status,
    total: session.amount_total ? session.amount_total / 100 : 0,
    currency: (session.currency ?? "mxn").toUpperCase(),
    items: lineItems.map((li) => ({
      description: li.description,
      quantity: li.quantity,
    })),
    createdAt: session.created * 1000,
    shippingCity: [ciudad, estado].filter(Boolean).join(", ") || null,
    tracking: trackingNumber
      ? {
          number: trackingNumber,
          carrier: metadata.tracking_carrier?.trim() || null,
          url: metadata.tracking_url?.trim() || null,
        }
      : null,
    oxxoVoucherUrl:
      status === "pendiente"
        ? (metadata.oxxo_voucher_url?.trim() ?? null)
        : null,
  };
}

/** Junta los `metadata` del pago y los de la sesión (el pago manda). */
async function metadataDelPago(
  session: Stripe.Checkout.Session
): Promise<Stripe.Metadata> {
  const pi = session.payment_intent;
  if (!pi) return session.metadata ?? {};

  const id = typeof pi === "string" ? pi : pi.id;
  try {
    const intent = await getStripe().paymentIntents.retrieve(id);
    return { ...(session.metadata ?? {}), ...(intent.metadata ?? {}) };
  } catch {
    return session.metadata ?? {};
  }
}

/**
 * Encuentra la compra a partir del número de pedido. Lo intenta por dos vías
 * porque ninguna sola alcanza:
 *
 *  1. BUSCAR EN LOS PAGOS. Es la vía buena y la que escala. Stripe solo deja
 *     buscar por `metadata` en los pagos, no en las sesiones de checkout, por
 *     eso el número se guarda en los dos lados. Tiene dos huecos: el pago no
 *     existe hasta que el cliente entra a pagar, y a Stripe le toma hasta un
 *     minuto indexar lo recién creado.
 *
 *  2. REVISAR LAS ÚLTIMAS SESIONES. Cubre justo ese hueco: quien acaba de
 *     comprar está entre las más recientes. Se limita a las últimas 100 a
 *     propósito — no es para buscar pedidos viejos, para eso está la vía 1.
 */
async function buscarSesion(
  numero: string
): Promise<Stripe.Checkout.Session | null> {
  // `numero` ya viene validado contra un alfabeto cerrado (ver
  // `lib/orderNumber.ts`), así que no puede alterar esta consulta.
  try {
    const encontrados = await getStripe().paymentIntents.search({
      query: `metadata['order_number']:'${numero}'`,
      limit: 1,
    });
    const intent = encontrados.data[0];
    if (intent) {
      const sesiones = await getStripe().checkout.sessions.list({
        payment_intent: intent.id,
        limit: 1,
      });
      if (sesiones.data[0]) return sesiones.data[0];
    }
  } catch (err) {
    // La búsqueda puede fallar sola (por ejemplo, si el índice aún no existe
    // en una cuenta nueva). No es motivo para rendirse: queda el respaldo.
    console.error(
      "Búsqueda de pedido:",
      err instanceof Error ? err.message : err
    );
  }

  const recientes = await getStripe().checkout.sessions.list({ limit: 100 });
  return recientes.data.find((s) => s.metadata?.order_number === numero) ?? null;
}

const noEncontrado = () =>
  NextResponse.json({ error: "not_found" }, { status: 404 });

export async function POST(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "local";

  try {
    const body = (await request.json()) as {
      sessionId?: string;
      orderNumber?: string;
      email?: string;
    };

    let session: Stripe.Checkout.Session | null = null;

    if (body.sessionId) {
      // --- Modo 1: recién pagado, viene de la página de gracias. ---
      if (!/^cs_[A-Za-z0-9_]+$/.test(body.sessionId)) return noEncontrado();
      session = await getStripe().checkout.sessions.retrieve(body.sessionId);
    } else {
      // --- Modo 2: consulta pública con número de pedido + correo. ---
      if (demasiadosIntentos(ip)) {
        return NextResponse.json({ error: "too_many" }, { status: 429 });
      }

      const numero = normalizarNumeroPedido(body.orderNumber ?? "");
      const correo = (body.email ?? "").trim().toLowerCase();
      if (!numero || !correo.includes("@")) return noEncontrado();

      session = await buscarSesion(numero);
      if (!session) return noEncontrado();

      // El correo tiene que coincidir con el de la compra.
      const correoCompra = session.customer_details?.email?.toLowerCase();
      if (!correoCompra || correoCompra !== correo) return noEncontrado();
    }

    if (!session) return noEncontrado();

    const lineItems = await getStripe().checkout.sessions.listLineItems(
      session.id,
      { limit: 100 }
    );
    const metadata = await metadataDelPago(session);

    return NextResponse.json(
      armarRespuesta(session, lineItems.data, metadata)
    );
  } catch (error: unknown) {
    // Un id que no existe hace que Stripe truene: para el cliente es lo mismo
    // que no encontrarlo. El detalle solo se registra del lado del servidor.
    console.error(
      "Consulta de pedido:",
      error instanceof Error ? error.message : error
    );
    return noEncontrado();
  }
}
