import { DROP_ACCESS_KEY } from "@/config/drop";

/**
 * CONTENIDO DEL PANEL DE ADMINISTRACIÓN
 * -------------------------------------
 * Agrega/edita aquí los accesos directos. `external: true` abre en pestaña nueva.
 */

export type PanelLink = {
  label: string;
  href: string;
  note?: string;
  external?: boolean;
  soon?: boolean; // marca "próximamente" (aún no integrado)
};

export type PanelGroup = {
  title: string;
  links: PanelLink[];
};

export const PANEL_GROUPS: PanelGroup[] = [
  {
    title: "Operación",
    links: [
      { label: "Stripe", href: "https://dashboard.stripe.com/", note: "Pagos y órdenes", external: true },
      { label: "Vercel", href: "https://vercel.com/dashboard", note: "Hosting y deploys", external: true },
      { label: "GitHub (repo)", href: "https://github.com/charliram93-png/indegomain", note: "Código", external: true },
      // Link DIRECTO a la carpeta de assets del drop en la consola. Si no hay
      // sesión, la propia consola manda a la pantalla de credenciales y regresa
      // aquí. (La otra forma —cloudinary.com/users/login?RelayState=…— cae en
      // una página donde no se ve dónde iniciar sesión.)
      { label: "Cloudinary", href: "https://console.cloudinary.com/app/c-352ca81f24567880a371335d3fb1a8/assets/media_library/folders/ce5fd576010912bdb2bba411509212f103", note: "Imágenes del drop", external: true },
      { label: "Linktree", href: "https://linktr.ee/admin", note: "Bio links", external: true },
      { label: "Drive (marca)", href: "https://drive.google.com/drive/folders/18u7HUdStuxEBlRP3BV6Pe4F90ui43zsr?hl=es-419", note: "Carpeta compartida: fotos, textos y video", external: true },
    ],
  },
  {
    title: "Enlaces internos",
    links: [
      { label: "Tienda (preview)", href: `/product?access=${DROP_ACCESS_KEY}`, note: "Ver la tienda antes del drop" },
      { label: "Countdown", href: "/", note: "Vista pública" },
      { label: "Términos", href: "/terms" },
    ],
  },
  {
    title: "Envíos",
    links: [
      { label: "Skydropx", href: "https://www.skydropx.com/", note: "Guías con descuento", external: true },
      { label: "Envía.com", href: "https://envia.com/", note: "Comparar paqueterías", external: true },
    ],
  },
  {
    title: "Utilidades",
    links: [
      { label: "Squoosh", href: "https://squoosh.app/", note: "Optimizar imágenes", external: true },
      { label: "TinyPNG", href: "https://tinypng.com/", note: "Comprimir PNG/JPG", external: true },
      { label: "Coolors", href: "https://coolors.co/", note: "Paletas de color", external: true },
      { label: "Favicon generator", href: "https://realfavicongenerator.net/", external: true },
    ],
  },
  {
    title: "Próximamente",
    links: [
      { label: "Supabase", href: "https://supabase.com/dashboard", note: "Base de datos (órdenes/stock)", external: true, soon: true },
      { label: "Resend", href: "https://resend.com/", note: "Correos de confirmación", external: true, soon: true },
    ],
  },
];
