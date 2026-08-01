import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductDetail from "@/components/productDetail";
import { PRODUCTS } from "@/config/products";

/**
 * PÁGINA PROPIA DE CADA PLAYERA — PRUEBA (ago-2026)
 * -------------------------------------------------
 *   /product/idg-01, /product/idg-02, /product/idg-03
 *
 * Esta mitad corre en el SERVIDOR y es la que da lo que un modal nunca podrá:
 * una dirección propia y una previsualización propia al compartir. La parte
 * con la que el cliente interactúa vive en `components/productDetail.tsx`.
 *
 * El candado del drop (`proxy.ts`) ya cubre estas direcciones: su filtro es
 * `/product/:path*`, así que antes de la fecha tampoco se pueden abrir.
 */

type Props = { params: Promise<{ slug: string }> };

const buscar = (slug: string) => {
  const index = PRODUCTS.findIndex((p) => p.slug === slug);
  return index === -1 ? null : { product: PRODUCTS[index], index };
};

/** Deja las tres páginas pregeneradas: se sirven al instante. */
export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ slug: p.slug }));
}

/**
 * Lo que se ve cuando alguien pega el enlace en WhatsApp o Instagram: el
 * nombre de ESA playera, su precio y SU foto — no la imagen genérica del sitio.
 * Es justamente el motivo de tener páginas por producto.
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const encontrado = buscar(slug);
  if (!encontrado) return { title: "Indego Studio" };

  const { product } = encontrado;
  const titulo = `${product.name} — Indego Studio`;
  const descripcion = product.description?.es ?? "Indego Studio · Drop #1";

  return {
    title: titulo,
    description: descripcion,
    openGraph: {
      title: titulo,
      description: descripcion,
      type: "website",
      locale: "es_MX",
      siteName: "Indego Studio",
      images: [{ url: product.images[0], alt: product.name }],
    },
    twitter: {
      card: "summary_large_image",
      title: titulo,
      description: descripcion,
      images: [product.images[0]],
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const encontrado = buscar(slug);
  if (!encontrado) notFound();

  return (
    <ProductDetail product={encontrado.product} index={encontrado.index} />
  );
}
