import { NextResponse } from "next/server";
import Stripe from "stripe";

// Inicializamos Stripe con la versión más reciente (Clover)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  
  apiVersion: "2026-02-25.clover", 
});

export async function POST(request: Request) {
  try {
    const { name, price, image, quantity } = await request.json();

    // Convertimos el precio de "$1200 MXN" a centavos (120000)
    const unitAmount = parseInt(price.replace(/[^0-9]/g, "")) * 100;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      billing_address_collection: "required",
      line_items: [
        {
          price_data: {
            currency: "mxn",
            product_data: {
              name: name,
              images: [image],
            },
            unit_amount: unitAmount,
          },
          quantity: quantity || 1, 
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_URL}/success`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/`,
    });

    // IMPORTANTE: Devolvemos la URL para que el frontend pueda redirigir
    return NextResponse.json({ 
      id: session.id, 
      url: session.url 
    });

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal Server Error";
    console.error("Stripe API Error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}