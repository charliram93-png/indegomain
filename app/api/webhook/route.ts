import { NextResponse } from "next/server";
import Stripe from "stripe";

// Cliente de Stripe perezoso: se crea en la 1ª petición, NO al cargar el módulo
// (así el build sin variables de entorno no truena).
let stripe: Stripe | null = null;
function getStripe(): Stripe {
  if (!stripe) {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2026-02-25.clover",
    });
  }
  return stripe;
}

/**
 * Registra/cumple una orden pagada. Aquí verás los datos en los logs.
 * TODO (cuando quieras persistencia real): guardar en base de datos,
 * enviar correo de confirmación, y descontar stock.
 */
async function fulfillOrder(session: Stripe.Checkout.Session) {
  const lineItems = await getStripe().checkout.sessions.listLineItems(
    session.id,
    { limit: 100 }
  );

  const order = {
    id: session.id,
    email: session.customer_details?.email,
    name: session.customer_details?.name,
    phone: session.customer_details?.phone,
    shipping: session.collected_information?.shipping_details ?? null,
    total: session.amount_total ? session.amount_total / 100 : 0,
    currency: session.currency,
    items: lineItems.data.map((li) => ({
      description: li.description,
      quantity: li.quantity,
    })),
  };

  console.log("✅ ORDEN PAGADA:", JSON.stringify(order, null, 2));
}

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret || !signature) {
    return NextResponse.json(
      { error: "Webhook no configurado" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Firma inválida";
    console.error("Webhook signature error:", msg);
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  try {
    switch (event.type) {
      // Tarjeta: el pago ya se completó al terminar el checkout.
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        // Para OXXO el pago queda pendiente (payment_status = "unpaid"):
        // no cumplas la orden todavía, espera async_payment_succeeded.
        if (session.payment_status === "paid") {
          await fulfillOrder(session);
        } else {
          console.log("⏳ Pago pendiente (OXXO):", session.id);
        }
        break;
      }

      // OXXO: el cliente pagó en efectivo después.
      case "checkout.session.async_payment_succeeded": {
        await fulfillOrder(event.data.object as Stripe.Checkout.Session);
        break;
      }

      // OXXO: el voucher expiró o falló.
      case "checkout.session.async_payment_failed": {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log("❌ Pago OXXO fallido/expirado:", session.id);
        break;
      }

      default:
        break;
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Error procesando evento";
    console.error("Webhook handler error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
