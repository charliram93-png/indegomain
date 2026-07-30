/**
 * DICCIONARIO DE TEXTOS (EN / ES)
 * -------------------------------
 * Todos los textos visibles de la interfaz viven aquí. Para agregar/editar
 * una traducción, cambia el valor en `en` y su equivalente en `es`.
 * El idioma por defecto es inglés.
 */

export type Lang = "en" | "es";

export const LANGS: Lang[] = ["en", "es"];

const en = {
  home: {
    comingSoon: "COMING SOON",
    outNow: "OUT NOW",
    enter: "ENTER",
    enterPreview: "Enter (preview)",
  },
  countdown: { days: "DAYS", hrs: "HRS", min: "MIN", sec: "SEC" },
  catalog: { title: "The Collection" },
  nav: { openCart: "Open cart" },
  cart: {
    title: "Cart",
    empty: "Your cart is empty",
    size: "Size",
    subtotal: "Subtotal",
    shippingNote: "Shipping calculated at checkout",
    pay: "Pay now",
    connecting: "Connecting to Stripe...",
    remove: "Remove",
  },
  product: {
    selectSize: "Select size",
    quantity: "Quantity",
    addToCart: "Add to cart",
    soldOut: "Sold out",
    lastPieces: "Only {n} left",
    close: "Close",
    view: "View",
    changeView: "Change view",
  },
  success: {
    tag: "Indego Studio — Drop #1",
    title: "Thank you for your order",
    body: "We received your order. We'll email your confirmation and tracking number as soon as your package ships.",
    cta: "Keep browsing",
  },
  footer: {
    terms: "Terms",
    linktree: "Linktree",
    rights: "© 2026 INDEGO STUDIO",
  },
  terms: {
    back: "← Back",
    title: "Terms & Conditions",
    updatedLabel: "Last updated:",
    updated: "July 2026",
    sections: [
      {
        h: "1. Who we are",
        p: 'This site is operated by Indego Studio ("we"). For any questions write to [tu-correo@indegostudio.com].',
      },
      {
        h: "2. Products and prices",
        p: "All prices are in Mexican pesos (MXN) and include tax. Stock is limited per drop; an item may sell out at any time. We reserve the right to correct pricing or description errors.",
      },
      {
        h: "3. Payments",
        p: "Payments are processed securely through Stripe. We do not store your card details. We accept [credit/debit card and OXXO]. Your order is confirmed once payment is approved.",
      },
      {
        h: "4. Shipping",
        p: "We ship only within Mexico. Estimated delivery is [X to Y business days] after payment is confirmed. You'll receive your tracking number by email. Times may vary by carrier.",
      },
      {
        h: "5. Exchanges and returns",
        p: "[Describe your policy: e.g., we accept size exchanges within the first X days after delivery, as long as the item is unworn and tagged. Return shipping is covered by the customer.] To start an exchange write to [tu-correo].",
      },
      {
        h: "6. Privacy",
        p: "We use your data (name, address, contact) only to process and ship your order. We don't share it with third parties except as needed for payment and delivery. [Link your full privacy notice here if you have one.]",
      },
    ],
  },
};

const es: typeof en = {
  home: {
    comingSoon: "PRÓXIMAMENTE",
    outNow: "AHORA DISPONIBLE",
    enter: "ENTRAR",
    enterPreview: "Entrar (preview)",
  },
  countdown: { days: "DÍAS", hrs: "HRS", min: "MIN", sec: "SEG" },
  catalog: { title: "La Colección" },
  nav: { openCart: "Abrir carrito" },
  cart: {
    title: "Carrito",
    empty: "Tu carrito está vacío",
    size: "Talla",
    subtotal: "Subtotal",
    shippingNote: "Envío calculado en el pago",
    pay: "Pagar ahora",
    connecting: "Conectando con Stripe...",
    remove: "Quitar",
  },
  product: {
    selectSize: "Selecciona talla",
    quantity: "Cantidad",
    addToCart: "Agregar al carrito",
    soldOut: "Agotado",
    lastPieces: "Últimas {n} piezas",
    close: "Cerrar",
    view: "Ver",
    changeView: "Cambiar vista",
  },
  success: {
    tag: "Indego Studio — Drop #1",
    title: "Gracias por tu compra",
    body: "Recibimos tu pedido. Te enviaremos la confirmación y el número de rastreo por correo en cuanto tu paquete salga.",
    cta: "Seguir viendo",
  },
  footer: {
    terms: "Términos",
    linktree: "Linktree",
    rights: "© 2026 INDEGO STUDIO",
  },
  terms: {
    back: "← Volver",
    title: "Términos y condiciones",
    updatedLabel: "Última actualización:",
    updated: "julio 2026",
    sections: [
      {
        h: "1. Quiénes somos",
        p: 'Este sitio es operado por Indego Studio ("nosotros"). Para cualquier aclaración escríbenos a [tu-correo@indegostudio.com].',
      },
      {
        h: "2. Productos y precios",
        p: "Todos los precios están expresados en pesos mexicanos (MXN) e incluyen IVA. Las existencias son limitadas por drop; un producto puede agotarse en cualquier momento. Nos reservamos el derecho de corregir errores de precio o descripción.",
      },
      {
        h: "3. Pagos",
        p: "Los pagos se procesan de forma segura a través de Stripe. No almacenamos datos de tu tarjeta. Aceptamos [tarjeta de crédito/débito y OXXO]. Tu pedido se confirma una vez aprobado el pago.",
      },
      {
        h: "4. Envíos",
        p: "Enviamos únicamente dentro de la República Mexicana. El tiempo estimado de entrega es de [X a Y días hábiles] una vez confirmado el pago. Recibirás tu número de guía por correo. Los tiempos pueden variar por la paquetería.",
      },
      {
        h: "5. Cambios y devoluciones",
        p: "[Describe tu política: por ejemplo, aceptamos cambios de talla dentro de los primeros X días posteriores a la entrega, siempre que la prenda esté sin uso y con etiquetas. Los gastos de envío del cambio corren por cuenta del cliente.] Para iniciar un cambio escribe a [tu-correo].",
      },
      {
        h: "6. Privacidad",
        p: "Usamos tus datos (nombre, dirección, contacto) únicamente para procesar y enviar tu pedido. No los compartimos con terceros salvo lo necesario para el pago y la entrega. [Enlaza aquí tu aviso de privacidad completo si cuentas con uno.]",
      },
    ],
  },
};

export const dictionaries = { en, es };
export type Dictionary = typeof en;
