"use client";

import { useState } from "react";
import ProductCard from "@/components/productCard";
import ProductModal from "@/components/productModal";
import { Product } from "@/types/products";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

export default function Catalog() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const products: Product[] = [
    {
      slug: "idg - 01",
      name: "IDG - 01",
      image: "https://res.cloudinary.com/dij60ghdf/image/upload/v1772813593/pngtree-black-oversized-fit-t-shirt-mockup-png-image_6740829_makeyn.png",
      price: "$1200 MXN",
    },
    {
      slug: "idg - 02",
      name: "IDG - 02",
      image: "https://res.cloudinary.com/dij60ghdf/image/upload/v1772813593/pngtree-black-oversized-fit-t-shirt-mockup-png-image_6740829_makeyn.png",
      price: "$1200 MXN",
    },
    {
      slug: "idg - 03",
      name: "IDG - 03",
      image: "https://res.cloudinary.com/dij60ghdf/image/upload/v1772813593/pngtree-black-oversized-fit-t-shirt-mockup-png-image_6740829_makeyn.png",
      price: "$1200 MXN",
    },
    {
      slug: "idg - 04",
      name: "IDG - 04",
      image: "https://res.cloudinary.com/dij60ghdf/image/upload/v1772813593/pngtree-black-oversized-fit-t-shirt-mockup-png-image_6740829_makeyn.png",
      price: "$1200 MXN",
    },
    {
      slug: "idg - 05",
      name: "IDG - 05",
      image: "https://res.cloudinary.com/dij60ghdf/image/upload/v1772813593/pngtree-black-oversized-fit-t-shirt-mockup-png-image_6740829_makeyn.png",
      price: "$1200 MXN",
    },
  ];

  return (
    /* FRAGMENTO (<>): Es necesario para envolver múltiples elementos 
       sin añadir un nodo extra al DOM. Arregla el error ts(2657).
    */
    <>
      <Navbar />
      
      <main 
        className="min-h-screen p-4 md:p-12 pt-24" // pt-24 para que el contenido no quede bajo el Navbar
        style={{
          backgroundColor: "#E2E5D5",
          fontFamily: "Inter, sans-serif",
          fontWeight: "600",
        }}
      >
        {/* GRID DE PRODUCTOS:
           - grid-cols-2: 2 columnas en móvil.
           - md:grid-cols-3: 3 columnas exactas en escritorio (lo que pediste).
        */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
          {products.map((product) => (
            <ProductCard
              key={product.slug}
              product={product}
              onClick={() => setSelectedProduct(product)}
            />
          ))}
        </div>

        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      </main>

      <Footer />
    </>
  );
}