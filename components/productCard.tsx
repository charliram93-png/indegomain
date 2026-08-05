"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import Reveal from "@/components/reveal";
import SwipeHint from "@/components/swipeHint";
import { Product, isSoldOut } from "@/types/products";
import { HELVETICA } from "@/lib/fonts";
import { useI18n } from "@/lib/i18n/context";

type Props = {
  product: Product;
  index: number;
  onClick: () => void;
};

/**
 * Fila editorial del catálogo: imagen (cuadro con número) de un lado y el
 * nombre en grande del otro, alternando por índice. Al hacer clic abre el modal.
 *
 * FRENTE Y ESPALDA SIN ABRIR EL MODAL
 * -----------------------------------
 * Los estampados de la espalda son lo más fuerte del drop y estaban escondidos
 * detrás de un clic. Ahora se ven desde el catálogo, con un gesto distinto
 * según el aparato:
 *
 *  · En COMPUTADORA: al pasar el cursor, la foto se funde a la espalda. No
 *    agrega ni un elemento a la pantalla, que es lo que le va al catálogo.
 *
 *  · En TELÉFONO no hay cursor, así que se DESLIZA sobre la foto. Es el mismo
 *    gesto que ya tiene el modal, para no enseñarle al cliente dos formas
 *    distintas de ver lo mismo.
 *    SIN puntitos, por decisión de diseño (ago-2026): se probaron y ensuciaban
 *    el cuadro. Ojo con la contra, que es real: sin ellos nada avisa que hay
 *    una segunda foto, así que el gesto solo lo va a encontrar quien ya lo
 *    aprendió en el modal o quien arrastre por accidente.
 *
 * Las dos fotos se dibujan encimadas y solo se les cambia la opacidad: si se
 * intercambiara el `src`, la espalda tendría que descargarse en ese instante y
 * se vería un parpadeo la primera vez.
 */
