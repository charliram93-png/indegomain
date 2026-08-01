"use client";

import { useState } from "react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import CartDrawer from "@/components/cartDrawer";
import ProductCard from "@/components/productCard";
import ProductModal from "@/components/productModal";
import ProductTeaser from "@/components/productTeaser";
import Manifesto from "@/components/manifesto";
import { PRODUCTS } from "@/config/products";

export default function Catalog() {
  const [selected, setSelected] = useState<number | null>(null);

  return (
    /* `entrada`: el catálogo aparece desde el color del tema, enganchando con
       el fundido del countdown (ver `app/page.tsx` y globals.css). */
    <div className="entrada flex min-h-dvh flex-col bg-background">
      <Navbar />

      <main className="flex-1">
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
      <Footer />
    </div>
  );
}
