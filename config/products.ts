import type { Product } from "@/types/products";

/**
 * CATÁLOGO DEL DROP
 * -----------------
 * Inventario manual para el Drop #1. Para agotar una talla, pon `stock: 0`.
 * Si todas las tallas quedan en 0, el producto se muestra como SOLD OUT.
 *
 * `images`: agrega varias fotos por producto (frente, espalda, detalle…).
 * La primera es la principal; las demás salen como miniaturas en el modal.
 */
const CLOUD = "https://res.cloudinary.com/dij60ghdf/image/upload";
const MOCK =
  "v1772813593/pngtree-black-oversized-fit-t-shirt-mockup-png-image_6740829_makeyn.png";
const IMG = `${CLOUD}/${MOCK}`;

// NOTA: cada producto usa la MISMA imagen con transformación de Cloudinary,
// solo para mostrar el concepto de galería (frente / espalda). Reemplázalas por
// fotos reales. La primera es la principal.
const GALLERY = [
  IMG, // frente
  `${CLOUD}/a_hflip/${MOCK}`, // "espalda" (espejo, solo demo)
];

export const PRODUCTS: Product[] = [
  {
    slug: "idg-01",
    name: "IDG - 01",
    images: GALLERY, // demo de galería (frente/espalda)
    price: 600,
    description: {
      en: "Oversized tee · heavy cotton · limited Drop #1 edition.",
      es: "Playera oversized · algodón pesado · edición limitada Drop #1.",
    },
    sizes: [
      { size: "S", stock: 10 },
      { size: "M", stock: 10 },
      { size: "L", stock: 10 },
      { size: "XL", stock: 0 }, // ejemplo de talla agotada
    ],
  },
  {
    slug: "idg-02",
    name: "IDG - 02",
    images: GALLERY, // demo de galería (frente/espalda)
    price: 600,
    description: {
      en: "Oversized tee · heavy cotton · limited Drop #1 edition.",
      es: "Playera oversized · algodón pesado · edición limitada Drop #1.",
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
    images: GALLERY, // demo de galería (frente/espalda)
    price: 600,
    description: {
      en: "Oversized tee · heavy cotton · limited Drop #1 edition.",
      es: "Playera oversized · algodón pesado · edición limitada Drop #1.",
    },
    sizes: [
      { size: "S", stock: 10 },
      { size: "M", stock: 10 },
      { size: "L", stock: 10 },
      { size: "XL", stock: 10 },
    ],
  },
];
