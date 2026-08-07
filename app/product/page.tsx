"use client";

import { useState } from "react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import CartDrawer from "@/components/cartDrawer";
import ProductCard from "@/components/productCard";
import ProductModal from "@/components/productModal";
import ProductTeaser from "@/components/productTeaser";
import Manifesto from "@/components/manifesto";
import LluviaDeLogos from "@/components/lluviaDeLogos";
import { PRODUCTS } from "@/config/products";

export default function Catalog() {
  const [selected, setSelected] = useState<number | null>(null);

  return (
    /* `entrada`: el catálogo aparece desde el color del tema, enganchando con
       el fundido del countdown (ver `app/page.tsx` y globals.css). */
    <div className="entrada flex min-h-dvh flex-col bg-background">
      <Navbar />

      {/*
        LLUVIA DE LOGOS en los costados. Llena el aire que queda a los lados de
        la columna del catálogo en pantallas anchas. Va ANTES del contenido y sin
        z propio para que quede por debajo de todo; el `main` y el pie llevan
        `relative z-10` justo por eso. Ver `components/lluviaDeLogos.tsx`.
      */}
      <LluviaDeLogos />

      <main className="relative z-10 flex-1">
        {/*
          Hueco del navbar: la barra es fija y mide h-20 (80px). Así el bloque
          del manifiesto ARRANCA debajo de ella y el fondo contrastante no se
          mete detrás del cristal del navbar.
        */}
        <div className="h-20" />

        {/* El manifiesto ABRE la página, de lado a lado */}
        <Manifesto />

        <div className="px-6 md:px-12">
          {/* Filas editoriales alternadas (espaciado compacto) */}
          <div className="mx-auto mt-16 max-w-6xl space-y-16 pb-24 md:mt-24 md:space-y-24">
            {PRODUCTS.map((product, i) => (
              <ProductCard
                key={product.slug}
                product={product}
                index={i}
                onClick={() => setSelected(i)}
              />
            ))}

            {/* Adelanto Drop 1.5 (incógnito) */}
            <ProductTeaser />
          </div>
        </div>
      </main>

      <ProductModal
        product={selected !== null ? PRODUCTS[selected] : null}
        index={selected ?? 0}
        onClose={() => setSelected(null)}
      />

      <CartDrawer />
      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  );
}
