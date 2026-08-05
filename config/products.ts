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

/**
 * Las fotos vienen en 1700×1000 con fondo TRANSPARENTE y la playera chica en
 * medio, con mucho vacío a los lados. Estas transformaciones de Cloudinary las
 * arreglan al vuelo:
 *
 *  e_trim  — recorta el vacío transparente y deja solo la prenda, así se ve
 *            del mismo tamaño en las tres. (Depende del fondo transparente: si
 *            algún día suben una foto con fondo blanco sólido, `e_trim` no
 *            recorta nada y esa prenda se verá chica y desalineada.)
 *  f_auto  — entrega WebP/AVIF al navegador que lo soporte.
 *  q_auto  — calidad automática. Junto con lo anterior, cada foto pasa de
 *            ~400–950 KB a unas decenas de KB.
 *  w_900   — la prenda recortada mide ~950 px de ancho, así que con esto ya
 *            está a tamaño real para el cuadro del catálogo y para el modal.
 *
 * OJO CON LA VERSIÓN: va incluida en cada nombre (`v1785968996/negro_...`)
 * porque Cloudinary le puso una distinta a cada archivo según el segundo en que
 * se subió. Cópiala tal cual de la URL que te da Cloudinary, junto con el
 * sufijo aleatorio del nombre — los dos son parte de la dirección.
 */
const foto = (nombre: string) =>
  `${CLOUD}/e_trim/f_auto,q_auto,w_900/${nombre}.png`;

/**
 * EL ORDEN DE ESTA LISTA MANDA. Es el orden en que salen en el catálogo y de
 * él sale el número grande del cuadro (01, 02, 03), que es la POSICIÓN, no el
 * `slug`. Por eso, al reordenar hay que renumerar también `slug` y `name`: si
 * no, la prenda que aparece tercera diría "IDG - 01" en su ficha.
 *
 * Orden decidido el 5-ago-2026: gris, café, negra.
 */
export const PRODUCTS: Product[] = [
  {
    slug: "idg-01",
    name: "IDG - 01",
    images: [
      // Ojo: el nombre del archivo trae mayúscula ("Gris_Adelante") y el de la
      // espalda un dedazo ("girs"). Cloudinary distingue mayúsculas, así que
      // van tal cual están subidos — no los "corrijas" aquí.
      foto("v1785968995/Gris_Adelante_ewfovx"),
      foto("v1785968996/girs_atras_yrlaet"),
    ],
    price: 600,
    description: {
      en: "Run the Race · Grey · Drop #1",
      es: "Run the Race · Gris · Drop #1",
    },
    sizes: [
      { size: "S", stock: 10 },
      { size: "M", stock: 10 },
      { size: "L", stock: 10 },
    ],
  },
  {
    slug: "idg-02",
    name: "IDG - 02",
    images: [
      foto("v1785968997/cafe_adelante_mvn0qr"),
      foto("v1785968995/cafe_atras_ev9yl0"),
    ],
    price: 600,
    description: {
      en: "Headache Man · Brown · Drop #1",
      es: "Headache Man · Café · Drop #1",
    },
    sizes: [
      { size: "S", stock: 10 },
      { size: "M", stock: 10 },
      { size: "L", stock: 10 },
    ],
  },
  {
    slug: "idg-03",
    name: "IDG - 03",
    images: [
      foto("v1785968996/negro_adelante_lcb2qa"),
      foto("v1785968996/negro_atras_d97zdm"),
    ],
    price: 600,
    description: {
      en: "NO RP JUST HW · Black · Drop #1",
      es: "NO RP JUST HW · Negra · Drop #1",
    },
    sizes: [
      { size: "S", stock: 10 },
      { size: "M", stock: 10 },
      { size: "L", stock: 10 },
    ],
  },
];