export default function ProductCard({ product, index, onClick }: Props) {
  const { t, lang } = useI18n();
  const soldOut = isSoldOut(product);
  const number = String(index + 1).padStart(2, "0");
  const reversed = index % 2 === 1;

  const frente = product.images[0];
  const espalda = product.images[1];
  const hayEspalda = !!espalda;

  const [viendoEspalda, setViendoEspalda] = useState(false);

  // Deslizar en el teléfono. `deslizó` evita que el gesto termine además
  // abriendo el modal: sin esto, arrastrar cuenta también como clic.
  const inicioX = useRef<number | null>(null);
  const deslizo = useRef(false);

  /*
    Cuánto lleva recorrido el dedo, en fracción de foto. Solo sirve para que la
    rayita de abajo se mueva CON la mano (ver `components/swipeHint.tsx`); el
    cambio de foto sigue decidiéndose al soltar. Se mide contra el ancho del
    cuadro, así el gesto se siente igual en cualquier teléfono.
  */
  const [arrastre, setArrastre] = useState(0);
  const cuadro = useRef<HTMLButtonElement | null>(null);

  const onTouchStart = (e: React.TouchEvent) => {
    inicioX.current = e.touches[0].clientX;
    deslizo.current = false;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (inicioX.current === null || !hayEspalda) return;
    const ancho = cuadro.current?.offsetWidth ?? 1;
    const dx = e.touches[0].clientX - inicioX.current;
    // El signo se invierte: arrastrar a la IZQUIERDA avanza a la espalda.
    setArrastre(Math.min(Math.max(-dx / ancho, -1), 1));
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    setArrastre(0);
    if (inicioX.current === null || !hayEspalda) return;
    const dx = e.changedTouches[0].clientX - inicioX.current;
    if (Math.abs(dx) > 40) {
      deslizo.current = true;
      setViendoEspalda(dx < 0);
    }
    inicioX.current = null;
  };

  const abrirModal = () => {
    if (deslizo.current) {
      deslizo.current = false;
      return;
    }
    onClick();
  };

  return (
    <Reveal className="grid items-center gap-6 md:grid-cols-2 md:gap-16">
      {/* IMAGEN (cuadro con número y la rayita de fotos) */}
      <button
        ref={cuadro}
        onClick={abrirModal}
        onMouseEnter={() => hayEspalda && setViendoEspalda(true)}
        onMouseLeave={() => setViendoEspalda(false)}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        aria-label={product.name}
        className={`group relative order-2 block w-full overflow-hidden rounded-sm bg-surface ${
          reversed ? "md:order-2" : "md:order-1"
        }`}
      >
        {/*
          `container-type: inline-size` deja medir el número contra el ANCHO
          del cuadro (unidad `cqw`). Antes usaba tamaños fijos (7xl/9xl) y en
          escritorio salía proporcionalmente más grande que en móvil: por eso
          se veía distinto en cada pantalla.
        */}
        {/* `halo-prenda`: luz suave detrás de la playera SOLO en tema oscuro.
            Las tres prendas son oscuras y contra la placa oscura se pierden
            (la café es la peor). Ver globals.css. */}
        <div className="halo-prenda relative aspect-square w-full [container-type:inline-size]">
          {/*
            El número va ABAJO A LA DERECHA y un poco metido hacia adentro, para
            que la playera lo tape en parte. Queda ANTES de la <Image> a
            propósito: al pintarse primero, la foto le pasa por encima y se ve
            como si el número estuviera detrás.

            En COMPUTADORA va más pegado a la orilla (2%) que en teléfono (6%):
            ahí el cuadro es más grande y la playera le tapaba casi todo, así
            que corrido a la derecha se asoma un poco más. En móvil se quedó
            como estaba, que ahí sí se veía bien.
          */}
          <span
            className="pointer-events-none absolute bottom-[3%] right-[6%] text-[24cqw] font-bold leading-none opacity-15 md:right-[2%]"
            style={{ fontFamily: HELVETICA }}
          >
            {number}
          </span>
          {/* FRENTE */}
          <Image
            src={frente}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className={`pointer-events-none select-none object-contain p-12 transition-all duration-500 ease-out group-hover:scale-[1.04] ${
              soldOut ? "opacity-50 grayscale" : ""
            } ${viendoEspalda ? "opacity-0" : ""}`}
          />

          {/* ESPALDA, encimada. Se funde con la de arriba al cambiar. */}
          {hayEspalda && (
            <Image
              src={espalda}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className={`pointer-events-none select-none object-contain p-12 transition-all duration-500 ease-out group-hover:scale-[1.04] ${
                soldOut ? "grayscale" : ""
              } ${viendoEspalda ? (soldOut ? "opacity-50" : "opacity-100") : "opacity-0"}`}
            />
          )}

          {soldOut && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="bg-foreground px-4 py-2 text-[10px] font-bold uppercase tracking-[0.03em] text-background">
                {t.product.soldOut}
              </span>
            </div>
          )}

          {/*
            LA RAYITA, solo en TELÉFONO (`md:hidden`). En computadora sobra: ahí
            la espalda se ve con el cursor y no hay nada que deslizar. Este era
            el hueco que quedó abierto cuando se quitaron los puntitos: en móvil
            nada avisaba que hubiera una segunda foto.

            Va DENTRO del cuadro, debajo de la playera: colgada afuera se leía
            como un elemento más de la página; adentro se entiende que habla de
            esa foto y de nada más.
          */}
          {hayEspalda && (
            <SwipeHint
              total={2}
              index={viendoEspalda ? 1 : 0}
              arrastre={arrastre}
              className="absolute inset-x-0 bottom-4 md:hidden"
            />
          )}
        </div>
      </button>

      {/*
        NOMBRE EN GRANDE. En móvil se monta sobre el borde de arriba del cuadro:
        el margen negativo sube la imagen y el `z-10` deja el nombre encima, así
        queda mitad sobre el fondo y mitad sobre la playera. En escritorio va al
        lado, como siempre.
      */}
      <div
        className={`relative z-10 order-1 -mb-12 flex flex-col md:mb-0 ${
          reversed ? "md:order-1" : "md:order-2"
        }`}
      >
        <button onClick={onClick} className="text-left">
          <h2
            className="text-5xl font-bold uppercase leading-none tracking-tighter transition-opacity hover:opacity-60 md:text-7xl"
            style={{ fontFamily: HELVETICA }}
          >
            {product.name}
          </h2>
        </button>
        {/* Descripción en desktop (junto al nombre) */}
        {product.description && (
          <p className="mt-5 hidden max-w-xs text-sm leading-relaxed opacity-50 md:block">
            {product.description[lang]}
          </p>
        )}
      </div>

      {/* Descripción en móvil: DEBAJO de la imagen */}
      {product.description && (
        <p className="order-3 max-w-xs text-sm leading-relaxed opacity-50 md:hidden">
          {product.description[lang]}
        </p>
      )}
    </Reveal>
  );
}
