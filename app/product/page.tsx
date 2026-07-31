"use client";

import { useState } from "react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import CartDrawer from "@/components/cartDrawer";
import ProductCard from "@/components/productCard";
import ProductModal from "@/components/productModal";
import ProductTeaser from "@/components/productTeaser";
import { PRODUCTS } from "@/config/products";
import { DROP_NAME } from "@/config/drop";
import { useI18n } from "@/lib/i18n/context";

export default function Catalog() {
  const { t } = useI18n();
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <Navbar />

      <main className="flex-1 px-6 pt-32 md:px-12">
        {/* Encabezado editorial */}
        <header className="mx-auto mb-10 max-w-5xl text-center md:mb-14">
          <p className="text-[11px] font-bold tracking-[0.4em] opacity-40">
            {DROP_NAME}
          </p>
          <h1 className="mt-3 text-4xl font-bold uppercase tracking-tighter md:text-6xl">
            {t.catalog.title}
          </h1>
        </header>

        {/* Filas editoriales alternadas (espaciado compacto) */}
        <div className="mx-auto max-w-6xl space-y-16 pb-24 md:space-y-24">
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
