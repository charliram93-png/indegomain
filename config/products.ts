import type { Product } from "@/types/products";

/**
 * CATÁLOGO DEL DROP
 * -----------------
 * Inventario manual para el Drop #1. Para agotar una talla, pon `stock: 0`.
 * Si todas las tallas quedan en 0, el producto se muestra como SOLD OUT.
 *
 * `images`: la PRIMERA es el frente (es la que se ve en el catálogo y la que
 * abre el modal); la segunda es la espalda.
 */
const CLOUD = "https://res.cloudinary.com/dij60ghdf/image/upload";
const VERSION = "v1785555583";

/**
 * Las fotos vienen en 1600×900 con la playera chica en medio y mucho vacío a
 * los lados. Estas transformaciones de Cloudinary las arreglan al vuelo:
 *
 *  e_trim  — recorta el vacío transparente y deja solo la prenda, así se ve
 *            del mismo tamaño que los mockups de muestra.
 *  f_auto  — entrega WebP/AVIF al navegador que lo soporte.
 *  q_auto  — calidad automática. Junto con lo anterior, cada foto pasa de
 *            ~650 KB a ~37 KB.
 *  w_900   — más que suficiente para el cuadro del catálogo y para el modal.
 */
const foto = (nombre: string) =>
  `${CLOUD}/e_trim/f_auto,q_auto,w_900/${VERSION}/${nombre}.png`;

export const PRODUCTS: Product[] = [
  {
    slug: "idg-01",
    name: "IDG - 01",
    images: [foto("negra-frente_ccmgfb"), foto("negra-atras_ahdhsr")],
    price: 600,
    description: {
      en: "NO RP JUST HW · Black · Drop #1",
      es: "NO RP JUST HW · Negra · Drop #1",
    },
    sizes: [
      { size: "S", stock: 10 },
      { size: "M", stock: 10 },
      { size: "L", stock: 10 },
      { size: "XL", stock: 10 },
    ],
  },
  {
    slug: "idg-02",
    name: "IDG - 02",
    images: [foto("marron-frente_bab5w5"), foto("marron-atras_dk8enh")],
    price: 600,
    description: {
      en: "Headache Man · Brown · Drop #1",
      es: "Headache Man · Café · Drop #1",
    },
    sizes: [
      { size: "S", stock: 10 },
      { size: "M", stock: 10 },
      { size: "L", stock: 10 },
      { size: "XL", stock: 10 },
    ],
  },
  {
    slug: "idg-03",
    name: "IDG - 03",
    images: [foto("gris-frente_nbgl7i"), foto("gris-atras_xgmtqn")],
    price: 600,
    description: {
      en: "Run the Race · Grey · Drop #1",
      es: "Run the Race · Gris · Drop #1",
    },
    sizes: [
      { size: "S", stock: 10 },
      { size: "M", stock: 10 },
      { size: "L", stock: 10 },
      { size: "XL", stock: 10 },
    ],
  },
];
