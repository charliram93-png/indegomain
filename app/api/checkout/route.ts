import { NextResponse } from "next/server";
import Stripe from "stripe";
import { PRODUCTS } from "@/config/products";
import { generarNumeroPedido } from "@/lib/orderNumber";
import { dictionaries, type Lang } from "@/lib/i18n/dictionaries";

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

/**
 * LO QUE MANDA EL NAVEGADOR: SOLO QUÉ Y CUÁNTO.
 *
 * Ojo con esto, que es la regla más importante de este archivo: el navegador
 * NO manda precios. Solo dice qué playera y qué talla quiere; el precio lo
 * pone el servidor leyendo `config/products.ts`.
 *
 * Antes sí llegaba el precio en la petición y se le hacía caso. Eso significa
 * que cualquiera con las herramientas de desarrollador del navegador podía
 * cambiar el número antes de enviarlo y comprarse una playera de $600 en $20
 * — probado, Stripe cobraba los $20 sin chistar. Ya no: aunque manden un
 * precio, aquí se ignora.
 */
type ItemPedido = {
  slug: string;
  size: string;
  quantity: number;
};

/** Cuántas piezas se dejan pedir de una talla en un solo pedido. */
const MAX_POR_TALLA = 10;

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      items?: ItemPedido[];
      lang?: Lang;
    };
    const items = body.items;

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "empty_cart" }, { status: 400 });
    }

    // El idioma solo decide cómo se escribe "Talla"/"Size" en el recibo de
    // Stripe. Se valida igual, para no meter cualquier cosa en el diccionario.
    const lang: Lang = body.lang === "es" ? "es" : "en";
    const etiquetaTalla = dictionaries[lang].cart.size;

    const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

    for (const item of items) {
      const product = PRODUCTS.find((p) => p.slug === item.slug);
      if (!product) {
        return NextResponse.json({ error: "unknown_product" }, { status: 400 });
      }

      const talla = product.sizes.find((s) => s.size === item.size);
      if (!talla) {
        return NextResponse.json({ error: "unknown_size" }, { status: 400 });
      }

      const pedidas = Math.floor(Number(item.quantity));
      if (!Number.isFinite(pedidas) || pedidas < 1) {
        return NextResponse.json({ error: "bad_quantity" }, { status: 400 });
      }

      /*
        EXISTENCIAS. Hoy se revisan contra `config/products.ts`, que es un
        inventario escrito a mano: frena a quien pida 500 piezas o una talla
        agotada, pero NO evita que dos personas compren la última al mismo
        tiempo — para eso hace falta la base de datos (Supabase), donde el
        stock se descuenta de verdad al confirmarse el pago.
      */
      if (talla.stock <= 0) {
        return NextResponse.json({ error: "sold_out" }, { status: 409 });
      }
      if (pedidas > Math.min(talla.stock, MAX_POR_TALLA)) {
        return NextResponse.json({ error: "not_enough_stock" }, { status: 409 });
      }

      line_items.push({
        price_data: {
          currency: "mxn",
          product_data: {
            name: `${product.name} — ${etiquetaTalla} ${talla.size}`,
            images: product.images[0] ? [product.images[0]] : undefined,
          },
          // El precio SIEMPRE sale del catálogo del servidor, nunca del cuerpo
          // de la petición. Ver la nota de arriba.
          unit_amount: Math.round(product.price * 100), // pesos -> centavos
        },
        quantity: pedidas,
      });
    }

    /*
      NÚMERO DE PEDIDO (`IDG-4F7K2P`). Se genera aquí y se guarda en DOS
      lugares de Stripe a propósito:

        · en la sesión de checkout -> para leerlo en la página de "gracias"
        · en el PaymentIntent      -> para poder BUSCARLO después

      Lo segundo es lo importante: Stripe solo deja buscar por `metadata` en
      los pagos, no en las sesiones. Sin esa copia, la página de estado del
      pedido no tendría forma de encontrar la compra a partir del número.
    */
    const numeroPedido = generarNumeroPedido();

    const session = await getStripe().checkout.sessions.create({
      // Sin payment_method_types: Stripe usa los métodos habilitados en tu
      // Dashboard (tarjeta por defecto; activa OXXO ahí para aceptarlo).
      line_items,
      mode: "payment",
      metadata: { order_number: numeroPedido },
      payment_intent_data: { metadata: { order_number: numeroPedido } },
      // Recolecta dirección de envío, restringida a México.
      billing_address_collection: "required",
      shipping_address_collection: { allowed_countries: ["MX"] },
      phone_number_collection: { enabled: true },
      locale: lang === "es" ? "es" : "en",
      success_url: `${process.env.NEXT_PUBLIC_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/product`,
    });

    return NextResponse.json({ id: session.id, url: session.url });
  } catch (error: unknown) {
    // El detalle se queda en los registros del servidor: al navegador solo se
    // le dice que falló, sin explicarle por dentro qué pasó.
    console.error(
      "Stripe API Error:",
      error instanceof Error ? error.message : error
    );
    return NextResponse.json({ error: "checkout_failed" }, { status: 500 });
  }
}
