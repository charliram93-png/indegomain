import { NextResponse } from "next/server";
import Stripe from "stripe";

// Cliente de Stripe perezoso: se crea en la 1ª petición, NO al cargar el módulo.
// Así el build (que no tiene las variables de entorno) no truena.
let stripe: Stripe | null = null;
function getStripe(): Stripe {
  if (!stripe) {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2026-02-25.clover",
    });
  }
  return stripe;
}

type IncomingItem = {
  name: string;
  price: number; // MXN unitario (pesos)
  image: string;
  quantity: number;
};

export async function POST(request: Request) {
  try {
    const { items } = (await request.json()) as { items: IncomingItem[] };

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "El carrito está vacío" },
        { status: 400 }
      );
    }

    const line_items = items.map((item) => {
      const quantity = Math.max(1, Math.floor(Number(item.quantity) || 1));
      const unitAmount = Math.round(Number(item.price) * 100); // pesos -> centavos

      if (!Number.isFinite(unitAmount) || unitAmount <= 0) {
        throw new Error(`Precio inválido para ${item.name}`);
      }

      return {
        price_data: {
          currency: "mxn",
          product_data: {
            name: item.name,
            images: item.image ? [item.image] : undefined,
          },
          unit_amount: unitAmount,
        },
        quantity,
      };
    });

    const session = await getStripe().checkout.sessions.create({
      // Sin payment_method_types: Stripe usa los métodos habilitados en tu
      // Dashboard (tarjeta por defecto; activa OXXO ahí para aceptarlo).
      line_items,
      mode: "payment",
      // Recolecta dirección de envío, restringida a México.
      billing_address_collection: "required",
      shipping_address_collection: { allowed_countries: ["MX"] },
      phone_number_collection: { enabled: true },
      locale: "es",
      success_url: `${process.env.NEXT_PUBLIC_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/product`,
    });

    return NextResponse.json({ id: session.id, url: session.url });
  } catch (error: unknown) {
    const msg =
      error instanceof Error ? error.message : "Internal Server Error";
    console.error("Stripe API Error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
